---
title: "Vue computed vs watch vs watchEffect: When to Use Each One"
description: "Learn the practical difference between computed, watch, and watchEffect in Vue 3, with examples, mistakes to avoid, and a decision guide for real components."
date: 2026-07-06T20:00:00-05:00
updatedAt: 2026-07-06T20:00:00-05:00
draft: false
tags:
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Performance"
    color: "#D4A017"
  - tag: "Guides"
    color: "#42B983"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1783385054/vue-computed-watch-watcheffect-guide_vepplp.png
coverAlt: "Vue reactivity concepts represented as connected data flows"
coverCaption: "Computed values, watchers, and effects in Vue 3 by TODOvue"
locale: en
author: TODOvue
keywords:
  - Vue.js
  - Vue 3
  - computed
  - watch
  - watchEffect
  - reactivity
  - Composition API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue computed vs watch vs watchEffect: When to Use Each One"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-06T20:00:00-05:00"
lab:
  title: "Choose the right reactive tool"
  goal: "Practice using computed for derived state, watch for explicit side effects, and watchEffect for automatic dependency tracking."
  tasks:
    - "Create a search input stored in a ref."
    - "Use computed to normalize the query."
    - "Use watch to trigger a fetch-like function only when the normalized query changes."
    - "Use watchEffect to log every reactive value read inside the effect, then explain why it runs."
  starterCode: |
    <script setup>
    import { computed, ref, watch, watchEffect } from 'vue'

    const query = ref('')
    const page = ref(1)

    const normalizedQuery = computed(() => query.value.trim().toLowerCase())

    watch(normalizedQuery, (value) => {
      page.value = 1
      console.log('Fetch results for:', value)
    })

    watchEffect(() => {
      console.log('Current search state:', normalizedQuery.value, page.value)
    })
    </script>

    <template>
      <input v-model="query" placeholder="Search articles">
      <p>Normalized query: {{ normalizedQuery }}</p>
      <p>Page: {{ page }}</p>
    </template>
  solutionHint: "The computed value derives data without causing side effects. The watch reacts to one explicit source. The watchEffect reruns whenever anything it reads changes."
---
# Vue `computed` vs `watch` vs `watchEffect`: When to Use Each One

Vue gives you three tools that often appear in the same conversation: `computed`, `watch`, and `watchEffect`.

They all react to state, but they do not solve the same problem.

If you mix them up, components start to feel unpredictable. Values update from too many places, API calls fire more often than expected, and logic that should be simple becomes hard to debug. If you choose the right tool, the code almost explains itself.

This guide is a practical decision map.

## The short version

Use `computed` when you need a value.

Use `watch` when you need to do something because a specific value changed.

Use `watchEffect` when the effect should automatically track everything it reads.

| Tool | Best for | Should return a value? | Should cause side effects? |
|------|----------|------------------------|----------------------------|
| `computed` | Derived state | Yes | No |
| `watch` | Explicit reactions | No | Yes |
| `watchEffect` | Auto-tracked effects | No | Yes, carefully |

## Start with `computed` when you need derived state

A computed value answers the question: "What value can I derive from existing state?"

For example, imagine a cart summary:

```vue [CartSummary.vue]
<script setup>
import { computed, ref } from 'vue'

const items = ref([
  { id: 1, name: 'Vue stickers', price: 6, quantity: 2 },
  { id: 2, name: 'Nuxt notebook', price: 14, quantity: 1 }
])

const subtotal = computed(() => {
  return items.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const hasFreeShipping = computed(() => subtotal.value >= 30)
</script>

<template>
  <p>Subtotal: {{ subtotal }}</p>
  <p>{{ hasFreeShipping ? 'Free shipping unlocked' : 'Shipping is calculated at checkout' }}</p>
</template>
```

`subtotal` is not a second source of truth. It is a value derived from `items`.

That is exactly where `computed` shines:

- It is cached.
- It updates when its dependencies change.
- It keeps templates readable.
- It avoids duplicating state.

If you are tempted to create a `ref` and manually keep it in sync with another `ref`, pause. Most of the time, that synced value should be a `computed`.

## Do not use `watch` to create a derived value

This is a common mistake:

```vue [AvoidThis.vue]
<script setup>
import { ref, watch } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')
const fullName = ref('')

watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
}, { immediate: true })
</script>
```

It works, but it makes the component harder than it needs to be. Now `fullName` is a writable piece of state that must stay synchronized forever.

Use `computed` instead:

```vue [UseComputed.vue]
<script setup>
import { computed, ref } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')

const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

The rule is simple: if the result can be calculated from reactive state, prefer `computed`.

## Use `watch` for explicit side effects

A watcher answers a different question: "When this specific thing changes, what should happen?"

That "happen" is usually a side effect:

- Fetch data.
- Write to `localStorage`.
- Reset pagination.
- Sync a query string.
- Call a browser API.

Here is a search example:

```vue [SearchResults.vue]
<script setup>
import { computed, ref, watch } from 'vue'

const query = ref('')
const page = ref(1)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

watch(normalizedQuery, async (value, previousValue) => {
  if (value === previousValue) return

  page.value = 1
  await fetchResults(value)
})

async function fetchResults(value) {
  console.log('Fetching results for:', value)
}
</script>

<template>
  <input v-model="query" type="search" placeholder="Search">
  <p>Page: {{ page }}</p>
</template>
```

This is a good use of `watch` because the source is explicit: `normalizedQuery`.

You can read the code and know exactly why the fetch happens.

## Use `watchEffect` for automatic tracking

`watchEffect` runs immediately and tracks every reactive value read during its execution.

That makes it convenient when the dependency list is obvious from the body:

```vue [AutoTrackedEffect.vue]
<script setup>
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const locale = ref('en')

watchEffect(() => {
  console.log(`Load user ${userId.value} using locale ${locale.value}`)
})
</script>
```

The effect reads `userId.value` and `locale.value`, so Vue tracks both. When either changes, the effect runs again.

This is expressive, but it also requires discipline. If you read more reactive values later, you also add more dependencies. Sometimes that is exactly what you want. Sometimes it turns into a surprise.

## Be careful with async `watchEffect`

`watchEffect` only tracks reactive reads that happen during its synchronous execution.

This part is tracked:

```js [tracked-before-await.js]
watchEffect(async () => {
  console.log(userId.value)
  await loadSomething()
})
```

But reactive reads after `await` are easier to misunderstand:

```js [after-await.js]
watchEffect(async () => {
  await loadSomething()
  console.log(userId.value)
})
```

If an async effect depends on a specific source, `watch` is usually clearer:

```js [async-watch.js]
watch(userId, async (id) => {
  profile.value = await fetchUserProfile(id)
}, { immediate: true })
```

The dependency is explicit. Future readers do not need to inspect the body to know what triggers the request.

## A practical decision tree

Ask these questions in order:

1. Do I need a value for the template or another calculation?

Use `computed`.

2. Do I need to run code because one specific source changed?

Use `watch`.

3. Do I need an effect that naturally depends on everything it reads?

Use `watchEffect`.

4. Am I writing to another ref just to keep it synchronized?

You probably want `computed`.

5. Is the effect making a request, touching storage, or coordinating with something outside Vue?

You probably want `watch`, unless auto-tracking is truly the point.

## Common mistakes

### Mutating state inside `computed`

A computed getter should not change state.

```js [bad-computed-side-effect.js]
const total = computed(() => {
  analyticsCount.value++
  return items.value.length
})
```

That makes a value calculation behave like an effect. Keep `computed` pure.

### Watching too much

Deep watchers can be useful, but they are easy to overuse.

```js [deep-watch.js]
watch(settings, saveSettings, { deep: true })
```

If `settings` is large, this can become expensive or too broad. Prefer watching the specific field that matters when you can.

### Using `watchEffect` when you need control

`watchEffect` is wonderful for compact effects, but less ideal when the trigger matters.

If you need to say "run this only when the selected id changes", say that with `watch`.

## Final rule

If it describes data, use `computed`.

If it responds to a change, use `watch`.

If it should track what it reads, use `watchEffect`.

That tiny distinction prevents a surprising amount of reactive chaos.
