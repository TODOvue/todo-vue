---
title: "Vue Directives: v-if, v-else, and v-show"
description: "Learn how to use v-if, v-else, and v-show in Vue with clear examples, best practices, and key notes to correctly choose between conditional rendering and visibility."
date: 2026-02-05T12:30:00-05:00
updatedAt: 2026-02-05T12:30:00-05:00
readingTime: 8
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Conditional Rendering"
    color: "#E056FD"
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Guides"
    color: "#42B983"
  - tag: "Reactivity"
    color: "#1D5BA1"
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770306351/directives-vue-v-if-v-else-v-show-guide_squcy7.png
coverAlt: "Conceptual illustration of conditional rendering in Vue.js"
coverCaption: "Conditional rendering in Vue.js illustrated by TODOvue"
locale: en
author: TODOvue
keywords:
  - Vue.js
  - v-if
  - v-else
  - v-show
  - conditional rendering
  - directives
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "v-if, v-else, and v-show in Vue: when to use each one"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-05T12:30:00-05:00"
---
# `v-if`, `v-else`, and `v-show` in Vue: when to use each one

The `v-if`, `v-else`, and `v-show` directives are used to **show or hide content** based on a reactive condition.
The key difference—the one that prevents subtle bugs and performance issues—is this:

* **`v-if` / `v-else`**: *create or destroy* DOM elements.
* **`v-show`**: *doesn't destroy anything*; it only toggles `display: none`.

If you think of it as **"Does this exist?"** vs **"Is this visible?"**, you're on the right track.

## What each one does

### `v-if`

Renders the element **only if** the condition is `true`.
If it's `false`, the element **doesn't exist in the DOM**.

**Useful when:**

* The content is heavy (large components, lists, charts)
* It shouldn't exist if the condition isn't met (UI permissions, sensitive flows)
* It's shown infrequently or occasionally

> `v-if` has a higher cost when toggling, because it involves **mounting and unmounting** the component tree.

### `v-else` and `v-else-if`

Used **immediately after** a `v-if` or `v-else-if`.

Important rules:

* They must be **adjacent** (no intermediate nodes).
* Vue interprets them as **a single conditional block**.

### `v-show`

The element is **always rendered** (exists in the DOM), but is shown or hidden with CSS.

**Useful when:**

* Visibility changes frequently (toggles, menus, panels)
* You want to avoid the cost of mounting/unmounting

> `v-show` **doesn't work with `<template>`**, because it's not a real element.
The content remains in the DOM: focus, tab order, and accessibility can be affected if not managed properly.

## Quick summary: which to use

* Use **`v-if`** when the content **shouldn't exist** if the condition isn't met.
* Use **`v-show`** when the content **should only be hidden** and the toggle will be **frequent**.
* Use **`v-else`** for the immediate alternative case of a `v-if`.

## Example 1: Login (`v-if` + `v-else`)

When a person is authenticated, you show the panel; if not, a CTA to log in.

```vue [Composition API]{7,16,21}
<script setup>
import { ref } from "vue";

const isLoggedIn = ref(false);

function toggleLogin() {
  isLoggedIn.value = !isLoggedIn.value;
}
</script>

<template>
  <button @click="toggleLogin">
    {{ isLoggedIn ? "Log out" : "Log in" }}
  </button>

  <section v-if="isLoggedIn">
    <h2>Welcome back</h2>
    <p>You have access to your dashboard.</p>
  </section>

  <section v-else>
    <h2>Please log in</h2>
    <p>You need an account to continue.</p>
  </section>
</template>
```
```vue [Options API]{10,21,26}
<script>
export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  methods: {
    toggleLogin() {
      this.isLoggedIn = !this.isLoggedIn;
    },
  },
};
</script>

<template>
  <button @click="toggleLogin">
    {{ isLoggedIn ? "Log out" : "Log in" }}
  </button>

  <section v-if="isLoggedIn">
    <h2>Welcome back</h2>
    <p>You have access to your dashboard.</p>
  </section>

  <section v-else>
    <h2>Please log in</h2>
    <p>You need an account to continue.</p>
  </section>
</template>
```
> The `<section v-else>` must go **right after** the `v-if`.
If you insert a comment, a `<div>`, or another node in between, Vue stops associating it as an `else`.

## Example 2: Tabs or toggle panel (`v-show`)

A filter panel that the user opens and closes constantly. Here **`v-show`** is ideal.

```vue [Composition API]{4,12}
<script setup>
import { ref } from "vue";

const isOpen = ref(false);
</script>

<template>
  <button @click="isOpen = !isOpen">
    {{ isOpen ? "Hide filters" : "Show filters" }}
  </button>

  <aside v-show="isOpen" class="filters">
    <h3>Filters</h3>
    <label>
      <input type="checkbox" />
      Only available items
    </label>
  </aside>
</template>
```
```vue [Options API]{5,16}
<script>
export default {
  data() {
    return {
      isOpen: false,
    };
  },
};
</script>

<template>
  <button @click="isOpen = !isOpen">
    {{ isOpen ? "Hide filters" : "Show filters" }}
  </button>

  <aside v-show="isOpen" class="filters">
    <h3>Filters</h3>
    <label>
      <input type="checkbox" />
      Only available items
    </label>
  </aside>
</template>
```

### UX and accessibility note

Since the panel **still exists**, its interactive elements can:

* Preserve state
* Preserve focus (sometimes desirable, sometimes not)
* Remain accessible to screen readers if roles/ARIA aren't handled

If the content **shouldn't exist** at all, use `v-if`.

## `v-else-if`: multiple states (without unnecessary nested `if`s)

A common pattern: *loading*, *error*, and *success*.

```vue [Composition API]{4,13-16}
<script setup>
import { ref } from "vue";

const status = ref("idle"); // "idle" | "loading" | "error" | "success"
</script>

<template>
  <button @click="status = 'loading'">Simulate loading</button>
  <button @click="status = 'error'">Simulate error</button>
  <button @click="status = 'success'">Simulate success</button>
  <button @click="status = 'idle'">Reset</button>

  <p v-if="status === 'loading'">Loading...</p>
  <p v-else-if="status === 'error'">Something went wrong.</p>
  <p v-else-if="status === 'success'">Done!</p>
  <p v-else>Idle. Click a button.</p>
</template>
```
```vue [Options API]{5,17-20}
<script>
export default {
  data() {
    return {
      status: "idle", // "idle" | "loading" | "error" | "success"
    };
  },
};
</script>

<template>
  <button @click="status = 'loading'">Simulate loading</button>
  <button @click="status = 'error'">Simulate error</button>
  <button @click="status = 'success'">Simulate success</button>
  <button @click="status = 'idle'">Reset</button>

  <p v-if="status === 'loading'">Loading...</p>
  <p v-else-if="status === 'error'">Something went wrong.</p>
  <p v-else-if="status === 'success'">Done!</p>
  <p v-else>Idle. Click a button.</p>
</template>
```

## Common mistakes

### 1) `v-else` separated from `v-if`

Incorrect:

```vue [App.vue]{2}
<div v-if="ok">Ok</div>
<!-- comment or node -->
<div v-else>Not ok</div>
```

> The `v-else` must go **immediately** after the `v-if`.

### 2) Using `v-show` for content that shouldn't exist

If you hide something like an *admin panel* with `v-show`, **it's still in the DOM**.
It's not security; it's just presentation. Security goes in the backend, but in the UI at least use `v-if`.

### 3) Thinking `v-if` is "free"

Toggling `v-if` many times involves **repeated mounting and unmounting**.
If the user will open and close something constantly, `v-show` is usually a better option.

## Conclusion

* **`v-if`**: controls the **real existence** of the element.
* **`v-else / v-else-if`**: alternative branches of the same conditional block.
* **`v-show`**: hide/show quickly with CSS, without destroying the DOM.

> A UI becomes clearer when you consciously decide:
> **Do I want this to exist or just to be visible?**

