---
title: "Vue Directives: v-model"
description: "Learn how to use v-model in Vue 3 for forms and custom components, with Composition API and Options API, real-world cases, common mistakes, and best practices."
date: 2026-02-16T13:30:00-05:00
updatedAt: 2026-02-16T13:30:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Best Practices"
    color: "#2196F3"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771265788/directives-vue-v-model-guide_ticgya.png
coverAlt: "Temporary cover image for the article about v-model in Vue"
coverCaption: "Temporary cover: replace with TODOvue final artwork"
locale: en
author: TODOvue
keywords:
  - Vue.js
  - v-model
  - forms
  - two-way binding
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue v-model directive: complete guide for forms and components"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-16T13:30:00-05:00"
---
# Vue Directives: `v-model`

`v-model` reduces friction in forms by syncing UI and state with a single declaration. When used well, it makes your components more readable and consistent; when misused, it can hide confusing data flows and subtle bugs.

## Why it matters

In real interfaces, much of the experience depends on forms and filters.
`v-model` lets you declare synchronization between view and state without manually manipulating the DOM, keeping code more predictable and easier to maintain.

With `v-model`, you can:

* Avoid repetitive `:value` + `@input` boilerplate.
* Keep what the user sees aligned with reactive state.
* Standardize the API of reusable form components.

## Core concept

In Vue 3, `v-model` is syntactic sugar to bind a value and listen for updates.

### On native elements

* `v-model="email"` is equivalent to binding the value and listening to the related event.
* Vue automatically adapts the prop and event based on the control type (`input`, `change`, `checkbox`, etc.).

For example, on `<input type="text">`, it maps to `:value` + `@input`.
On `<input type="checkbox">`, it binds `checked` and listens to `change`.

### On components

In Vue 3:

* It uses the `modelValue` prop by default.
* It expects the `update:modelValue` event.
* You can use arguments for additional models: `v-model:title`, `v-model:filters`.

It also supports modifiers such as:

* `.trim`
* `.number`
* `.lazy`

Since Vue 3.3+, you can use `defineModel()` in `<script setup>` to simplify model contract definitions in components.

## When to use it

Use `v-model` when the primary goal is syncing input data with application state.

Typical cases:

* Registration, login, or profile forms.
* Real-time search filters.
* Reusable UI components (`TextInput`, `Toggle`, `Select`) with a consistent contract.
* Quick interface settings (switches, sliders, preferences).

## When to avoid it

Avoid `v-model` when:

* The data is read-only or derived (`computed` without a setter).
* You need strict traceability for every change due to complex domain rules.
* Per-keystroke processing is expensive and requires an explicit pipeline (debounce, throttle, heavy validation).
* You need to preserve an explicit business-event flow, not just UI events.

## Common mistakes

### 1) Mutating props directly in the child

Incorrect:

```vue [Avoid]
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
props.modelValue = "new value"
</script>
```

Correct: emit `update:modelValue` or use `defineModel`.

> Props are read-only. Mutating them breaks one-way data flow.

### 2) Binding `v-model` to non-writable expressions

Incorrect:

```vue [Avoid]
<input v-model="user.name.toUpperCase()" />
```

> `v-model` requires a writable reference. A derived expression has no setter.

Correct:

```vue [Recommended]
<input v-model="user.name" />
```

### 3) Not using modifiers where they add value

Example:

* Without `.trim`, you store unnecessary spaces.
* Without `.number`, you receive a `string` where you expected a `number`.
* Without `.lazy`, updates happen on every keystroke when you only needed updates on blur.

### 4) Putting too much logic in the model setter

Keep `v-model` flow simple and move complex rules into functions or composables.
The model should sync state; business logic should not live in the setter.

# Practical examples

## 1) Text input with basic sanitization

```vue [Composition API] {10}
<script setup lang="ts">
import { ref } from "vue";

const fullName = ref("");
</script>

<template>
  <label>
    Full name
    <input v-model.trim="fullName" type="text" />
  </label>
</template>
```
```vue [Options API] {14}
<script lang="ts">
export default {
  data() {
    return {
      fullName: "",
    };
  },
};
</script>

<template>
  <label>
    Full name
    <input v-model.trim="fullName" type="text" />
  </label>
</template>
```

## 2) Numeric input with `v-model.number`

```vue [Composition API] {10}
<script setup lang="ts">
import { ref } from "vue";

const age = ref<number | null>(null);
</script>

<template>
  <label>
    Age
    <input v-model.number="age" type="number" min="0" />
  </label>
</template>
```
```vue [Options API] {14}
<script lang="ts">
export default {
  data() {
    return {
      age: null,
    };
  },
};
</script>

<template>
  <label>
    Age
    <input v-model.number="age" type="number" min="0" />
  </label>
</template>
```

## 3) Checkbox for boolean state

```vue [Composition API] {9}
<script setup lang="ts">
import { ref } from "vue";

const acceptedTerms = ref(false);
</script>

<template>
  <label>
    <input v-model="acceptedTerms" type="checkbox" />
    I accept terms and conditions
  </label>
</template>
```
```vue [Options API] {13}
<script lang="ts">
export default {
  data() {
    return {
      acceptedTerms: false,
    };
  },
};
</script>

<template>
  <label>
    <input v-model="acceptedTerms" type="checkbox" />
    I accept terms and conditions
  </label>
</template>
```

## 4) Full examples

### Composition API example

Reusable `SearchInput` with `defineModel` + filter screen:

```vue [SearchInput.vue] {9}
<script setup lang="ts">
const model = defineModel<string>({ default: "" });
</script>

<template>
  <label class="field">
    Search
    <input
      v-model.trim="model"
      type="text"
      placeholder="Type to filter..."
    />
  </label>
</template>
```
```vue [ProductFilter.vue]
<script setup lang="ts">
import { computed, ref } from "vue";
import SearchInput from "./SearchInput.vue";

const query = ref("");
const minPrice = ref<number | null>(null);
const onlyInStock = ref(false);

const products = ref([
  { id: 1, name: "Mechanical keyboard", price: 89, stock: true },
  { id: 2, name: "Ergonomic mouse", price: 45, stock: false },
  { id: 3, name: '27" monitor', price: 299, stock: true },
]);

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.value.toLowerCase());
    const matchesPrice =
      minPrice.value == null || p.price >= minPrice.value;
    const matchesStock = !onlyInStock.value || p.stock;

    return matchesQuery && matchesPrice && matchesStock;
  })
);
</script>

<template>
  <section>
    <h2>Filters</h2>

    <SearchInput v-model="query" />

    <label>
      Minimum price
      <input v-model.number="minPrice" type="number" min="0" />
    </label>

    <label>
      <input v-model="onlyInStock" type="checkbox" />
      In stock only
    </label>

    <ul>
      <li v-for="item in filteredProducts" :key="item.id">
        {{ item.name }} - ${{ item.price }}
        <span v-if="!item.stock">(out of stock)</span>
      </li>
    </ul>
  </section>
</template>
```

### Options API example

Same behavior using `modelValue` and `update:modelValue`:

```vue [SearchInput.vue]
<script lang="ts">
export default {
  name: "SearchInput",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
};
</script>

<template>
  <label class="field">
    Search
    <input
      :value="modelValue"
      type="text"
      placeholder="Type to filter..."
      @input="$emit('update:modelValue', $event.target.value.trim())"
    />
  </label>
</template>
```
```vue [ProductFilter.vue]
<script lang="ts">
import SearchInput from "./SearchInput.vue";

export default {
  name: "ProductFilter",
  components: { SearchInput },
  data() {
    return {
      query: "",
      minPrice: null,
      onlyInStock: false,
      products: [
        { id: 1, name: "Mechanical keyboard", price: 89, stock: true },
        { id: 2, name: "Ergonomic mouse", price: 45, stock: false },
        { id: 3, name: '27" monitor', price: 299, stock: true },
      ],
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((p) => {
        const matchesQuery = p.name
          .toLowerCase()
          .includes(this.query.toLowerCase());
        const matchesPrice =
          this.minPrice == null || p.price >= Number(this.minPrice);
        const matchesStock = !this.onlyInStock || p.stock;

        return matchesQuery && matchesPrice && matchesStock;
      });
    },
  },
};
</script>

<template>
  <section>
    <h2>Filters</h2>

    <SearchInput v-model="query" />

    <label>
      Minimum price
      <input v-model.number="minPrice" type="number" min="0" />
    </label>

    <label>
      <input v-model="onlyInStock" type="checkbox" />
      In stock only
    </label>

    <ul>
      <li v-for="item in filteredProducts" :key="item.id">
        {{ item.name }} - ${{ item.price }}
        <span v-if="!item.stock">(out of stock)</span>
      </li>
    </ul>
  </section>
</template>
```

## Summary

`v-model` is the idiomatic way in Vue 3 to sync UI and state in forms and components.

Use it to reduce boilerplate and keep consistency, but avoid turning it into a shortcut for complex business logic.

Key points:

* On native inputs, it simplifies `:value` + events.
* On components, respect `modelValue` / `update:modelValue` or use `defineModel`.
* Apply modifiers (`.trim`, `.number`, `.lazy`) when they improve data quality or performance.
* Keep data flow clear and explicit when the domain requires it.
