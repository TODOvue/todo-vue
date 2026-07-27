---
title: "Props and Emits in Vue 3: Component Communication"
description: "Learn how to use props and emits in Vue 3 to pass data down to child components and communicate events back to parent components."
date: 2026-06-30T20:00:00-05:00
updatedAt: 2026-07-26T00:00:00-05:00
draft: false
tags:
  - tag: "Components"
    color: "#41B883"
  - tag: "Events"
    color: "#2D98DA"
  - tag: "Guides"
    color: "#42B983"
  - tag: "Basics"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1782863303/vue-3-props-emits-component-communication_chbuab.png
coverAlt: "Props and Emits in Vue 3: Component Communication"
coverCaption: "Component communication in Vue 3 by TODOvue"
locale: en
author: TODOvue
series: vue-3-architecture
seriesOrder: 2
seriesTitle: "Vue 3 Application Architecture"
seriesDescription: "A practical series for designing maintainable Vue 3 applications through clear component communication, reusable logic, scoped dependencies, and intentional state management."
keywords:
  - Vue.js
  - Vue 3
  - props
  - emits
  - components
  - defineProps
  - defineEmits
schemaOrg:
  - type: "BlogPosting"
    headline: "Props and Emits in Vue 3: Component Communication"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-06-30T20:00:00-05:00"
lab:
  title: "Create a task card with props and emits"
  goal: "Build a small component that receives a task through props and tells the parent when the user wants to mark it as complete."
  tasks:
    - "Create a TaskCard.vue component."
    - "Receive a task prop with title and completed fields."
    - "Show the task state in the template."
    - "Emit a complete event when the user clicks the button."
  starterCode: |
    <!-- TaskCard.vue -->
    <script setup>
    const props = defineProps({
      task: {
        type: Object,
        required: true
      }
    })

    const emit = defineEmits(['complete'])
    </script>

    <template>
      <article>
        <h2>{{ props.task.title }}</h2>
        <p>{{ props.task.completed ? 'Completed' : 'Pending' }}</p>

        <button @click="emit('complete', props.task.id)">
          Mark as complete
        </button>
      </article>
    </template>
  solutionHint: "The child component does not need to change the list directly. It only communicates the intention; the parent decides how to update the state."
---
# Props and Emits in Vue 3: Component Communication

Once an application starts to split into components, a simple question appears: how do those components share information?

In Vue, the basic answer usually looks like this:

- `props` pass data from a parent component down to a child component.
- `emits` let a child component notify the parent that something happened.

That flow may look small, but it gives a lot of order to an interface. The parent keeps the important state. The child receives what it needs to render and emits events when something happens that the parent should know about.

## The usual flow: data down, events up

Imagine a task list. The parent component owns the full array:

```vue [TaskList.vue] {19-23}
<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'

const tasks = ref([
  { id: 1, title: 'Read the props guide', completed: false },
  { id: 2, title: 'Create a small component', completed: false }
])

const completeTask = (taskId) => {
  const task = tasks.value.find((item) => item.id === taskId)
  if (task) {
    task.completed = true
  }
}
</script>

<template>
  <TaskCard
    v-for="task in tasks"
    :key="task.id"
    :task="task"
    @complete="completeTask"
  />
</template>
```

The parent knows the list, knows how to update it, and decides what to do when a task changes.

The child component only needs to display one task and notify the parent when the user clicks:

```vue [TaskCard.vue] {2-7,9,20}
<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])
</script>

<template>
  <article>
    <h2>{{ props.task.title }}</h2>
    <p>{{ props.task.completed ? 'Completed' : 'Pending' }}</p>

    <button
      type="button"
      :disabled="props.task.completed"
      @click="emit('complete', props.task.id)"
    >
      Mark as complete
    </button>
  </article>
</template>
```

This pattern keeps a healthy separation: the child does not need to know how the full list is stored. It only says, "this task should be completed."

## `defineProps`: what the component needs to receive

With `<script setup>`, props are declared with `defineProps()`.

```vue [Composition API] {2-11}
<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Member'
  }
})
</script>

<template>
  <div>
    <strong>{{ props.name }}</strong>
    <span>{{ props.role }}</span>
  </div>
</template>
```
```vue [Options API] {3-12}
<script>
export default {
  props: {
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'Member'
    }
  }
}
</script>

<template>
  <div>
    <strong>{{ name }}</strong>
    <span>{{ role }}</span>
  </div>
</template>
```

A prop should answer a concrete question: what data does this component need in order to render?

If the component needs a name, a URL, an active state, or a small list, that is probably a prop. If it needs to modify shared state, save data, or coordinate several pieces, you may no longer be dealing with a simple prop.

## `defineEmits`: what the component can communicate

Emits describe events that a child component can fire.

```vue [Composition API] {2,8}
<script setup>
const emit = defineEmits(['search'])

const handleSubmit = (event) => {
  const form = event.currentTarget
  const query = new FormData(form).get('query')

  emit('search', String(query || '').trim())
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input name="query" type="search">
    <button type="submit">Search</button>
  </form>
</template>
```
```vue [Options API] {4,10}
<script>
export default {
  name: 'SearchBox',
  emits: ['search'],
  methods: {
    handleSubmit(event) {
      const form = event.currentTarget
      const query = new FormData(form).get('query')

      this.$emit('search', String(query || '').trim())
    }
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input name="query" type="search">
    <button type="submit">Search</button>
  </form>
</template>
```

The component does not decide what to do with the search. The parent might call an API, update the URL, or filter a local list. The child only communicates the event with the data the parent needs.

## Do not mutate props directly

One important rule: a child component should not mutate a prop it receives.

This is tempting:

```vue [Composition API] {9-11}
<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const complete = () => {
  props.task.completed = true
}
</script>
```

With objects, it may look like it works, but the design becomes harder to follow. The parent stops being the clear place where state changes, and the child starts having too much control over something it does not own.

A cleaner version is to emit the intention:

```vue [Composition API] {9,11-13}
<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])

const complete = () => {
  emit('complete', props.task.id)
}
</script>
```
```vue [Options API] {4-10,13}
<script>
export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['complete'],
  methods: {
    complete() {
      this.$emit('complete', this.task.id)
    }
  }
}
</script>

<template>
  <article>
    <h2>{{ task.title }}</h2>
    <p>{{ task.completed ? 'Completed' : 'Pending' }}</p>

    <button type="button" @click="complete">
      Mark as complete
    </button>
  </article>
</template>
```

The parent receives the event and makes the change:

```vue [TaskList.vue] {3}
<TaskCard
  :task="task"
  @complete="completeTask"
/>
```

## Name events by intention

A good event name says what happened, not how the parent should react.

For example:

- `@submit`
- `@select`
- `@remove`
- `@complete`
- `@update:status`

Avoid names that are too coupled to the parent, like `@callApiNow` or `@changeParentList`. The child should not know that much about what the parent will do next.

## Small props, clear events

The problem is not usually using props. The problem appears when a component receives too many loose props and emits events that are hard to follow.

If you see something like this:

```vue
<UserCard
  :id="user.id"
  :name="user.name"
  :email="user.email"
  :avatar="user.avatar"
  :role="user.role"
  :is-active="user.isActive"
  :last-login="user.lastLogin"
/>
```

maybe the component should receive a full `user` object instead:

```vue
<UserCard :user="user" />
```

Not always. If the component only needs two fields, passing specific props can be more explicit. But when all props represent the same entity, grouping them can make the template clearer.

## When to use props and emits

Props and emits are a good fit when:

- There is a direct parent-child relationship.
- The state naturally belongs in the parent.
- The child only needs to display data and notify interactions.
- You want the flow to be easy to read from the template.

If you start passing the same prop through five levels, you probably need another tool. That may be a good moment to look at `provide/inject`, a shared composable, or a state solution like Pinia.

But do not jump to those options too early. For many components, props and emits are enough.

## A simple way to think about it

Before connecting two components, ask:

> Does this component need to receive data, or does it need to notify that something happened?

If it needs to receive data, use a prop.

If it needs to notify something, use an emit.

That distinction keeps the code predictable. Data goes down, events go up, and each component keeps a clear responsibility.
