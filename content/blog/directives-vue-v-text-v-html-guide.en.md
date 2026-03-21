---
title: "Vue Directives: v-text and v-html"
description: "Learn when to use v-text and v-html in Vue, key differences, security risks, common mistakes, and recommended patterns with Composition API and Options API examples."
date: 2026-02-20T20:00:00-05:00
updatedAt: 2026-02-20T20:00:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Templates"
    color: "#00B894"
  - tag: "Rendering"
    color: "#E17055"
  - tag: "Basics"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771635700/directives-vue-v-text-v-html-guide_n0cemz.png
coverAlt: "Example of v-text and v-html usage in Vue.js"
coverCaption: "Learn to use v-text and v-html safely and effectively in your Vue projects"
series: vue-directives
seriesOrder: 8
seriesTitle: "Vue Directives"
seriesDescription: "A step-by-step path to master Vue core directives."
keywords:
  - Vue.js
  - v-text
  - v-html
  - XSS
  - rendering
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Directives: v-text and v-html"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-20T20:00:00-05:00"
---
# Vue Directives: `v-text` vs `v-html`

In Vue, `v-text` and `v-html` let you render dynamic content in the DOM, but they do not do the same thing and they do not carry the same risk level.

* `v-text` inserts **plain text**.
* `v-html` inserts **HTML interpreted by the browser**.

> Understanding this difference is key to avoiding UI bugs and, more importantly, security vulnerabilities like XSS.

## Why This Matters

In real projects, content often comes from APIs, CMS platforms, or even user forms. Choosing the wrong directive between `v-text` and `v-html` can cause:

* Broken layouts due to unexpected tags.
* Exposure to XSS attacks.
* Duplicated sanitization logic across multiple components.
* Visual inconsistencies that are hard to debug.

> Making the right decision early improves security, maintainability, and code consistency.

## Core Concept

### `v-text`

Renders the value as node text content (`textContent`).
If the value includes HTML tags, they are displayed as literal text and not interpreted.

```vue [App.vue]
<p v-text="message"></p>
```

It is equivalent to standard interpolation:

```vue [App.vue]
<p>{{ message }}</p>
```

> In practice, interpolation (`{{ }}`) is usually the most common and readable way to render dynamic text.

### `v-html`

Renders the value as HTML inside the node (`innerHTML`).
If the string contains tags, the browser parses them as part of the DOM.

```vue [App.vue]
<div v-html="htmlSnippet"></div>
```

Important considerations:

* `v-html` **does not compile Vue templates** inside injected content.
* It does not bind directives (`v-if`, `@click`, etc.).
* It should not be used with untrusted content.
* Injected content is outside the Vue template compiler scope.

## When To Use

### Use `v-text` when:

* You render simple, safe dynamic text.
* Content can include `<` or `>` and you need those characters shown literally.
* You do not need rich formatting.
* You want the safest default option.

### Use `v-html` when:

* You render previously sanitized HTML.
* Content comes from a controlled CMS or trusted backend.
* You need rich formatting (`<strong>`, `<em>`, lists, links, etc.).
* A clear, centralized sanitization strategy exists.

## When To Avoid

### Avoid `v-text` when:

* You need actual rich HTML formatting.

### Avoid `v-html` when:

* Content comes directly from user input without sanitization.
* You do not have a centralized sanitization strategy.
* The same result can be achieved with explicit components (safer and easier to maintain).
* You can model structure as data and render it with `v-for` and components instead of injecting raw HTML.

## Common Mistakes

### 1) Using `v-html` with untrusted content

Incorrect:

```vue [App.vue]
<div v-html="userBio"></div>
```

If `userBio` is not sanitized, it can inject `<script>`, dangerous attributes (`onerror`, `onclick`), or malicious URLs.

### 2) Expecting `v-html` to process Vue directives

This does not work:

```js [main.js]
const html = '<button @click="save">Save</button>'
```

> Directives inside a string injected with `v-html` are **not compiled or bound** to the component context.

### 3) Using `v-html` for “flexibility”

If you only need text, use interpolation (`{{ }}`) or `v-text`.
It is simpler, more readable, and safer.

### 4) Repeating sanitization in every component

Sanitization should live in a centralized function, composable, or utility.
Duplicating it in each view increases inconsistency and error risk.

## Practical Examples

### 1) Safe dynamic message (`v-text`)

```vue [App.vue]
<p class="status" v-text="statusMessage"></p>
```

### 2) Rich description from a CMS (`v-html` + prior sanitization)

```vue [App.vue]
<article class="prose" v-html="safeHtml"></article>
```

### 3) Fallback between allowed HTML and plain text

```vue [App.vue]
<div v-if="allowRichText" v-html="safeHtml"></div>
<p v-else v-text="plainText"></p>
```

## Composition API Example

```vue [Composition API]
<script setup lang="ts">
import { computed, ref } from "vue";

const allowRichText = ref(true);
const rawFromCms = ref("<h3>Updates</h3><p><strong>Vue 3</strong> improves DX.</p>");
const plainFallback = ref("Updates: Vue 3 improves DX.");

function sanitizeHtml(input: string) {
  // Placeholder: in production, use a robust library such as DOMPurify.
  return input.replace(/<script.*?>.*?<\/script>/gi, "");
}

const safeHtml = computed(() => sanitizeHtml(rawFromCms.value));
</script>

<template>
  <section>
    <h2>Editorial content</h2>

    <div v-if="allowRichText" class="prose" v-html="safeHtml"></div>
    <p v-else v-text="plainFallback"></p>
  </section>
</template>
```

## Options API Example

```vue [Options API]
<script>
export default {
  data() {
    return {
      allowRichText: true,
      rawFromCms: "<h3>Updates</h3><p><strong>Vue 3</strong> improves DX.</p>",
      plainFallback: "Updates: Vue 3 improves DX.",
    };
  },
  computed: {
    safeHtml() {
      return this.sanitizeHtml(this.rawFromCms);
    },
  },
  methods: {
    sanitizeHtml(input) {
      // Placeholder: in production, use a robust library such as DOMPurify.
      return input.replace(/<script.*?>.*?<\/script>/gi, "");
    },
  },
};
</script>

<template>
  <section>
    <h2>Editorial content</h2>

    <div v-if="allowRichText" class="prose" v-html="safeHtml"></div>
    <p v-else v-text="plainFallback"></p>
  </section>
</template>
```

## Summary

* `v-text` is for plain text and is the default option when you do not need HTML.
* Interpolation (`{{ }}`) is often more idiomatic than `v-text`.
* `v-html` should only be used with trusted or previously sanitized content.
* `v-html` does not compile or bind Vue directives.
* Centralize sanitization in a clear layer (utility/composable).

> **Practical rule:** if in doubt, start with interpolation or `v-text`, and use `v-html` only when the use case explicitly requires it.
