---
title: "Vue Directives: v-once / v-memo / v-pre"
description: "Learn when to use v-once, v-memo, and v-pre in Vue 3 to optimize rendering, avoid unnecessary work, and keep components clear."
date: 2026-02-23T21:00:00-05:00
updatedAt: 2026-02-23T21:00:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Best Practices"
    color: "#2196F3"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771897190/directives-vue-v-once-v-memo-v-pre-guide_ljsdlv.png
coverAlt: "Temporary cover image for the article about v-once, v-memo, and v-pre in Vue"
coverCaption: "Temporary cover: replace with TODOvue final artwork"
locale: en
series: vue-directives
seriesOrder: 9
seriesTitle: "Vue Directives"
seriesDescription: "A step-by-step path to master Vue core directives."
author: TODOvue
keywords:
  - Vue.js
  - v-once
  - v-memo
  - v-pre
  - render optimization
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Directives: v-once, v-memo, and v-pre for efficient rendering"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-23T21:00:00-05:00"
---
# Vue Directives: `v-once` / `v-memo` / `v-pre`

`v-once`, `v-memo`, and `v-pre` are directives focused on rendering performance and compile/render control. They are not meant to be added everywhere, but in specific scenarios they reduce unnecessary work and avoid costly re-renders.

## Why This Matters

In large apps, many performance issues do not come from one heavy operation, but from thousands of small renders that happen repeatedly without need.

These directives let you:

* Freeze static fragments (`v-once`).
* Reuse subtrees when key dependencies do not change (`v-memo`).
* Skip expression compilation for literal content (`v-pre`).

When used intentionally, they improve smoothness without hurting readability.

## Core Concept

### `v-once`

Renders a node only once. On later updates, Vue reuses the result and does not evaluate it again.

Ideal for truly immutable content (build version, fixed legal text, environment metadata, etc.).

### `v-memo`

Memoizes (caches) a template subtree based on a **dependency array**. If no dependency changes, Vue skips patching that subtree.

Useful when part of the template is expensive and depends on a few stable signals. Important note: `v-memo` exists since Vue **3.2+**.

### `v-pre`

Tells Vue to **not compile** that block. Interpolations like `{{ ... }}` are rendered as literal text.

It is perfect for code samples or snippets where you want to display Vue syntax without evaluating it.

## When To Use

Use these directives when you have a concrete, measurable reason:

* `v-once`: static blocks that should not react to updates.
* `v-memo`: complex lists/cards with high render cost when you know the **exact dependencies**.
* `v-pre`: docs, tutorials, or demos where you want to show moustaches literally.

Real cases:

* A dashboard with dense cards that only change by `id` and specific status flags.
* An onboarding screen with fully static sections.
* In-app documentation views that show raw Vue syntax.

## When To Avoid

Avoid them when you are only trying to "optimize for the sake of optimizing":

* Do not use `v-once` for data that should update later.
* Do not use `v-memo` without understanding dependencies; it can hide expected updates.
* Do not use `v-pre` in blocks that still need bindings or events.

If you have not identified a real render issue, measure first with Vue Devtools before adding template complexity.

## Comparison

* `v-once`: permanently frozen after first render.
* `v-memo`: conditionally frozen based on dependencies.
* `v-pre`: no template compilation; literal output.

Quick rule:

* You want "never update this again": `v-once`.
* You want "update only if X dependencies change": `v-memo`.
* You want "show template without interpreting it": `v-pre`.

## Common Mistakes

### 1) Applying `v-once` to data that can change

If the source changes but the node has `v-once`, the UI will become stale.

**Fix:** limit `v-once` to strictly immutable content.

### 2) Defining `v-memo` dependencies incorrectly

If you miss a relevant dependency, Vue may reuse an old subtree.
If you include too many dependencies, you lose the optimization benefit.

**Fix:** declare only signals that affect rendered HTML (and make sure you include all required ones).

### 3) Expecting `v-pre` to process directives or interpolations

With `v-pre`, Vue does not interpret anything inside the block (neither moustaches nor nested directives).

**Fix:** use `v-pre` only for literal output/documentation.

### 4) Using them without validating impact

Adding these directives indiscriminately can increase complexity without real performance gain.

**Fix:** profile first and optimize only where cost is measurable.

## Practical Examples

### 1) Static block with `v-once`

```vue [Composition API] {11}
<script setup lang="ts">
import { ref } from "vue";

const counter = ref(0);
const buildVersion = "2026.02.24";
</script>

<template>
  <button @click="counter++">Clicks: {{ counter }}</button>

  <p v-once>Build: {{ buildVersion }}</p>
</template>
```

```vue [Options API] {14}
<script lang="ts">
export default {
  data() {
    return {
      counter: 0,
      buildVersion: "2026.02.24",
    };
  },
};
</script>

<template>
  <button @click="counter++">Clicks: {{ counter }}</button>
  <p v-once>Build: {{ buildVersion }}</p>
</template>
```

> Note: this assumes `buildVersion` is immutable. If it might change in your app (for example from an async call), `v-once` is not appropriate.

### 2) Heavy segment with `v-memo`

```vue [Composition API] {18}
<script setup lang="ts">
import { ref } from "vue";

type UserCard = { id: number; name: string; isOnline: boolean; score: number };

const selectedId = ref<number | null>(null);
const users = ref<UserCard[]>([
  { id: 1, name: "Ana", isOnline: true, score: 98 },
  { id: 2, name: "Luis", isOnline: false, score: 77 },
  { id: 3, name: "Marta", isOnline: true, score: 88 },
]);
</script>

<template>
  <article
    v-for="user in users"
    :key="user.id"
    v-memo="[user.id, user.isOnline, selectedId === user.id]"
    class="card"
  >
    <h3>{{ user.name }}</h3>
    <p>Score: {{ user.score }}</p>
    <p>{{ user.isOnline ? "Online" : "Offline" }}</p>
    <button @click="selectedId = user.id">Select</button>
  </article>
</template>
```

```vue [Options API] {20}
<script lang="ts">
export default {
  data() {
    return {
      selectedId: null as number | null,
      users: [
        { id: 1, name: "Ana", isOnline: true, score: 98 },
        { id: 2, name: "Luis", isOnline: false, score: 77 },
        { id: 3, name: "Marta", isOnline: true, score: 88 },
      ],
    };
  },
};
</script>

<template>
  <article
    v-for="user in users"
    :key="user.id"
    v-memo="[user.id, user.isOnline, selectedId === user.id]"
    class="card"
  >
    <h3>{{ user.name }}</h3>
    <p>Score: {{ user.score }}</p>
    <p>{{ user.isOnline ? "Online" : "Offline" }}</p>
    <button @click="selectedId = user.id">Select</button>
  </article>
</template>
```

> Important: the `v-memo` array must include **everything** that affects HTML. If `user.score` can change, it should also be in dependencies (otherwise the DOM can show stale score values).

### 3) Literal block with `v-pre`

```vue [Composition API] {8}
<script setup lang="ts">
const message = "This should not render inside the v-pre block";
</script>

<template>
  <p>{{ message }}</p>

  <pre v-pre>{{ message }} + {{ 2 + 2 }}</pre>
</template>
```

```vue [Options API] {13}
<script lang="ts">
export default {
  data() {
    return {
      message: "This should not render inside the v-pre block",
    };
  },
};
</script>

<template>
  <p>{{ message }}</p>
  <pre v-pre>{{ message }} + {{ 2 + 2 }}</pre>
</template>
```

### 4) Complete example

A list component with a static header (`v-once`), memoized cards (`v-memo`), and a literal snippet (`v-pre`):

```vue [Composition API]
<script setup lang="ts">
import { computed, ref } from "vue";

type Task = { id: number; title: string; done: boolean; owner: string };

const selectedOwner = ref<"all" | string>("all");
const tasks = ref<Task[]>([
  { id: 1, title: "Set up CI", done: true, owner: "Ana" },
  { id: 2, title: "Refactor store", done: false, owner: "Luis" },
  { id: 3, title: "Update docs", done: false, owner: "Ana" },
]);

const owners = computed(() => ["all", ...new Set(tasks.value.map((t) => t.owner))]);
const visibleTasks = computed(() =>
  selectedOwner.value === "all"
    ? tasks.value
    : tasks.value.filter((t) => t.owner === selectedOwner.value)
);
</script>

<template>
  <header v-once>
    <h2>Sprint task board</h2>
    <p>Static institutional content</p>
  </header>

  <label>
    Filter by owner
    <select v-model="selectedOwner">
      <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
    </select>
  </label>

  <section
    v-for="task in visibleTasks"
    :key="task.id"
    v-memo="[task.id, task.title, task.owner, task.done, selectedOwner]"
    class="task-card"
  >
    <h3>{{ task.title }}</h3>
    <p>Owner: {{ task.owner }}</p>
    <p>Status: {{ task.done ? "Done" : "Pending" }}</p>
  </section>

  <aside>
    <h4>Snippet for docs</h4>
    <code v-pre>{{ title }} - {{ owner }}</code>
  </aside>
</template>
```

```vue [Options API]
<script lang="ts">
export default {
  data() {
    return {
      selectedOwner: "all",
      tasks: [
        { id: 1, title: "Set up CI", done: true, owner: "Ana" },
        { id: 2, title: "Refactor store", done: false, owner: "Luis" },
        { id: 3, title: "Update docs", done: false, owner: "Ana" },
      ],
    };
  },
  computed: {
    owners() {
      return ["all", ...new Set(this.tasks.map((t) => t.owner))];
    },
    visibleTasks() {
      return this.selectedOwner === "all"
        ? this.tasks
        : this.tasks.filter((t) => t.owner === this.selectedOwner);
    },
  },
};
</script>

<template>
  <header v-once>
    <h2>Sprint task board</h2>
    <p>Static institutional content</p>
  </header>

  <label>
    Filter by owner
    <select v-model="selectedOwner">
      <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
    </select>
  </label>

  <section
    v-for="task in visibleTasks"
    :key="task.id"
    v-memo="[task.id, task.title, task.owner, task.done, selectedOwner]"
    class="task-card"
  >
    <h3>{{ task.title }}</h3>
    <p>Owner: {{ task.owner }}</p>
    <p>Status: {{ task.done ? "Done" : "Pending" }}</p>
  </section>

  <aside>
    <h4>Snippet for docs</h4>
    <code v-pre>{{ title }} - {{ owner }}</code>
  </aside>
</template>
```

## Summary

`v-once`, `v-memo`, and `v-pre` are precision tools:

* `v-once` to freeze immutable content.
* `v-memo` to skip renders when key dependencies do not change.
* `v-pre` to display literal template syntax without compilation.

The key is not using them everywhere, but applying them where render cost is real and expected behavior is explicit.
