---
title: "Reactive Performance in Vue: shallowRef, readonly, markRaw, and Unnecessary Updates"
description: "Learn to choose Vue reactivity boundaries, update shallow state correctly, and distinguish deep conversion from avoidable renders."
date: 2026-08-04T19:00:00-05:00
updatedAt: 2026-08-04T19:00:00-05:00
draft: false
locale: en
author: TODOvue
series: vue-reactivity
seriesOrder: 6
seriesTitle: "Practical Reactivity in Vue 3"
seriesDescription: "A practical path to understand how Vue tracks state, choose the right reactive API, and optimize updates without losing clarity."
tags:
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Performance"
    color: "#D4A017"
  - tag: "Best Practices"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1785888143/reactive-performance-shallowref-readonly-markraw-unnecessary-updates_ngtda7.png
coverAlt: "Vue reactivity boundary diagram showing shallowRef, readonly, and markRaw."
coverCaption: "Diagram about Vue reactivity boundaries."
keywords:
  - reactive performance in Vue
  - shallowRef
  - readonly
  - markRaw
  - unnecessary Vue updates
  - triggerRef
  - computed stability
schemaOrg:
  - type: "BlogPosting"
    headline: "Reactive Performance in Vue: shallowRef, readonly, markRaw, and Unnecessary Updates"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-08-04T19:00:00-05:00"
lab:
  title: "Repair the catalog update flow"
  goal: "Update a shallow catalog through root replacement and classify the remaining work as reactive, component-level, or DOM-level."
  tasks:
    - "Make the button update the first item's name without mutating the nested array."
    - "Explain whether an observed extra render belongs to reactivity, child-component props, or DOM-node volume."
    - "Use onRenderTriggered() in development before adding another optimization."
  starterCode: |
    <script setup lang="ts">
    import { shallowRef } from 'vue'

    type CatalogItem = {
      id: string
      name: string
    }

    const catalog = shallowRef<CatalogItem[]>([
      { id: 'catalog-1', name: 'Starter plan' }
    ])

    function renameFirstItem() {
      catalog.value[0].name = 'Updated starter plan'
    }
    </script>

    <template>
      <button @click="renameFirstItem">Rename first item</button>
      <p>{{ catalog[0].name }}</p>
    </template>
  solutionHint: "Create a new array with map() and assign it to catalog.value. A nested mutation does not by itself notify shallowRef() dependencies."
---

# Reactive Performance in Vue: shallowRef, readonly, markRaw, and Unnecessary Updates

A slow interface does not by itself prove that Vue is doing too much deep reactivity. Extra work may come from converting and tracking a large object, unstable props that update child components, or a list with too many DOM nodes. These problems are related, but they require different decisions.

The right decision starts by observing which dependency triggers rendering. Then define the reactivity boundary that expresses your state contract: deep reactivity for frequent nested changes, root replacement for large immutable structures, a readonly view to protect who can mutate, and focused opt-outs for instances Vue should not proxy.

## Before Optimizing: Identify Which Work Is Unnecessary

First, find out what causes the update. `onRenderTracked` shows the dependencies read during rendering, and `onRenderTriggered` shows which one triggered another render. These hooks are for development-time diagnosis; they are not a performance solution by themselves.

```vue [RenderDiagnosis.vue] {6-12}
<script setup lang="ts">
import { onRenderTracked, onRenderTriggered, ref } from 'vue'

const selectedId = ref<string | null>(null)

onRenderTracked((event) => {
  console.debug('render tracked', event)
})

onRenderTriggered((event) => {
  console.debug('render triggered', event)
})
</script>

<template>
  <button @click="selectedId = 'catalog-1'">Select catalog item</button>
  <p>Selected: {{ selectedId ?? 'none' }}</p>
</template>
```

With that evidence, separate three questions:

- Is the cost in accessing a large structure that Vue converts and tracks deeply?
- Does a child component receive props or derived objects with a new identity even though their meaning did not change?
- Is the bottleneck the number of nodes that must render?

Replacing `ref()` with `shallowRef()` only addresses the first question. If a list still has too many visible items, evaluate virtualization. If the problem is at component boundaries, stabilize props and derived values before adding rendering directives.

## shallowRef(): Large State with Replacement Updates

`ref()` deeply converts object values. By contrast, `shallowRef()` makes only `.value` access reactive. This difference reduces access and tracking work for large structures treated as immutable, but it changes the update contract: a nested write does not notify on its own; replacing the root value does.

The following catalog uses root replacement to express an edit. The second button illustrates the operation you should not expect to update the interface automatically.

```vue [LargeCatalog.vue] {13-15}
<script setup lang="ts">
import { shallowRef } from 'vue'

type CatalogItem = {
  id: string
  name: string
}

const catalog = shallowRef<CatalogItem[]>([
  { id: 'catalog-1', name: 'Starter plan' },
  { id: 'catalog-2', name: 'Team plan' }
])

function renameFirstItem() {
  catalog.value = catalog.value.map((item, index) =>
    index === 0 ? { ...item, name: 'Updated starter plan' } : item
  )
}

function mutateFirstItemInPlace() {
  catalog.value[0].name = 'Changed without replacing the root'
}
</script>

<template>
  <button @click="renameFirstItem">Rename with root replacement</button>
  <button @click="mutateFirstItemInPlace">Mutate nested value</button>

  <ul>
    <li v-for="item in catalog" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

The highlighted lines create a new array and assign a new reference to `.value`, so reactive consumers receive the update. The nested mutation may change the JavaScript object, but it does not trigger effects that depend on the `shallowRef` by itself.

Use this pattern when state is large and mostly immutable, or when Vue only needs to observe the container for external state. For a small object that your application commonly mutates deeply, `ref()` or `reactive()` retain a clearer contract. If you need to revisit that foundation, see the guide to [`ref` and `reactive`](/blog/ref-vs-reactive-como-modelar-el-estado-en-vue-3.en/).

## triggerRef() and External State: Controlled Exceptions

Sometimes an external system mutates internally a value you hold in a `shallowRef`. `triggerRef()` lets you explicitly notify dependent effects after that mutation. It is useful as a controlled bridge, not as the primary update model for data you can update immutably.

```vue [ExplicitShallowTrigger.vue] {9-10}
<script setup lang="ts">
import { shallowRef, triggerRef } from 'vue'

const draft = shallowRef({
  title: 'Quarterly plan',
  status: 'editing'
})

function saveDraft() {
  draft.value.status = 'saved'
  triggerRef(draft)
}
</script>

<template>
  <button @click="saveDraft">Save draft</button>
  <p>{{ draft.title }} — {{ draft.status }}</p>
</template>
```

Here, the explicit trigger makes a deep mutation visible. If you control the data shape, prefer replacing the root: it communicates what changed more clearly and prevents the rest of the code from relying on manual notifications.

## readonly(): Protecting Mutation Ownership

`readonly()` creates a deeply readonly view. Reads from that view still participate in reactive tracking, and updates made to the original state can reach consumers of the view. Its main purpose is not performance optimization: it makes clear who owns mutations.

This composable exposes items as readonly and keeps writing in an explicit function. The state lives inside the exported function, so every use receives its own instance.

```ts [useCart.ts] {16}
import { readonly, ref } from 'vue'

type CartItem = {
  id: string
  name: string
}

export function useCart() {
  const items = ref<CartItem[]>([])

  function addItem(item: CartItem) {
    items.value = [...items.value, item]
  }

  return {
    items: readonly(items),
    addItem
  }
}
```

This boundary answers API ownership and safety, not whether state should be deep or shallow. You can expose a `readonly()` view of deep state or of a shallow container according to the update contract you chose.

## markRaw(): Excluding Instances Vue Should Not Proxy

`markRaw()` prevents Vue from converting one specific object into a proxy. Reserve it for complex instances that should not be proxied, such as an instance managed by an external library. It is not a general optimization for application objects.

```ts [external-engine.ts] {15}
import { markRaw, reactive } from 'vue'

class ExternalEngine {
  private connected = false

  connect() {
    this.connected = true
  }

  get status() {
    return this.connected ? 'connected' : 'idle'
  }
}

const engine = markRaw(new ExternalEngine())
const state = reactive({ engine })

state.engine.connect()
console.log(state.engine.status)
```

The `markRaw()` opt-out applies at the root. If nested objects enter a reactive graph again through another path, you may end up comparing a raw reference with a proxied version. This identity risk is a reason to keep the boundary small and avoid mixing raw and proxied references without a clear need.

## Unnecessary Updates That shallowRef Does Not Solve

Even with the right reactivity boundary, a derived value can create extra work if it creates a new object every time. In Vue 3.4 or later, a `computed` can reuse its previous value when a safe comparison shows that the semantic result did not change.

```vue [AvailabilityLabel.vue] {11-12}
<script setup lang="ts">
import { computed, ref } from 'vue'

const quantity = ref(1)

const availability = computed<{ label: string }>((previous) => {
  const next = {
    label: quantity.value > 0 ? 'In stock' : 'Sold out'
  }

  if (previous?.label === next.label) return previous
  return next
})
</script>

<template>
  <button @click="quantity += 1">Add one</button>
  <button @click="quantity -= 1">Remove one</button>
  <p>{{ availability.label }}</p>
</template>
```

The comparison happens after building `next`, so the `computed` reads its dependencies before deciding whether it can reuse the result. When quantity moves from one to two, the label remains the same and the previous identity is retained. Apply this technique only when you can safely compare the meaning consumed by descendants.

Stable props remain just as important: move calculations to the component that owns the data when doing so lets children receive values that do not change. Consider `v-memo` or `v-once` only after measuring and stabilizing data flow. The [render debugging](/blog/vue-lifecycle-render-debug-rendertracked-rendertriggered.en/) guide and the [`v-memo` and `v-once`](/blog/directives-vue-v-once-v-memo-v-pre-guide.en/) guide help evaluate those cases.

## Decision Rule

Choose the API by the state contract, not its name:

| Situation                                                    | Initial decision                    |
|--------------------------------------------------------------|-------------------------------------|
| Small state with frequent nested mutations                   | `ref()` or `reactive()`             |
| Large immutable structure, or a container for external state | `shallowRef()` and root replacement |
| Public view that consumers must not mutate                   | `readonly()`                        |
| A specific instance Vue should not proxy                     | `markRaw()`                         |

Before applying any of these options, measure or inspect rendering in development. Then confirm whether the remaining work belongs to reactivity, component updates, or DOM volume.

Useful optimization means setting the right boundary. Keep deep reactivity when nested mutations are part of the contract; use shallow replacement when immutability makes it viable; expose `readonly()` to protect ownership of writes; and reserve `markRaw()` for focused exceptions. This reduces unnecessary work without hiding updates the interface actually needs.

