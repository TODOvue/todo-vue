---
title: "Reactivity in Composables: `toRef`, `toRefs`, and How Not to Lose It When Destructuring"
description: "Learn why destructuring can disconnect reactive state and when to use direct refs, `toRef()`, or `toRefs()` in Vue composables."
date: 2026-07-31T19:00:00-05:00
updatedAt: 2026-07-31T19:00:00-05:00
draft: false
locale: en
author: TODOvue
series: vue-reactivity
seriesOrder: 4
seriesTitle: "Practical Reactivity in Vue 3"
seriesDescription: "A practical path to understand how Vue tracks state, choose the right reactive API, and optimize updates without losing clarity."
tags:
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "Guides"
    color: "#42B983"
cover: "https://res.cloudinary.com/denj4fg7f/image/upload/v1785525834/reactivity-in-composables-toref-torefs-and-how-not-to-lose-it-when-destructuring_tvgcff.png"
coverAlt: "Diagram of a Vue composable preserving reactivity with toRef and toRefs."
coverCaption: "Visual reference for a guide to Vue reactivity utilities."
keywords:
  - "Vue composable reactivity"
  - "Vue toRef"
  - "Vue toRefs"
  - "destructuring reactive Vue"
  - "Vue composables"
schemaOrg:
  - type: "BlogPosting"
    headline: "Reactivity in Composables: `toRef`, `toRefs`, and How Not to Lose It When Destructuring"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-31T19:00:00-05:00"
lab:
  title: "Repair a Composable’s Reactive Contract"
  goal: "Redesign a composable return value so its reactive properties can be destructured and an optional key can be exposed."
  tasks:
    - "Make count and step safe to destructure without losing reactivity."
    - "Expose status even though it does not yet exist on the reactive object."
    - "Explain why you use toRefs() for existing properties and toRef() for the optional key."
  starterCode: |
    import { reactive } from 'vue'

    export function useCounter() {
      const state = reactive<{ count: number; step: number; status?: string }>({
        count: 0,
        step: 1
      })

      function increment() {
        state.count += state.step
      }

      return { state, increment }
    }
  solutionHint: "Convert state’s existing properties with toRefs(state), then create a separate ref for status with toRef(state, 'status')."
---

# Reactivity in Composables: `toRef`, `toRefs`, and How Not to Lose It When Destructuring

A composable can appear correct until its consumer does something natural: destructure its result. If the composable returns an object created with `reactive()` directly, an extracted primitive property is no longer connected to the proxy that Vue tracks.

The issue is not destructuring itself. It is the contract you expose: does the consumer receive a proxy that must remain an object, or refs that can be extracted without losing updates? This guide starts with that decision and shows when to use property access, `toRef()`, and `toRefs()`.

This draft assumes Vue 3.3 or later for the `toRef(() => getter)` example.

## The Problem: Destructuring a `reactive()` Object Disconnects Its Properties

Vue records reactive reads through the proxy. That is why `state.count` keeps its connection, while `const { count } = state` assigns the current value to a local variable. If it is a primitive, that variable does not go through the proxy again when state changes.

```ts [BrokenCounter.ts] {5}
import { reactive } from 'vue'

const state = reactive({ count: 0 })

const { count } = state

function increment() {
  state.count += 1
}

export { count, increment }
```

After `increment()`, `state.count` changes, but `count` remains the extracted value. Keeping access as `state.count` is valid when the grouped object is part of the API you want to provide.

This differs from destructuring a plain object that contains refs. Extracting a ref does not turn it into an ordinary value: you still retain its ref object and its `.value`.

## `toRef()`: A Live Reference to One Property

When you need to expose one property from a reactive object, `toRef(state, 'count')` creates a ref that is synchronized in both directions with that property. It is a reference to the property, not a copy of its current value.

```ts [PropertyLink.vue] {10,11}
<script setup lang="ts">
import { reactive, ref, toRef } from 'vue'

const state = reactive({ count: 0 })
const copiedCount = ref(state.count)
const linkedCount = toRef(state, 'count')

function updateCounts() {
  state.count += 1
  copiedCount.value += 1
  linkedCount.value += 1
}
</script>

<template>
  <button type="button" @click="updateCounts">
    Update counts
  </button>
  <p>State: {{ state.count }}</p>
  <p>Copied: {{ copiedCount }}</p>
  <p>Linked: {{ linkedCount }}</p>
</template>
```

`copiedCount` is initialized with the number held by `state.count`; it then changes independently. `linkedCount`, by contrast, reads and writes the same property as `state.count`.

It is also the choice for an optional or missing key. `toRefs()` only creates refs for enumerable properties that exist when it runs. If `status` is not in the object yet, create it explicitly with `toRef(state, 'status')`.

```ts [OptionalProperty.ts] {6}
import { reactive, toRef } from 'vue'

const state = reactive<{ count: number; status?: string }>({ count: 0 })
const status = toRef(state, 'status')

status.value = 'ready'
```

## `toRefs()`: Returning Destructurable State from a Composable

A composable sometimes needs one internal reactive object because its fields belong to the same operation state. Do not return that proxy directly if you expect it to be destructured. Convert its existing properties to refs and return the resulting plain object.

```ts [useCounter.ts] {10}
import { reactive, toRefs } from 'vue'

export function useCounter() {
  const state = reactive({ count: 0, step: 1 })

  function increment() {
    state.count += state.step
  }

  return { ...toRefs(state), increment }
}
```

Mutable state lives inside `useCounter()`, so each use gets its own instance. `toRefs(state)` produces linked refs for `count` and `step`; the object returned by the composable is no longer a proxy, but a plain object of refs. Consumers can therefore destructure it safely.

```vue [CounterPanel.vue] {4}
<script setup lang="ts">
import { useCounter } from './useCounter'

const { count, step, increment } = useCounter()
</script>

<template>
  <label>
    Step
    <input v-model.number="step" type="number" min="1">
  </label>
  <button type="button" @click="increment">
    Increment
  </button>
  <p>Count: {{ count }}</p>
</template>
```

Do not create a `reactive()` object only to call `toRefs()` afterward. If your state pieces are independent from the start, declare independent refs and return them directly: `return { data, error }`.

## Choosing Between `state.prop`, `toRef()`, `toRefs()`, and Independent Refs

The choice depends on the API shape, not on a universal preference:

- Keep `state.prop` when consumers benefit from treating the state as one cohesive group.
- Use `toRef(state, 'prop')` to expose one specific property, especially when it may not exist yet.
- Use `toRefs(state)` when exposing several existing properties from a reactive object that consumers should be able to destructure.
- Return independent refs when there is no real reason to keep one reactive object.

This avoids losing reactivity when extracting values from a proxy or applying `toRefs()` mechanically to state that was already clearer as independent refs.

## Props and Reactive Inputs: Getters, `toRef()`, and `toValue()`

Props remain readonly in the child component. In Vue 3.3+, `toRef(() => props.projectId)` provides a reactive input based on a prop, but it does not authorize assigning a new value to it.

If a composable accepts a static value, a ref, or a getter, it must evaluate that input inside a reactive effect when it needs to respond to changes. `toValue()` normalizes all three forms; inside `watchEffect()`, it also lets Vue register the getter's dependencies.

```ts [useDisplayId.ts] {6}
import { ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

export function useDisplayId(projectId: MaybeRefOrGetter<string>) {
  const displayId = ref('')

  watchEffect(() => {
    displayId.value = toValue(projectId)
  })

  return { displayId }
}
```

```vue [ProjectHeader.vue] {7}
<script setup lang="ts">
import { toRef } from 'vue'
import { useDisplayId } from './useDisplayId'

const props = defineProps<{ projectId: string }>()

const { displayId } = useDisplayId(toRef(() => props.projectId))
</script>

<template>
  <h2>Project: {{ displayId }}</h2>
</template>
```

The getter keeps the read linked to `props.projectId`; `watchEffect()` recalculates `displayId` when it changes. The ref created from the getter is readonly, as a prop should be.

## Limits and Common Mistakes

Do not replace `toRef(state, 'key')` with `ref(state.key)` when you need a live link: the second form takes an ordinary value and creates an independent ref. Do not expect `toRefs()` to include keys added after it runs or optional properties that were absent at that point.

Do not present a ref derived from props as a way to mutate them. If the design needs a writable interface, explicitly define who owns the state and how the change is communicated.

Finally, do not base this choice on Reactivity Transform (`$ref`, `$()`, or `$$()`). It was experimental and was removed from Vue core in version 3.4.

## Lab: Repair a Composable’s Reactive Contract

Start with a composable that returns a `reactive()` object with `count`, `step`, and an optional `status` key. Redesign its return value so a component can destructure `count` and `step`, while `status` can be exposed even when it does not exist yet.

The final rule is short: return independent refs when the state is already independent. If you expose several properties from a reactive object and want to allow destructuring, return linked refs with `toRefs(state)`.

For broader state-shape criteria, see [the `ref()` versus `reactive()` guide](/blog/ref-vs-reactive-como-modelar-el-estado-en-vue-3.en/) and [the Vue composables guide](/blog/vue-3-composables-extract-reusable-logic.en/). Technical sources: [Reactivity API: Utilities](https://vuejs.org/api/reactivity-utilities), [Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html), and [Composables](https://vuejs.org/guide/reusability/composables.html).
