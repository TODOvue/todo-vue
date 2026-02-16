---
title: "Vue Directives: An Overview"
description: "Explore Vue.js’ essential directives, their syntax, and common use cases."
date: 2026-02-03T20:00:00-05:00
updatedAt: 2026-02-13T00:00:00-05:00
readingTime: 6
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Conditional Rendering"
    color: "#E056FD"
  - tag: "Lists"
    color: "#1D5BA1"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770161262/vue-directives-overview_qyrngz.png
coverAlt: "Vue Directives: An Overview"
coverCaption: "Cover image representing directives in Vue.js."
locale: en
author: TODOvue
keywords:
  - Vue.js
  - Directives
  - Frontend Development
  - Best Practices
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Directives: An Overview"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-03T20:00:00-05:00"
---
# Vue 3 directives: a complete guide to understanding them properly

Vue directives are **special attributes** that let you apply reactive logic directly to the DOM.
They all start with `v-` and exist to **reduce imperative code** and make templates more expressive and declarative.

This post is a **high-level map**: it doesn’t go extremely deep, but it makes it clear **what each directive does, when to use it, and what problem it solves**.
Each one will later have its own dedicated article.

## `v-if`, `v-else-if`, `v-else`

They’re used to **render or remove elements from the DOM** based on a reactive condition.
If the condition is false, the element **doesn’t exist in the DOM**.

Use it when:

* The content is heavy
* It shouldn’t always exist
* It depends on permissions or critical states

```vue [Composition API]{8-9}
<script setup>
import { ref } from 'vue'

const isLogged = ref(true)
</script>

<template>
  <p v-if="isLogged">Welcome</p>
  <p v-else>You’re not logged in</p>
</template>
```
```vue [Options API]{12-13}
<script>
export default {
  data() {
    return {
      isLogged: true
    }
  }
}
</script>

<template>
  <p v-if="isLogged">Welcome</p>
  <p v-else>You’re not logged in</p>
</template>
```

> If you want to learn more, read the guide [Vue Directives: v-if, v-else, and v-show](https://todovue.blog/blog/directives-vue-v-if-v-else-v-show-guide.en/).

## `v-show`

It controls visibility using CSS (`display: none`), but **the element always exists in the DOM**.

Use it when:

* The element is shown and hidden frequently
* You don’t want to pay the cost of mounting and unmounting the node

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'
  
const isVisible = ref(true)
</script>

<template>
  <p v-show="isVisible">Visible content</p>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      isVisible: true
    }
  }
}
</script>

<template>
  <p v-show="isVisible">Visible content</p>
</template>
```
> If you want to learn more, read the guide [Vue Directives: v-if, v-else, and v-show](https://todovue.blog/blog/directives-vue-v-if-v-else-v-show-guide.en/).

## `v-for`

It lets you render lists from reactive arrays or objects.

Mental key:

> `v-for` describes **structure**, not logic.

```vue [Composition API]{11-13}
<script setup>
import { ref } from 'vue'
  
const items = ref([
  { id: 1, name: 'Vue' },
  { id: 2, name: 'React' }
])
</script>

<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```
```vue [Options API]{15-17}
<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Vue' },
        { id: 2, name: 'React' }
      ]
    }
  }
}
</script>

<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

`key` **is not optional**. It never was.
It’s essential so Vue can properly optimize rendering.

> If you want to learn more, read the guide [Vue Directives: v-for](https://todovue.blog/blog/directives-vue-v-for-guide.en/).

## `v-bind`

It dynamically binds HTML attributes or component props.

Think of `v-bind` like:

> “This attribute depends on state”

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const imageUrl = ref('https://example.com/image.jpg')
</script>

<template>
  <img v-bind:src="imageUrl" alt="Dynamic image" />
</template>
```
```vue [Options API]{13}
<script>
export default {
  data() {
    return {
      imageUrl: '/logo.png',
      description: 'Logo'
    }
  }
}
</script>

<template>
  <img :src="imageUrl" :alt="description" />
</template>
```

> If you want to learn more, read the guide [Vue Directive: v-bind](https://todovue.blog/blog/directives-vue-v-bind-guide.en/).

## `v-model`

It creates **two-way synchronization** between state and an input or component.

It’s ideal for:

* Forms
* Controlled inputs
* Reusable components

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const username = ref('')
</script>

<template>
  <input v-model="username" placeholder="Enter your username" />
  <p>Hello, {{ username }}!</p>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      username: ''
    }
  }
}
</script>

<template>
  <input v-model="username" placeholder="Enter your username" />
  <p>Hello, {{ username }}!</p>
</template>
```

Internally, it combines props and events (`modelValue` + `update:modelValue`).
It’s not magic, but it definitely feels like it.

> If you want to learn more, read the guide [Vue Directives: v-model](https://todovue.blog/blog/directives-vue-v-model-guide.en/).

## `v-on`

It listens to DOM events and runs reactive logic.

```vue [Composition API]{11}
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => {
  count.value++
}
</script>

<template>
  <button v-on:click="increment">You’ve clicked {{ count }} times</button>
</template>
```
```vue [Options API]{17}
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

<template>
  <button v-on:click="increment">Click me</button>
  <p>You’ve clicked {{ count }} times.</p>
</template>
```

It supports **modifiers** (`.stop`, `.prevent`, `.once`, etc.) that avoid unnecessary code.

> If you want to learn more, read the guide [Vue Directives: v-on](https://todovue.blog/blog/directives-vue-v-on-guide.en/).

## `v-text`

It inserts plain text into an element, replacing its content.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const message = ref('Hello World')
</script>

<template>
  <div v-text="message"></div>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      message: 'Hello Vue'
    }
  }
}
</script>

<template>
  <div v-text="message"></div>
</template>
```

It’s not used much, but it exists for very specific cases where you don’t want interpolations.

## `v-html`

It inserts unescaped HTML.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const rawHtml = ref('<strong>Bold text</strong>')
</script>

<template>
  <div v-html="rawHtml"></div>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      rawHtml: '<strong>Dynamic HTML</strong>'
    }
  }
}
</script>

<template>
  <div v-html="rawHtml"></div>
</template>
```

> ⚠️ **Never use it with untrusted content**.
It’s a direct door to XSS if you don’t know exactly what you’re rendering.

## `v-slot`

It lets you define dynamic content inside components via slots.

```vue [Composition API]{6,10}
<script setup>
</script>

<template>
  <MyCard>
    <template v-slot:header>
      <h1>Custom Header</h1>
    </template>
    <p>Card body content.</p>
    <template v-slot:footer>
      <button>Action</button>
    </template>
  </MyCard>
</template>
```
```vue [Options API]{9,13}
<script>
export default {
  components: { MyCard }
}
</script>

<template>
  <MyCard>
    <template v-slot:header>
      <h1>Custom Header</h1>
    </template>
    <p>Card body content.</p>
    <template v-slot:footer>
      <button>Action</button>
    </template>
  </MyCard>
</template>
```

It’s key for building **flexible, composable, reusable** components.

## `v-once`

It renders content **only once** and excludes it from the reactive system.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'
  
const count = ref(0)
</script>

<template>
  <p v-once>This text won’t change: {{ count }}</p>
  <button @click="count++">Increment</button>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>

<template>
  <p v-once>This text won’t change: {{ count }}</p>
  <button @click="count++">Increment</button>
</template>
```

Useful when content should never update, even if state changes.

## `v-memo`

It prevents unnecessary re-renders when dependencies don’t change.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div v-memo="[count]">
    <p>This block only re-renders if 'count' changes: {{ count }}</p>
  </div>
  <button @click="count++">Increment</button>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      value: 10
    }
  }
}
</script>

<template>
  <div v-memo="[value]">
    <p>The value is: {{ value }}</p>
  </div>
</template>
```

It’s an **advanced optimization**.
It’s not meant to be used “just because”, but in real bottlenecks.

## `v-pre`

It prevents Vue from compiling the node’s content.

```vue [Composition API]{5}
<script setup>
</script>

<template>
  <div v-pre>
    {{ this_will_not_be_evaluated }}
  </div>
</template>
```
```vue [Options API]{6}
<script>
export default {}
</script>

<template>
  <div v-pre>
    {{ this_will_not_be_evaluated }}
  </div>
</template>
```

Perfect for showing snippets, literal examples, or demo templates.

## `v-cloak`

It hides the template until Vue finishes mounting the app.

```vue [Composition API]{5}
<script setup>
</script>

<template>
  <div v-cloak>
    {{ message }}
  </div>
</template>
```
```vue [Options API]{6}
<script>
export default {}
</script>

<template>
  <div v-cloak>
    {{ message }}
  </div>
</template>
```

It prevents the initial flash in client-rendered apps.

## Custom directives

They let you extend Vue to directly manipulate the DOM when there’s no more declarative option.

```js [main.js]{4-8}
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})
```
```vue [App.vue]{2}
<template>
  <input v-focus />
</template>
```

They’re powerful, but they must be used carefully:
if you abuse them, you’re probably breaking Vue’s mental model.

## Conclusion

Directives aren’t just fancy syntax.
They’re **clear contracts between state and the DOM**.

This article is the starting point.
Each directive will have its own individual post, with:

* Real-world cases
* Common mistakes
* Good and bad practices

This map already helps you **read Vue code with good judgment**.
The rest is depth, not confusion.
