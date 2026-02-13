---
title: "Vue Directives: v-on"
description: "Learn how to use v-on in Vue with DOM events, modifiers, keyboard shortcuts, and best practices to keep components clear and maintainable."
date: 2026-02-13T10:30:00-05:00
updatedAt: 2026-02-13T10:30:00-05:00
tags:
  - tag: "Directives"
    color: "#6C5CE7"
  - tag: "Events"
    color: "#FF7043"
  - tag: "Guides"
    color: "#42B983"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771022043/directives-vue-v-on-guide_hwtqel.png
coverAlt: "Temporary cover image for the Vue v-on article"
coverCaption: "Temporary cover: replace with TODOvue final artwork"
locale: en
author: TODOvue
keywords:
  - Vue.js
  - v-on
  - events
  - event modifiers
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue v-on directive: practical guide to handling events"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-13T10:30:00-05:00"
---
# Vue Directives: `v-on`

`v-on` connects DOM or component events to functions in your app.
When the user clicks, types, or presses a key, `v-on` triggers the logic you defined.

## Why it matters

Without `v-on`, an interface cannot respond to user interaction.
With `v-on`, you can:

* Capture user actions without manually manipulating the DOM.
* Keep interactions declarative and readable in the template.
* Separate state, rendering, and behavior in a way that stays consistent with Vue.

> `v-on` is the foundation for buttons, forms, keyboard shortcuts, and event-based communication between components.

## Core concept

Long form:

```vue [App.vue]
<button v-on:click="increment">Increase</button>
```

Recommended shorthand:

```vue [App.vue]
<button @click="increment">Increase</button>
```

`v-on` supports:

* Native events (`click`, `input`, `submit`, `keydown`).
* Component-emitted events (`@save`, `@close`).
* Event modifiers (`.prevent`, `.stop`, `.once`, `.self`).
* Keyboard modifiers (`.enter`, `.esc`, combinations with `ctrl`, `shift`, etc.).

## When to use it

Use `v-on` whenever you need to react to user actions or component events.

Typical use cases:

* Action buttons (`@click="createTask"`).
* Forms (`@submit.prevent="submitForm"`).
* Real-time input handling (`@input="handleSearch"`).
* Keyboard shortcuts (`@keydown.ctrl.enter="publish"`).
* Custom events emitted by child components (`@save="persistTask"`).

## When to avoid it

Avoid `v-on` in these cases:

* When there is no real interaction and content is fully static.
* When you are placing too much inline logic in the template; move it to functions or `computed`.
* When you are trying to "solve" security with frontend events: real validation must happen in the backend.

> Also avoid chaining too many modifiers without clear intent, since that hurts maintainability.

## Common mistakes

### 1) Executing the function instead of referencing it

Incorrect:

```vue [Avoid]
<button @click="saveTask()">Save</button>
```

This is **valid**, but if you do not need arguments, this is usually cleaner:

```vue [Recommended]
<button @click="saveTask">Save</button>
```

### 2) Forgetting `.prevent` in forms

Incorrect:

```vue [Avoid]
<form @submit="submitForm">
```

Correct:

```vue [Recommended]
<form @submit.prevent="submitForm">
```

> Without `.prevent`, the browser reloads the page by default.

### 3) Putting too much logic inside the template

Avoid:

```vue [Avoid]
<button @click="isAdmin && canEdit && !isLocked ? publishNow() : showWarning()">
  Publish
</button>
```

Better:

```vue [Recommended]
<button @click="handlePublishClick">Publish</button>
```

Then move the decision into a clear function in the script.

### 4) Using `event` without declaring it

Incorrect:

```vue [Avoid]
<input @input="onInput(event)" />
```

Correct:

```vue [Recommended]
<input @input="onInput($event)" />
```

Or better, type the event and read `target` safely with TypeScript.

## Practical examples

### 1) Simple click to update state

```vue [Composition API] {4,8}
<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <button @click="count++">Clicks: {{ count }}</button>
</template>
```

```vue [Options API] {5,12}
<script lang="ts">
export default {
  data() {
    return {
      count: 0,
    };
  },
};
</script>

<template>
  <button @click="count++">Clicks: {{ count }}</button>
</template>
```

### 2) Form submit with `.prevent`

```vue [Composition API] {13}
<script setup lang="ts">
import { ref } from "vue";

const email = ref("");

function submitForm() {
  if (!email.value.trim()) return;
  console.log("Send:", email.value);
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <input v-model="email" type="email" placeholder="you@email.com" />
    <button type="submit">Send</button>
  </form>
</template>
```

```vue [Options API] {18}
<script lang="ts">
export default {
  data() {
    return {
      email: "",
    };
  },
  methods: {
    submitForm() {
      if (!this.email.trim()) return;
      console.log("Send:", this.email);
    },
  },
};
</script>

<template>
  <form @submit.prevent="submitForm">
    <input v-model="email" type="email" placeholder="you@email.com" />
    <button type="submit">Send</button>
  </form>
</template>
```

### 3) Keyboard shortcut with modifiers

```vue [Composition API] {12}
<script setup lang="ts">
import { ref } from "vue";

const note = ref("");

function saveDraft() {
  console.log("Draft saved:", note.value);
}
</script>

<template>
  <textarea v-model="note" @keydown.ctrl.enter.prevent="saveDraft" />
</template>
```

```vue [Options API] {17}
<script lang="ts">
export default {
  data() {
    return {
      note: "",
    };
  },
  methods: {
    saveDraft() {
      console.log("Draft saved:", this.note);
    },
  },
};
</script>

<template>
  <textarea v-model="note" @keydown.ctrl.enter.prevent="saveDraft" />
</template>
```

### 4) Custom event from a child component

```vue [Composition API] {4,10}
<script setup lang="ts">
import TaskForm from "./TaskForm.vue";

function handleSave(taskTitle: string) {
  console.log("New task:", taskTitle);
}
</script>

<template>
  <TaskForm @save="handleSave" />
</template>
```

```vue [Options API] {6,14}
<script lang="ts">
import TaskForm from "./TaskForm.vue";

export default {
  components: { TaskForm },
  methods: {
    handleSave(taskTitle) {
      console.log("New task:", taskTitle);
    },
  },
};
</script>

<template>
  <TaskForm @save="handleSave" />
</template>
```

## Full example

Task list component with:

* `@submit.prevent` to create tasks.
* `@click` to mark tasks as completed.
* `@keydown.enter` for quick submit.

```vue [Composition API]
<script setup lang="ts">
import { computed, ref } from "vue";

type Task = {
  id: number;
  title: string;
  done: boolean;
};

const draft = ref("");
const tasks = ref<Task[]>([]);

const remaining = computed(() => tasks.value.filter((task) => !task.done).length);

function addTask() {
  const title = draft.value.trim();
  if (!title) return;

  tasks.value.push({
    id: Date.now(),
    title,
    done: false,
  });
  draft.value = "";
}

function toggleTask(id: number) {
  const task = tasks.value.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
}
</script>

<template>
  <section>
    <h2>Tasks</h2>
    <p>Remaining: {{ remaining }}</p>

    <form @submit.prevent="addTask">
      <input
        v-model="draft"
        type="text"
        placeholder="Type a task and press Enter"
        @keydown.enter.prevent="addTask"
      />
      <button type="submit">Add</button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <button @click="toggleTask(task.id)">
          {{ task.done ? "Reopen" : "Complete" }}
        </button>
        <span :style="{ textDecoration: task.done ? 'line-through' : 'none' }">
          {{ task.title }}
        </span>
      </li>
    </ul>
  </section>
</template>
```

```vue [Options API]
<script lang="ts">
export default {
  data() {
    return {
      draft: "",
      tasks: [],
    };
  },
  computed: {
    remaining() {
      return this.tasks.filter((task) => !task.done).length;
    },
  },
  methods: {
    addTask() {
      const title = this.draft.trim();
      if (!title) return;

      this.tasks.push({
        id: Date.now(),
        title,
        done: false,
      });
      this.draft = "";
    },
    toggleTask(id) {
      const task = this.tasks.find((item) => item.id === id);
      if (!task) return;
      task.done = !task.done;
    },
  },
};
</script>

<template>
  <section>
    <h2>Tasks</h2>
    <p>Remaining: {{ remaining }}</p>

    <form @submit.prevent="addTask">
      <input
        v-model="draft"
        type="text"
        placeholder="Type a task and press Enter"
        @keydown.enter.prevent="addTask"
      />
      <button type="submit">Add</button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <button @click="toggleTask(task.id)">
          {{ task.done ? "Reopen" : "Complete" }}
        </button>
        <span :style="{ textDecoration: task.done ? 'line-through' : 'none' }">
          {{ task.title }}
        </span>
      </li>
    </ul>
  </section>
</template>
```

## Summary

`v-on` is the directive that turns static templates into interactive interfaces.
If you use it with clear handlers and the right modifiers, you reduce bugs and improve readability.

Key points to remember:

* Use `@` as shorthand for `v-on`.
* Prefer script functions over complex inline expressions.
* Use modifiers (`.prevent`, `.stop`, `.once`) when needed.
* Keep behavior consistent across Composition API and Options API for easier maintenance.
