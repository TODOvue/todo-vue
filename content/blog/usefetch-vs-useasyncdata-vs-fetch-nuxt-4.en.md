---
title: 'useFetch vs useAsyncData vs $fetch in Nuxt 4'
description: 'Learn how to choose between useFetch, useAsyncData, and $fetch in Nuxt 4 according to the data flow, SSR, payload, reactivity, and state ownership with Pinia.'
date: 2026-08-14T21:30:00-05:00
updatedAt: 2026-08-14T21:30:00-05:00
draft: false
locale: en
author: TODOvue
tags:
  - tag: 'Guides'
    color: '#42B983'
  - tag: 'SSR'
    color: '#0E9AA7'
  - tag: 'Composables'
    color: '#14B8A6'
  - tag: 'Reactivity'
    color: '#1D5BA1'
  - tag: 'State Management'
    color: '#FF9800'
  - tag: 'Best Practices'
    color: '#2196F3'
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1786757439/nuxt-4-usefetch-useasyncdata-dollarfetch-ssr_bhosyq.png
coverAlt: 'Visual comparison of useFetch, useAsyncData, and $fetch in Nuxt 4 for SSR, payload, and hydration.'
coverCaption: 'Visual guide to choosing the right data API in Nuxt 4.'
keywords:
  - 'useFetch vs useAsyncData vs $fetch'
  - 'Nuxt 4 SSR'
  - 'Nuxt payload'
  - 'Nuxt hydration'
  - 'duplicate requests'
  - 'Pinia in Nuxt'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'useFetch vs useAsyncData vs $fetch in Nuxt 4'
    author:
      type: 'Person'
      name: 'TODOvue'
    datePublished: 2026-08-14T21:30:00-05:00
lab:
  title: 'Lab: Diagnose and Fix a Duplicate Fetch'
  goal: 'Identify why an initial read can repeat during hydration and decide whether useFetch, useAsyncData, or $fetch fits, with coherent data identity and state ownership.'
  tasks:
    - 'Explain what happens to the direct $fetch call during SSR and why it can repeat during hydration.'
    - 'Make the URL or key represent the category and remove the redundant watcher.'
    - 'Decide whether the read should remain in a composable or whether shared state and domain behavior justify Pinia.'
    - 'Define the strategy to apply after a mutation: refresh(), key-based invalidation, or an intentional store update.'
  starterCode: |
    <script setup lang='ts'>
    import { computed, ref, watch } from 'vue'

    interface CatalogItem {
      id: string
      name: string
    }

    const route = useRoute()
    const category = computed(() => String(route.params.category))
    const items = await $fetch<CatalogItem[]>('/api/catalog')
    const staticKey = 'catalog'
    const storeItems = ref<CatalogItem[]>([])

    watch(category, async () => {
      storeItems.value = await $fetch<CatalogItem[]>('/api/catalog')
    })
    </script>

    <template>
      <p>{{ staticKey }}</p>
      <ul>
        <li v-for='item in items' :key='item.id'>{{ item.name }}</li>
      </ul>
    </template>
  solutionHint: 'The fragment does not use a data composable, ignores category in the URL, keeps a local key with no effect on Nuxt, and retains a local ref that is not a Pinia store. Fix each issue separately and justify the post-mutation policy.'
---

# useFetch vs useAsyncData vs $fetch in Nuxt 4

Choosing a data API in Nuxt 4 is not only a question of how to make an HTTP request. The same page can run on the server, reach the browser, hydrate, and load again during client navigation. If you do not distinguish those moments, a correct call can run again during hydration or become disconnected from the state your application actually needs.

The practical rule is this: start with `useFetch` for URL-based reads that belong to a view; choose `useAsyncData` when asynchronous work needs composition or additional control; reserve `$fetch` for event-driven commands or use it inside a data handler. Then decide explicitly what identifies the data, whether navigation should wait, and who owns the state.

## The Quick Decision: What Each API Is Responsible For

| API          | Main responsibility                      | SSR and payload                                           | Reactivity                                                 | Typical use case                                                 |
|--------------|------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------|------------------------------------------------------------------|
| useFetch     | Fetch a URL with compact configuration   | SSR-friendly and transfers the result through the payload | Reactive URLs and some options can trigger new loads       | Initial page read or dynamic route                               |
| useAsyncData | Coordinate a custom asynchronous handler | SSR-friendly and preserves the result for hydration       | The key and dependencies can control updates               | Multiple requests, SDKs, alternative clients, or transformations |
| $fetch       | Execute an HTTP request                  | Does not transfer the SSR result to the client by itself  | Does not automatically create data, error, and status refs | Submit, click, mutation, or handler implementation               |

`useFetch` combines `useAsyncData` and `$fetch`. That is why it is usually the first choice when the question is “which URL does this view need?”. `useAsyncData` better expresses the question “what asynchronous work should this data unit resolve?”. `$fetch` performs the request, but it does not decide how to preserve its result between the server and hydration.

## What Happens During SSR, Payload Transfer, and Hydration

For an initial read with `useFetch` or `useAsyncData`, the conceptual flow is:

`server → nuxtApp.payload.data → hydrated client`

Nuxt can wait for the result during SSR before serializing the page, even if you do not write `await` before the composable. `await` does control when the current `setup` continues and, during client navigation, whether navigation waits for the data to arrive.

The result is stored in `nuxtApp.payload.data`. During hydration, Nuxt can reuse that value instead of repeating the initial request. The `useAsyncData` payload uses `devalue`, while server-route responses have the limitations of `JSON.stringify`; these are different serialization mechanisms.

With direct `$fetch`, the flow can be different:

`SSR: $fetch → HTML`

`hydration: $fetch again → client`

An internal route can be resolved directly during SSR without an additional HTTP round trip. That improves this particular step, but it does not turn `$fetch` into a payload mechanism. If you use `$fetch` at the top level of a universal component for initial data, the load can run again during hydration.

```vue [ProductPage.vue] {7}
<script setup lang='ts'>
interface Product {
  id: string
  name: string
}

const products = await $fetch<Product[]>('/api/products')
</script>

<template>
  <ul>
    <li v-for='product in products' :key='product.id'>
      {{ product.name }}
    </li>
  </ul>
</template>
```

This example is valid as an HTTP call, but it does not automatically preserve the SSR result in Nuxt’s payload. For an initial read, `useFetch` or `useAsyncData` communicates the intent more accurately.

The payload is also not automatically a permanent cache across navigations. `useNuxtData` provides reactive access to a cached value when an explicit key exists. `getCachedData` participates in the decision to obtain cached data. By contrast, `transform` and `pick` shape or reduce the exposed result and the data added to the payload; they do not prevent the complete response from being fetched initially from the API. Later invalidation or reloading is a separate decision, such as `refresh()` or an explicit key-based policy.

## useFetch: The Natural Choice for URL-Based Reads

`useFetch` is appropriate when the data unit can primarily be described by a URL and its options. Besides combining the two underlying primitives, it generates a key and can provide type inference when the URL corresponds to a route handled by the application server.

For dynamic routes, the real identity of the data must appear in the URL or in an explicit key. Route parameters, locale, and filters should not be hidden behind a static key.

```vue [CatalogPage.vue] {11-14,16-18}
<script setup lang='ts'>
import { computed, ref } from 'vue'

interface CatalogItem {
  id: string
  name: string
}

const route = useRoute()
const locale = ref('en')
const requestUrl = computed(() => {
  const category = encodeURIComponent(String(route.params.category))
  return `/api/catalog/${category}`
})

const { data: items, status, error } = await useFetch<CatalogItem[]>(requestUrl, {
  query: computed(() => ({ locale: locale.value }))
})
</script>

<template>
  <p v-if='status === "pending"'>Loading catalog...</p>
  <p v-else-if='error'>Could not load the catalog.</p>
  <ul v-else>
    <li v-for='item in items ?? []' :key='item.id'>
      {{ item.name }}
    </li>
  </ul>
</template>
```

The URL and the `query` option are reactive. When the category or locale changes, `useFetch` can request the data again. Do not add a `watch` and a manual `refresh` to repeat the same mechanism. Use `watch: false` only when you explicitly want to disable automatic observation.

During SSR, a relative URL can use the request context through `useRequestFetch`. This can forward cookies and allowed headers, but it does not mean that every received header should be forwarded. Sensitive or inappropriate headers must remain outside that flow.

## useAsyncData: When the Task Is More Than a URL

`useAsyncData` provides a handler for expressing custom asynchronous work. It is the right choice when you need to combine multiple requests, consume an SDK, use a client other than `$fetch`, or transform the result before exposing it to the view.

```vue [DashboardPage.vue] {12-19}
<script setup lang='ts'>
interface Profile {
  id: string
  name: string
}

interface Notification {
  id: string
  message: string
}

const { data: dashboard, status, error } = await useAsyncData('dashboard', async () => {
  const [profile, notifications] = await Promise.all([
    $fetch<Profile>('/api/profile'),
    $fetch<Notification[]>('/api/notifications')
  ])

  return { profile, notifications }
})
</script>

<template>
  <p v-if='status === "pending"'>Loading dashboard...</p>
  <p v-else-if='error'>Could not load the dashboard.</p>
  <section v-else-if='dashboard'>
    <h2>{{ dashboard.profile.name }}</h2>
    <ul>
      <li v-for='notification in dashboard.notifications' :key='notification.id'>
        {{ notification.message }}
      </li>
    </ul>
  </section>
</template>
```

This example assumes public endpoints. If the data depends on cookies, authentication, or headers from the incoming request, explicitly establish a suitable client or apply the request-aware `useRequestFetch` flow for relative URLs during SSR. Do not attribute automatic propagation to `$fetch when the example does not demonstrate it.

The `dashboard` key identifies this data unit. If several calls share a key, they share the `data`, `error`, and `status` refs; therefore structural options—such as `handler`, `deep`, `transform`, `pick`, `getCachedData`, and `default`—must remain consistent across those calls.

The handler should be predictable, return a valid value, and avoid side effects. It is not the place to run Pinia actions, show notifications, or modify other domain state. Those actions belong in a separate flow, such as `callOnce` when you need to await a store action without unnecessarily repeating its load.

`useAsyncData` also provides concurrency-related mechanisms, such as an abortable signal and deduplication options. They help coordinate simultaneous loads, but they do not replace an invalidation policy after a mutation.

## $fetch: Commands, Interactions, and Handler Construction

`$fetch` fits naturally in an action initiated by the user: submit a form, archive a record, or run a command after a button click. At that point, you are changing something and must then decide how to update the read model.

```vue [ArchiveButton.vue] {15-23}
<script setup lang='ts'>
import { ref } from 'vue'

const props = defineProps<{
  productId: string
}>()

const saving = ref(false)
const message = ref('')

async function archiveProduct() {
  saving.value = true
  message.value = ''

  try {
    await $fetch(`/api/products/${props.productId}`, {
      method: 'POST'
    })
    message.value = 'Product archived.'
  } catch {
    message.value = 'Could not archive the product.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <button type='button' :disabled='saving' @click='archiveProduct'>
    {{ saving ? 'Archiving...' : 'Archive product' }}
  </button>
  <p v-if='message'>{{ message }}</p>
</template>
```

This block demonstrates the command and local feedback; it does not by itself demonstrate `refresh()`, key-based invalidation, or a Pinia update. In a final implementation, the message region should announce changes with accessible semantics, for example through `aria-live`, and distinguish error messages from informational ones.

After the mutation, separate two decisions: how to confirm the result in the interface and who owns the updated state. You can call `refresh()` on an existing read, invalidate or reload by key, or intentionally update a Pinia store. The choice depends on the application’s consistency policy.

You can also use `$fetch` inside a `useAsyncData` handler. In that case, `useAsyncData` preserves SSR and payload integration, while `$fetch` remains the handler’s HTTP implementation.

## Reactivity, Waiting, and Loading States

`await` and reactivity solve different problems. `await` decides when `setup` continues and whether client navigation waits. Reactive dependencies decide when the data identity can change and a new fetch can be triggered.

The API returns refs such as `data`, `error`, and `status`. Those refs participate in Vue’s reactivity model: the template updates when their values change. Do not confuse that reactivity with a caching policy. A reactive URL does not determine how long the result is retained or what happens after a mutation.

If navigation should not block, you can use `lazy: true`, `useLazyFetch`, or `useLazyAsyncData`. Navigation continues before the handler finishes, so the interface must visibly represent loading and error states.

```vue [LazyCatalog.vue] {7-8}
<script setup lang='ts'>
interface CatalogItem {
  id: string
  name: string
}

const { data: items, status, error } = await useLazyFetch<CatalogItem[]>('/api/catalog')
</script>

<template>
  <p v-if='status === "pending"'>Loading catalog...</p>
  <p v-else-if='error'>Could not load the catalog.</p>
  <ul v-else>
    <li v-for='item in items ?? []' :key='item.id'>
      {{ item.name }}
    </li>
  </ul>
</template>
```

`server: false` is a different decision: the initial load happens only on the client, and the data is not available before hydration finishes. Do not use it as an automatic fix for a duplicate request; first decide whether the read belongs in the server-rendered HTML.

## Composables, Pinia, and Data Ownership

A view-specific read can stay in the page or in a composable when it has no shared consumers or shared lifetime. This separation prevents turning every HTTP response into global state.

Pinia is a better fit when multiple components need the same state, when domain actions exist, or when the information must live beyond a single view. Its Nuxt integration handles SSR context and serialization. For initial store loads, the documentation recommends a flow such as `callOnce` to await the action without unnecessarily repeating it.

Do not automatically copy every `useFetch` response into Pinia. Doing so can create two sources of truth and two invalidation policies: one for the Nuxt ref and another for the store. If you decide to retain the data in Pinia, define which read is authoritative and when it is updated.

The difference from `useNuxtData` is responsibility: `useNuxtData` provides reactive access to a value cached under an explicit key; Pinia represents shared state and domain behavior. For per-user state, respect the scope of each SSR request and avoid declaring a module-level singleton `ref` inside a composable.

You can expand this criterion in [Reactivity in Composables: toRef, toRefs, and How Not to Lose It When Destructuring](/blog/reactivity-in-composables-toref-torefs-and-how-not-to-lose-it-when-destructuring.en/) and [Pinia in Vue 3: When to Use Global State and When Not To](/blog/pinia-in-vue-3-when-to-use-global-state-and-when-not-to.en/).

The following fragment is preserved as the starting point for the lab configured in frontmatter. Its defects are deliberate: it is for diagnosing the flow, not production-ready code.

```vue [BrokenCatalog.vue] {9-17}
<script setup lang='ts'>
import { computed, ref, watch } from 'vue'

interface CatalogItem {
  id: string
  name: string
}

const route = useRoute()
const category = computed(() => String(route.params.category))
const items = await $fetch<CatalogItem[]>('/api/catalog')
const staticKey = 'catalog'
const storeItems = ref<CatalogItem[]>([])

watch(category, async () => {
  storeItems.value = await $fetch<CatalogItem[]>('/api/catalog')
})
</script>

<template>
  <p>{{ staticKey }}</p>
  <ul>
    <li v-for='item in items' :key='item.id'>{{ item.name }}</li>
  </ul>
</template>
```

There is no `useFetch` or `useAsyncData` call with `key: 'catalog'`, and there is no Pinia store yet. `staticKey` is only a local constant, while `storeItems` is a local ref that is not rendered. The diagnosis should focus on the defects that are actually present: the initial call uses direct `$fetch`, the URL ignores `category`, and the watcher requests data again without expressing a complete identity.

## Final Criterion

Use `useFetch` for URL-based view reads. Use `useAsyncData` for custom asynchronous work. Use `$fetch` for event-driven commands or inside a handler. In every case, review what identifies the data, whether navigation waits, how the result is reused or invalidated, and who owns it.

Before closing an implementation, also confirm whether the deployment enables `experimental.payloadExtraction` when you need a static caching policy across navigations, whether the external API requires authentication or a configured client, and which strategy you will apply after a mutation.
