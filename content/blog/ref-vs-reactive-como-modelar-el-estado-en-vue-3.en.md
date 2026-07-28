---
title: "ref() vs reactive(): How to Model State in Vue 3"
description: "Learn how to choose between ref(), reactive(), toRefs(), and useState() based on data shape, destructuring, and SSR scope."
date: 2026-07-27T18:31:41-05:00
updatedAt: 2026-07-27T18:31:41-05:00
draft: false
locale: en
author: TODOvue
series: vue-reactivity
seriesOrder: 2
seriesTitle: "Practical Reactivity in Vue 3"
seriesDescription: "A practical path to understand how Vue tracks state, choose the right reactive API, and optimize updates without losing clarity."
tags:
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "State Management"
    color: "#FF9800"
  - tag: "Guides"
    color: "#42B983"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "SSR"
    color: "#0E9AA7"
  - tag: "Best Practices"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1785199207/ref-vs-reactive-como-modelar-el-estado-en-vue-3_j8hzro.png
coverAlt: "Comparison of ref() and reactive() for modeling reactive state in Vue 3"
coverCaption: "Official Vue reference for reactivity fundamentals"
keywords:
  - "ref() vs reactive()"
  - "Vue 3 reactivity"
  - "state management in Vue 3"
  - "toRefs()"
  - "useState() in Nuxt"
  - "Composition API"
schemaOrg:
  - type: "BlogPosting"
    headline: "ref() vs reactive(): How to Model State in Vue 3"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-27T18:31:41-05:00"
---

# ref() vs reactive(): How to Model State in Vue 3

Choosing between `ref()` and `reactive()` is not about memorizing two interchangeable ways to write state. The decision affects how you replace values, how you expose data from a composable, and how you preserve reactivity when destructuring.

As a general rule, start with `ref()`. It works well for primitive values, asynchronous results, replaceable values, and state that will travel between composables. Choose `reactive()` deliberately when you have a stable object and want to mutate its properties directly.

Nuxt adds another decision: state scope. Local state can live inside `setup()`, while state shared between components or instances must keep each SSR request isolated and account for serialization and hydration.

## The Quick Decision: `ref()` as the General Default

| Need                                  | Usual choice | Reason                                                       |
|---------------------------------------|--------------|--------------------------------------------------------------|
| Boolean, number, or string            | `ref()`      | It can hold any value type.                                  |
| Replaceable asynchronous result       | `ref()`      | The value can move from `null` to a new result.              |
| State shared between composables      | `ref()`      | It can be returned and destructured without losing the link. |
| Stable object with several properties | `reactive()` | Properties are mutated in place.                             |
| SSR-compatible shared state in Nuxt   | `useState()` | It adds a key and participates in Nuxt hydration.            |

The choice describes the state contract: what is replaced, what is mutated, and who consumes it.

## What `ref()` Provides: An Explicit, Replaceable Container

`ref()` returns a mutable reactive object. In JavaScript, you read and write its value through `.value`. This makes the state change explicit and works equally well for a boolean, number, string, or object.

This example focuses on the state model with `ref()`. The button uses native semantics and updates a visible result. For a production toggle, add `aria-pressed` bound to `isEnabled` to expose its state programmatically; changing the text does not replace that semantic.

```vue [FeatureToggle.vue] {2,4}
<script setup lang='ts'>
import { ref } from 'vue'

const isEnabled = ref(false)

function toggleEnabled() {
  isEnabled.value = !isEnabled.value
}
</script>

<template>
  <button type='button' @click='toggleEnabled'>
    {{ isEnabled ? 'Disable' : 'Enable' }}
  </button>
  <p>{{ isEnabled ? 'Feature enabled' : 'Feature disabled' }}</p>
</template>
```

The important difference is in JavaScript: `isEnabled.value` reads or writes the value. In a template, Vue can automatically unwrap refs that are top-level properties of the render context.

`ref()` is also a natural fit for a result that starts empty and is replaced later. In TypeScript, for example, `ref<User | null>(null)` expresses that the state does not contain a user yet and will later receive a `User` object. The same idea applies to HTTP responses, selections, and search results.

When a ref contains an object, Vue makes that object deeply reactive. When you need reactivity only on `.value` and want to avoid deep conversion, `shallowRef()` is a specific alternative; it is not the usual starting point for small forms or objects.

## What `reactive()` Provides: A Proxy for Stable Objects

`reactive()` receives an object, array, or collection and returns a deeply reactive proxy. It is convenient when the domain is understood as one unit with several related properties: a form, filters, or local configuration.

```vue [ProfileForm.vue] {2,4-7}
<script setup lang='ts'>
import { reactive } from 'vue'

const profile = reactive({
  displayName: '',
  email: ''
})

function resetProfile() {
  profile.displayName = ''
  profile.email = ''
}
</script>

<template>
  <form @submit.prevent='resetProfile'>
    <label>
      Display name
      <input v-model='profile.displayName' type='text' />
    </label>

    <label>
      Email
      <input v-model='profile.email' type='email' />
    </label>

    <button type='submit'>Reset</button>
  </form>
</template>
```

Here, `profile.displayName` and `profile.email` are direct operations on the proxy. `reactive()` cannot directly hold a string, number, or boolean as its root value. For those cases, `ref()` communicates the intent more clearly.

You must also preserve the reference created by `reactive()`. Mutating `profile.email` keeps the reactive connection; freely replacing the entire `profile` object does not preserve the connection to the original proxy. If replacing the whole object is part of the design, an object held by a `ref()` is usually a better representation.

## The Limits That Change the Decision: References, Destructuring, and Unwrapping

A common source of bugs is directly destructuring primitive properties from a reactive object:

```ts
const { email } = profile
```

The `email` variable is no longer connected to the reactive property. When you need to expose one property, use `toRef()`. When you want to expose several properties, use `toRefs()`.

```ts [useProfileFilters.ts] {1,4-7,15}
import { reactive, toRefs } from 'vue'

export function useProfileFilters() {
  const filters = reactive({
    query: '',
    activeOnly: false
  })

  function resetFilters() {
    filters.query = ''
    filters.activeOnly = false
  }

  return {
    ...toRefs(filters),
    resetFilters
  }
}
```

The returned object is plain and contains linked refs. Therefore, a consumer can write `const { query, activeOnly } = useProfileFilters()` without breaking reactivity. `toRef(filters, 'query')` would be appropriate if you needed only one property.

Unwrapping also has limits. A ref may be unwrapped as a property of a deeply reactive object, but not necessarily when accessed as an element of a reactive array or a native collection such as `Map`. In those cases, you still need `.value`.

Do not confuse JavaScript with templates. In templates, automatic unwrapping applies to top-level properties of the render context; a nested property does not necessarily receive the same treatment.

## Designing Composables and Types Around the State Contract

The composables documentation recommends returning a plain object containing multiple refs. This format works well as a reusable API: each consumer can destructure the refs and preserve their reactive links.

Return a `reactive()` object when the object’s identity is part of the contract and consumers are expected to work with `state.field`. Return refs when consumers need to replace values, destructure them, or combine them with `computed()` and other APIs.

TypeScript infers a `ref()` type from its initial value. If the state starts empty, use an explicit type such as `ref<User | null>(null)`. `reactive()` also infers types, but Vue discourages passing a generic directly without considering that the resulting type includes nested ref unwrapping. In practice, it is often clearer to type the initial structure and let `reactive()` infer it.

## In Nuxt: Choose According to SSR Scope

Keep local state inside `setup()` when it belongs to one component or instance. Avoid exporting mutable module-scope state in an SSR application: multiple requests could observe or modify the same state.

When you need state shared between Nuxt components or instances and want it preserved during hydration, `useState()` provides an SSR-compatible alternative through a unique key. Each request must remain isolated; `useState()` does not turn the state into mutable storage shared between requests:

```vue [CartBadge.vue] {2,11}
<script setup lang='ts'>
const cartCount = useState('cart-count', () => 0)

function addToCart() {
  cartCount.value++
}
</script>

<template>
  <button type='button' @click='addToCart'>
    Add item ({{ cartCount }})
  </button>
</template>
```

The value passed to `useState()` must be serializable. Do not store classes, functions, or symbols in shared state. Nuxt can serialize and revive refs and reactive objects inside its data payload, while API route responses are serialized with JSON.

Nuxt auto-imports Vue APIs such as `ref()` and `computed()` in the application context. If you prefer explicit imports, Nuxt also provides the `#imports` alias. The choice between auto-imports and explicit imports does not change the reactivity contract.

## Practical Rule and Common Mistakes

Start with `ref()`. Move to `reactive()` when you have a stable object that is mutated through its properties and that shape makes the code clearer. Use `toRef()` or `toRefs()` when exposing properties without losing their links. Reserve `useState()` for shared Nuxt state whose scope and hydration lifecycle require SSR integration.

Check these mistakes before finishing an implementation:

- forgetting `.value` in JavaScript;
- using `reactive()` with a primitive;
- replacing a `reactive()` object while expecting its connection to remain;
- destructuring properties without `toRef()` or `toRefs()`;
- assuming refs inside arrays or `Map` are unwrapped;
- confusing template unwrapping with JavaScript access;
- exporting mutable module-scope state during SSR;
- storing non-serializable values in `useState()`.

## Lab: Justify the Chosen API

Model three cases and write a short justification for each:

1. A local toggle that switches between `true` and `false`.
2. A form with a name and email that is edited field by field.
3. A counter shared between Nuxt components that must survive hydration.

Use `ref()`, `reactive()`, and `useState()` respectively. Then turn the form into a composable that returns refs through `toRefs()`. To study reference replacement, run a separate test with `let state = reactive({ email: '' })` and a `replacement` variable: assigning `state = replacement` stops using the original proxy, while `Object.assign(state, replacement)` preserves the proxy and updates its properties. If replacing the whole object is a routine operation, compare that design with `ref({ email: '' })`. Finally, destructure the properties and explain which link breaks without `toRefs()`.

The decision is not about choosing one API forever. It is about making explicit whether the state represents a replaceable value, a stable object, or shared state whose scope includes SSR.
