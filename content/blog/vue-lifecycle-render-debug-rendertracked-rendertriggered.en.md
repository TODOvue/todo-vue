---
title: "Vue Lifecycle: render debugging (renderTracked, renderTriggered)"
description: "How to use renderTracked, renderTriggered, onRenderTracked, and onRenderTriggered to understand which dependencies enter a render and which changes are forcing new updates."
date: 2026-03-17T22:00:00-05:00
updatedAt: 2026-03-17T22:00:00-05:00
tags:
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Components"
    color: "#41B883"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773802976/vue-lifecycle-render-debug-rendertracked-rendertriggered_ekkgg1.png
coverAlt: "Illustration of render debugging in Vue with renderTracked and renderTriggered"
coverCaption: "renderTracked and renderTriggered help you see which dependency enters render and which one triggers it again."
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 8
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - renderTracked
  - renderTriggered
  - onRenderTracked
  - onRenderTriggered
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: render debugging (renderTracked, renderTriggered)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-17T22:00:00-05:00"
---
# Vue Lifecycle: render debugging (`renderTracked`, `renderTriggered`)

Some bugs are not in business logic or in an API call. They live one layer deeper: a component that re-renders too often, a list that recalculates more than it should, or a view that depends on reactive state you did not even realize it was reading.

That kind of issue is hard to spot because Vue abstracts the reactive system so well. It updates when it should, and from the outside it can feel like magic. That is exactly why `renderTracked` and `renderTriggered` exist: to open that black box and show what is happening inside the render cycle.

These are not lifecycle hooks for application logic. They are diagnostic tools. When a component updates for "no obvious reason", they help answer two practical questions:

* Which reactive dependencies were registered during render?
* Which specific change triggered the next render?

## Why This Matters

As an interface grows, the cost of rendering "a little too much" stops being invisible. You start to notice symptoms like:

* Inputs that feel sluggish.
* Tables that recalculate or reorder unnecessarily.
* Child components updating because of irrelevant changes.
* `computed` properties and `watch` logic that look correct, but still participate in noisy render cycles.

In those situations, reading the template is not enough. You need to understand the relationship between the render effect and the reactive system. That is where `renderTracked` and `renderTriggered` become useful: they show which dependencies were registered and which mutations led to fresh updates.

## Core Concept

Vue tracks reactive dependencies while a component is rendering. If the template, a `computed`, or any reactive expression touches a property during that process, Vue associates it with the component's render effect.

The render debugging hooks let you observe that flow:

* `renderTracked` in the Options API and `onRenderTracked()` in the Composition API run when a dependency is collected during render.
* `renderTriggered` in the Options API and `onRenderTriggered()` in the Composition API run when one of those dependencies changes and causes a new render.

Both hooks receive a debugger event object with details such as:

* `target`: the reactive object involved.
* `key`: the property that was accessed or mutated.
* `type`: the kind of operation (`get`, `set`, `add`, `delete`, and so on).
* `newValue` and `oldValue`, when they apply.

Two details matter here:

* These hooks are meant for development, not business logic.
* The normal way to use them is with `console.log()` or `debugger`, not by mutating reactive state from inside the hook.

Once you try to turn them into application behavior, they usually create more noise than clarity.

## When To Use

These hooks make sense when you need to understand why a component renders or re-renders.

Common cases:

* A component changes unexpectedly when you edit state that looked unrelated.
* A complex view refreshes too often.
* You are tuning performance and suspect the render depends on more state than necessary.
* A seemingly harmless `computed` is pulling a much wider render than expected.

Practical rule: if the real question is "why is this component rendering?", these hooks are a strong fit.

## When To Avoid

They are not a permanent tool, and they do not replace a clear component architecture.

Avoid them when:

* The issue is better understood by reviewing `props`, `emits`, `computed`, or `watch`.
* You only need to react to one specific change, in which case `watch` is clearer.
* You plan to store traces in reactive state inside the same component.
* You want to use them as production telemetry.

It is also worth avoiding a common trap: proving your theory with these hooks and then leaving them in the codebase. They are excellent for debugging and bad as permanent noise.

## Common Mistakes

### 1. Using them for business logic

They are not designed to trigger functional side effects. If you need to respond to data changes, `watch` or `computed` is the right tool.

### 2. Mutating state inside the hook

Saving debugger events in a `ref` can introduce extra renders and pollute the very thing you are trying to inspect.

### 3. Blaming Vue instead of the component's reactive scope

If the template touches a large reactive object, Vue is doing the correct thing: subscribing the render effect to everything it reads.

### 4. Assuming stable production behavior

These are debugging hooks, not APIs you should rely on for functional behavior.

## Practical Examples

### Detecting accidental dependencies

A table may be reading more state than it actually needs: filters, visual flags, form drafts, or unrelated metadata. `renderTracked` makes that visible.

### Identifying what is firing a render

`renderTriggered` shows the exact key that caused the update, which removes a lot of guesswork.

### Optimizing components connected to stores

It helps confirm whether a component depends only on what it should, or whether it is over-subscribed to global state.

## Full Example

```vue [Composition API]
<script setup lang="ts">
import { computed, onRenderTracked, onRenderTriggered, reactive, ref } from 'vue'

const filters = reactive({
  search: '',
  showOnlyOpen: false
})

const ui = reactive({
  selectedId: 1,
  panelOpen: true
})

const tasks = ref([
  { id: 1, title: 'Review PR', done: false, owner: 'Ana' },
  { id: 2, title: 'Update dependencies', done: true, owner: 'Luis' },
  { id: 3, title: 'Document composable', done: false, owner: 'Ana' }
])

const visibleTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(filters.search.toLowerCase())

    const matchesStatus = filters.showOnlyOpen ? !task.done : true

    return matchesSearch && matchesStatus
  })
})

onRenderTracked((event) => {
  console.log('[renderTracked]', {
    type: event.type,
    key: String(event.key),
    target: event.target
  })
})

onRenderTriggered((event) => {
  console.log('[renderTriggered]', {
    type: event.type,
    key: String(event.key),
    oldValue: event.oldValue,
    newValue: event.newValue
  })
})

function toggleTask(taskId: number) {
  const task = tasks.value.find(item => item.id === taskId)

  if (!task) return

  task.done = !task.done
}
</script>
```

```vue [Options API]
<script lang="ts">
export default {
  name: 'TaskRenderDebugger',

  data() {
    return {
      filters: {
        search: '',
        showOnlyOpen: false
      },
      ui: {
        selectedId: 1,
        panelOpen: true
      },
      tasks: [
        { id: 1, title: 'Review PR', done: false, owner: 'Ana' },
        { id: 2, title: 'Update dependencies', done: true, owner: 'Luis' },
        { id: 3, title: 'Document composable', done: false, owner: 'Ana' }
      ]
    }
  },

  computed: {
    visibleTasks() {
      return this.tasks.filter(task => {
        const matchesSearch = task.title
          .toLowerCase()
          .includes(this.filters.search.toLowerCase())

        const matchesStatus = this.filters.showOnlyOpen ? !task.done : true

        return matchesSearch && matchesStatus
      })
    }
  },

  renderTracked(event) {
    console.log('[renderTracked]', {
      type: event.type,
      key: String(event.key),
      target: event.target
    })
  },

  renderTriggered(event) {
    console.log('[renderTriggered]', {
      type: event.type,
      key: String(event.key),
      oldValue: event.oldValue,
      newValue: event.newValue
    })
  },

  methods: {
    toggleTask(taskId) {
      const task = this.tasks.find(item => item.id === taskId)

      if (!task) return

      task.done = !task.done
    }
  }
}
</script>
```

This example makes three things easy to inspect:

* Which dependencies are collected during render.
* Which changes cause fresh updates.
* How the component's scope affects its reactive surface area.

## Summary

`renderTracked` and `renderTriggered` are not decorative lifecycle hooks or generic observability tools. They are diagnostic instruments for understanding render behavior from the inside.

Used well, they help you:

* Detect accidental dependencies.
* Reduce unnecessary renders.
* Understand the relationship between template code, reactive state, and `computed`.

> Before you optimize blindly, inspect which dependencies are being collected and which changes are actually firing the render.
