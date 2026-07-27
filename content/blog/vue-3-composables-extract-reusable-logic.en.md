---
title: "Composables in Vue 3: How to Extract Reusable Logic Without Overcomplicating It"
description: "Learn what composables are in Vue 3, when they are worth using, and how to extract reusable logic with a clear useToggle example."
date: 2026-06-22T20:00:00-05:00
updatedAt: 2026-07-26T00:00:00-05:00
draft: false
tags:
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "Components"
    color: "#41B883"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Basics"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1782172219/vue-3-composables-extract-reusable-logic.es.md_myyutl.png
coverAlt: "Screen showing code in a development environment"
coverCaption: "Reusable code in Vue 3 by TODOvue"
locale: en
author: TODOvue
series: vue-3-architecture
seriesOrder: 3
seriesTitle: "Vue 3 Application Architecture"
seriesDescription: "A practical series for designing maintainable Vue 3 applications through clear component communication, reusable logic, scoped dependencies, and intentional state management."
keywords:
  - Vue.js
  - Vue 3
  - Composables
  - Composition API
  - useToggle
  - reusable logic
schemaOrg:
  - type: "BlogPosting"
    headline: "Composables in Vue 3: How to Extract Reusable Logic Without Overcomplicating It"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-06-22T20:00:00-05:00"
lab:
  title: "Create your first composable: useToggle"
  goal: "Extract a small, repeatable bit of logic for opening, closing, and toggling a boolean state from any component."
  tasks:
    - "Create a useToggle.js or useToggle.ts file."
    - "Use ref() to store the active or inactive state."
    - "Expose the open(), close(), and toggle() functions."
    - "Use the composable from a component with a button."
  starterCode: |
    <script setup>
    import { ref } from 'vue'

    function useToggle(initialValue = false) {
      const isActive = ref(initialValue)

      const open = () => {
        isActive.value = true
      }

      const close = () => {
        isActive.value = false
      }

      const toggle = () => {
        isActive.value = !isActive.value
      }

      return {
        isActive,
        open,
        close,
        toggle
      }
    }

    const menu = useToggle()
    </script>

    <template>
      <button @click="menu.toggle()">
        {{ menu.isActive ? 'Close menu' : 'Open menu' }}
      </button>

      <nav v-if="menu.isActive">
        Menu visible
      </nav>
    </template>
  solutionHint: "If the component no longer needs to know how the state changes, only when to use it, the composable is doing its job."
---
# Composables in Vue 3: How to Extract Reusable Logic Without Overcomplicating It

There is a pretty clear sign that a component is asking for help: you start copying the same logic into two, three, or four different places.

First it was a menu that opens and closes. Then a modal. Then a side panel. Each one has its own `ref`, its own function to open, its own function to close, and an almost identical `toggle`. Nothing explodes at first, but the code starts to feel repetitive, as if every component is solving the same tiny problem alone.

That is where composables come in.

## What a composable is, without making it weird

A composable is a function that encapsulates reusable logic with Vue's Composition API.

That is it. It does not need a heavier definition.

It can hold state with `ref()` or `reactive()`, create derived values with `computed()`, listen to changes with `watch()`, or connect to browser APIs. The point is to give that logic a clear home so several components can use it without copy and paste.

If a component should focus on rendering the interface, a composable can take care of part of the logic behind it.

## The problem: repeated logic inside the component

Imagine a small menu:

```vue [MenuButton.vue]
<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <button @click="toggle">
    {{ isOpen ? 'Close menu' : 'Open menu' }}
  </button>

  <nav v-if="isOpen">
    Menu visible
  </nav>
</template>
```

This code is fine. You do not need to extract everything the moment a function appears. The problem starts when the same idea shows up in a modal, an accordion, an expandable card, and a filter panel.

At that point, you are no longer writing menu logic. You are writing a small reusable rule: something can be active or inactive, and you need to open it, close it, or toggle it.

## The after: extracting `useToggle`

We can move that logic into a composable:

```js [composables/useToggle.js]
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const isActive = ref(initialValue)

  const open = () => {
    isActive.value = true
  }

  const close = () => {
    isActive.value = false
  }

  const toggle = () => {
    isActive.value = !isActive.value
  }

  return {
    isActive,
    open,
    close,
    toggle
  }
}
```

And now the component is more focused:

```vue [MenuButton.vue]
<script setup>
import { useToggle } from '@/composables/useToggle'

const menu = useToggle()
</script>

<template>
  <button @click="menu.toggle()">
    {{ menu.isActive ? 'Close menu' : 'Open menu' }}
  </button>

  <nav v-if="menu.isActive">
    Menu visible
  </nav>
</template>
```

The component still makes sense. Actually, it makes more sense: there is a menu, and that menu can be toggled. The mechanics are no longer in the way.

## When creating a composable is worth it

A composable is useful when it extracts a real intention, not just a few lines of code.

It is usually worth it when:

- The same logic appears in more than one component.
- The component is carrying too many responsibilities.
- You want to reason about one piece of behavior separately.
- The logic has a clear name: `useToggle`, `useMousePosition`, `useLocalStorage`, `usePagination`.

The name matters. If you can name it naturally, there is probably a reusable idea there.

## When you do not need one

Not everything needs to become a composable.

If a bit of logic only lives in one component and reads well there, leave it there. Extracting too early can also make code harder to follow. You end up jumping between files to understand something that used to take twenty seconds to read.

A good composable removes noise. An unnecessary one just moves the noise somewhere else.

## Common mistakes

The first one is using names that are too vague. `useHelpers`, `useUtils`, or `useCommon` do not say much. If the name does not explain the intention, the file becomes a drawer for random things.

The second one is putting too much logic into the same composable. `useUserDashboardEverything` may feel convenient at first, but soon it will be harder to maintain than the original component.

The third one is hiding side effects. If a composable makes a request, writes to `localStorage`, or registers global events, that should be clear from its name or from how it is used.

The fourth one is returning too many things. If a composable returns fifteen properties, you may not have found the right boundary yet.

## A practical rule

Before creating a composable, ask yourself:

> Am I extracting an idea, or am I just moving code?

If you are extracting an idea, go for it. If you are only moving code to make the component look shorter, wait a bit.

Composables are not there to show off. They are there to help the code breathe, to let components talk about the interface, and to give repeated logic a home of its own.
