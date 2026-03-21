---
title: "Ciclos de vida en Vue: fase de actualización (beforeUpdate, updated)"
description: "Qué ocurre cuando Vue vuelve a renderizar un componente y cómo usar beforeUpdate y updated sin convertirlos en sustitutos de watch o computed."
date: 2026-03-10T22:00:00-05:00
updatedAt: 2026-03-10T22:00:00-05:00
tags:
  - tag: "Ciclo de Vida"
    color: "#FF6B6B"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Renderizado"
    color: "#E17055"
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Básico"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773284616/vue-lifecycle-update-phase-beforeupdate-updated_qql7os.png
coverAlt: "Ilustración de la fase de actualización del ciclo de vida de Vue con beforeUpdate y updated"
coverCaption: "La fase de actualización ocurre cuando un cambio reactivo obliga a Vue a volver a renderizar el componente."
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 4
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - beforeUpdate
  - updated
  - onUpdated
  - renderizado
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: fase de actualización (beforeUpdate, updated)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-10T22:00:00-05:00"
---
# Ciclos de vida en Vue: fase de actualización (`beforeUpdate`, `updated`)

Muchos componentes no fallan al crearse ni al montarse. Fallan después, cuando el estado cambia y la interfaz empieza a re-renderizarse varias veces. Ahí aparecen mediciones incorrectas, efectos duplicados o hooks usados como si fueran un `watch` global.

La fase de actualización existe precisamente para entender ese momento: **cuándo Vue todavía no ha reflejado el cambio en el DOM y cuándo ya terminó de hacerlo**. Si manejas bien esa diferencia, evitas código reactivo confuso y componentes que se vuelven difíciles de mantener.

En aplicaciones reales, muchos problemas de UI —scroll roto, mediciones incorrectas o integraciones con librerías externas que se desincronizan— aparecen justo en este punto del ciclo de vida.

# Concepto clave

Cada vez que una dependencia reactiva usada por el componente cambia, Vue programa una nueva renderización.

Durante ese proceso aparecen dos hooks:

* `beforeUpdate`: se ejecuta **después de que el estado cambió, pero antes de que Vue actualice el DOM**.
* `updated`: se ejecuta **después de que Vue ya aplicó los cambios al DOM**.

En **Composition API**, los equivalentes son:

* `onBeforeUpdate()`
* `onUpdated()`

La idea práctica es bastante simple:

* Si necesitas **ver el estado anterior del DOM antes de que cambie**, `beforeUpdate` es el momento.
* Si necesitas **leer o manipular el DOM ya actualizado**, `updated` es el momento.
* Si lo que quieres es **reaccionar a un dato concreto**, normalmente un `watch` o un `computed` será más claro que cualquiera de estos hooks.

También conviene recordar algo importante: **Vue agrupa cambios reactivos y actualizaciones del DOM**. Esto significa que estos hooks no expresan *"cambió esta variable"*, sino algo más amplio:

> "El componente está entrando o saliendo de un ciclo completo de actualización."

Por eso no son buenos sustitutos de `watch`.

# Cuándo usarlo

La fase de actualización encaja bien cuando tu lógica depende del **paso entre un render y el siguiente**.

Casos típicos:

* Comparar el DOM visible antes y después de una actualización.
* Ajustar scroll o foco después de que cambió una lista renderizada.
* Recalcular una integración con una librería externa cuando el marcado ya está actualizado.
* Sincronizar layouts dinámicos.
* Depurar renderizados excesivos o entender por qué una vista se está refrescando.

`beforeUpdate` suele ser útil cuando quieres **leer o limpiar algo del DOM anterior antes de que Vue lo reemplace**.

`updated` tiene sentido cuando necesitas **confirmar que el HTML ya refleja el nuevo estado** y solo entonces medir, desplazar o sincronizar una librería.

# Cuándo evitarlo

No todo cambio reactivo necesita estos hooks.

Evita `beforeUpdate` y `updated` cuando:

* Solo quieres reaccionar a una propiedad concreta.
* Puedes resolver el problema con `computed`.
* La lógica no depende del DOM.
* Estás pensando en `updated` para disparar más cambios de estado sin una condición clara.

En especial, `updated` puede volverse peligroso si dentro cambias el mismo estado que provocó el render. Ahí es donde nacen los **bucles de actualización** o los renders innecesarios.

# Errores comunes

## Usar `updated` como reemplazo de `watch`

Es un error muy frecuente.

`updated` se ejecuta **cuando el componente ya se volvió a renderizar**, no cuando una variable específica cambió con intención semántica.

Si necesitas reaccionar a `search`, `page`, `filters` o cualquier dato concreto, un `watch` comunica mejor el objetivo y reduce trabajo innecesario.

## Modificar estado dentro de `updated` sin control

Este es el camino clásico hacia un bucle:

```vue [App.vue]{6}
<script setup lang="ts">
import { onUpdated, ref } from 'vue'

const count = ref(0)

onUpdated(() => {
  count.value++
})
</script>
```

Cada actualización provoca otra actualización.

Si necesitas corregir estado, hazlo con una **condición muy clara** o mueve esa lógica a:

* `watch`
* `computed`
* la acción que origina el cambio

## Leer el DOM nuevo en `beforeUpdate`

En `beforeUpdate` el DOM visible todavía representa el **render anterior**.

Si mides ahí esperando el nuevo tamaño, el dato será viejo.

Para leer el resultado final del render, usa `updated`.

## Meter lógica pesada en cada actualización

Estos hooks pueden dispararse **muchas veces**.

Si dentro colocas:

* Cálculos costosos
* Integraciones pesadas
* Consultas repetidas al DOM

El componente se degradará rápido.

> Si una tarea no necesita ejecutarse en **cada render**, probablemente no debería vivir aquí.

# Ejemplos prácticos

## Mantener el scroll pegado al final en un chat

Cuando llega un mensaje nuevo, el array cambia primero y el DOM se actualiza después.

Si haces scroll demasiado pronto, todavía no existe la nueva altura del contenedor.

La solución es esperar al momento en que el DOM ya fue actualizado.

## Recalcular una librería visual después de actualizar una lista

Algunas librerías (diagramas, grids, tooltips o librerías de layout) necesitan que **el markup ya esté en pantalla** antes de recalcular posiciones o tamaños.

`updated` permite ejecutar esa sincronización justo después del render.

## Detectar renderizados repetidos durante depuración

Estos hooks también sirven para entender si un componente se actualiza más de lo esperado.

```vue [App.vue]{2,6}
<script>
onBeforeUpdate(() => {
  console.log('El componente está a punto de actualizarse')
})

onUpdated(() => {
  console.log('El componente terminó de actualizarse')
})
</script>
```

Esto ayuda a detectar dependencias reactivas que provocan renders innecesarios.

```vue [Composition API]
<script setup lang="ts">
import { onBeforeUpdate, onUpdated, ref } from 'vue'

const messages = ref([
  { id: 1, text: 'Primer mensaje' },
  { id: 2, text: 'Segundo mensaje' }
])

const listRef = ref<HTMLOListElement | null>(null)
const previousHeight = ref(0)

function addMessage() {
  messages.value.push({
    id: Date.now(),
    text: `Mensaje ${messages.value.length + 1}`
  })
}

onBeforeUpdate(() => {
  previousHeight.value = listRef.value?.scrollHeight ?? 0
})

onUpdated(() => {
  if (!listRef.value) return

  const nextHeight = listRef.value.scrollHeight

  if (nextHeight > previousHeight.value) {
    listRef.value.scrollTop = nextHeight
  }
})
</script>

<template>
  <section class="chat-panel">
    <button @click="addMessage">
      Agregar mensaje
    </button>

    <ol
      ref="listRef"
      class="messages"
    >
      <li
        v-for="message in messages"
        :key="message.id"
      >
        {{ message.text }}
      </li>
    </ol>
  </section>
</template>
```
```vue [Options Api]
<script>
export default {
  data() {
    return {
      messages: [
        { id: 1, text: 'Primer mensaje' },
        { id: 2, text: 'Segundo mensaje' }
      ],
      previousHeight: 0
    }
  },

  methods: {
    addMessage() {
      this.messages.push({
        id: Date.now(),
        text: `Mensaje ${this.messages.length + 1}`
      })
    }
  },

  beforeUpdate() {
    if (this.$refs.listRef instanceof HTMLOListElement) {
      this.previousHeight = this.$refs.listRef.scrollHeight
    }
  },

  updated() {
    if (!(this.$refs.listRef instanceof HTMLOListElement)) {
      return
    }

    const nextHeight = this.$refs.listRef.scrollHeight

    if (nextHeight > this.previousHeight) {
      this.$refs.listRef.scrollTop = nextHeight
    }
  }
}
</script>

<template>
  <section class="chat-panel">
    <button @click="addMessage">
      Agregar mensaje
    </button>

    <ol
      ref="listRef"
      class="messages"
    >
      <li
        v-for="message in messages"
        :key="message.id"
      >
        {{ message.text }}
      </li>
    </ol>
  </section>
</template>
```

* `onBeforeUpdate()` guarda la altura del render anterior.
* `onUpdated()` decide si debe ajustar el scroll una vez que el nuevo mensaje ya existe en el DOM.

# Resumen

* `beforeUpdate` te permite observar **el punto justo antes del parche del DOM**.
* `updated` sirve cuando **la interfaz ya refleja el nuevo estado** y necesitas actuar sobre ese resultado.
* Si el problema gira alrededor de un dato específico, **`watch` suele ser más expresivo**.
* Estos hooks describen **el ciclo de actualización del componente**, no el cambio de una variable concreta.
* La regla más importante es esta: **no conviertas `updated` en una máquina de mutar estado después de cada render.**
