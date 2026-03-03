---
title: "How Vue 3 Reactivity Works Internally"
description: "Technical breakdown of Vue 3's reactivity engine: dependency tracking, WeakMap->Map->Set structure, activeEffect, scheduler, batching, and real architecture pitfalls."
date: 2026-03-02T20:00:00-05:00
updatedAt: 2026-03-02T20:00:00-05:00
tags:
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Architecture"
    color: "#4CAF50"
  - tag: "Best Practices"
    color: "#2196F3"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772497884/vue-3-reactivity-internals_hhru1s.png
coverAlt: "How Vue 3 reactivity works internally"
coverCaption: "Temporary cover: replace with final TODOvue artwork"
locale: en
author: TODOvue
keywords:
  - Vue 3
  - reactivity
  - dependency tracking
  - scheduler
  - batching
  - computed
schemaOrg:
  - type: "BlogPosting"
    headline: "How Vue 3 Reactivity Works Internally"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-02T20:00:00-05:00"
---
# How Vue 3 Reactivity Works Internally

Vue 3 introduced a fully redesigned reactivity system compared to Vue 2, based on Proxy and a dynamic dependency graph. While the public API (`ref`, `reactive`, `computed`, `watch`) looks simple, the internal behavior follows a model carefully optimized for granularity, performance, and predictability. Understanding this model is not optional in large applications: it is the difference between debugging symptoms and solving root causes.

## Introduction Based on a Real Problem

In teams already using Vue 3 in production, the most expensive questions are usually not "how to use `ref`", but these:

* How does Vue know exactly what to update and what not to touch?
* Why does a valid state change sometimes fail to re-render?
* Why does a screen sometimes re-render too much and become slow?

The answer is not in a single API call. It is in the internal engine: how Vue records dependencies while reading state and how it decides which effects to run when state is written.

When this mental model is unclear, debugging is guesswork. When it is clear, you can reason precisely about root cause, render cost, and the behavior of `computed` and `watchEffect`.

## Simplified Mental Model

### Dependency tracking in one sentence

Every time an active effect (render, `computed`, `watchEffect`) reads a reactive property, Vue records a relationship:

```txt [dependency-rule.txt]
efecto X depende de target.key
```

Then, if `target.key` changes, Vue only notifies effects subscribed to that key.

### Internal structure: WeakMap -> Map -> Set

A simplified model of dependency storage:

* `WeakMap`: index by reactive object (`target`).
* `Map`: index by property inside that object (`key`).
* `Set`: effects that depend on that property.

```txt [dependency-graph.txt]
bucket (WeakMap)
  -> targetA (Map)
       -> "count" (Set: effectRender, effectComputed)
       -> "ok"    (Set: effectRender)
  -> targetB (Map)
       -> "name"  (Set: effectProfile)
```

This structure enables:

* Avoiding memory leaks (thanks to `WeakMap`).
* Property-level granularity.
* Running only the effects that are actually needed.

### `activeEffect`: the critical piece

Vue keeps a temporary global reference to the effect currently executing: `activeEffect`.

Flow:

1. `effect(fn)` starts -> `activeEffect = fn`.
2. Inside `fn`, a reactive read runs `track(target, key)`.
3. `track` associates `activeEffect` with the `Set` for `target.key`.
4. When `fn` ends, `activeEffect` is restored to the previous one (nested effect stack).

Without `activeEffect`, there is no tracking.

## Mini Implementation from Scratch in Plain JavaScript

The real implementation is more complex (operation types, collection handlers for `Map`/`Set`, internal flags, etc.), but this model reproduces the essential pieces:

* `track(target, key)`
* `trigger(target, key)`
* `effect(fn)`

```js [reactivity-core.js]
// Global dependency graph.
const bucket = new WeakMap()

// Active effect and stack for nested effects.
let activeEffect = null
const effectStack = []

function cleanup(effectFn) {
  for (const deps of effectFn.deps) {
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const result = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1] ?? null
    return result
  }

  effectFn.deps = []
  effectFn.options = options

  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function track(target, key) {
  if (!activeEffect) return

  let depsMap = bucket.get(target)
  if (!depsMap) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  if (!deps.has(activeEffect)) {
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  if (!deps) return

  const effectsToRun = new Set()
  deps.forEach((effectFn) => {
    if (effectFn !== activeEffect) effectsToRun.add(effectFn)
  })

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (!Object.is(oldValue, value)) {
        trigger(target, key)
      }
      return result
    }
  })
}
```

```js [demo.js]
const state = reactive({ count: 0, ok: true })

effect(() => {
  console.log("render ->", state.ok ? state.count : "hidden")
})

state.count++
state.ok = false
```

### Step by step of what happens

1. `effect` runs the render function and marks it as active.
2. Reading `state.ok` and `state.count` makes the Proxy `get` trap call `track`.
3. `track` stores dependencies in `WeakMap -> Map -> Set`.
4. Changing `state.count` makes the Proxy `set` trap call `trigger`.
5. `trigger` looks up the `Set` for that key and re-runs only dependent effects.

This pattern is exactly the core of Vue 3 reactivity.

## Connection to Real Vue

### `reactive` uses `Proxy`

`reactive` does not "magically transform" values. It creates a `Proxy` that intercepts operations (`get`, `set`, `has`, `deleteProperty`, iteration, etc.).

* `get` performs tracking.
* `set` performs triggering.
* Arrays and collections (`Map`, `Set`, `WeakMap`, `WeakSet`) have specialized handlers.

### `ref` wraps primitives

Since a primitive cannot be proxied by property, Vue uses a wrapper object with getter/setter on `.value`.

Conceptual simplification:

```js [ref.js]
function ref(raw) {
  const box = {
    get value() {
      track(box, "value")
      return raw
    },
    set value(newValue) {
      if (!Object.is(raw, newValue)) {
        raw = newValue
        trigger(box, "value")
      }
    }
  }
  return box
}
```

In real Vue:

* Objects passed to `ref` are internally converted to reactive values.
* In templates, `.value` is automatically unwrapped.

### `computed` is built on top of `effect`

`computed` is implemented with a lazy effect:

1. It is not evaluated until `.value` is read.
2. It caches the result.
3. It gets invalidated when an internal dependency changes.
4. It exposes its own `track`/`trigger` for consumers depending on that computed.

Internally, it combines:

* A lazy effect
* A `dirty` flag
* A scheduler that invalidates instead of recalculating immediately

### Scheduler and batching

Vue avoids redundant work within the same tick:

1. Instead of running every effect immediately, it can enqueue jobs.
2. It deduplicates repeated jobs.
3. It flushes in a microtask.

Conceptual mini scheduler:

```js [scheduler.js]
const queue = new Set()
let flushing = false
const p = Promise.resolve()

function scheduler(job) {
  queue.add(job)
  if (flushing) return
  flushing = true
  p.then(() => {
    queue.forEach((j) => j())
    queue.clear()
    flushing = false
  })
}
```

This is why 10 synchronous mutations can produce one final render.

## Common Mistakes

### Destructuring breaks reactivity

```js [destructuring-breaks-reactivity.js]
const state = reactive({ count: 0 })
const { count } = state // count is no longer linked
```

Fix:

* Use `toRef(state, "count")`
* Or access `state.count` directly.

### Mutations outside the proxy

If you mutate a raw reference outside the `Proxy`, Vue cannot trigger updates.
Any reactive read/write must go through the proxy or `.value`.

### `shallowRef` vs `ref`

`shallowRef` only tracks replacement of `.value`, not deep mutations.

```js [shallow-ref-example.js]
const user = shallowRef({ name: "Ana" })
user.value.name = "Eva" // does not trigger by itself
user.value = { ...user.value, name: "Eva" } // does trigger
```

It is useful when:

* You handle large structures
* You integrate external libraries
* You want explicit control over invalidation timing

### Effects running more than expected

Typical causes:

* Reading too many sources inside a single `watchEffect`
* Returning new objects every time in `computed`
* Using `watchEffect` where `computed` is enough
* Mutating state inside an effect without isolating dependencies

## Conclusion

When you understand Vue 3 internals, your UI architecture changes:

* You move from trial-and-error to dependency-driven diagnosis
* You distinguish tracking problems from rendering problems
* You shape state to reduce render frequency and computational cost

In large applications, that directly impacts:

* Stable performance under load
* Fewer intermittent synchronization bugs
* Better decisions around `ref`, `reactive`, `shallowRef`, `computed`, `watch`, and scheduling

> Vue 3 reactivity is not magic. It is a well-designed dependency graph plus an efficient scheduler. Understanding it gives you more predictable, more performant, and easier-to-debug code.
