---
title: "Ciclos de vida en Vue: depuración del render (renderTracked, renderTriggered)"
description: "Cómo usar renderTracked, renderTriggered, onRenderTracked y onRenderTriggered para entender qué dependencias entran en un render y qué cambios están forzando nuevas actualizaciones."
date: 2026-03-17T22:00:00-05:00
updatedAt: 2026-03-17T22:00:00-05:00
tags:
  - tag: "Ciclo de Vida"
    color: "#FF6B6B"
  - tag: "Depuración"
    color: "#C44569"
  - tag: "Renderizado"
    color: "#E17055"
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Avanzado"
    color: "#F54927"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773802976/vue-lifecycle-render-debug-rendertracked-rendertriggered_ekkgg1.png
coverAlt: "Ilustración de depuración del render en Vue con renderTracked y renderTriggered"
coverCaption: "renderTracked y renderTriggered ayudan a ver qué dependencia entra al render y cuál lo vuelve a disparar."
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 8
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - renderTracked
  - renderTriggered
  - onRenderTracked
  - onRenderTriggered
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: depuración del render (renderTracked, renderTriggered)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-17T22:00:00-05:00"
---
# Ciclos de vida en Vue: depuración del render (`renderTracked`, `renderTriggered`)

Hay bugs que no están en la lógica de negocio ni en una API externa. Están en otro nivel: un componente que se vuelve a renderizar demasiadas veces, una lista que recalcula de más o una vista que depende de un estado reactivo que ni siquiera sabías que estaba leyendo.

Este tipo de problema suele ser difícil de detectar porque Vue abstrae muy bien el sistema reactivo. Actualiza cuando corresponde y, desde fuera, parece magia. Precisamente por eso existen `renderTracked` y `renderTriggered`: para abrir esa “caja negra” y entender qué está ocurriendo dentro del ciclo de render.

No son hooks para lógica de aplicación. Son herramientas de diagnóstico. Cuando un componente se actualiza “sin razón aparente”, ayudan a responder dos preguntas clave:

* ¿Qué dependencias reactivas se registraron durante el render?
* ¿Qué cambio concreto disparó el siguiente render?

## Por qué esto importa

A medida que una interfaz crece, el coste de renderizar “un poco de más” deja de ser invisible. Empiezan a aparecer síntomas claros:

* Inputs que se sienten lentos.
* Tablas que se recalculan o reordenan innecesariamente.
* Componentes hijos que se actualizan por cambios irrelevantes.
* `computed` y `watch` que parecen correctos, pero participan en renders excesivos.

En estos casos, leer únicamente el template no es suficiente. Necesitas entender la relación entre el render y el sistema reactivo. Aquí es donde `renderTracked` y `renderTriggered` aportan valor: muestran qué dependencias se registraron y qué mutaciones provocaron nuevas actualizaciones.

## Concepto clave

Vue registra dependencias reactivas mientras renderiza un componente. Si durante ese proceso el template, un `computed` o cualquier expresión reactiva accede a una propiedad, Vue la asocia al efecto de render.

Los hooks de depuración permiten observar este proceso:

* `renderTracked` (Options API) y `onRenderTracked()` (Composition API) se ejecutan cuando una dependencia se registra durante el render.
* `renderTriggered` (Options API) y `onRenderTriggered()` (Composition API) se ejecutan cuando una de esas dependencias cambia y provoca un nuevo render.

Ambos reciben un objeto de depuración con información como:

* `target`: el objeto reactivo implicado.
* `key`: la propiedad accedida o modificada.
* `type`: el tipo de operación (`get`, `set`, `add`, `delete`, etc.).
* `newValue` y `oldValue`, cuando aplica.

Dos matices importantes:

* Son hooks pensados para desarrollo. No deben formar parte de la lógica de negocio.
* Su uso típico es con `console.log()` o `debugger`, no mutando estado reactivo.

Intentar integrarlos en la lógica de la aplicación suele generar más problemas de los que resuelve.

## Cuándo usarlo

Estos hooks tienen sentido cuando necesitas entender por qué un componente renderiza (o re-renderiza).

Casos comunes:

* Un componente cambia de forma inesperada al modificar un estado aparentemente no relacionado.
* Una vista compleja se actualiza demasiadas veces.
* Estás optimizando rendimiento y sospechas dependencias innecesarias.
* Un `computed` aparentemente simple provoca renders amplios.

Regla práctica: si la pregunta es “¿por qué este componente se está renderizando?”, estos hooks encajan perfectamente.

## Cuándo evitarlo

No son una herramienta permanente ni sustituyen una arquitectura clara.

Evítalos cuando:

* El problema se entiende mejor revisando `props`, `emits`, `computed` o `watch`.
* Solo necesitas reaccionar a cambios específicos (usa `watch`).
* Pretendes almacenar trazas en estado reactivo del mismo componente.
* Quieres usarlos como telemetría en producción.

También evita dejarlos en el código una vez terminado el debugging: generan ruido innecesario.

## Errores comunes

### 1. Usarlos para lógica de negocio

No están diseñados para disparar efectos funcionales. Si necesitas reaccionar a datos, usa `watch` o `computed`.

### 2. Mutar estado dentro del hook

Guardar eventos en un `ref` puede introducir renders adicionales y contaminar la depuración.

### 3. Culpar a Vue en lugar del alcance reactivo

Si el template accede a un objeto grande, Vue hará lo correcto: suscribirse a todo lo que se use.

### 4. Asumir comportamiento estable en producción

Son herramientas de debugging, no API para comportamiento funcional.

## Ejemplos prácticos

### Detectar dependencias accidentales

Una tabla puede estar leyendo más estado del necesario (filtros, flags, metadatos). `renderTracked` permite verlo claramente.

### Identificar qué dispara un render

`renderTriggered` muestra la clave exacta que provocó la actualización, eliminando suposiciones.

### Optimizar componentes conectados a stores

Permite validar si el componente depende solo de lo necesario o si está sobre-suscrito a estado global.

## Ejemplo completo

```vue [Composition API]
<script setup lang="ts">
import { computed, onRenderTracked, onRenderTriggered, reactive, ref } from 'vue'

const filters = reactive({
  search: '',
  showOnlyOpen: false
})

const ui = reactive({
  selectedId: 1,
  panelOpen: true
})

const tasks = ref([
  { id: 1, title: 'Revisar PR', done: false, owner: 'Ana' },
  { id: 2, title: 'Actualizar dependencias', done: true, owner: 'Luis' },
  { id: 3, title: 'Documentar composable', done: false, owner: 'Ana' }
])

const visibleTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(filters.search.toLowerCase())

    const matchesStatus = filters.showOnlyOpen ? !task.done : true

    return matchesSearch && matchesStatus
  })
})

onRenderTracked((event) => {
  console.log('[renderTracked]', {
    type: event.type,
    key: String(event.key),
    target: event.target
  })
})

onRenderTriggered((event) => {
  console.log('[renderTriggered]', {
    type: event.type,
    key: String(event.key),
    oldValue: event.oldValue,
    newValue: event.newValue
  })
})

function toggleTask(taskId: number) {
  const task = tasks.value.find(item => item.id === taskId)

  if (!task) return

  task.done = !task.done
}
</script>
```
```vue [Options API]
<script lang="ts">
export default {
  name: 'TaskRenderDebugger',

  data() {
    return {
      filters: {
        search: '',
        showOnlyOpen: false
      },
      ui: {
        selectedId: 1,
        panelOpen: true
      },
      tasks: [
        { id: 1, title: 'Revisar PR', done: false, owner: 'Ana' },
        { id: 2, title: 'Actualizar dependencias', done: true, owner: 'Luis' },
        { id: 3, title: 'Documentar composable', done: false, owner: 'Ana' }
      ]
    }
  },

  computed: {
    visibleTasks() {
      return this.tasks.filter(task => {
        const matchesSearch = task.title
          .toLowerCase()
          .includes(this.filters.search.toLowerCase())

        const matchesStatus = this.filters.showOnlyOpen ? !task.done : true

        return matchesSearch && matchesStatus
      })
    }
  },

  renderTracked(event) {
    console.log('[renderTracked]', {
      type: event.type,
      key: String(event.key),
      target: event.target
    })
  },

  renderTriggered(event) {
    console.log('[renderTriggered]', {
      type: event.type,
      key: String(event.key),
      oldValue: event.oldValue,
      newValue: event.newValue
    })
  },

  methods: {
    toggleTask(taskId) {
      const task = this.tasks.find(item => item.id === taskId)

      if (!task) return

      task.done = !task.done
    }
  }
}
</script>
```

Este ejemplo permite observar claramente:

* Qué dependencias se registran al renderizar.
* Qué cambios provocan nuevas actualizaciones.
* Cómo el alcance del componente afecta su reactividad.

## Resumen

`renderTracked` y `renderTriggered` no son herramientas decorativas ni de observabilidad general. Son instrumentos de diagnóstico para entender el render desde dentro.

Bien utilizados, permiten:

* Detectar dependencias accidentales.
* Reducir renders innecesarios.
* Comprender mejor la relación entre template, estado reactivo y `computed`.

> Antes de optimizar a ciegas, observa qué dependencias se registran y qué cambios están disparando el render.
