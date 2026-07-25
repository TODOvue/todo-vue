---
title: "Pinia in Vue 3: When to Use Global State and When Not To"
description: "Learn how to decide whether data belongs in a component, a subtree, or a Pinia store based on its consumers, lifetime, and shared logic."
date: 2026-07-24T23:20:00-05:00
updatedAt: 2026-07-24T23:20:00-05:00
draft: true
locale: en
author: TODOvue
tags:
  - tag: "State Management"
    color: "#FF9800"
  - tag: "Architecture"
    color: "#4CAF50"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "SSR"
    color: "#0E9AA7"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1784941922/pinia-in-vue-3-when-to-use-global-state-and-when-not-to_aztyma.png
coverAlt: "Decision diagram for choosing between local state, props and events, composables, or Pinia in Vue 3."
coverCaption: "Visual reference for deciding the scope of state in Vue 3."
keywords:
  - State
  - Pinia
  - Vue 3
  - State Management
  - Architecture
  - Composables
schemaOrg:
  - type: "BlogPosting"
    headline: "Pinia in Vue 3: When to Use Global State and When Not To"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-24T23:20:00-05:00"
---

# Pinia in Vue 3: When to Use Global State and When Not To

Pinia does not make an application scalable on its own. A poorly chosen store can hide who owns a piece of data and turn a simple component relationship into a global dependency.

The decision starts before choosing a tool: identify who consumes the state, who changes it, and how long it needs to live. With those criteria, Pinia becomes a useful boundary when the scope is truly global.

## Before choosing Pinia: define the scope of state

Every component instance already has its own reactive state. Shared state matters when multiple components or views depend on the same data, or when different actions need to coordinate its changes.

Before creating a store, ask:

- Does a single component own this data?
- Do only the components of one screen or subtree coordinate it?
- Does it need to survive navigation?
- Does changing it represent a recognizable business operation?

Pinia follows from those answers; it is not the starting point.

## Decision map: local, subtree, or global

| Situation                                 | Recommended scope                        | Example                     |
|-------------------------------------------|------------------------------------------|-----------------------------|
| A component's visual control              | Local state with `ref()` or `reactive()` | Opening a modal on one page |
| Several descendants of one screen         | Common ancestor with props and events    | Catalog filters             |
| Reusable behavior per instance            | Composable with local state per use      | Search logic                |
| Data and logic across components or pages | Pinia store                              | Session across navigation   |
| A process that continues between routes   | Pinia store                              | Multi-page checkout         |

A composable centralizes reusable behavior, but it does not make its state global automatically. Decide separately whether every use needs its own instance or the application requires one shared source.

## When props and events are clearer than a store

In a parent-child relationship, props and events keep the flow explicit: the parent provides data and the child communicates an intention. The child should not mutate a prop.

Here, the filters belong to the catalog screen. The ancestor keeps the state and the child control requests the change; no other route needs to know about it.

```vue [CatalogPage.vue] {4,14}
<script setup>
import { ref } from 'vue'

const selectedCategory = ref('all')

function selectCategory(category) {
  selectedCategory.value = category
}
</script>

<template>
  <CategoryFilters
    :selected-category="selectedCategory"
    @select-category="selectCategory"
  />
</template>
```

```vue [CategoryFilters.vue] {9}
<script setup>
defineProps({
  selectedCategory: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['select-category'])
</script>

<template>
  <button
    type="button"
    :aria-pressed="selectedCategory === 'books'"
    @click="emit('select-category', 'books')"
  >
    Books
  </button>
</template>
```

The parent declares the true owner of the state, and the child emits an intention without changing the prop. If too many intermediate levels make the tree uncomfortable, revisit the design and the scope: prop drilling is a signal to evaluate alternatives, not an automatic order to globalize.

## When Pinia earns its place

A Pinia store organizes state and business logic outside the component tree through `state`, getters, and actions. It fits when multiple parts of the application need the same source of truth, such as a session shown in navigation and protected pages, or a complex form that continues across pages.

A small store should have one specific responsibility. In an Option Store, declare every property in `state()`; do not add them later.

```ts [stores/session.ts] {6-8,11,15-17}
import { defineStore } from 'pinia'

type SessionUser = { id: string; name: string }

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: undefined as SessionUser | undefined,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== undefined,
  },

  actions: {
    setUser(user: SessionUser) {
      this.user = user
    },
    clearSession() {
      this.user = undefined
    },
  },
})
```

`user` is stored state and `isAuthenticated` is derived state, so it is not duplicated as mutable data. Actions name session operations and make it easier to locate why shared state changes. This does not mean an action alone prevents every direct mutation: clarity comes from establishing and respecting that boundary.

Do not use this store for the visibility of a tooltip or a modal that exists on only one page. That detail belongs to the component or, at most, its screen.

## Simple shared state and composables: alternatives with boundaries

For a simple SPA case, Vue lets you share a `reactive()` object imported by several components. The important boundary is mutation: if every consumer can write any property, the design loses traceability.

```ts [catalogFilters.ts] {5-7}
import { reactive } from 'vue'

export const catalogFilters = reactive({
  category: 'all',
  setCategory(category: string) {
    this.category = category
  },
})
```

Centralizing the change in `setCategory()` communicates which operation is happening. Consider Pinia when the state grows or you need collaboration conventions, DevTools integration, HMR, or a more robust SSR boundary.

## SSR: do not share state between requests

In server-side rendering, a reactive singleton created at module scope can share state between requests. Isolation must respect each application instance.

Pinia works with the corresponding Pinia instance. If you use a store outside a component, do it when that instance is available and use the one associated with the current application. This is an isolation rule, not a framework-specific recipe.

## Common mistakes and a practical rule

Avoid globalizing every reactive variable, replacing props and events in a simple parent-child relationship, storing ephemeral visual details from one page in a store, allowing shared mutations without an operation with clear intent, and creating a manual singleton for SSR.

The practical rule is to start with the smallest scope that honestly represents who owns the data. Expand it when consumers, cross-page lifetime, or coordination logic demand it. Pinia adds value when it makes a real global boundary explicit.
