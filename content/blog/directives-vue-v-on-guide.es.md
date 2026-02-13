---
title: "Directivas en Vue: v-on"
description: "Aprende a usar v-on en Vue con eventos del DOM, modificadores, atajos de teclado y buenas practicas para mantener componentes claros y mantenibles."
date: 2026-02-13T10:30:00-05:00
updatedAt: 2026-02-13T10:30:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Eventos"
    color: "#FF7043"
  - tag: "Guías"
    color: "#42B983"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771022043/directives-vue-v-on-guide_hwtqel.png
coverAlt: "Imagen temporal para portada del articulo sobre v-on en Vue"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-on
  - eventos
  - event modifiers
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directiva v-on en Vue: guia practica para manejar eventos"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-13T10:30:00-05:00"
---
# Directivas en Vue: `v-on`

`v-on` conecta eventos del DOM o de componentes con funciones de tu app.
Cuando el usuario hace clic, escribe o pulsa una tecla, `v-on` dispara la lógica que definiste.

## Por qué importa

Sin `v-on`, una interfaz no responde a la interacción del usuario.
Con `v-on`, puedes:

* Capturar acciones del usuario sin manipular el DOM manualmente.
* Mantener la interacción declarativa y legible en el template.
* Separar estado, renderizado y comportamiento de forma consistente con Vue.

> `v-on` es la base de botones, formularios, atajos de teclado y comunicación entre componentes vía eventos.

## Concepto base

La forma larga:

```vue [App.vue]
<button v-on:click="increment">Sumar</button>
```

La forma corta recomendada:

```vue [App.vue]
<button @click="increment">Sumar</button>
```

`v-on` admite:

* Eventos nativos (`click`, `input`, `submit`, `keydown`).
* Eventos emitidos por componentes (`@save`, `@close`).
* Modificadores de evento (`.prevent`, `.stop`, `.once`, `.self`).
* Modificadores de teclado (`.enter`, `.esc`, combinaciones con `ctrl`, `shift`, etc.).

## Cuándo usarlo

Usa `v-on` cuando necesites reaccionar a acciones del usuario o a eventos de componentes.

Casos típicos:

* Botones de acción (`@click="createTask"`).
* Formularios (`@submit.prevent="submitForm"`).
* Inputs en tiempo real (`@input="handleSearch"`).
* Atajos de teclado (`@keydown.ctrl.enter="publish"`).
* Eventos personalizados desde componentes hijos (`@save="persistTask"`).

## Cuándo evitarlo

Evita `v-on` en estos casos:

* Cuando no hay interacción real y el contenido es completamente estático.
* Cuando colocas demasiada lógica inline en el template; es mejor moverla a funciones o `computed`.
* Cuando intentas “resolver” seguridad con eventos del frontend: la validación real debe ocurrir en backend.

> También evita encadenar muchos modificadores sin una intención clara, porque dificulta el mantenimiento.

## Errores comunes

### 1) Ejecutar la función en vez de referenciarla

Incorrecto:

```vue [Evitar]
<button @click="saveTask()">Guardar</button>
```

Esto **es válido**, pero si no necesitas argumentos, suele ser más limpio:

```vue [Recomendado]
<button @click="saveTask">Guardar</button>
```

### 2) Olvidar `.prevent` en formularios

Incorrecto:

```vue [Evitar]
<form @submit="submitForm">
```

Correcto:

```vue [Recomendado]
<form @submit.prevent="submitForm">
```

> Sin `.prevent`, el navegador recarga la página por defecto.

### 3) Poner demasiada lógica dentro del template

Evitar:

```vue [Evitar]
<button @click="isAdmin && canEdit && !isLocked ? publishNow() : showWarning()">
  Publicar
</button>
```

Mejor:

```vue [Recomendado]
<button @click="handlePublishClick">Publicar</button>
```

Y mover la decisión a una función clara en el script.

### 4) Usar `event` sin declararlo

Incorrecto:

```vue [Evitar]
<input @input="onInput(event)" />
```

Correcto:

```vue [Recomendado]
<input @input="onInput($event)" />
```

O mejor aún, tipar el evento y leer `target` de forma segura en TypeScript.

## Ejemplos prácticos

### 1) Click simple para actualizar estado

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

### 2) Submit de formulario con `.prevent`

```vue [Composition API] {13}
<script setup lang="ts">
import { ref } from "vue";

const email = ref("");

function submitForm() {
  if (!email.value.trim()) return;
  console.log("Enviar:", email.value);
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <input v-model="email" type="email" placeholder="tu@email.com" />
    <button type="submit">Enviar</button>
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
      console.log("Enviar:", this.email);
    },
  },
};
</script>

<template>
  <form @submit.prevent="submitForm">
    <input v-model="email" type="email" placeholder="tu@email.com" />
    <button type="submit">Enviar</button>
  </form>
</template>
```

### 3) Atajo de teclado con modificadores

```vue [Composition API] {12}
<script setup lang="ts">
import { ref } from "vue";

const note = ref("");

function saveDraft() {
  console.log("Borrador guardado:", note.value);
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
      console.log("Borrador guardado:", this.note);
    },
  },
};
</script>

<template>
  <textarea v-model="note" @keydown.ctrl.enter.prevent="saveDraft" />
</template>
```

### 4) Evento personalizado desde un componente hijo

```vue [Composition API] {4,10}
<script setup lang="ts">
import TaskForm from "./TaskForm.vue";

function handleSave(taskTitle: string) {
  console.log("Nueva tarea:", taskTitle);
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
      console.log("Nueva tarea:", taskTitle);
    },
  },
};
</script>

<template>
  <TaskForm @save="handleSave" />
</template>
```

## Ejemplo completo

Componente de lista de tareas con:

* `@submit.prevent` para crear tareas.
* `@click` para marcar como completada.
* `@keydown.enter` para envío rápido.

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
    <h2>Tareas</h2>
    <p>Pendientes: {{ remaining }}</p>

    <form @submit.prevent="addTask">
      <input
        v-model="draft"
        type="text"
        placeholder="Escribe una tarea y pulsa Enter"
        @keydown.enter.prevent="addTask"
      />
      <button type="submit">Agregar</button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <button @click="toggleTask(task.id)">
          {{ task.done ? "Reabrir" : "Completar" }}
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
    <h2>Tareas</h2>
    <p>Pendientes: {{ remaining }}</p>

    <form @submit.prevent="addTask">
      <input
        v-model="draft"
        type="text"
        placeholder="Escribe una tarea y pulsa Enter"
        @keydown.enter.prevent="addTask"
      />
      <button type="submit">Agregar</button>
    </form>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <button @click="toggleTask(task.id)">
          {{ task.done ? "Reabrir" : "Completar" }}
        </button>
        <span :style="{ textDecoration: task.done ? 'line-through' : 'none' }">
          {{ task.title }}
        </span>
      </li>
    </ul>
  </section>
</template>
```

## Resumen

`v-on` es la directiva que convierte plantillas estáticas en interfaces interactivas.
Si la usas con handlers claros y modificadores correctos, reduces bugs y mejoras legibilidad.

Puntos clave para recordar:

* Usa `@` como shorthand de `v-on`.
* Prefiere funciones del script sobre expresiones complejas inline.
* Aprovecha modificadores (`.prevent`, `.stop`, `.once`) cuando sean necesarios.
* Mantén consistencia entre Composition API y Options API para facilitar mantenimiento.
