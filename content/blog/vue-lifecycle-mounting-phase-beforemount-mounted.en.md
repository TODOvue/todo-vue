---
title: "Vue Lifecycle: mounting phase (beforeMount, mounted)"
description: "What happens right before and right after Vue inserts a component into the DOM, and how to use beforeMount and mounted without turning them into a dumping ground."
date: 2026-03-09T22:00:00-05:00
updatedAt: 2026-03-09T22:00:00-05:00
tags:
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Components"
    color: "#41B883"
  - tag: "Best Practices"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773284431/vue-lifecycle-mounting-phase-beforemount-mounted_wkrzal.png
coverAlt: "Illustration of a Vue component lifecycle focused on the DOM mounting phase"
coverCaption: "The mounting phase is the moment when Vue creates and inserts the component DOM into the page."
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 3
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - beforeMount
  - mounted
  - onMounted
  - DOM
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: mounting phase (beforeMount, mounted)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-09T22:00:00-05:00"
---
# Vue Lifecycle: mounting phase (`beforeMount`, `mounted`)

Many day-to-day problems in Vue come from the same source: trying to interact with the DOM too early or piling logic into `mounted` that could have run earlier.

The mounting phase is exactly where that boundary sits. It is the moment when Vue stops preparing the component internally and finally inserts it into the page. Understanding that transition makes it easier to decide when to focus an input, when to initialize an external library, and when you simply do not need any hook at all.

## Core Concept

During the mounting phase, Vue already has the component reactivity in place: props, state, watchers, and the render tree are ready. What changes at this stage is that **the real DOM starts to exist**.

This is where two classic lifecycle hooks appear:

* `beforeMount`: runs when Vue is about to mount the component, but the real DOM has not been inserted yet.
* `mounted`: runs when the component has already been mounted and you can interact with real DOM nodes.

If you are working with the Composition API, the equivalents are:

* `onBeforeMount()`
* `onMounted()`

A practical way to think about it:

* If you need to prepare **state or logic that does not depend on the DOM**, that usually belongs in `setup`.
* If you need to **interact with real interface elements**, `mounted` is usually the natural place.
* If you are considering `beforeMount`, it is worth checking whether that code fits better earlier, for example inside `setup`.

Also, in SSR applications, **neither `beforeMount` nor `mounted` runs on the server**. These hooks exist only on the client.

## When To Use

The mounting phase makes sense when the component needs to cross the boundary between reactive state and the real browser environment.

Typical cases:

* Focusing a search field when the view appears.
* Initializing an external library that needs a DOM container, such as a chart or editor.
* Measuring sizes, positions, or scroll after the first render.
* Registering browser API integrations that depend on real DOM nodes.

`beforeMount` sees much less use in practice, but it can still help when you need to:

* Leave debug traces or performance markers before mounting.
* Adjust some state right before the first browser render happens.
* Prepare integrations that need to know mounting is imminent, even if they do not touch the DOM yet.

## When To Avoid

Not everything should be solved in this phase.

Avoid `beforeMount` and `mounted` when:

* You are only loading data that **does not depend on the DOM**.
* The logic belongs in a `watch`, a `computed`, or a **composable**.
* You are using `mounted` as a dumping ground for "whatever was left".
* You need logic that must work with **SSR from the first render**.

If the work can happen before mounting, it is usually better to do it earlier. That way the component reaches the screen in a cleaner state and the first render is not burdened with unnecessary tasks.

## Comparison

| Hook | What already exists | What you still should not assume | Typical use |
|---|---|---|---|
| `beforeMount` | Reactive state, props, methods, and prepared render output | Real DOM availability | Very targeted logic right before mounting |
| `mounted` | Component inserted into the DOM | That external libraries or async work have already finished on their own | Focusing, measuring, integrating browser APIs |

In most modern projects, `mounted` shows up often and `beforeMount` very rarely. That does not mean `beforeMount` is wrong, only that **there is usually a better place for that logic**.

## Common Mistakes

### 1. Trying to read or modify the DOM in `beforeMount`

This is a classic mistake. In `beforeMount`, Vue is about to mount the component, but the real nodes do not exist yet.

If you need to do something like:

* `focus()`
* `getBoundingClientRect()`
* initialize a library on top of a container

Then you need to wait for `mounted`.

### 2. Moving every initial load into `mounted` out of habit

Not every `fetch` belongs in `mounted`. If the request does not depend on the DOM, you can start it earlier and avoid delaying the visual experience for no good reason.

`mounted` **is not the main hook**. It is simply the right hook when the real browser environment becomes part of the problem.

For example, this kind of logic does not need `mounted`:

```vue [App.vue]
<script setup lang="ts">
import { ref } from 'vue'

const users = ref([])

async function loadUsers() {
  const res = await fetch('/api/users')
  users.value = await res.json()
}

loadUsers()
</script>
```

> Here, the load can start directly in `setup`.

### 3. Creating listeners or timers in `mounted` and forgetting to clean them up

This mistake does not show up during mounting, but it shows up later.

If you register:

* global events
* `setInterval`
* `ResizeObserver`
* `IntersectionObserver`

inside `mounted`, you should clean them up in `beforeUnmount` or `onBeforeUnmount`.

```vue [App.vue]
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

let interval: number

onMounted(() => {
  interval = window.setInterval(() => {
    console.log('tick')
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
```

> Mounting well also means **being ready for unmounting**.

### 4. Assuming these hooks also run in SSR

In Nuxt or any server-side rendering flow, these hooks **run only on the client**.

If you put critical initial HTML logic inside `mounted`, that logic **will not be part of the server's first render**.

In Nuxt, for example, initial data loading usually lives in composables or helpers such as `useAsyncData`.

## Practical Examples

### Focusing an input when a view opens

This is one of the simplest and most useful examples: the element needs to exist before you can call `focus()`.

### Initializing a third-party library

If you use a chart, calendar, or rich text editor, the library normally needs a DOM container. That is a natural job for `mounted`.

### Measuring a block after the first render

Some components need to know their height or width to decide animations, layout, or scroll behavior. That measurement also belongs to the mounting phase.

```vue [Composition API]
<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'

const searchInput = ref<HTMLInputElement | null>(null)
const status = ref('Preparing component...')

onBeforeMount(() => {
  status.value = 'Vue has prepared the instance, but the input does not exist in the DOM yet.'
})

onMounted(() => {
  searchInput.value?.focus()
  status.value = 'Component mounted. The input can now receive focus.'
})
</script>

<template>
  <section class="search-panel">
    <p>{{ status }}</p>

    <input
      ref="searchInput"
      type="search"
      placeholder="Search tasks"
    >
  </section>
</template>
```

```vue [Options API]
<script>
export default {
  data() {
    return {
      status: 'Preparing component...'
    }
  },

  beforeMount() {
    this.status = 'Vue is about to insert the component DOM.'
  },

  mounted() {
    this.status = 'Component mounted. The input can now receive focus.'

    if (this.$refs.searchInput instanceof HTMLInputElement) {
      this.$refs.searchInput.focus()
    }
  }
}
</script>

<template>
  <section class="search-panel">
    <p>{{ status }}</p>

    <input
      ref="searchInput"
      type="search"
      placeholder="Search tasks"
    >
  </section>
</template>
```

> Here, `onBeforeMount()` only updates an informational state. `focus()`, on the other hand, stays in `onMounted()` because it needs a real DOM node.

## Summary

* `beforeMount` exists, but in most components it will not be your main tool. If you do not need the DOM, it is usually better to solve the logic earlier.
* `mounted`, on the other hand, has a very clear role: **it is the hook where the component meets the real browser**. Inputs, measurements, charts, observers, and third-party libraries often start there.
* The best way to use this phase is not to put more into it, but to **reserve it only for what truly depends on the DOM**.
