---
title: "Vue Directives: v-cloak"
description: "Learn how to use v-cloak in Vue 3 to prevent template flicker before mount, with Composition API and Options API, real-world use cases, common mistakes, and best practices."
date: 2026-02-25T12:30:00-05:00
updatedAt: 2026-02-25T12:30:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Architecture"
    color: "#4CAF50"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771976009/directives-vue-v-cloak-guide_vhkz2i.png
coverAlt: "Temporary cover image for the article about v-cloak in Vue"
coverCaption: "Temporary cover: replace with TODOvue final artwork"
locale: en
series: vue-directives
seriesOrder: 10
seriesTitle: "Vue Directives"
seriesDescription: "A step-by-step path to master Vue core directives."
author: TODOvue
keywords:
  - Vue.js
  - v-cloak
  - FOUC
  - hydration
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue v-cloak directive: prevent flicker before mount"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-25T12:30:00-05:00"
---
# Vue Directives: `v-cloak`

`v-cloak` solves a classic visual issue in **Vue** apps: the flicker of uncompiled templates (`{{ ... }}`) before the instance finishes mounting. It is a simple directive, but a strategic one when first-load quality matters.

## Why it matters

If your initial HTML includes Vue expressions, the browser can render them raw for a few milliseconds, especially when the bundle has not downloaded or executed yet.
That flash hurts user experience and gives a sense of instability.

`v-cloak` prevents this intermediate state by hiding content until Vue has finished mounting and compiling the template.

Direct benefits:

* Users do not see `{{ message }}` or unprocessed structures.
* First paint feels cleaner and more professional.
* You reduce visual noise in landing pages, static layouts, or progressive integrations.

## Core concept

`v-cloak` works together with CSS.
Vue automatically removes the `v-cloak` attribute from the node once the instance has mounted and the template is compiled.

Typical pattern:

1. Add a global CSS rule:

```css [style.css]
[v-cloak] {
  display: none;
}
```

2. Mark the root container (or the required fragment) with `v-cloak`.
3. While Vue has not mounted, the block stays hidden.
4. When Vue mounts, it removes the attribute and processed content appears.

> `v-cloak` does not transform data or add reactivity. It only controls visibility during the pre-mount phase (`before mount`).

## Vue 3 and SSR considerations

In SSR apps (for example, with **Nuxt 4**), HTML already arrives compiled from the server, so there is usually no risk of showing raw interpolations.

In those cases:

* `v-cloak` is usually unnecessary.
* It does not fix hydration mismatches.
* It does not replace a proper loading or streaming strategy.

Its value is higher in:

* Progressive enhancement over existing HTML.
* SPA apps where the bundle can take time to execute.
* Environments where initial HTML includes raw Vue markers.

## When to use

Use `v-cloak` when:

* You serve initial HTML with visible Vue templates (CMS, progressive integration).
* The app takes noticeable time to mount because of bundle size or slow network.
* You want to protect first visual impression for critical components (hero, login, pricing).

## When to avoid

Avoid it when:

* There is no real risk of exposing interpolations.
* Skeletons or richer placeholders solve initial state better.
* Hiding the full container hurts accessibility or layout continuity.
* You are in SSR and HTML already arrives processed.

> `v-cloak` is not a performance strategy; it is a visual finishing adjustment.

## Common mistakes

### 1) Using `v-cloak` without CSS

If you do not define `[v-cloak] { display: none; }`, the directive has no visible effect.

### 2) Placing the CSS rule in the wrong scope

If the rule lives in another component's `<style scoped>`, it may not affect the marked node.
Define it in global styles (for example, `main.css` or root layout styles).

### 3) Hiding too much UI

Applying `v-cloak` to the full wrapper can blank the screen during startup.
In complex views, use it only where flicker risk is real.

### 4) Expecting it to fix hydration mismatches

`v-cloak` does not fix differences between server HTML and client render.
Hydration mismatches must be fixed by aligning render logic between server and client.

## Practical examples

### 1) Minimal global setup

```css
[v-cloak] {
  display: none;
}
```

With this rule, any node marked with `v-cloak` remains hidden until mount.

### 2) Hero with reactive headline

```vue [Composition API] {11}
<script setup lang="ts">
import { ref } from "vue";

const headline = ref("Learn Vue without friction");
</script>

<template>
  <section v-cloak class="hero">
    <h1>{{ headline }}</h1>
    <p>Practical guides for frontend teams.</p>
  </section>
</template>
```

```vue [Options API] {15}
<script lang="ts">
export default {
  data() {
    return {
      headline: "Learn Vue without friction",
    };
  },
};
</script>

<template>
  <section v-cloak class="hero">
    <h1>{{ headline }}</h1>
    <p>Practical guides for frontend teams.</p>
  </section>
</template>
```

```css [style.css]{1-3}
[v-cloak] {
  display: none;
}

.hero {
  background: linear-gradient(135deg, #6C5CE7, #B173BF);
  color: white;
  padding: 2rem;
  border-radius: 8px;
}
```

### 3) Progressive enhancement on legacy HTML

When you mount Vue into a specific section of a legacy page (for example, a login block or interactive widget), `v-cloak` prevents raw markers from flashing during initial bootstrap.

### 4) Full example with async state

```vue [Composition API] {2,14}
<script setup lang="ts">
import { onMounted, ref } from "vue";

const user = ref<{ name: string } | null>(null);

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 350));
  user.value = { name: "Cristhian" };
});
</script>

<template>
  <aside v-cloak class="welcome-card">
    <h2>Dashboard</h2>
    <p v-if="user">Hi, {{ user.name }}</p>
    <p v-else>Loading profile...</p>
  </aside>
</template>
```

```vue [Options API] {14}
<script lang="ts">
export default {
  name: "WelcomeCard",
  data() {
    return {
      user: null as null | { name: string },
    };
  },
  async mounted() {
    await new Promise((resolve) => setTimeout(resolve, 350));
    this.user = { name: "Cristhian" };
  },
};
</script>

<template>
  <aside v-cloak class="welcome-card">
    <h2>Dashboard</h2>
    <p v-if="user">Hi, {{ user.name }}</p>
    <p v-else>Loading profile...</p>
  </aside>
</template>
```

```css [style.css]
[v-cloak] {
  display: none;
}
```

## Summary

`v-cloak` is a visual finishing directive: it does not modify your logic or reactivity model, but it improves perceived first-render quality in contexts where templates can appear uncompiled.

Key points:

* It requires a global CSS rule: `[v-cloak] { display: none; }`.
* It prevents flashing of unprocessed interpolations.
* It does not replace performance optimization or solve hydration mismatches.
* It should be applied selectively and with context awareness (SPA vs SSR).
