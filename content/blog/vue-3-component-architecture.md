---
title: "Vue 3 Component Architecture: Communication, Reuse, and Dependencies"
description: "Learn when to use props, events, slots, fallthrough attributes, composables, and provide/inject to design clear and maintainable Vue 3 components."
date: 2026-07-10T17:22:43-05:00
updatedAt: 2026-07-10T17:22:43-05:00
draft: false
locale: en
author: TODOvue
tags:
  - tag: "Components"
    color: "#41B883"
  - tag: "Architecture"
    color: "#4CAF50"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "Events"
    color: "#2D98DA"
  - tag: "Slots"
    color: "#8E44AD"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1783729357/vue-3-component-architecture_ecetna.png
coverAlt: "Vue.js guide to architecture and reusable components"
coverCaption: "Official Vue.js reference for components"
keywords:
  - Components
  - Vue 3 component architecture
  - props and events
  - slots in Vue 3
  - composables
  - provide/inject
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue 3 Component Architecture: Communication, Reuse, and Dependencies"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-10T17:22:43-05:00"
---

# Vue 3 Component Architecture: Communication, Reuse, and Dependencies

When a component grows, the difficult part is usually not the syntax. It is deciding where data belongs, how pieces communicate, and which logic deserves to be reused. A useful architecture separates visual structure, inputs, events, content, and dependencies without creating unnecessary abstractions.

In Vue 3, you can think of components as a hierarchy connected through explicit contracts. Props carry data down, events communicate intentions up, slots enable visual composition, composables extract logic, and `provide/inject` handles deep dependencies.

## A mental model: components as a tree of responsibilities

Components encapsulate independent, reusable pieces organized as a tree. Each use of a component creates an independent instance with its own state. In a Single-File Component using `<script setup>`, imported components are automatically available in the template.

Start with one clear responsibility. A component can coordinate other components, but it should not casually accumulate presentation, data fetching, validation, and cross-cutting configuration.

## Explicit communication: props and events

Props represent inputs. Declare them explicitly so the contract is visible and Vue can validate types and warn during development when a value does not follow the declared rules. Treat props as input data: the child should not mutate them directly.

Custom events let a child communicate an intention to its parent. In `<script setup>`, `defineProps` and `defineEmits` make that contract visible:

```vue [UserCard.vue] {2,6}
<script setup lang="ts">
const props = defineProps<{ userName: string }>()
const emit = defineEmits<{ select: [userName: string] }>()

function selectUser() {
  emit('select', props.userName)
}
</script>

<template>
  <button type="button" @click="selectUser">
    {{ props.userName }}
  </button>
</template>
```

The highlighted lines declare the input and communicate the change. If the parent needs to update a value, the child emits the event and the parent decides how to change its state.

## Visual composition with slots and fallthrough attributes

Use slots when the main variation is content or visual structure. The parent provides template fragments, and the child defines where they render:

```vue [BaseLayout.vue] {4-7-10}
<template>
  <div class="layout">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

Named slots distribute content across multiple regions. A scoped slot lets the child expose data to content provided by the parent. That content keeps the parent’s scope; it does not automatically gain access to the child’s private state.

Attributes and listeners that are not declared as props or emits can fall through to the root element. If the component has multiple root nodes, automatic fallthrough does not exist: explicitly bind `$attrs` to the appropriate element when needed. If you disable `inheritAttrs`, remember to bind `$attrs` intentionally.

## Separate logic and presentation with composables

A composable is a Composition API-based function that encapsulates and reuses stateful logic. It is a good option when several components need the same logic but do not share a visual structure.

```ts [useOnlineStatus.ts] {4-8}
import { onMounted, onUnmounted, ref } from 'vue'

export function useOnlineStatus() {
  const isOnline = ref(true)
  const updateStatus = () => { isOnline.value = navigator.onLine }

  onMounted(() => window.addEventListener('online', updateStatus))
  onUnmounted(() => window.removeEventListener('online', updateStatus))

  return { isOnline }
}
```

Cleaning up the listener is part of the composable’s contract. Vue recommends composables over mixins because the origin of properties is clearer, there is less risk of name collisions, and implicit communication is reduced.

Use a component when logic and presentation form a reusable unit. Use a composable when you want to reuse logic without imposing a visual interface.

## Provide/inject for deep dependencies

`provide/inject` avoids passing props through every intermediate level when a dependency belongs to a deep context, such as a theme or form configuration. The closest provided dependency can override one defined higher in the tree.

This mechanism should not automatically become a replacement for shared application state. Document the key, contract, and lifecycle of the dependency so the relationship remains understandable.

## Decision criteria and common mistakes

- Use props and events for direct parent-child contracts.
- Use slots when the variation is content or visual structure.
- Use composables for reusable logic without shared visual structure.
- Use `provide/inject` for deep dependencies or contextual configuration.
- Do not move complex visual content through events when a slot expresses the composition better.
- Do not mutate props directly in the child.
- Do not rely on automatic attribute fallthrough in components with multiple roots.
- Do not choose a renderless component when a composable solves the pure logic more directly.
- Do not present mixins or a global event bus inherited from Vue 2 as the primary strategy for new code.

The central decision is to choose the smallest mechanism that represents the relationship: data with props, intent with events, visual composition with slots, logic with composables, and deep dependencies with `provide/inject`. This separation keeps contracts visible and makes it easier to evolve each component without dragging unrelated responsibilities along.
