---
title: "Vue Lifecycle: server-side rendering with serverPrefetch"
description: "How to use serverPrefetch and onServerPrefetch to load data before SSR rendering, avoid incomplete HTML, and coordinate the server's first render with client hydration."
date: 2026-03-20T19:15:00-05:00
updatedAt: 2026-03-20T19:15:00-05:00
readingTime: 8
tags:
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Architecture"
    color: "#4CAF50"
  - tag: "Components"
    color: "#41B883"
  - tag: "Best Practices"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1774051488/vue-lifecycle-ssr-serverprefetch_averlr.png
coverAlt: "Illustration of a server delivering HTML with resolved data while a client hydrates without needing an extra fetch."
coverCaption: "With `serverPrefetch`, the server can deliver complete HTML, improving both experience and SEO from the very first render."
draft: false
locale: en
series: vue-lifecycle-hooks
seriesOrder: 9
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - serverPrefetch
  - onServerPrefetch
  - SSR
  - hydration
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle: server-side rendering with serverPrefetch"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-20T19:15:00-05:00"
---
# Vue Lifecycle: server-side rendering with `serverPrefetch`

When an application uses SSR (Server-Side Rendering), the first render no longer happens only in the browser. The server generates the HTML before sending it, and if important data arrives too late, the user gets a page that feels incomplete or not especially useful until the client requests that data again.

`serverPrefetch` exists to solve exactly that moment. It lets Vue wait for asynchronous data before rendering the component on the server, so the initial HTML already includes real content instead of depending on skeletons or placeholders that change during hydration.

## Why This Matters

With SSR, the first impression depends on the HTML generated on the server. If a product, an article, or a dashboard summary loads only after the component mounts in the client, several advantages are lost at once:

* The user sees less useful content on the first paint.
* SEO gets a weaker document.
* Hydration can feel inconsistent.
* Work is duplicated between server and client.

`serverPrefetch` helps make sure critical data is available in time for the initial render. It does not replace your entire data-fetching strategy, but it fits very well in the phase before the server render happens.

## Core Concept

`serverPrefetch` in the Options API and `onServerPrefetch()` in the Composition API let you register an asynchronous function that Vue resolves **before** rendering the component on the server.

Simplified flow:

* The component enters the SSR tree.
* Vue runs the hook.
* If the hook returns a promise, the renderer waits.
* Once the promise resolves, Vue generates the HTML with the data already available.

Important details:

* It only runs during **server-side rendering**.
* It does not replace client-side loading when the component appears outside the initial render.
* In **Nuxt**, it is usually better to use `useAsyncData()` or `useFetch()`, since those utilities integrate serialization, caching, and hydration automatically.

You can think of this hook as a lower-level SSR tool: useful when you need fine-grained control inside a component rendered on the server.

## When To Use

`serverPrefetch` makes sense when the initial HTML is important enough that the data should already be there.

Typical cases:

* Product pages that need name, price, and availability in the first response.
* Articles or public content that should be indexable and visible from the start.
* Components that depend on the current request before rendering.

Practical rule: if the data must exist **before the server render**, this hook is a strong option.

## When To Avoid

It should not become a generic answer for every fetch.

Avoid it when:

* The component only renders on the client.
* The information is not critical for the initial HTML.
* You are already using Nuxt and the case fits better in `useAsyncData()` or `useFetch()`.
* The fetch depends on browser-only APIs.

Also avoid expensive or unnecessary work here: everything you run inside `serverPrefetch` directly affects the server response time.

## Common Mistakes

### 1. Assuming it also runs during client navigation

`serverPrefetch` does not replace `mounted`, nor does it cover an entire loading strategy by itself. If the component only renders on the client, this hook will not run.

Fix: add a fallback in `onMounted()` or `mounted()` when the data is still missing.

### 2. Using browser APIs inside the hook

During SSR, there is no `window`, `document`, or `localStorage`. Code inside `serverPrefetch` must be safe to run on the server.

### 3. Repeating the fetch unnecessarily

If the server already fetched the data, there is no reason to request it again on the client.

Fix: check whether the state already exists before fetching in `mounted`.

### 4. Overloading deep components

Using `serverPrefetch` across too many components can increase response time and make the data flow harder to reason about.

Distribute responsibilities carefully: the page, layout, and inner components should each have a clear role.

## Practical Example

```vue [Composition API]
<script setup lang="ts">
import { onMounted, onServerPrefetch, ref } from 'vue'

type Product = {
  id: number
  name: string
  price: number
  stock: number
}

const product = ref<Product | null>(null)
const errorMessage = ref('')

async function fetchProduct() {
  const response = await fetch('https://api.example.com/products/42')

  if (!response.ok) {
    throw new Error('The product could not be loaded.')
  }

  product.value = (await response.json()) as Product
}

onServerPrefetch(async () => {
  try {
    await fetchProduct()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unexpected SSR error.'
  }
})

onMounted(async () => {
  if (product.value || errorMessage.value) return

  try {
    await fetchProduct()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unexpected client error.'
  }
})
</script>

<template>
  <article class="product-card">
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <template v-else-if="product">
      <h1>{{ product.name }}</h1>
      <p>Price: {{ product.price }} USD</p>
      <p>Stock: {{ product.stock }}</p>
    </template>

    <p v-else>Loading product...</p>
  </article>
</template>
```
```vue [Options API]
<script lang="ts">
import { defineComponent } from 'vue'

type Product = {
  id: number
  name: string
  price: number
  stock: number
}

export default defineComponent({
  name: 'ProductCardSsr',

  data() {
    return {
      product: null as Product | null,
      errorMessage: ''
    }
  },

  methods: {
    async fetchProduct() {
      const response = await fetch('https://api.example.com/products/42')

      if (!response.ok) {
        throw new Error('The product could not be loaded.')
      }

      this.product = (await response.json()) as Product
    }
  },

  async serverPrefetch() {
    try {
      await this.fetchProduct()
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Unexpected SSR error.'
    }
  },

  async mounted() {
    if (this.product || this.errorMessage) return

    try {
      await this.fetchProduct()
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Unexpected client error.'
    }
  }
})
</script>

<template>
  <article class="product-card">
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <template v-else-if="product">
      <h1>{{ product.name }}</h1>
      <p>Price: {{ product.price }} USD</p>
      <p>Stock: {{ product.stock }}</p>
    </template>

    <p v-else>Loading product...</p>
  </article>
</template>
```

This pattern lets the server deliver resolved content on the first load. If the component later renders during a client-side navigation, `onMounted()` works as a fallback without duplicating the request.

This version keeps the same intent: resolve the data before the SSR render and use `mounted` as a backup when no previous state is available.

## Summary

`serverPrefetch` lets you move critical data earlier into the server render and produce useful HTML from the very first response. Its value is in improving the first render, not in replacing your entire fetching strategy.

In manual Vue SSR, it is a precise and powerful tool. In Nuxt, higher-level utilities are usually the better fit. In both cases, the key idea is the same: important content should be ready before the initial page is rendered.
