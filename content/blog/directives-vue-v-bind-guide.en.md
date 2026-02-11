---
title: "Vue Directive: v-bind"
description: "Learn how to use v-bind in Vue from basic syntax to advanced patterns: dynamic attributes, reactive class/style bindings, component props, and common mistakes."
date: 2026-02-11T18:30:00-05:00
updatedAt: 2026-02-11T18:30:00-05:00
readingTime: 10
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Guides"
    color: "#42B983"
  - tag: "Reactivity"
    color: "#2196F3"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770849828/directives-vue-v-bind-guide_gqrgyj.png
coverAlt: "Temporary cover image for the Vue v-bind article"
coverCaption: "Temporary cover: replace with TODOvue final artwork"
locale: en
author: TODOvue
keywords:
  - Vue.js
  - v-bind
  - dynamic attributes
  - class binding
  - style binding
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue directive v-bind: guide from basic to advanced"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-11T18:30:00-05:00"
---

# Vue Directive: `v-bind`

`v-bind` connects template attributes or props to reactive data.
If the state changes, the attribute changes too.

In Vue, `v-bind` is one of the core pieces that turns static HTML into dynamic UI without manual DOM manipulation.

## Why it matters

Without `v-bind`, you would end up writing imperative logic to:

- Enable/disable buttons.
- Switch classes based on state.
- Render dynamic links or images.
- Pass data from a parent component to a child component.

With `v-bind`, all of that becomes declarative.
You describe the relationship between state and UI, and Vue handles the updates.

## Core concept

Basic form:

```vue [App.vue]
<a v-bind:href="url">Go to site</a>
```

Recommended shorthand:

```vue [App.vue]
<a :href="url">Go to site</a>
```

`v-bind` works with:

- HTML attributes (`href`, `src`, `disabled`, `id`, `title`),
- component props (`:user="currentUser"`),
- special bindings for `class` and `style`,
- dynamic arguments (`:[attrName]="value"`),
- spread-like bindings (`v-bind="attrsObject"`).

## When to use it

Use `v-bind` when you need:

- Dynamic values in attributes.
- State-driven presentation (`class` / `style`).
- Reactive data passed to child components.
- Reusable components with configurable props.

## When to avoid it

Avoid it when:

- The value is fixed and never changes (plain static HTML is enough).
- You are putting complex logic directly in the template (move it to `computed`).
- You are trying to use `v-bind` as a security or validation layer (it is not).

## Common mistakes

### 1) Forgetting that `v-bind` evaluates JavaScript

Incorrect:

```vue [Incorrect]
<img :src="/images/avatar.png" />
```

Correct:

```vue [Correct]
<img src="/images/avatar.png" />
<!-- or -->
<img :src="avatarUrl" />
```

If you use `:src`, Vue expects a valid JS expression.

### 2) Writing too much inline logic in `:class` or `:style`

Incorrect:

```vue [Avoid]
<button :class="isAdmin && isActive && !isLocked ? 'btn btn-primary' : isLocked ? 'btn btn-muted' : 'btn'">
  Save
</button>
```

Better: extract this into `computed`.

### 3) Mixing up an HTML attribute with a component prop

`v-bind` supports both, but in components you must pass the exact prop expected by the child:

```vue [Parent]
<UserCard :user="user" />
```

If the child expects `profile` and you pass `user`, the data will not match.

### 4) Assuming `v-bind` "protects" data

`v-bind` only reflects state in the UI.
It does not replace backend validation or authorization rules.

## Practical examples

### 1) Basic: dynamic link (`href`)

```vue [Composition API] {4,8}
<script setup>
import { ref } from "vue";

const docsUrl = ref("https://vuejs.org/");
</script>

<template>
  <a :href="docsUrl" target="_blank" rel="noopener">Vue Docs</a>
</template>
```
```vue [Options API] {5,12}
<script>
export default {
  data() {
    return {
      docsUrl: "https://vuejs.org/",
    };
  },
};
</script>

<template>
  <a :href="docsUrl" target="_blank" rel="noopener">Vue Docs</a>
</template>
```

### 2) Dynamic boolean attribute (`disabled`)

```vue [Composition API] {4,8}
<script setup>
import { ref } from "vue";

const isSaving = ref(false);
</script>

<template>
  <button :disabled="isSaving">
    {{ isSaving ? "Saving..." : "Save changes" }}
  </button>
</template>
```
```vue [Options API] {5,12}
<script>
export default {
  data() {
    return {
      isSaving: false,
    };
  },
};
</script>

<template>
  <button :disabled="isSaving">
    {{ isSaving ? "Saving..." : "Save changes" }}
  </button>
</template>
```

### 3) `v-bind:class` with an object (recommended pattern)

```vue [Composition API] {4,10-14}
<script setup>
import { ref } from "vue";

const isActive = ref(true);
const hasError = ref(false);
</script>

<template>
  <p
    :class="{
      'text-success': isActive,
      'text-danger': hasError,
      'text-muted': !isActive && !hasError,
    }"
  >
    System status
  </p>
</template>
```
```vue [Options API] {5,13-17}
<script>
export default {
  data() {
    return {
      isActive: true,
      hasError: false,
    };
  },
};
</script>

<template>
  <p
    :class="{
      'text-success': isActive,
      'text-danger': hasError,
      'text-muted': !isActive && !hasError,
    }"
  >
    System status
  </p>
</template>
```

### 4) Dynamic `v-bind:style` with an object

```vue [Composition API] {4-5,9}
<script setup>
import { ref } from "vue";

const fontSize = ref(16);
const textColor = ref("#1D5BA1");
</script>

<template>
  <p :style="{ fontSize: `${fontSize}px`, color: textColor }">
    Text with reactive style
  </p>
</template>
```
```vue [Options API] {5-6,13}
<script>
export default {
  data() {
    return {
      fontSize: 16,
      textColor: "#1D5BA1",
    };
  },
};
</script>

<template>
  <p :style="{ fontSize: `${fontSize}px`, color: textColor }">
    Text with reactive style
  </p>
</template>
```

### 5) Dynamic argument: `:[attrName]="value"`

Useful when the attribute name itself depends on state.

```vue [Composition API] {4-5,9}
<script setup>
import { ref } from "vue";

const attrName = ref("title");
const attrValue = ref("Dynamic tooltip");
</script>

<template>
  <button :[attrName]="attrValue">Hover me</button>
</template>
```
```vue [Options API] {5-6,13}
<script>
export default {
  data() {
    return {
      attrName: "title",
      attrValue: "Dynamic tooltip",
    };
  },
};
</script>

<template>
  <button :[attrName]="attrValue">Hover me</button>
</template>
```

### 6) `v-bind="obj"` to pass multiple attributes or props

```vue [Composition API] {4-10,14}
<script setup>
import { ref } from "vue";

const inputAttrs = ref({
  id: "email",
  type: "email",
  placeholder: "you@email.com",
  autocomplete: "email",
  required: true,
});
</script>

<template>
  <input v-bind="inputAttrs" />
</template>
```
```vue [Options API] {5-11,18}
<script>
export default {
  data() {
    return {
      inputAttrs: {
        id: "email",
        type: "email",
        placeholder: "you@email.com",
        autocomplete: "email",
        required: true,
      },
    };
  },
};
</script>

<template>
  <input v-bind="inputAttrs" />
</template>
```

> `v-bind="obj"` is also common for prop forwarding in base components.

## Integrated example

Simple form using `v-bind` for attributes, classes, and state.

```vue [Composition API]
<script setup>
import { computed, ref } from "vue";

const email = ref("");
const isSubmitting = ref(false);
const hasError = ref(false);

const inputAttrs = computed(() => ({
  type: "email",
  placeholder: "Enter your email",
  autocomplete: "email",
  required: true,
}));

const buttonClass = computed(() => ({
  "btn-primary": !isSubmitting.value,
  "btn-disabled": isSubmitting.value,
}));

function submit() {
  hasError.value = email.value.trim() === "";
  if (hasError.value) return;
  isSubmitting.value = true;
  setTimeout(() => {
    isSubmitting.value = false;
  }, 1000);
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-bind="inputAttrs" v-model="email" :class="{ 'input-error': hasError }" />

    <button :disabled="isSubmitting" :class="buttonClass">
      {{ isSubmitting ? "Submitting..." : "Submit" }}
    </button>

    <p :style="{ color: hasError ? '#E74C3C' : '#2ECC71' }">
      {{ hasError ? "Email is required." : "Ready to submit." }}
    </p>
  </form>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      email: "",
      isSubmitting: false,
      hasError: false,
    };
  },
  computed: {
    inputAttrs() {
      return {
        type: "email",
        placeholder: "Enter your email",
        autocomplete: "email",
        required: true,
      };
    },
    buttonClass() {
      return {
        "btn-primary": !this.isSubmitting,
        "btn-disabled": this.isSubmitting,
      };
    },
  },
  methods: {
    submit() {
      this.hasError = this.email.trim() === "";
      if (this.hasError) return;
      this.isSubmitting = true;
      setTimeout(() => {
        this.isSubmitting = false;
      }, 1000);
    },
  },
};
</script>

<template>
  <form @submit.prevent="submit">
    <input v-bind="inputAttrs" v-model="email" :class="{ 'input-error': hasError }" />

    <button :disabled="isSubmitting" :class="buttonClass">
      {{ isSubmitting ? "Submitting..." : "Submit" }}
    </button>

    <p :style="{ color: hasError ? '#E74C3C' : '#2ECC71' }">
      {{ hasError ? "Email is required." : "Ready to submit." }}
    </p>
  </form>
</template>
```

## Summary

`v-bind` is the declarative way to connect state and attributes in Vue.
Mastering it helps you build dynamic interfaces that stay clean and maintainable.

Key takeaways:

- `:` is shorthand for `v-bind`.
- Use it for attributes, props, `class`, and `style`.
- Avoid complex inline logic: move rules into `computed`.
- `v-bind="obj"` is ideal for grouping attributes/props.

If you understand `v-bind` well, you understand a core part of how Vue turns reactivity into real UI.
