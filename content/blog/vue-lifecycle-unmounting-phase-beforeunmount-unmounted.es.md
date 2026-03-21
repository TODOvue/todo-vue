---
title: "Ciclos de vida en Vue: fase de desmontaje (beforeUnmount, unmounted)"
description: "Qué ocurre cuando un componente sale de pantalla y cómo usar beforeUnmount y unmounted para limpiar listeners, timers y efectos sin dejar fugas ni comportamientos extraños."
date: 2026-03-11T22:00:00-05:00
updatedAt: 2026-03-11T22:00:00-05:00
tags:
  - tag: "Ciclo de Vida"
    color: "#FF6B6B"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Básico"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773284773/vue-lifecycle-unmounting-phase-beforeunmount-unmounted_f9gqy0.png
coverAlt: "Ilustración de la fase de desmontaje del ciclo de vida de Vue con beforeUnmount y unmounted"
coverCaption: "La fase de desmontaje ocurre cuando Vue retira un componente del árbol activo"
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 5
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - beforeUnmount
  - unmounted
  - onBeforeUnmount
  - cleanup
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: fase de desmontaje (beforeUnmount, unmounted)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-11T22:00:00-05:00"
---
# Ciclos de vida en Vue: fase de desmontaje (`beforeUnmount`, `unmounted`)

Muchos bugs no nacen cuando un componente aparece, sino cuando desaparece. Un listener global que quedó activo, un `setInterval` que nunca se limpió o una petición que sigue en curso cuando el usuario ya cambió de vista suelen empezar ahí.

La fase de desmontaje sirve para cerrar correctamente esa historia. No se trata solo de “borrar cosas”, sino de dejar el componente en orden cuando Vue lo retira del árbol. Si entiendes bien la diferencia entre `beforeUnmount` y `unmounted`, puedes evitar fugas de memoria, efectos duplicados y componentes que siguen haciendo trabajo cuando ya no existen en pantalla.

## Concepto clave

El desmontaje ocurre cuando Vue decide retirar un componente del árbol activo. Esto puede pasar, por ejemplo, si un `v-if` cambia a `false`, si cambias de ruta o si un componente dinámico deja de renderizarse.

En esa fase aparecen dos hooks:

* `beforeUnmount`: se ejecuta **justo antes de que Vue desmonte el componente**.
* `unmounted`: se ejecuta **cuando el componente ya fue desmontado**.

En Composition API, los equivalentes son:

* `onBeforeUnmount()`
* `onUnmounted()`

La diferencia importante es esta:

* En `beforeUnmount` la instancia todavía existe y puedes acceder a su estado, refs y recursos activos para limpiarlos.
* En `unmounted` Vue ya terminó el desmontaje y ya detuvo los efectos reactivos del componente. Ese punto sirve más para confirmaciones finales, trazas o integraciones muy concretas.

En la práctica, casi toda la limpieza útil ocurre en `beforeUnmount`.

## Cuándo usarlo

La fase de desmontaje tiene sentido cuando el componente abrió recursos que no deben seguir vivos después.

Casos típicos:

* Quitar listeners registrados sobre `window`, `document` o cualquier objeto externo.
* Limpiar `setInterval`, `setTimeout`, `requestAnimationFrame` o `ResizeObserver`.
* Cerrar sockets, desconectar observers o abortar peticiones pendientes.
* Guardar una última traza de depuración o telemetría cuando el componente ya terminó de salir.

Una regla sencilla:

* Si necesitas **desconectar o cancelar algo**, piensa primero en `beforeUnmount`.
* Si necesitas **saber que el componente ya terminó de salir**, piensa en `unmounted`.

## Cuándo evitarlo

No todo debe ir en estos hooks.

Evita `beforeUnmount` y `unmounted` cuando:

* La lógica puede quedar encapsulada en un composable usando `onScopeDispose`.
* El recurso ya se limpia automáticamente y no requiere intervención manual.
* Estás usando el hook para corregir un problema que en realidad viene de una mala estructura del componente.
* El componente no se desmonta realmente, sino que solo se oculta.

Ese último punto importa mucho:

* `v-if` puede desmontar un componente.
* `v-show` solo lo oculta.
* Un componente cacheado con `<KeepAlive>` puede desactivarse sin desmontarse.

Si confundes esos casos, esperarás un hook que nunca se ejecutará.

## Comparación

| Hook            | Qué sigue disponible                                            | Uso natural                                               | Riesgo habitual                                           |
|-----------------|-----------------------------------------------------------------|-----------------------------------------------------------|-----------------------------------------------------------|
| `beforeUnmount` | Instancia, refs, estado y recursos activos                      | Limpiar listeners, timers, observers o abortar peticiones | Dejar demasiado trabajo para después                      |
| `unmounted`     | El componente ya salió del árbol y sus efectos fueron detenidos | Trazas finales o integraciones puntuales                  | Intentar hacer limpieza que dependía de la instancia viva |

`unmounted` existe, pero eso no significa que deba cargar con toda la responsabilidad del cierre. Si necesitas tocar algo que el componente abrió, normalmente llegaste tarde si esperas a `unmounted`.

## Errores comunes

### 1. Registrar recursos en `mounted` y olvidarse del cierre

Es el error más común. El componente se monta correctamente, funciona durante un tiempo y luego empieza a comportarse de forma extraña porque un listener antiguo sigue respondiendo aunque la vista ya cambió.

Esto suele pasar con:

* `window.addEventListener()`
* `setInterval()`
* `IntersectionObserver`
* `ResizeObserver`
* websockets o suscripciones externas

Si lo abriste manualmente, debes asumir que también te corresponde cerrarlo.

### 2. Dejar toda la limpieza en `unmounted`

`unmounted` no es el lugar ideal para todo. Si necesitas abortar una petición, desconectar un observer o retirar listeners mientras la instancia todavía es accesible, `beforeUnmount` es más claro y más seguro.

Piensa en `beforeUnmount` como el momento de desmontar la mesa antes de sacarla del salón.

### 3. Confundir ocultar con desmontar

Muchos desarrolladores esperan que `beforeUnmount` se ejecute cuando un panel deja de verse. Pero si ese panel usa `v-show`, el componente sigue vivo.

También ocurre con `<KeepAlive>`: al cambiar de vista, el componente puede quedar desactivado y luego reactivarse sin pasar por `unmounted`.

Si el problema es de activación o desactivación, los hooks correctos pueden ser otros.

### 4. Lanzar trabajo nuevo cuando el componente ya se está yendo

No conviene iniciar nuevas tareas pesadas durante el desmontaje. Si en `beforeUnmount` abres otra petición o empiezas otra suscripción, estás complicando justo el momento en que Vue intenta cerrar el componente.

La fase de desmontaje debería reducir trabajo, no crear más.

## Ejemplos prácticos

### Limpiar listeners globales al salir de una vista

Si una vista escucha eventos del navegador, esos listeners deben desaparecer cuando la ruta cambia. De lo contrario, terminarás reaccionando dos veces al mismo evento cuando el usuario vuelva.

### Abortar una petición pendiente

En componentes con navegación rápida, es normal que una solicitud siga en curso mientras el usuario ya abandonó la página. Cancelarla en `beforeUnmount` evita trabajo innecesario y estados inconsistentes.

### Dejar una traza final de depuración

`unmounted` puede ser útil para confirmar que el componente sí salió cuando estás investigando *remounts* inesperados, cacheo o renders condicionales.

```vue [Composition API]
<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue'

const status = ref('Cargando estado...')
const totalTasks = ref<number | null>(null)

let controller: AbortController | null = null

function syncOnlineStatus() {
  status.value = navigator.onLine ? 'En línea' : 'Sin conexión'
}

async function loadSummary() {
  controller = new AbortController()

  try {
    const response = await fetch('/api/tasks/summary', {
      signal: controller.signal
    })

    const data = await response.json() as { total: number }
    totalTasks.value = data.total
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    console.error('No se pudo cargar el resumen', error)
  }
}

onMounted(() => {
  syncOnlineStatus()
  window.addEventListener('online', syncOnlineStatus)
  window.addEventListener('offline', syncOnlineStatus)
  void loadSummary()
})

onBeforeUnmount(() => {
  window.removeEventListener('online', syncOnlineStatus)
  window.removeEventListener('offline', syncOnlineStatus)
  controller?.abort()
})

onUnmounted(() => {
  console.info('TaskSummary ya salió del árbol')
})
</script>

<template>
  <section class="task-summary">
    <p>{{ status }}</p>
    <p v-if="totalTasks !== null">
      Tareas registradas: {{ totalTasks }}
    </p>
  </section>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      status: 'Cargando estado...',
      totalTasks: null,
      controller: null
    }
  },

  mounted() {
    this.syncOnlineStatus()
    window.addEventListener('online', this.syncOnlineStatus)
    window.addEventListener('offline', this.syncOnlineStatus)
    void this.loadSummary()
  },

  beforeUnmount() {
    window.removeEventListener('online', this.syncOnlineStatus)
    window.removeEventListener('offline', this.syncOnlineStatus)
    this.controller?.abort()
  },

  unmounted() {
    console.info('TaskSummary ya salió del árbol')
  },

  methods: {
    syncOnlineStatus() {
      this.status = navigator.onLine ? 'En línea' : 'Sin conexión'
    },

    async loadSummary() {
      this.controller = new AbortController()

      try {
        const response = await fetch('/api/tasks/summary', {
          signal: this.controller.signal
        })

        const data = await response.json()
        this.totalTasks = data.total
      }
      catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        console.error('No se pudo cargar el resumen', error)
      }
    }
  }
}
</script>

<template>
  <section class="task-summary">
    <p>{{ status }}</p>
    <p v-if="totalTasks !== null">
      Tareas registradas: {{ totalTasks }}
    </p>
  </section>
</template>
```

* `onMounted()` abre recursos externos.
* `onBeforeUnmount()` realiza la limpieza real.
* `onUnmounted()` deja una confirmación final de que el componente ya terminó de salir.

## Resumen

* `beforeUnmount` es el hook principal para limpiar lo que el componente abrió.
* `unmounted` confirma que el desmontaje ya terminó.
* Si el componente solo se oculta o queda cacheado, estos hooks pueden no ejecutarse.
* El criterio más útil es simple: si registraste listeners, timers, observers o peticiones manuales, define también su cierre.
