---
title: "Props y Emits en Vue 3: comunicación entre componentes"
description: "Aprende cómo usar props y emits en Vue 3 para pasar datos hacia componentes hijos y comunicar eventos hacia componentes padres de forma clara."
date: 2026-06-30T20:00:00-05:00
updatedAt: 2026-07-26T00:00:00-05:00
draft: false
tags:
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Eventos"
    color: "#2D98DA"
  - tag: "Guías"
    color: "#42B983"
  - tag: "Básico"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1782863303/vue-3-props-emits-component-communication_chbuab.png
coverAlt: "Props y Emits en Vue 3: comunicación entre componentes"
coverCaption: "Comunicación entre componentes en Vue 3 por TODOvue"
locale: es
author: TODOvue
series: vue-3-architecture
seriesOrder: 2
seriesTitle: "Arquitectura de aplicaciones en Vue 3"
seriesDescription: "Serie práctica para diseñar aplicaciones Vue 3 mantenibles mediante comunicación clara entre componentes, lógica reutilizable, dependencias acotadas y una gestión intencional del estado."
keywords:
  - Vue.js
  - Vue 3
  - props
  - emits
  - componentes
  - defineProps
  - defineEmits
schemaOrg:
  - type: "BlogPosting"
    headline: "Props y Emits en Vue 3: comunicación entre componentes"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-06-30T20:00:00-05:00"
lab:
  title: "Crea una tarjeta de tarea con props y emits"
  goal: "Construye un componente pequeño que recibe una tarea por props y avisa al padre cuando el usuario quiere marcarla como completada."
  tasks:
    - "Crea un componente TaskCard.vue."
    - "Recibe una prop task con title y completed."
    - "Muestra el estado de la tarea en el template."
    - "Emite un evento complete cuando el usuario haga clic en el botón."
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
        <p>{{ props.task.completed ? 'Completada' : 'Pendiente' }}</p>

        <button @click="emit('complete', props.task.id)">
          Marcar como completada
        </button>
      </article>
    </template>
  solutionHint: "El componente hijo no necesita cambiar la lista directamente. Solo comunica la intención; el padre decide cómo actualizar el estado."
---
# Props y Emits en Vue 3: comunicación entre componentes

Cuando una aplicación empieza a dividirse en componentes, aparece una pregunta muy simple: ¿cómo se pasan información entre ellos?

En Vue, la respuesta básica suele ser esta:

- Las `props` pasan datos desde el componente padre hacia el componente hijo.
- Los `emits` permiten que el componente hijo avise algo al componente padre.

Ese flujo puede parecer pequeño, pero es una de las ideas que más orden le da a una interfaz. El padre conserva el estado importante. El hijo recibe lo que necesita para mostrarse y emite eventos cuando pasa algo que el padre debería conocer.

## El flujo normal: datos bajan, eventos suben

Imagina una lista de tareas. El componente padre tiene el arreglo completo:

```vue [TaskList.vue] {19-23}
<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'

const tasks = ref([
  { id: 1, title: 'Leer la guía de props', completed: false },
  { id: 2, title: 'Crear un componente pequeño', completed: false }
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

El padre conoce la lista, sabe cómo actualizarla y decide qué hacer cuando una tarea cambia.

El componente hijo, en cambio, solo necesita mostrar una tarea y avisar cuando el usuario hace clic:

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
    <p>{{ props.task.completed ? 'Completada' : 'Pendiente' }}</p>

    <button
      type="button"
      :disabled="props.task.completed"
      @click="emit('complete', props.task.id)"
    >
      Marcar como completada
    </button>
  </article>
</template>
```

Este patrón mantiene una separación sana: el hijo no necesita saber cómo está guardada la lista completa. Solo dice: "esta tarea debería completarse".

## `defineProps`: qué necesita recibir el componente

Con `<script setup>`, las props se declaran con `defineProps()`.

```vue [Composition API] {2-11}
<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Miembro'
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
      default: 'Miembro'
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

Una prop debería responder una pregunta concreta: ¿qué dato necesita este componente para poder renderizarse?

Si el componente necesita un nombre, una URL, un estado activo o una lista pequeña, eso probablemente es una prop. Si necesita modificar estado compartido, guardar datos o coordinar muchas piezas, quizá ya no estamos hablando de una simple prop.

## `defineEmits`: qué puede comunicar el componente

Los emits describen eventos que el componente hijo puede disparar.

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
    <button type="submit">Buscar</button>
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
    <button type="submit">Buscar</button>
  </form>
</template>
```

El componente no decide qué hacer con la búsqueda. Puede que el padre llame una API, actualice la URL o filtre una lista local. El hijo solo comunica el evento con los datos necesarios.

## No modifiques props directamente

Una regla importante: un componente hijo no debería modificar una prop recibida.

Esto es tentador:

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

Aunque con objetos puede parecer que funciona, el diseño se vuelve confuso. El padre deja de ser el lugar claro donde cambia el estado y el hijo empieza a tener demasiado control sobre algo que no le pertenece.

Una versión más limpia es emitir la intención:

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
    <p>{{ task.completed ? 'Completada' : 'Pendiente' }}</p>

    <button type="button" @click="complete">
      Marcar como completada
    </button>
  </article>
</template>
```

El padre recibe el evento y hace el cambio:

```vue [TaskList.vue] {3}
<TaskCard
  :task="task"
  @complete="completeTask"
/>
```

## Nombrar eventos con intención

Un buen nombre de evento dice qué ocurrió, no cómo debería reaccionar el padre.

Por ejemplo:

- `@submit`
- `@select`
- `@remove`
- `@complete`
- `@update:status`

Evita nombres demasiado acoplados como `@callApiNow` o `@changeParentList`. El hijo no debería saber tanto sobre lo que hará el padre.

## Props pequeñas, eventos claros

El problema no suele ser usar props. El problema aparece cuando un componente recibe demasiadas props sueltas y emite eventos difíciles de seguir.

Si ves algo así:

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

tal vez el componente debería recibir un objeto `user` completo:

```vue
<UserCard :user="user" />
```

No siempre. Si el componente solo necesita dos campos, pasar props específicas puede ser más explícito. Pero cuando todas las props representan la misma entidad, agruparlas puede hacer el template más claro.

## Cuándo usar props y emits

Props y emits son ideales cuando:

- Hay una relación directa entre padre e hijo.
- El estado vive naturalmente en el padre.
- El hijo solo necesita mostrar datos y avisar interacciones.
- Quieres que el flujo sea fácil de leer desde el template.

Si empiezas a pasar la misma prop por cinco niveles, probablemente necesitas otra herramienta. Ahí puede tener sentido mirar `provide/inject`, un composable compartido o una solución de estado como Pinia.

Pero no saltes a esas opciones demasiado pronto. Para muchísimos componentes, props y emits son suficientes.

## Una forma simple de pensarlo

Antes de conectar dos componentes, pregúntate:

> ¿Este componente necesita recibir un dato o necesita avisar que algo ocurrió?

Si necesita recibir un dato, usa una prop.

Si necesita avisar algo, usa un emit.

Esa distinción mantiene el código predecible. Los datos bajan, los eventos suben, y cada componente conserva una responsabilidad clara.
