---
title: "Vue Lifecycle Hooks: An Overview"
description: "A clear map of all Vue 3 lifecycle hooks to understand when to use each one."
date: 2026-03-04T21:30:00-05:00
updatedAt: 2026-03-04T21:30:00-05:00
readingTime: 8
tags:
  - tag: "Basics"
    color: "#B173BF"
  - tag: "Components"
    color: "#41B883"
  - tag: "Reactivity"
    color: "#1D5BA1"
  - tag: "Best Practices"
    color: "#2196F3"
  - tag: "Architecture"
    color: "#4CAF50"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772676391/vue-lifecycle-hooks-overview_ovnxzy.png
coverAlt: "Vue Lifecycle Hooks: An Overview"
coverCaption: "Overview of lifecycle hooks in Vue 3."
locale: en
series: vue-lifecycle-hooks
seriesOrder: 1
seriesTitle: "Vue Lifecycle Hooks"
seriesDescription: "A practical series to master every Vue lifecycle hook, from basics to advanced use cases."
author: TODOvue
keywords:
  - Vue.js
  - Lifecycle hooks
  - Composition API
  - Options API
  - Hooks
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue Lifecycle Hooks: An Overview"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-04T21:30:00-05:00"
---
# Vue lifecycle hooks: practical guide and when to use each one

## Why this matters

Understanding the **component lifecycle** helps you know exactly **when to run each type of logic**: initialization, DOM access, API synchronization, side effect cleanup, or debugging.

# Core concept

A **Vue 3** component goes through several phases:

1. **Creation**
2. **Mounting**
3. **Updating**
4. **Unmounting**

There are also special hooks for:

* Components cached with `<KeepAlive>`
* Error handling
* Reactive render debugging
* **SSR (Server-Side Rendering)**

In the next sections, we will see **when each hook runs and what it is for**, with examples.

# Component creation

In this phase, Vue **creates the component instance and sets up reactivity**, but **the DOM does not exist yet**.

This is where you usually initialize state, configuration, or early requests.

## `beforeCreate`

Runs **before Vue configures reactivity**.

```vue [App.vue]{3}
<script>
export default {
  beforeCreate() {
    console.log('The component is starting')
  }
}
</script>
```

> `beforeCreate` is not available in Composition API, because `setup()` runs before any other hook.

## `created`

Reactive state is already available, but **the DOM still does not exist**.

It is commonly used for:

* HTTP requests
* State initialization
* Business logic preparation

```vue [App.vue]{8}
<script>
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    this.users = await fetch('/api/users').then(r => r.json())
  }
}
</script>
```

> `created` is not available in Composition API, because `setup()` runs before any other hook.

## `setup()`

It is the **main entry point in Composition API**.

Here you define:

* Reactive state
* Composables
* Watchers
* Initial component logic

```vue [App.vue]{1}
<script setup>
import { ref } from 'vue'

const count = ref(0)

console.log('Setup executed')
</script>
```
> `setup()` is not available in Options API, because it is exclusive to Composition API.

# Component mounting

In this phase Vue **creates and inserts the component DOM**.

At this point it is safe to use:

* Browser APIs
* External libraries
* DOM manipulation

## `onBeforeMount` / `beforeMount`

Runs **right before inserting the DOM into the page**.

It is not very common, but it can be useful for final pre-render logic.

```vue [Composition API]{4}
<script setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  console.log('Component is about to mount')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  beforeMount() {
    console.log('Before mounting the component')
  }
}
</script>
```

## `onMounted` / `mounted`

Runs **after the component has been inserted into the DOM**.

This is one of the **most used hooks**.

Typical uses:

* Initializing charts
* Registering listeners
* Focusing inputs
* Integrating third-party libraries

```vue [Composition API]{4}
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Component mounted in the DOM')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  mounted() {
    console.log('Component mounted')
  }
}
</script>
```

# Component update

When reactive state changes, Vue **re-renders the component**.

These hooks let you react before or after the DOM changes.

## `onBeforeUpdate` / `beforeUpdate`

Runs **before Vue updates the DOM**.

Can be used to inspect previous state.

```vue [Composition API]{4}
<script setup>
import { onBeforeUpdate } from 'vue'

onBeforeUpdate(() => {
  console.log('Before updating the DOM')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  beforeUpdate() {
    console.log('Before update')
  }
}
</script>
```

## `onUpdated` / `updated`

Runs **after Vue updates the DOM**.

Useful when you need to measure or interact with the updated DOM.

> `onUpdated` should not be used as a replacement for `watch`.

```vue [Composition API]{4}
<script setup>
import { onUpdated } from 'vue'

onUpdated(() => {
  console.log('DOM has been updated')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  updated() {
    console.log('DOM updated')
  }
}
</script>
```

# Component unmounting

When a component stops existing, Vue runs cleanup hooks.

This is **key to avoid memory leaks**.

## `onBeforeUnmount` / `beforeUnmount`

Runs **right before destroying the component**.

```vue [Composition API]{4}
<script setup>
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  console.log('Component will be destroyed')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  beforeUnmount() {
    console.log('Before unmounting')
  }
}
</script>
```

## `onUnmounted` / `unmounted`

Runs **after the component has been destroyed**.

Ideal for cleaning:

* Timers
* Sockets
* Event listeners

```vue [Composition API]{6,12}
<script setup>
import { onMounted, onUnmounted } from 'vue'

let timer

onMounted(() => {
  timer = setInterval(() => {
    console.log('tick')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
```
```vue [Options API]{3,8}
<script>
export default {
  mounted() {
    this.timer = setInterval(() => {
      console.log('tick')
    }, 1000)
  },
  unmounted() {
    clearInterval(this.timer)
  }
}
</script>
```

# `<KeepAlive>` hooks

When a component is inside `<KeepAlive>`, **it is not destroyed**, it is only activated or deactivated.

## `onActivated` / `activated`

Runs when the component **becomes active again**.

```vue [Composition API]{4}
<script setup>
import { onActivated } from 'vue'

onActivated(() => {
  console.log('Component activated again')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  activated() {
    console.log('Component activated')
  }
}
</script>
```

## `onDeactivated` / `deactivated`

Runs when the component **is hidden but stays in memory**.

```vue [Composition API]{4}
<script setup>
import { onDeactivated } from 'vue'

onDeactivated(() => {
  console.log('Component deactivated')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  deactivated() {
    console.log('Component deactivated')
  }
}
</script>
```

# Error handling

## `onErrorCaptured` / `errorCaptured`

Allows capturing errors from **child components**.

```vue [Composition API]{4}
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((error) => {
  console.error('Captured error:', error)
  return false
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  errorCaptured(error) {
    console.error('Captured error:', error)
    return false
  }
}
</script>
```

# Render debugging hooks

These hooks help understand **why a component is re-rendering**.

They should not be used by default in production.

## `onRenderTracked`

Runs when Vue **tracks a reactive dependency during render**.

```vue [Composition API]{4}
<script setup>
import { onRenderTracked } from 'vue'

onRenderTracked((event) => {
  console.debug('Tracked dependency:', event.key)
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  renderTracked(event) {
    console.debug('Tracked dependency:', event.key)
  }
}
</script>
```

## `onRenderTriggered`

Runs when **a dependency triggers a re-render**.

```vue [Composition API]{4}
<script setup>
import { onRenderTriggered } from 'vue'

onRenderTriggered((event) => {
  console.debug('Re-render caused by:', event.key)
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  renderTriggered(event) {
    console.debug('Re-render caused by:', event.key)
  }
}
</script>
```

# SSR (Server-Side Rendering)

## `onServerPrefetch` / `serverPrefetch`

Allows **loading data before rendering HTML on the server**.

This prevents empty screens during first render.

```vue [Composition API]{4}
<script setup>
import { onServerPrefetch } from 'vue'

onServerPrefetch(async () => {
  await fetch('/api/data')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  async serverPrefetch() {
    await fetch('/api/data')
  }
}
</script>
```

# When to use hooks (and when not to)

## Use them when:

* You need **real DOM access** (`onMounted`)
* You need **resource cleanup** (`onUnmounted`)
* You are working with **SSR** (`onServerPrefetch`)
* You need to react to **component lifecycle phases**

## Avoid them when:

* A **`computed`** solves the problem
* A **`watch`** is enough
* You only need to react to **specific state changes**

Hooks coordinate **lifecycle moments** and should not hold all component logic.

# Summary

Lifecycle hooks let you control **key component moments**:

| Phase      | Main hooks                     |
|------------|--------------------------------|
| Creation   | `setup`, `created`             |
| Mounting   | `onMounted`, `mounted`         |
| Updating   | `onUpdated`, `updated`         |
| Unmounting | `onUnmounted`, `unmounted`     |
| Cache      | `onActivated`, `onDeactivated` |
| SSR        | `onServerPrefetch`             |

> If you are not sure which hook to use, ask first:
> **At what point in the component lifecycle do I need this logic to run?**
