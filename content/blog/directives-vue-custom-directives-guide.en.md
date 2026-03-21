---
title: "Vue Directives: Custom Directives"
description: "Learn how to create custom directives in Vue 3 with real-world cases, lifecycle hooks, proper cleanup, and equivalent Composition API and Options API examples."
date: 2026-02-27T12:30:00-05:00
updatedAt: 2026-02-27T12:30:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Custom Directives"
    color: "#7D5FFF"
  - tag: "Architecture"
    color: "#4CAF50"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Advanced"
    color: "#F54927"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772207944/directives-vue-custom-directives-guide_nwp7od.png
coverAlt: "Example of a custom directive in Vue 3"
coverCaption: "Example of a custom directive in Vue 3"
locale: en
author: TODOvue
series: vue-directives
seriesOrder: 11
seriesTitle: "Vue Directives"
seriesDescription: "A step-by-step path to master Vue core directives."
keywords:
  - Vue.js
  - custom directives
  - directive lifecycle
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Custom Directives in Vue 3"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-27T12:30:00-05:00"
---
# Custom Directives in Vue 3

## Why This Matters

Custom directives let you encapsulate **imperative DOM manipulation** that does not fit well in a component or a pure composable. They are especially useful for low-level behavior such as:

* Autofocus (`v-autofocus`)
* Keyboard shortcuts (`v-hotkey`)
* Click outside to close (`v-click-outside`)
* Integrating browser APIs or non-reactive libraries (`IntersectionObserver`, `ResizeObserver`, tooltips)

If directives are not designed carefully, it is easy to end up with **duplicated listeners**, **memory leaks**, or repeated logic across multiple views.

## Core Concept

A custom directive is an object (or shorthand function) with hooks that Vue runs on a **real DOM element**.

In Vue 3, a directive can expose these hooks (most commonly used):

* `mounted`: The element is already in the DOM (great for listeners and observers).
* `updated`: The component updated and you need to refresh behavior.
* `unmounted`: Cleanup for listeners, timers, observers, and more.

There are also useful before-hooks:

* `beforeMount`, `beforeUpdate`, `beforeUnmount`

The `binding` object gives you the current value, argument, and modifiers:

* `binding.value`: Current value (`v-my-directive="value"`).
* `binding.oldValue`: Previous value (available in `beforeUpdate`/`updated`).
* `binding.arg`: Argument (`v-my-directive:delay="300"`).
* `binding.modifiers`: Modifiers (`v-my-directive.once.capture`).

Practical rule: use directives for **element behavior**, not **business state**.

## When To Use

1. When you need reusable imperative DOM logic across multiple components.
2. When integrating non-reactive APIs (`IntersectionObserver`, `ResizeObserver`, third-party tooltips).
3. When you want a declarative template contract for a specific behavior (`v-autofocus`, `v-click-outside`).

## When To Avoid

1. When the real solution is a component (visual structure + state + events).
2. When native bindings or built-in directives already solve it (`v-model`, `v-bind`, `v-on`).
3. When trying to coordinate global state or complex data flow through a directive.

## Common Mistakes

1. **Not cleaning up resources in `unmounted`.**

   * Why it happens: a listener is added in `mounted` and never removed.
   * Fix: keep references (on the element or in a controlled closure) and always clean up in `unmounted`.

2. **Overfitting a directive to a single case.**

   * Why it happens: generic name, highly specific logic.
   * Fix: define a clear contract using `value`, `arg`, and `modifiers`.

3. **Assuming a directive on a component will always target one stable DOM node.**

   * Why it happens: expecting one root and attribute/directive forwarding to always behave the same.
   * Fix: for low-level behavior, prefer concrete HTML elements (`input`, `div`, `button`). If used on a component, verify it has a clear root and forwarding is not broken (multi-root and specific setups can surprise you).

4. **Capturing a callback once and never updating it.**

   * Why it happens: listener registered in `mounted` closes over the initial `binding.value`.
   * Fix: store the “current” callback on the element and refresh it in `updated`.

5. **Doing heavy work on every `updated`.**

   * Why it happens: no check between previous and current values.
   * Fix: exit early when appropriate (for example, compare `binding.value` and `binding.oldValue`).

## Practical Examples

* `v-autofocus`: focus an input on mount.
* `v-click-outside`: close a menu or modal when clicking outside.
* `v-intersect`: trigger callbacks when an element enters the viewport.

### `v-click-outside` (with updatable callback)

```vue [Composition API]
<script setup lang="ts">
import type { Directive } from "vue";
import { ref } from "vue";

type ClickOutsideHandler = (event: MouseEvent) => void;

type ElWithClickOutside = HTMLElement & {
  __clickOutsideHandler__?: (event: MouseEvent) => void;
  __clickOutsideCallback__?: ClickOutsideHandler;
};

const isOpen = ref(false);

const vClickOutside: Directive<ElWithClickOutside, ClickOutsideHandler> = {
  mounted(el, binding) {
    if (typeof binding.value !== "function") return;

    // Keep the current callback (important when it changes over time)
    el.__clickOutsideCallback__ = binding.value;

    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // If click is outside, call the latest callback
      if (!el.contains(target)) {
        el.__clickOutsideCallback__?.(event);
      }
    };

    el.__clickOutsideHandler__ = handler;

    // Capture helps with overlays / stopPropagation inside dropdowns
    document.addEventListener("click", handler, true);
  },

  updated(el, binding) {
    // Keep callback fresh if it changed
    if (typeof binding.value === "function") {
      el.__clickOutsideCallback__ = binding.value;
    }
  },

  unmounted(el) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener("click", el.__clickOutsideHandler__, true);
    }
    delete el.__clickOutsideHandler__;
    delete el.__clickOutsideCallback__;
  },
};
</script>

<template>
  <section class="dropdown-demo">
    <button type="button" @click="isOpen = !isOpen">Toggle menu</button>

    <div v-if="isOpen" v-click-outside="() => (isOpen = false)">
      <p>Panel open</p>
      <p>Click outside to close.</p>
    </div>
  </section>
</template>
```
```vue [Options API]
<script>
export default {
  name: "ClickOutsideExample",
  data() {
    return {
      isOpen: false,
    };
  },
  directives: {
    clickOutside: {
      mounted(el, binding) {
        if (typeof binding.value !== "function") return;

        el.__clickOutsideCallback__ = binding.value;

        el.__clickOutsideHandler__ = (event) => {
          const target = event.target;
          if (target && !el.contains(target)) {
            el.__clickOutsideCallback__?.(event);
          }
        };

        document.addEventListener("click", el.__clickOutsideHandler__, true);
      },
      updated(el, binding) {
        if (typeof binding.value === "function") {
          el.__clickOutsideCallback__ = binding.value;
        }
      },
      unmounted(el) {
        if (el.__clickOutsideHandler__) {
          document.removeEventListener("click", el.__clickOutsideHandler__, true);
        }
        delete el.__clickOutsideHandler__;
        delete el.__clickOutsideCallback__;
      },
    },
  },
};
</script>

<template>
  <section class="dropdown-demo">
    <button type="button" @click="isOpen = !isOpen">Toggle menu</button>

    <div v-if="isOpen" v-click-outside="() => (isOpen = false)">
      <p>Panel open</p>
      <p>Click outside to close.</p>
    </div>
  </section>
</template>
```

> In `<script setup>`, any **camelCase** variable that starts with `v` can be used as a directive (`vClickOutside` -> `v-click-outside`).

## More Useful Examples

### `v-autofocus` (basic and practical)

```ts [main.ts]
import type { Directive } from "vue";

export const vAutofocus: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    // v-autofocus="false" disables the behavior
    if (binding.value === false) return;

    // Usually expected for inputs/textareas
    if (typeof (el as any).focus === "function") {
      (el as any).focus();
    }
  },
};
```
```js [main.js]
export const vAutofocus = {
  mounted(el, binding) {
    // v-autofocus="false" disables the behavior
    if (binding.value === false) return;
    // Usually expected for inputs/textareas
    if (typeof el.focus === "function") {
      el.focus();
    }
  },
};
```
```vue [App.vue]
<input v-autofocus />
<input v-autofocus="isDesktop" />
```

### `v-intersect` (IntersectionObserver)

```ts [main.ts]
import type { Directive } from "vue";

type IntersectValue = {
  onEnter?: (entry: IntersectionObserverEntry) => void;
  onLeave?: (entry: IntersectionObserverEntry) => void;
  options?: IntersectionObserverInit;
};

type ElWithObserver = HTMLElement & { __io__?: IntersectionObserver };

export const vIntersect: Directive<ElWithObserver, IntersectValue> = {
  mounted(el, binding) {
    const { onEnter, onLeave, options } = binding.value ?? {};

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);

    io.observe(el);
    el.__io__ = io;
  },
  updated(el, binding) {
    // If options change dynamically, recreating the observer is usually safest
    // (micro-optimization: only recreate when values truly changed)
    // Keeping it explicit here:
    el.__io__?.disconnect();
    delete el.__io__;
    const { onEnter, onLeave, options } = binding.value ?? {};
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);
    io.observe(el);
    el.__io__ = io;
  },
  unmounted(el) {
    el.__io__?.disconnect();
    delete el.__io__;
  },
};
```
```js [main.js]
export const vIntersect = {
  mounted(el, binding) {
    const { onEnter, onLeave, options } = binding.value ?? {};

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);

    io.observe(el);
    el.__io__ = io;
  },
  updated(el, binding) {
    // If options change dynamically, recreating the observer is usually safest
    // (micro-optimization: only recreate when values truly changed)
    // Keeping it explicit here:
    el.__io__?.disconnect();
    delete el.__io__;
    const { onEnter, onLeave, options } = binding.value ?? {};
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);
    io.observe(el);
    el.__io__ = io;
  },
  unmounted(el) {
    el.__io__?.disconnect();
    delete el.__io__;
  },
};
```
```vue [App.vue]
<div
  v-intersect="{
    onEnter: () => (visible = true),
    onLeave: () => (visible = false),
    options: { threshold: 0.2 }
  }"
>
  ...
</div>
```

> If you recreate observers in `updated`, compare `binding.value` vs `binding.oldValue` when possible to avoid unnecessary work.

## Summary

* Custom directives are ideal for reusable **DOM behavior**.
* `unmounted` is essential to clean resources and prevent leaks.
* Keep a simple contract (`value`, `arg`, `modifiers`) and avoid mixing in business state.
* In Vue 3, **if callback references can change**, refresh them in `updated` so listeners do not call stale handlers.
* Prefer Composition API; use Options API when needed for incremental compatibility.
