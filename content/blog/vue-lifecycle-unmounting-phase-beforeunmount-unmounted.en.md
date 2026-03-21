---
title: "Vue Lifecycle: unmounting phase (beforeUnmount, unmounted)"
description: "What happens when a component leaves the screen and how to use beforeUnmount and unmounted to clean up listeners, timers, and side effects without leaks or strange behavior."
date: 2026-03-11T22:00:00-05:00
updatedAt: 2026-03-11T22:00:00-05:00
tags:
  - tag: "Lifecycle"
    color: "#FF6B6B"
  - tag: "Components"
    color: "#41B883"
  - tag: "Basics"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773284773/vue-lifecycle-unmounting-phase-beforeunmount-unmounted_f9gqy0.png
coverAlt: "Illustration of the unmounting phase of the Vue lifecycle with beforeUnmount and unmounted"
coverCaption: "The unmounting phase happens when Vue removes a component from the active tree"
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 5
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - beforeUnmount
  - unmounted
  - onBeforeUnmount
  - cleanup
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: unmounting phase (beforeUnmount, unmounted)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-11T22:00:00-05:00"
---
# Vue Lifecycle: unmounting phase (`beforeUnmount`, `unmounted`)

Many bugs do not start when a component appears, but when it disappears. A global listener left running, a `setInterval` that was never cleared, or a request that is still in flight after the user already changed views usually begins there.

The unmounting phase is what lets you close that story properly. It is not only about "removing things", but about leaving the component in a clean state when Vue takes it out of the tree. If you understand the difference between `beforeUnmount` and `unmounted`, you can avoid memory leaks, duplicated side effects, and components that keep doing work even though they are no longer on screen.

## Core Concept

Unmounting happens when Vue decides to remove a component from the active tree. That can happen, for example, when a `v-if` flips to `false`, when the route changes, or when a dynamic component stops rendering.

During that phase, two hooks appear:

* `beforeUnmount`: runs **right before Vue unmounts the component**.
* `unmounted`: runs **after the component has already been unmounted**.

In the Composition API, the equivalents are:

* `onBeforeUnmount()`
* `onUnmounted()`

The important difference is this:

* Inside `beforeUnmount`, the instance still exists and you can still access its state, refs, and active resources to clean them up.
* Inside `unmounted`, Vue has already finished unmounting the component and stopped its reactive effects. That point is more useful for final confirmations, traces, or very specific integrations.

In practice, most meaningful cleanup happens in `beforeUnmount`.

## When To Use

The unmounting phase makes sense when the component opened resources that should not stay alive afterward.

Typical cases:

* Removing listeners registered on `window`, `document`, or any external object.
* Clearing `setInterval`, `setTimeout`, `requestAnimationFrame`, or `ResizeObserver`.
* Closing sockets, disconnecting observers, or aborting pending requests.
* Leaving one final debug trace or telemetry signal after the component has fully left.

A simple rule:

* If you need to **disconnect or cancel something**, start by thinking about `beforeUnmount`.
* If you need to **know that the component has fully finished leaving**, think about `unmounted`.

## When To Avoid

Not everything belongs in these hooks.

Avoid `beforeUnmount` and `unmounted` when:

* The logic can live inside a composable with `onScopeDispose`.
* The resource already cleans itself up and does not need manual teardown.
* You are using the hook to compensate for a problem that really comes from poor component structure.
* The component is not truly being unmounted and is only being hidden.

That last point matters a lot:

* `v-if` can unmount a component.
* `v-show` only hides it.
* A component cached with `<KeepAlive>` can be deactivated without being unmounted.

If you mix up those cases, you will wait for a hook that never runs.

## Comparison

| Hook | What is still available | Natural use | Typical risk |
|------|--------------------------|-------------|--------------|
| `beforeUnmount` | Instance, refs, state, and active resources | Cleaning listeners, timers, observers, or aborting requests | Leaving too much work for later |
| `unmounted` | The component is already out of the tree and its effects have been stopped | Final traces or very specific integrations | Trying to do cleanup that depended on the live instance |

`unmounted` exists, but that does not mean it should carry the whole burden of teardown. If you need to touch something the component opened, waiting for `unmounted` is usually too late.

## Common Mistakes

### 1. Registering resources in `mounted` and forgetting to close them

This is the most common mistake. The component mounts correctly, works for a while, and then starts acting strangely because an old listener is still responding even though the view already changed.

This often happens with:

* `window.addEventListener()`
* `setInterval()`
* `IntersectionObserver`
* `ResizeObserver`
* websockets or external subscriptions

If you opened it manually, you should assume it is also your job to close it.

### 2. Leaving all cleanup for `unmounted`

`unmounted` is not the ideal place for everything. If you need to abort a request, disconnect an observer, or remove listeners while the instance is still accessible, `beforeUnmount` is clearer and safer.

Think of `beforeUnmount` as taking the table apart before carrying it out of the room.

### 3. Confusing hiding with unmounting

Many developers expect `beforeUnmount` to run when a panel stops being visible. But if that panel uses `v-show`, the component is still alive.

The same thing happens with `<KeepAlive>`: when the view changes, the component can be deactivated and later reactivated without ever going through `unmounted`.

If the real problem is activation or deactivation, the correct hooks may be different.

### 4. Starting new work while the component is already leaving

It is a bad idea to start heavy new work during unmounting. If you open another request or start another subscription inside `beforeUnmount`, you make the exact moment Vue is trying to close the component more complicated than it needs to be.

The unmounting phase should reduce work, not create more of it.

## Practical Examples

### Cleaning global listeners when leaving a view

If a view listens to browser events, those listeners should disappear when the route changes. Otherwise, you end up reacting twice to the same event when the user comes back.

### Aborting a pending request

In components with fast navigation, it is normal for a request to still be running while the user has already left the page. Cancelling it in `beforeUnmount` avoids unnecessary work and inconsistent state.

### Leaving a final debug trace

`unmounted` can be useful when you want to confirm that the component really did leave while you are debugging unexpected remounts, caching, or conditional rendering.

```vue [Composition API]
<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'

const status = ref('Loading status...')
const totalTasks = ref<number | null>(null)

let controller: AbortController | null = null

function syncOnlineStatus() {
  status.value = navigator.onLine ? 'Online' : 'Offline'
}

async function loadSummary() {
  controller = new AbortController()

  try {
    const response = await fetch('/api/tasks/summary', {
      signal: controller.signal
    })

    const data = await response.json() as { total: number }
    totalTasks.value = data.total
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    console.error('Failed to load the summary', error)
  }
}

onMounted(() => {
  syncOnlineStatus()
  window.addEventListener('online', syncOnlineStatus)
  window.addEventListener('offline', syncOnlineStatus)
  void loadSummary()
})

onBeforeUnmount(() => {
  window.removeEventListener('online', syncOnlineStatus)
  window.removeEventListener('offline', syncOnlineStatus)
  controller?.abort()
})

onUnmounted(() => {
  console.info('TaskSummary has left the tree')
})
</script>

<template>
  <section class="task-summary">
    <p>{{ status }}</p>
    <p v-if="totalTasks !== null">
      Registered tasks: {{ totalTasks }}
    </p>
  </section>
</template>
```

```vue [Options API]
<script>
export default {
  data() {
    return {
      status: 'Loading status...',
      totalTasks: null,
      controller: null
    }
  },

  mounted() {
    this.syncOnlineStatus()
    window.addEventListener('online', this.syncOnlineStatus)
    window.addEventListener('offline', this.syncOnlineStatus)
    void this.loadSummary()
  },

  beforeUnmount() {
    window.removeEventListener('online', this.syncOnlineStatus)
    window.removeEventListener('offline', this.syncOnlineStatus)
    this.controller?.abort()
  },

  unmounted() {
    console.info('TaskSummary has left the tree')
  },

  methods: {
    syncOnlineStatus() {
      this.status = navigator.onLine ? 'Online' : 'Offline'
    },

    async loadSummary() {
      this.controller = new AbortController()

      try {
        const response = await fetch('/api/tasks/summary', {
          signal: this.controller.signal
        })

        const data = await response.json()
        this.totalTasks = data.total
      }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('Failed to load the summary', error)
      }
    }
  }
}
</script>

<template>
  <section class="task-summary">
    <p>{{ status }}</p>
    <p v-if="totalTasks !== null">
      Registered tasks: {{ totalTasks }}
    </p>
  </section>
</template>
```

* `onMounted()` opens external resources.
* `onBeforeUnmount()` performs the real cleanup.
* `onUnmounted()` leaves a final confirmation that the component has fully exited.

## Summary

* `beforeUnmount` is the main hook for cleaning up what the component opened.
* `unmounted` confirms that unmounting has already finished.
* If the component is only hidden or cached, these hooks may never run.
* The most useful rule is simple: if you registered listeners, timers, observers, or manual requests, define their teardown too.
