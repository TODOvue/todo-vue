---
title: "Vue Directives: v-slot"
description: "Learn to master v-slot in Vue 3: default slots, named slots, and scoped slots, with clear examples in Composition API and Options API."
date: 2026-02-19T08:00:00-05:00
updatedAt: 2026-02-19T08:00:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Slots"
    color: "#8E44AD"
  - tag: "Components"
    color: "#41B883"
  - tag: "Advanced"
    color: "#F54927"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771508914/directives-vue-v-slot-guide_wr2iyy.png
coverAlt: "Cover image for the Vue Directives: v-slot article"
coverCaption: "Use v-slot to build more flexible and reusable components."
locale: en
series: vue-directives
seriesOrder: 7
seriesTitle: "Vue Directives"
seriesDescription: "A step-by-step path to master Vue core directives."
author: TODOvue
keywords:
  - Vue.js
  - v-slot
  - slots
  - scoped slots
  - reusable components
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Directives: v-slot with clear and practical examples"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-19T08:00:00-05:00"
---
# Vue Directives: `v-slot`

`v-slot` lets you decide, from the parent component, what content will be rendered inside specific areas defined by the child component.
In simple terms: the child defines "slots," and the parent decides what to place in them.

It is one of the most powerful tools in Vue 3 for building reusable components without losing control over rendering.

## Why it matters

Without slots, many components become rigid:

* With hardcoded text and buttons inside the child.
* With too many props to cover very specific cases.
* Hard to reuse across different screens.

> With `v-slot`, you can design base components (cards, modals, tables, layouts) that adapt to different contexts without duplicating logic or sacrificing clarity.

## Core concept

A child component defines `<slot />`, and the parent injects content:

```vue [BaseCard.vue] {3}
<template>
  <section class="card">
    <slot />
  </section>
</template>
```
```vue [App.vue] {2,5}
<template>
  <BaseCard>
    <h2>Dynamic title</h2>
    <p>Custom content from the parent.</p>
  </BaseCard>
</template>
```

Types of slots:

* **Default slot**: `<slot />`
* **Named slots**: `<slot name="header" />`
* **Slots with props (scoped slots)**: `<slot name="row" :item="item" />`

Common parent syntax:

* `#default` for the default slot.
* `#header`, `#footer`, etc. for named slots.
* `#row="{ item }"` to receive props from the child.

> `#` is shorthand for `v-slot:`.

## When to use it

Use `v-slot` when:

* You have a structural component (card, modal, layout) whose content changes by view.
* You need to expose child-internal data to the parent for custom rendering (`scoped slots`).
* You want a flexible API without multiplying boolean props like `showHeader`, `showFooter`, etc.

## When to avoid it

Avoid it when:

* The component has fully fixed structure and content.
* You are using slots to hide logic that should live in composables or the store.
* The template becomes too complex because of deeply nested slots.

> In these cases, less flexibility usually means better maintainability.

## Common mistakes

### 1) Using `v-slot` on an element that is not a component or `<template>`

`v-slot` can only be used on:

* A component.
* A `<template>` wrapping content for a specific slot.

```vue [Incorrect.vue] {1}
<div v-slot:header>
  Title
</div>
```
```vue [Correct.vue]{2,4}
<BaseCard>
  <template #header>
    Title
  </template>
</BaseCard>
```

### 2) Not destructuring scoped slot props

If the child exposes `:item="row"`, the parent should capture that object correctly:

```vue [DataTable.vue]{1,2}
<DataTable :rows="users">
  <template #row="{ item }">
    <strong>{{ item.name }}</strong>
  </template>
</DataTable>
```

If you do not destructure properly, you lose explicit access to slot props.

### 3) Turning slots into "visual prop drilling"

When everything goes through slots and almost nothing through well-defined props or events, the component API becomes confusing.

Practical rule:

* **Props** -> configuration.
* **Slots** -> structure/content.
* **Emits** -> events.

> Separating responsibilities keeps the API clear and predictable.

### 4) Not defining fallback content in the child

If the parent does not provide slot content, you may end up with an unexpected empty space.

Whenever it makes sense, define default content:

```vue [BaseCard.vue]
<slot>
  Default fallback
</slot>
```

## Practical examples

### 1) Default slot with fallback

```vue [BaseCard.vue]{3,5}
<template>
  <article class="card">
    <slot>
      <p>Default card content.</p>
    </slot>
  </article>
</template>
```

### 2) Named slots to structure a layout

```vue [BaseLayout.vue]{4,8,12}
<template>
  <section class="layout">
    <header>
      <slot name="header" />
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <slot name="footer" />
    </footer>
  </section>
</template>
```

### 3) Scoped slot to customize table rows

```vue [DataTable.vue]{6,8}
<template>
  <table>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>
          <slot name="row" :item="row">
            {{ row.name }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 4) `v-slot` with a dynamic argument

Vue supports dynamic arguments using the same syntax as other dynamic directives:

```vue [Parent.vue]{3}
<template>
  <WidgetShell>
    <template v-slot:[activeZone]>
      <p>This block is injected into a dynamic area.</p>
    </template>
  </WidgetShell>
</template>
```

> Use it with moderation. If you have too many dynamic areas, your component API likely needs simplification.

# Composition API Example

The child exposes a base table, and the parent decides how to render the actions cell.

```vue [DataTable.vue]
<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        <th class="text-left">Name</th>
        <th class="text-left">Role</th>
        <th class="text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in rows" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.role }}</td>
        <td>
          <slot name="actions" :user="user">
            <button type="button">View profile</button>
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```
```vue [UsersView.vue]
<script setup>
import { ref } from "vue";
import DataTable from "./DataTable.vue";

const users = ref([
  { id: 1, name: "Ana", role: "Admin", active: true },
  { id: 2, name: "Luis", role: "Editor", active: false },
]);

function toggleStatus(user) {
  user.active = !user.active;
}
</script>

<template>
  <DataTable :rows="users">
    <template #actions="{ user }">
      <button type="button" @click="toggleStatus(user)">
        {{ user.active ? "Deactivate" : "Activate" }}
      </button>
    </template>
  </DataTable>
</template>
```

# Options API Example

The same behavior, now using Options API to keep conceptual equivalence.

```vue [DataTable.vue]
<script>
export default {
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        <th class="text-left">Name</th>
        <th class="text-left">Role</th>
        <th class="text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in rows" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.role }}</td>
        <td>
          <slot name="actions" :user="user">
            <button type="button">View profile</button>
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```
```vue [UsersView.vue]
<script>
import DataTable from "./DataTable.vue";

export default {
  components: { DataTable },
  data() {
    return {
      users: [
        { id: 1, name: "Ana", role: "Admin", active: true },
        { id: 2, name: "Luis", role: "Editor", active: false },
      ],
    };
  },
  methods: {
    toggleStatus(user) {
      user.active = !user.active;
    },
  },
};
</script>

<template>
  <DataTable :rows="users">
    <template #actions="{ user }">
      <button type="button" @click="toggleStatus(user)">
        {{ user.active ? "Deactivate" : "Activate" }}
      </button>
    </template>
  </DataTable>
</template>
```

## Summary

* `v-slot` turns rigid components into reusable and expressive building blocks.
* Use the default slot for primary content.
* Use named slots for structure (`header`, `footer`, etc.).
* Use scoped slots when the child needs to share data and the parent controls rendering.
* Define fallback content when it makes sense to avoid empty gaps.
* Keep your API clear: props for configuration, slots for content, and emits for events.
