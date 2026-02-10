---
title: "Vue Directive: v-for"
description: "Learn to master v-for in Vue with practical examples from basics to advanced patterns, proper key usage, common mistakes, and best practices in Composition API and Options API."
date: 2026-02-09T21:30:00-05:00
updatedAt: 2026-02-09T21:30:00-05:00
readingTime: 11
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Lists"
    color: "#1D5BA1"
  - tag: "Guides"
    color: "#42B983"
  - tag: "Best Practices"
    color: "#2196F3"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770690176/directives-vue-v-for-guide_itbdds.png
coverAlt: "Temporary cover image for the Vue v-for article"
coverCaption: "Temporary cover: replace with TODOvue final artwork"
locale: en
author: TODOvue
keywords:
  - Vue.js
  - v-for
  - lists
  - key
  - Composition API
  - Options API
  - rendering
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Directive v-for: complete guide from basic to advanced"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-09T21:30:00-05:00"
---

# `v-for` in Vue: from basic to advanced

`v-for` is Vue's directive for rendering lists.
It looks simple, but using it correctly makes a huge difference in performance, UI stability, and code readability.

The key idea is:

- `v-for` describes repeated structure in the template.
- `:key` tells Vue how to identify each node in a stable way.

If you master that pair, you avoid most dynamic-list bugs.

## Why it matters

In real applications you always render lists:

- Tasks
- Products
- Comments
- Notifications
- Table rows

When the list changes (insert, remove, reorder), Vue needs to know which item is which.
If the key is unstable, you get problems like:

- Mixed internal state between rows
- Weird transitions
- Inputs "jumping" between elements

## When to use `v-for`

Use it when you need to:

- Render reactive arrays or objects
- Repeat components with different data
- Show nested structures (for example categories and products)

## When to avoid it

Avoid using `v-for` for:

- Heavy filtering logic directly in the template
- Combining `v-if` and `v-for` on the same node when you can prefilter with `computed`
- Using `index` as `key` in lists that can reorder

## Basic syntax

```vue [Composition API] {8}
<script setup>
import { ref } from 'vue'

const frameworks = ref(['Vue', 'React', 'Svelte'])
</script>

<template>
  <li v-for="framework in frameworks" :key="framework">
    {{ framework }}
  </li>
</template>
```

```vue [Options API] {12}
<script>
export default {
  data() {
    return {
      frameworks: ['Vue', 'React', 'Svelte']
    }
  }
}
</script>

<template>
  <li v-for="framework in frameworks" :key="framework">
    {{ framework }}
  </li>
</template>
```

## Basic example: todo list

This is the most common and correct pattern to start with.

```vue [Composition API] {4-8,13}
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Learn v-for', done: true },
  { id: 2, text: 'Practice stable keys', done: false },
  { id: 3, text: 'Avoid index as key', done: false }
])
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
        {{ todo.text }}
      </span>
    </li>
  </ul>
</template>
```

```vue [Options API] {5-9,17}
<script>
export default {
  data() {
    return {
      todos: [
        { id: 1, text: 'Learn v-for', done: true },
        { id: 2, text: 'Practice stable keys', done: false },
        { id: 3, text: 'Avoid index as key', done: false }
      ]
    }
  }
}
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
        {{ todo.text }}
      </span>
    </li>
  </ul>
</template>
```

## Intermediate level: index, objects, and `template v-for`

### 1) Index in `v-for`

You can access the index when you actually need it:

```vue [Composition API] {8}
<script setup>
import { ref } from 'vue'

const users = ref(['Ana', 'Luis', 'Marta'])
</script>

<template>
  <p v-for="(user, index) in users" :key="user">
    #{{ index + 1 }} - {{ user }}
  </p>
</template>
```

```vue [Options API] {12}
<script>
export default {
  data() {
    return {
      users: ['Ana', 'Luis', 'Marta']
    }
  }
}
</script>

<template>
  <p v-for="(user, index) in users" :key="user">
    #{{ index + 1 }} - {{ user }}
  </p>
</template>
```

### 2) Iterating over an object

```vue [Composition API] {12}
<script setup>
import { ref } from 'vue'

const profile = ref({
  name: 'Cristian',
  role: 'Frontend Dev',
  country: 'Colombia'
})
</script>

<template>
  <li v-for="(value, key) in profile" :key="key">
    {{ key }}: {{ value }}
  </li>
</template>
```

```vue [Options API] {16}
<script>
export default {
  data() {
    return {
      profile: {
        name: 'Cristian',
        role: 'Frontend Dev',
        country: 'Colombia'
      }
    }
  }
}
</script>

<template>
  <li v-for="(value, key) in profile" :key="key">
    {{ key }}: {{ value }}
  </li>
</template>
```

### 3) Repeating multiple nodes with `template`

```vue [Composition API] {11}
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, title: 'Vue 3', description: 'Progressive framework' },
  { id: 2, title: 'Pinia', description: 'Modern global state' }
])
</script>

<template>
  <template v-for="item in items" :key="item.id">
    <h3>{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <hr />
  </template>
</template>
```

```vue [Options API] {15}
<script>
export default {
  data() {
    return {
      items: [
        { id: 1, title: 'Vue 3', description: 'Progressive framework' },
        { id: 2, title: 'Pinia', description: 'Modern global state' }
      ]
    }
  }
}
</script>

<template>
  <template v-for="item in items" :key="item.id">
    <h3>{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <hr />
  </template>
</template>
```

## Advanced level: derived lists, components, and nesting

### 1) Prefilter and sort with `computed`

Do not place heavy logic directly inside `v-for`.
Derive the list first with `computed`.

```vue [Composition API] {10-15,19}
<script setup>
import { computed, ref } from 'vue'

const products = ref([
  { id: 1, name: 'Laptop', price: 1200, stock: 5 },
  { id: 2, name: 'Mouse', price: 25, stock: 0 },
  { id: 3, name: 'Keyboard', price: 80, stock: 12 }
])

const inStockSorted = computed(() => {
  return products.value
    .filter(product => product.stock > 0)
    .slice()
    .sort((a, b) => a.price - b.price)
})
</script>

<template>
  <li v-for="product in inStockSorted" :key="product.id">
    {{ product.name }} - ${{ product.price }}
  </li>
</template>
```

```vue [Options API] {12-19,24}
<script>
export default {
  data() {
    return {
      products: [
        { id: 1, name: 'Laptop', price: 1200, stock: 5 },
        { id: 2, name: 'Mouse', price: 25, stock: 0 },
        { id: 3, name: 'Keyboard', price: 80, stock: 12 }
      ]
    }
  },
  computed: {
    inStockSorted() {
      return this.products
        .filter(product => product.stock > 0)
        .slice()
        .sort((a, b) => a.price - b.price)
    }
  }
}
</script>

<template>
  <li v-for="product in inStockSorted" :key="product.id">
    {{ product.name }} - ${{ product.price }}
  </li>
</template>
```

### 2) Rendering components with `v-for`

```vue [Composition API] {12}
<script setup>
import { ref } from 'vue'
import UserCard from '~/components/UserCard.vue'

const users = ref([
  { id: 'u1', name: 'Ana', role: 'Admin' },
  { id: 'u2', name: 'Luis', role: 'Editor' }
])
</script>

<template>
  <UserCard v-for="user in users" :key="user.id" :user="user" />
</template>
```

```vue [Options API] {18}
<script>
import UserCard from '~/components/UserCard.vue'

export default {
  components: { UserCard },
  data() {
    return {
      users: [
        { id: 'u1', name: 'Ana', role: 'Admin' },
        { id: 'u2', name: 'Luis', role: 'Editor' }
      ]
    }
  }
}
</script>

<template>
  <UserCard v-for="user in users" :key="user.id" :user="user" />
</template>
```

### 3) Nested lists (categories and products)

```vue [Composition API] {17,19}
<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    id: 'c1',
    name: 'Peripherals',
    products: [
      { id: 'p1', name: 'Mouse' },
      { id: 'p2', name: 'Keyboard' }
    ]
  }
])
</script>

<template>
  <section v-for="category in categories" :key="category.id">
    <h3>{{ category.name }}</h3>
    <li v-for="product in category.products" :key="product.id">
      {{ product.name }}
    </li>
  </section>
</template>
```

```vue [Options API] {21,23}
<script>
export default {
  data() {
    return {
      categories: [
        {
          id: 'c1',
          name: 'Peripherals',
          products: [
            { id: 'p1', name: 'Mouse' },
            { id: 'p2', name: 'Keyboard' }
          ]
        }
      ]
    }
  }
}
</script>

<template>
  <section v-for="category in categories" :key="category.id">
    <h3>{{ category.name }}</h3>
    <li v-for="product in category.products" :key="product.id">
      {{ product.name }}
    </li>
  </section>
</template>
```

## Common `v-for` mistakes

### 1) Using `index` as `key` in mutable lists

```vue [Incorrect] {1}
<li v-for="(item, index) in items" :key="index">
  {{ item.name }}
</li>
```

This can break row state when reordering or inserting elements.
> Use a stable key (`item.id`) whenever possible.

### 2) Mixing `v-if` and `v-for` on the same node

```vue [Avoid] {1}
<li v-for="user in users" v-if="user.active" :key="user.id">
  {{ user.name }}
</li>
```

> Build a filtered `computed` list and iterate over that.

### 3) Mutating a derived `computed` result directly

If you derive a sorted/filtered list, do not mutate it directly.
Your source of truth should remain the original state.

### 4) Duplicate `key` values

If two elements share the same key, Vue cannot diff the list correctly.
Result: inconsistent rendering and hard-to-debug UI behavior.

## Quick best practices

- Use stable ids for `:key`.
- Prefilter and sort using `computed`.
- Keep complex logic out of templates.
- Keep `v-for` blocks small and readable.
- For very large lists, consider pagination or virtualization.

## Conclusion

`v-for` is not just about "painting arrays".
It is a core part of declarative rendering in Vue.

If you apply these rules:

- Stable `key`
- Derived lists with `computed`
- Clean template structure

You will build components that are more predictable, performant, and easier to maintain.
