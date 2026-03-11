---
title: "Vue Lifecycle: update phase (beforeUpdate, updated)"
description: "What happens when Vue re-renders a component and how to use beforeUpdate and updated without treating them as stand-ins for watch or computed."
date: 2026-03-10T22:00:00-05:00
updatedAt: 2026-03-10T22:00:00-05:00
tags:
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Components"
    color: "#41B883"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Best Practices"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773202087/vue-lifecycle-update-phase-beforeupdate-updated_lkp7kk.png
coverAlt: "Illustration of the Vue lifecycle update phase with beforeUpdate and updated"
coverCaption: "The update phase happens when a reactive change forces Vue to render the component again."
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 4
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - beforeUpdate
  - updated
  - onUpdated
  - rendering
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: update phase (beforeUpdate, updated)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-10T22:00:00-05:00"
---
# Vue Lifecycle: update phase (`beforeUpdate`, `updated`)

Many components do not fail when they are created or mounted. They fail later, when state changes and the interface starts re-rendering several times. That is when incorrect measurements, duplicated effects, or hooks used as if they were a global `watch` begin to show up.

The update phase exists precisely to understand that moment: **when Vue still has not reflected the change in the DOM and when it already has**. If you handle that distinction well, you avoid confusing reactive code and components that become harder to maintain.

In real applications, many UI problems like broken scroll, incorrect measurements, or external library integrations that drift out of sync appear right at this point in the lifecycle.

# Core Concept

Every time a reactive dependency used by the component changes, Vue schedules another render.

During that process, two hooks appear:

* `beforeUpdate`: runs **after state changed, but before Vue updates the DOM**.
* `updated`: runs **after Vue has already applied the DOM changes**.

In the **Composition API**, the equivalents are:

* `onBeforeUpdate()`
* `onUpdated()`

The practical idea is fairly simple:

* If you need to **see the previous DOM state before it changes**, `beforeUpdate` is the moment.
* If you need to **read or manipulate the already updated DOM**, `updated` is the moment.
* If what you want is to **react to one specific value**, a `watch` or a `computed` will usually be clearer than either of these hooks.

It also helps to remember something important: **Vue batches reactive changes and DOM updates**. That means these hooks do not express *"this variable changed"*, but something broader:

> "The component is entering or leaving a full update cycle."

That is why they are not good substitutes for `watch`.

# When To Use

The update phase fits well when your logic depends on the **transition between one render and the next**.

Typical cases:

* Comparing the visible DOM before and after an update.
* Adjusting scroll or focus after a rendered list changed.
* Refreshing an external library integration once the markup is already up to date.
* Syncing dynamic layouts.
* Debugging excessive re-renders or understanding why a view keeps refreshing.

`beforeUpdate` is usually helpful when you want to **read or clean up something from the previous DOM before Vue replaces it**.

`updated` makes sense when you need to **confirm that the HTML already reflects the new state** and only then measure, scroll, or sync a library.

# When To Avoid

Not every reactive change needs these hooks.

Avoid `beforeUpdate` and `updated` when:

* You only want to react to one specific property.
* A `computed` can solve the problem.
* The logic does not depend on the DOM.
* You are thinking about `updated` as a place to trigger more state changes without a clear condition.

In particular, `updated` can become dangerous if you mutate the same state that triggered the render. That is where **update loops** and unnecessary renders begin.

# Common Mistakes

## Using `updated` as a replacement for `watch`

This is a very common mistake.

`updated` runs **when the component has already re-rendered**, not when one specific variable changed with clear semantic intent.

If you need to react to `search`, `page`, `filters`, or any other specific value, a `watch` communicates the goal better and avoids unnecessary work.

## Mutating state inside `updated` without control

This is the classic path into a loop:

```vue [App.vue]{6}
<script setup lang="ts">
import { onUpdated, ref } from 'vue'

const count = ref(0)

onUpdated(() => {
  count.value++
})
</script>
```

Every update triggers another update.

If you need to correct state, do it with a **very clear condition** or move that logic into:

* `watch`
* `computed`
* the action that originated the change

## Reading the new DOM in `beforeUpdate`

Inside `beforeUpdate`, the visible DOM still represents the **previous render**.

If you measure there expecting the new size, the value will be stale.

Use `updated` if you need the final rendered result.

## Putting heavy logic into every update

These hooks can fire **many times**.

If you put the following inside them:

* Expensive calculations
* Heavy integrations
* Repeated DOM queries

The component will degrade quickly.

> If a task does not need to run on **every render**, it probably should not live here.

# Practical Examples

## Keeping scroll pinned to the end in a chat

When a new message arrives, the array changes first and the DOM updates afterward.

If you scroll too early, the container's new height does not exist yet.

The solution is to wait for the moment when the DOM has already been updated.

## Recalculating a visual library after updating a list

Some libraries such as diagrams, grids, tooltips, or layout libraries need **the markup to already be on screen** before they can recalculate positions or sizes.

`updated` lets you run that synchronization right after render.

## Detecting repeated renders during debugging

These hooks are also useful when you want to understand whether a component updates more often than expected.

```vue [App.vue]{2,6}
<script>
onBeforeUpdate(() => {
  console.log('The component is about to update')
})

onUpdated(() => {
  console.log('The component finished updating')
})
</script>
```

This helps reveal reactive dependencies that are causing unnecessary renders.

```vue [Composition API]
<script setup lang="ts">
import { onBeforeUpdate, onUpdated, ref } from 'vue'

const messages = ref([
  { id: 1, text: 'First message' },
  { id: 2, text: 'Second message' }
])

const listRef = ref<HTMLOListElement | null>(null)
const previousHeight = ref(0)

function addMessage() {
  messages.value.push({
    id: Date.now(),
    text: `Message ${messages.value.length + 1}`
  })
}

onBeforeUpdate(() => {
  previousHeight.value = listRef.value?.scrollHeight ?? 0
})

onUpdated(() => {
  if (!listRef.value) return

  const nextHeight = listRef.value.scrollHeight

  if (nextHeight > previousHeight.value) {
    listRef.value.scrollTop = nextHeight
  }
})
</script>

<template>
  <section class="chat-panel">
    <button @click="addMessage">
      Add message
    </button>

    <ol
      ref="listRef"
      class="messages"
    >
      <li
        v-for="message in messages"
        :key="message.id"
      >
        {{ message.text }}
      </li>
    </ol>
  </section>
</template>
```

```vue [Options Api]
<script>
export default {
  data() {
    return {
      messages: [
        { id: 1, text: 'First message' },
        { id: 2, text: 'Second message' }
      ],
      previousHeight: 0
    }
  },

  methods: {
    addMessage() {
      this.messages.push({
        id: Date.now(),
        text: `Message ${this.messages.length + 1}`
      })
    }
  },

  beforeUpdate() {
    if (this.$refs.listRef instanceof HTMLOListElement) {
      this.previousHeight = this.$refs.listRef.scrollHeight
    }
  },

  updated() {
    if (!(this.$refs.listRef instanceof HTMLOListElement)) {
      return
    }

    const nextHeight = this.$refs.listRef.scrollHeight

    if (nextHeight > this.previousHeight) {
      this.$refs.listRef.scrollTop = nextHeight
    }
  }
}
</script>

<template>
  <section class="chat-panel">
    <button @click="addMessage">
      Add message
    </button>

    <ol
      ref="listRef"
      class="messages"
    >
      <li
        v-for="message in messages"
        :key="message.id"
      >
        {{ message.text }}
      </li>
    </ol>
  </section>
</template>
```

* `onBeforeUpdate()` stores the previous render height.
* `onUpdated()` decides whether it should adjust scroll once the new message already exists in the DOM.

# Summary

* `beforeUpdate` lets you observe **the exact moment right before the DOM patch**.
* `updated` is useful when **the interface already reflects the new state** and you need to act on that result.
* If the problem revolves around one specific piece of data, **`watch` is usually more expressive**.
* These hooks describe **the component update cycle**, not the change of one specific variable.
* The most important rule is this: **do not turn `updated` into a state-mutation machine after every render.**
