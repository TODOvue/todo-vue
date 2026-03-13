---
title: "Vue Lifecycle: cached components with <KeepAlive> (activated, deactivated)"
description: "How activated and deactivated work in components cached with <KeepAlive>, when to use them, and how to avoid stale data, running timers, and misplaced lifecycle logic."
date: 2026-03-12T23:00:00-05:00
updatedAt: 2026-03-12T23:00:00-05:00
tags:
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Components"
    color: "#41B883"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Architecture"
    color: "#4CAF50"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773371011/vue-lifecycle-keepalive-activated-deactivated_abjmwe.png
coverAlt: "Illustration of cached Vue components with KeepAlive using activated and deactivated"
coverCaption: "KeepAlive lets Vue deactivate and reactivate components without destroying their local state"
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 6
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - KeepAlive
  - activated
  - deactivated
  - component cache
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: cached components with <KeepAlive> (activated, deactivated)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-12T23:00:00-05:00"
---
# Vue Lifecycle: cached components with `<KeepAlive>` (`activated`, `deactivated`)

Not every component truly disappears when it stops being visible. In Vue, a component wrapped in `<KeepAlive>` can leave the active DOM and still remain alive in memory. That detail completely changes how you should think about its lifecycle.

If you treat a cached component as if it always mounts from scratch, it becomes easy to reload data unnecessarily, leave timers or polling running while the view is no longer visible, or show stale information when the user returns to a tab.

The `activated` and `deactivated` hooks exist for exactly that scenario: components that move in and out of view without being destroyed on every switch.

## Core Concept

`<KeepAlive>` caches dynamic component instances so their state survives between switches. Instead of unmounting the component when it stops being shown, Vue moves it into a deactivated state.

That means the lifecycle is no longer just:

* Mount
* Update
* Unmount

There is now another important intermediate state:

* Activate
* Deactivate
* Activate again

The relevant hooks are:

* `onActivated()` / `activated`
* `onDeactivated()` / `deactivated`

There are two key details worth keeping in mind:

* `activated` also runs on the initial mount of the cached component.
* `deactivated` runs when the component leaves the active DOM for the cache and also when it is finally unmounted.

In practical terms:

* `mounted` is for one-time initialization.
* `activated` is for every moment the view becomes active again.
* `deactivated` is for pausing, saving, or cleaning up work while the instance stays in the background.
* `unmounted` only matters when the instance truly stops existing.

## When To Use

`activated` and `deactivated` fit best when the component needs to behave differently depending on whether it is visible or only cached.

Typical cases:

* Revalidating data when returning to a tab without losing local form state or filters.
* Pausing polling, listeners, or observers when the view stops being active.
* Restoring scroll, focus, or sync with external libraries when the component reappears.
* Keeping navigation smooth between tabs, dashboards, or dynamic views without reinstantiating everything from scratch.

The practical rule is simple:

* If you need to react to the component coming back, think about `activated`.
* If you need to stop work while the instance stays cached, think about `deactivated`.

## When To Avoid

Not every component needs `<KeepAlive>` or these hooks.

It is usually better to avoid them when:

* The component should start clean on every visit and should not preserve state.
* The logic fits better in global state or derived data, without caching the whole view.
* The real problem is a confusing navigation flow, not state loss.
* You want to force a full refresh on every visit; in that case, the cache works against you.

It is also worth keeping logic in the right place:

* If you depend on one specific piece of data, a `watch()` usually expresses the intent more clearly.
* If you only need one-time initialization, `mounted` or `setup()` is usually enough.
* If the component is not inside `<KeepAlive>`, these hooks will not run.

## Comparison

| Hook | When it runs | Best fit | Common mistake |
|---|---|---|---|
| `mounted` | When the instance mounts for the first time | One-time initialization | Putting logic here that should run every time the view returns |
| `activated` | On initial mount and on every reactivation from cache | Refreshing, re-syncing, or resuming visible work | Assuming the component comes back from a clean state |
| `deactivated` | When the component leaves the active DOM for cache and also on unmount | Pausing polling, timers, observers, or persisting temporary state | Treating it as if it meant full destruction |
| `unmounted` | When the instance is actually destroyed | Final cleanup | Expecting it to happen on every switch between cached views |

The decisive difference is this: a cached component does not die when it leaves the screen. It simply goes idle.

## Common Mistakes

### 1. Loading data only in `mounted`

That works the first time, but it often fails once the user leaves and comes back. Because the component stays cached, `mounted` does not run again and you can end up showing stale data.

The usual fix is to move light revalidation into `activated`.

### 2. Leaving polling or timers running while the view is hidden

A deactivated component still exists in memory. If you do not stop `setInterval`, sockets, or listeners, that work keeps running even though the screen is no longer visible.

The solution is to pause in `deactivated` and resume in `activated` when appropriate.

### 3. Expecting `unmounted` when switching between cached tabs

When you switch between components inside `<KeepAlive>`, there is often no immediate unmount. What happens instead is deactivation.

If all your cleanup depends on `unmounted`, it will happen late or not when you expected it to.

### 4. Confusing state preservation with data freshness

`<KeepAlive>` preserves local state, but it does not guarantee that your data is still current. You can return to a form with all its values intact and, at the same time, to a list backed by outdated data.

Caching the instance does not replace a refresh strategy.

## Practical Examples

### Returning to a tab without losing filters

Imagine a reporting view with filters, sorting, and internal scroll. Without `<KeepAlive>`, each tab change can destroy the instance and force the user to start over. With caching, the experience stays intact. With `activated`, you can also refresh only the summary or the last sync timestamp.

### Pausing background work

If a view fetches metrics every 30 seconds, it should not keep doing that after the user moves to another section while the instance remains cached. `deactivated` is the natural place to stop that work.

### Resuming visual synchronization

Some views need to recalculate sizes, charts, or panels when they reappear. Because the component is not recreated, `mounted` is already behind you. In that situation, `activated` is the right point to resync the UI.

```vue [Composition API]
<script setup lang="ts">
import { computed, onActivated, onDeactivated, onMounted, ref } from 'vue'

type Task = {
  id: number
  title: string
  done: boolean
}

const tasks = ref<Task[]>([])
const filter = ref<'all' | 'pending' | 'done'>('all')
const status = ref('Waiting for load...')
const lastSync = ref<string | null>(null)
const poller = ref<ReturnType<typeof setInterval> | null>(null)
const initialized = ref(false)

const visibleTasks = computed(() => {
  if (filter.value === 'pending') {
    return tasks.value.filter(task => !task.done)
  }

  if (filter.value === 'done') {
    return tasks.value.filter(task => task.done)
  }

  return tasks.value
})

async function fetchTasks() {
  status.value = 'Syncing...'

  const response = await fetch('/api/tasks')
  const data = (await response.json()) as { tasks: Task[] }

  tasks.value = data.tasks
  lastSync.value = new Date().toLocaleTimeString('en-US')
  status.value = 'Data updated'
}

function startPolling() {
  if (poller.value !== null) return

  poller.value = setInterval(() => {
    void fetchTasks()
  }, 30000)
}

function stopPolling() {
  if (poller.value === null) return

  clearInterval(poller.value)
  poller.value = null
}

onMounted(() => {
  initialized.value = true
})

onActivated(async () => {
  status.value = initialized.value ? 'View reactivated' : 'Loading view...'
  await fetchTasks()
  startPolling()
})

onDeactivated(() => {
  status.value = 'View paused'
  stopPolling()
})
</script>

<template>
  <section class="task-report">
    <header>
      <h2>Task report</h2>
      <p>{{ status }}</p>
      <p v-if="lastSync">Last sync: {{ lastSync }}</p>
    </header>

    <nav class="filters">
      <button @click="filter = 'all'">All</button>
      <button @click="filter = 'pending'">Pending</button>
      <button @click="filter = 'done'">Completed</button>
    </nav>

    <ul>
      <li
        v-for="task in visibleTasks"
        :key="task.id"
      >
        {{ task.title }}
      </li>
    </ul>
  </section>
</template>
```

```vue [Options API]
<script>
export default {
  data() {
    return {
      tasks: [],
      filter: 'all',
      status: 'Waiting for load...',
      lastSync: null,
      poller: null,
      initialized: false
    }
  },

  computed: {
    visibleTasks() {
      if (this.filter === 'pending') {
        return this.tasks.filter(task => !task.done)
      }

      if (this.filter === 'done') {
        return this.tasks.filter(task => task.done)
      }

      return this.tasks
    }
  },

  mounted() {
    this.initialized = true
  },

  async activated() {
    this.status = this.initialized ? 'View reactivated' : 'Loading view...'
    await this.fetchTasks()
    this.startPolling()
  },

  deactivated() {
    this.status = 'View paused'
    this.stopPolling()
  },

  methods: {
    async fetchTasks() {
      this.status = 'Syncing...'

      const response = await fetch('/api/tasks')
      const data = await response.json()

      this.tasks = data.tasks
      this.lastSync = new Date().toLocaleTimeString('en-US')
      this.status = 'Data updated'
    },

    startPolling() {
      if (this.poller !== null) return

      this.poller = setInterval(() => {
        void this.fetchTasks()
      }, 30000)
    },

    stopPolling() {
      if (this.poller === null) return

      clearInterval(this.poller)
      this.poller = null
    }
  }
}
</script>

<template>
  <section class="task-report">
    <header>
      <h2>Task report</h2>
      <p>{{ status }}</p>
      <p v-if="lastSync">Last sync: {{ lastSync }}</p>
    </header>

    <nav class="filters">
      <button @click="filter = 'all'">All</button>
      <button @click="filter = 'pending'">Pending</button>
      <button @click="filter = 'done'">Completed</button>
    </nav>

    <ul>
      <li
        v-for="task in visibleTasks"
        :key="task.id"
      >
        {{ task.title }}
      </li>
    </ul>
  </section>
</template>
```

* `onActivated()` covers both the first activation and every return from cache.
* `onDeactivated()` pauses polling so it does not keep consuming resources off screen.
* The local filter stays intact because the instance is not destroyed.
* `onMounted()` stays reserved for truly initial work; here it only marks that the instance has already gone through its first mount.

## Summary

* `<KeepAlive>` preserves the instance and its local state between view switches.
* `activated` does not mean "mount again"; it means "become active again".
* `deactivated` is the right hook for pausing work while the instance stays cached.
* Preserving state does not remove the need to revalidate data when the view returns.
* If the component should always restart from scratch, you probably should not cache it.
