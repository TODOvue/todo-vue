---
title: "Vue Lifecycle: error handling with errorCaptured"
description: "How to use errorCaptured and onErrorCaptured to isolate failures in child components, show fallback states, and log errors without breaking the entire interface."
date: 2026-03-16T22:00:00-05:00
updatedAt: 2026-03-16T22:00:00-05:00
tags:
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Components"
    color: "#41B883"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Architecture"
    color: "#4CAF50"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773714502/vue-lifecycle-error-handling-errorcaptured_mn62y7.png
coverAlt: "Illustration of a Vue component with a protective shield, representing error handling with errorCaptured."
coverCaption: "With errorCaptured, you can protect specific parts of your UI without compromising the whole experience."
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 7
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - errorCaptured
  - onErrorCaptured
  - error handling
  - error boundaries
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: error handling with errorCaptured"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-16T22:00:00-05:00"
---
# Vue Lifecycle: error handling with `errorCaptured`

Errors in the UI rarely announce themselves. A widget stops rendering, a third-party dependency throws an exception, or a child view fails during an update, and suddenly the user is left with a blank block or an incomplete screen.

That is where `errorCaptured` becomes valuable. It does not prevent errors from happening, but it does let you contain them in the right place, log useful context, and offer a graceful way out without compromising the entire UI.

## Why This Matters

As an application grows, not every component deserves the same level of trust. Some pieces are stable, while others are more fragile: external library integrations, complex widgets, panels that depend on changing data, or components that are still evolving.

If failures propagate without control, the impact is often disproportionate. An error in a secondary card can end up affecting an entire screen. `errorCaptured` gives you a way to set boundaries: this block may fail, but the rest of the page should keep working.

## Core Concept

`errorCaptured` is an Options API hook, and `onErrorCaptured()` is its Composition API equivalent. Both let you intercept errors that happen in **descendant components** of the current component.

That includes errors triggered in common parts of Vue's execution flow, such as:

* Render functions and template rendering
* Event handlers
* Lifecycle hooks
* `setup()`
* Watchers
* Custom directives
* Transition hooks

The hook receives three arguments:

* `err`: the captured error
* `instance`: the component instance that threw the error
* `info`: a hint about where the error happened, for example during render or inside an event handler

There are two important details to keep in mind:

* It only captures errors from child components and deeper descendants. It does not intercept errors from the same component where it is declared.
* If it returns `false`, it stops the error from propagating to higher `errorCaptured` hooks and to `app.config.errorHandler`.

In practice, it behaves like a local error boundary. The usual pattern is to use it for three things at once: log the error, show a fallback, and keep one isolated failure from taking down the rest of the interface.

## When To Use

`errorCaptured` fits well when you need to isolate failures in a specific part of the UI.

Typical cases:

* A dashboard with independent widgets where one card can fail without breaking the entire view.
* An editor, chart, or third-party component that is safer to wrap behind a fallback.
* An admin area where some modules are conditionally loaded and should not compromise the main navigation.
* A layout with reusable blocks where you want to centralize logging and show useful feedback to the user.

Practical rule: if a child component can fail and you want to contain the impact, `errorCaptured` is a strong fit.

## When To Avoid

`errorCaptured` should not be treated as a universal solution.

Avoid it when:

* The problem is an expected business error. In that case, it is usually better modeled as state (`loading`, `empty`, `error`).
* You only need to handle one specific operation. A `try/catch` is often clearer.
* It is being used to hide errors without logging them or addressing the root cause.
* Recovery depends on restarting the entire view. That usually means the boundary is placed at the wrong level.

`errorCaptured` does not replace an error-handling strategy. It complements one.

## Common Mistakes

### 1. Expecting it to catch errors from the same component

This hook is designed for descendants. If the error happens in the same component where the hook is declared, it will not be intercepted.

The fix is to move the boundary one level up or wrap the fragile part in a child component.

### 2. Returning `false` all the time

Returning `false` stops propagation. That can be useful if the error has already been handled, but doing it by default can block your global monitoring.

Return it only when the component has actually absorbed the error and logged what matters.

### 3. Showing a fallback without offering a way out

A message like "something went wrong" is not enough if the user cannot do anything next.

Whenever it makes sense, add actions such as retry, reload, or a way back to a valid state.

### 4. Using it to hide fragile code

If a component fails frequently, `errorCaptured` should not become the long-term solution. It helps reduce impact, not normalize structural issues.

## Practical Examples

### Dashboard with independent cards

If one card fails, you can replace only that block and keep the rest of the dashboard functional.

### Third-party components

Some libraries do not fail in a controlled way. Wrapping them in a boundary helps prevent them from breaking the entire view.

### Optional modules

In complex admin panels, some modules are not critical. It is better to degrade that section without affecting the main navigation.

## Full Example

```vue [Composition API]
<script setup lang="ts">
import { computed, defineComponent, h, onErrorCaptured, ref } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')
const errorSource = ref('')
const retryKey = ref(0)

const RiskyStatsPanel = defineComponent({
  name: 'RiskyStatsPanel',
  setup() {
    const shouldFail = ref(false)

    const stats = computed(() => {
      if (shouldFail.value) {
        throw new Error('The dashboard metrics could not be calculated.')
      }

      return [
        { label: 'Pending', value: 14 },
        { label: 'Completed', value: 29 },
        { label: 'Blocked', value: 3 }
      ]
    })

    return () =>
      h('section', { class: 'stats-panel' }, [
        h('h3', 'Task summary'),
        h(
          'button',
          {
            type: 'button',
            onClick: () => {
              shouldFail.value = true
            }
          },
          'Simulate widget failure'
        ),
        h(
          'ul',
          stats.value.map(stat =>
            h('li', { key: stat.label }, `${stat.label}: ${stat.value}`)
          )
        )
      ])
  }
})

onErrorCaptured((error, instance, info) => {
  hasError.value = true
  errorMessage.value =
    error instanceof Error ? error.message : 'An unexpected error occurred.'
  errorSource.value = info

  console.error('Widget captured by the dashboard boundary', {
    error,
    component: instance?.type,
    info
  })

  return false
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  errorSource.value = ''
  retryKey.value += 1
}
</script>

<template>
  <section class="dashboard-card">
    <header>
      <h2>Dashboard status</h2>
      <p>If one widget fails, the rest of the screen can keep working.</p>
    </header>

    <div v-if="hasError" class="error-box">
      <strong>This block could not be rendered.</strong>
      <p>{{ errorMessage }}</p>
      <small>Source: {{ errorSource }}</small>
      <button type="button" @click="retry">Retry</button>
    </div>

    <RiskyStatsPanel v-else :key="retryKey" />
  </section>
</template>
```

```vue [Options API]
<script lang="ts">
const RiskyStatsPanel = {
  name: 'RiskyStatsPanel',
  data() {
    return {
      shouldFail: false
    }
  },
  computed: {
    stats() {
      if (this.shouldFail) {
        throw new Error('The dashboard metrics could not be calculated.')
      }

      return [
        { label: 'Pending', value: 14 },
        { label: 'Completed', value: 29 },
        { label: 'Blocked', value: 3 }
      ]
    }
  },
  template: `
    <section class="stats-panel">
      <h3>Task summary</h3>
      <button
        type="button"
        @click="shouldFail = true"
      >
        Simulate widget failure
      </button>

      <ul>
        <li
          v-for="stat in stats"
          :key="stat.label"
        >
          {{ stat.label }}: {{ stat.value }}
        </li>
      </ul>
    </section>
  `
}

export default {
  name: 'DashboardErrorBoundary',
  components: {
    RiskyStatsPanel
  },
  data() {
    return {
      hasError: false,
      errorMessage: '',
      errorSource: '',
      retryKey: 0
    }
  },
  errorCaptured(error, instance, info) {
    this.hasError = true
    this.errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.'
    this.errorSource = info

    console.error('Widget captured by the dashboard boundary', {
      error,
      component: instance?.type,
      info
    })

    return false
  },
  methods: {
    retry() {
      this.hasError = false
      this.errorMessage = ''
      this.errorSource = ''
      this.retryKey += 1
    }
  }
}
</script>

<template>
  <section class="dashboard-card">
    <header>
      <h2>Dashboard status</h2>
      <p>If one widget fails, the rest of the screen can keep working.</p>
    </header>

    <div v-if="hasError" class="error-box">
      <strong>This block could not be rendered.</strong>
      <p>{{ errorMessage }}</p>
      <small>Source: {{ errorSource }}</small>
      <button type="button" @click="retry">Retry</button>
    </div>

    <RiskyStatsPanel v-else :key="retryKey" />
  </section>
</template>
```

The key pattern is straightforward: the error happens in the child, the parent captures it, logs context, and switches to a fallback state without affecting the rest of the tree.

> In both approaches, the responsibility is the same: the parent component defines the risk boundary and decides how the experience should degrade if something fails in its descendant tree.

## Summary

`errorCaptured` does not exist to hide exceptions. It exists to handle their impact more deliberately. Used well, it helps you build more resilient interfaces: one part can fail without compromising the whole flow.

The core idea is simple: capture locally, log with context, and give the user a clear way forward.
