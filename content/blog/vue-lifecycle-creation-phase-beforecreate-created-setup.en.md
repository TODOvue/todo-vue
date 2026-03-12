---
title: "Vue Lifecycle: creation phase (beforeCreate, created, setup)"
description: "What really happens during a Vue component's creation phase and how to choose between beforeCreate, created, and setup."
date: 2026-03-06T20:00:00-05:00
updatedAt: 2026-03-06T20:00:00-05:00
tags:
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Components"
    color: "#41B883"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Best Practices"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773284254/vue-lifecycle-creation-phase-beforecreate-created-setup_fkkyiw.png
coverAlt: "Illustration of a Vue component lifecycle highlighting the creation phase with beforeCreate, created, and setup"
coverCaption: "This image shows a Vue component lifecycle, focusing on the creation phase where beforeCreate, created, and setup run."
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 2
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - beforeCreate
  - created
  - setup
  - Composition API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: creation phase (beforeCreate, created, setup)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-06T20:00:00-05:00"
---
# Vue lifecycle: creation phase (`beforeCreate`, `created`, `setup`)

When you start writing a Vue component, one of the most common questions is: **where should I put the initial logic?**

The answer mostly depends on whether you are working with **Options API** or **Composition API**.

The **creation phase** is when Vue builds the component instance, initializes its reactivity system, and prepares internal state. At this stage, the component is still **not mounted in the DOM**.

## What happens in this phase

In practical terms, the classic lifecycle order with **Options API** is:

1. `beforeCreate`
2. `created`
3. mount (`beforeMount` / `mounted`)

With **Composition API**, the entry point is `setup()`, which runs **before Options API lifecycle hooks**, including `beforeCreate` and `created`.

If you want one quick takeaway:

* **`beforeCreate`** -> extremely early point; rarely needed today.
* **`created`** -> reactive state is available in Options API.
* **`setup`** -> main starting point in Composition API.

## `beforeCreate`: where it appears and why it is rarely used

`beforeCreate` runs **before Vue finishes initializing reactive state and instance options**.

At this point:

* `data`
* `computed`
* `methods`

Are still **not initialized**, so instance access is very limited.

For that reason, in modern Vue 3 projects this hook is rarely used. In most cases it only appears in **legacy code or very specific plugin/framework-extension scenarios**.

```vue [App.vue]{3-5}
<script>
export default {
  beforeCreate() {
    console.log('The component is starting')
  }
}
</script>
```

## `created`: the practical point in Options API

In `created`, the component instance is already initialized in terms of **reactive state and methods**, even though the **DOM has not been rendered yet**.

That makes it a good place to:

* Initialize state derived from configuration.
* Load data early.
* Prepare timers or listeners that do not depend on the DOM.

```vue [App.vue]{8-10}
<script>
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    this.users = await fetch('/api/users').then((r) => r.json())
  }
}
</script>
```

## `setup`: the natural start in Vue 3

When you use **Composition API**, `setup()` is the real entry point of the component.

Inside `setup` you define:

* `ref`
* `reactive`
* `computed`
* `watch`
* composables

Also, `setup` runs **before the component is mounted**, so it is the right place to prepare all state needed for first render.

```vue [App.vue]{7}
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

console.log('setup executed')
</script>

<template>
  <button @click="count++">
    count: {{ count }} / double: {{ double }}
  </button>
</template>
```

## Quick comparison: `beforeCreate` vs `created` vs `setup`

| Point          | API         | What is already available                | When to choose it                        |
|----------------|-------------|------------------------------------------|------------------------------------------|
| `beforeCreate` | Options     | Instance in very early startup           | Very specific cases or legacy code       |
| `created`      | Options     | State and methods available, no DOM      | Data init or logic that does not use DOM |
| `setup`        | Composition | Reactivity and composables from the start| Main option in modern Vue 3              |

## Common recurring mistakes

### 1) Trying to manipulate the DOM in `created` or early `setup`

Neither `created` nor the beginning of `setup` guarantees a mounted DOM.

If you need real DOM elements, use:

* `mounted` (Options API)
* `onMounted` (Composition API)

### 2) Using `beforeCreate` out of habit

Many old Vue examples use it, but in Vue 3 it **rarely provides real value** compared with `setup` (Composition API) or `created` (Options API).

### 3) Mixing Options API and Composition API mentally

Vue allows both APIs in the same project, but inside each component it is better to **keep one clear primary entry point**. Otherwise, initialization logic gets duplicated easily.

## An equivalent example in both styles

Let us say we want to **load users when the component is created**, without relying on the DOM.

```vue [Composition API]
<script setup>
import { ref } from 'vue'

const users = ref([])

async function loadUsers() {
  users.value = await fetch('/api/users').then((r) => r.json())
}

// Runs during setup (creation phase)
loadUsers()
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    this.users = await fetch('/api/users').then((r) => r.json())
  }
}
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

## Closing notes

* In modern Vue 3 components, **`setup` is usually the clearest and most consistent entry point** for initial state and logic.
* If you are working on **Options API** components, **`created` is still fully valid** for initialization that does not depend on the DOM.
* Meanwhile, **`beforeCreate` is mostly a historical hook** in most current projects.
