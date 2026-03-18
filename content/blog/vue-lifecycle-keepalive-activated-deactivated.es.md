---
title: "Ciclos de vida en Vue: componentes cacheados con <KeepAlive> (activated, deactivated)"
description: "Cómo funcionan activated y deactivated en componentes cacheados con <KeepAlive>, cuándo usarlos y cómo evitar datos obsoletos, timers activos y lógica mal ubicada."
date: 2026-03-12T23:00:00-05:00
updatedAt: 2026-03-12T23:00:00-05:00
tags:
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Arquitectura"
    color: "#4CAF50"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773371011/vue-lifecycle-keepalive-activated-deactivated_abjmwe.png
coverAlt: "Ilustración de componentes cacheados con KeepAlive en Vue usando activated y deactivated"
coverCaption: "KeepAlive permite desactivar y reactivar componentes sin destruir su estado local"
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 6
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - KeepAlive
  - activated
  - deactivated
  - cache de componentes
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: componentes cacheados con <KeepAlive> (activated, deactivated)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-12T23:00:00-05:00"
---
## Texto refinado completo

# Ciclos de vida en Vue: componentes cacheados con `<KeepAlive>` (`activated`, `deactivated`)

No todos los componentes desaparecen realmente cuando dejan de verse. En Vue, un componente envuelto en `<KeepAlive>` puede salir del DOM activo y, aun así, seguir vivo en memoria. Ese detalle cambia por completo la forma de entender su ciclo de vida.

Si tratas un componente cacheado como si siempre se montara desde cero, es fácil terminar recargando datos sin necesidad, dejando timers o polling corriendo cuando la vista ya no está visible, o mostrando información obsoleta al volver a una pestaña.

Los hooks `activated` y `deactivated` existen precisamente para ese escenario: componentes que entran y salen de pantalla sin destruirse en cada cambio.

## Concepto clave

`<KeepAlive>` cachea instancias de componentes dinámicos para preservar su estado entre cambios. En lugar de desmontar el componente cuando deja de mostrarse, Vue lo mueve a un estado desactivado.

Eso significa que el flujo ya no es solo:

* Montar
* Actualizar
* Desmontar

Ahora también aparece un estado intermedio muy importante:

* Activar
* Desactivar
* Volver a activar

Los hooks implicados son:

* `onActivated()` / `activated`
* `onDeactivated()` / `deactivated`

Hay dos matices clave que conviene tener claros:

* `activated` también se ejecuta en el montaje inicial del componente cacheado.
* `deactivated` se ejecuta cuando el componente sale del DOM activo hacia la caché y también cuando finalmente se desmonta.

En términos prácticos:

* `mounted` sirve para inicialización única.
* `activated` sirve para cada momento en que la vista vuelve a estar activa.
* `deactivated` sirve para pausar, guardar o limpiar trabajo mientras la instancia queda en segundo plano.
* `unmounted` solo entra en juego cuando la instancia realmente deja de existir.

## Cuándo usarlo

`activated` y `deactivated` encajan bien cuando el componente debe comportarse de forma distinta según esté visible o solo cacheado.

Casos típicos:

* Revalidar datos al volver a una pestaña sin perder el estado local de formularios o filtros.
* Pausar polling, listeners u observadores cuando la vista deja de estar activa.
* Retomar scroll, foco o sincronización con librerías externas cuando el componente reaparece.
* Mantener una navegación fluida entre tabs, dashboards o vistas dinámicas sin reinstanciar todo desde cero.

La regla práctica es simple:

* Si necesitas reaccionar al regreso del componente, piensa en `activated`.
* Si necesitas detener trabajo mientras la instancia queda cacheada, piensa en `deactivated`.

## Cuándo evitarlo

No todo componente necesita `<KeepAlive>` ni estos hooks.

Conviene evitarlos cuando:

* El componente debería reiniciarse limpio en cada visita y no conservar estado.
* La lógica encaja mejor en estado global o en datos derivados, sin cachear la vista completa.
* El problema real es un flujo de navegación confuso, no la pérdida de estado.
* Quieres forzar un refresco completo en cada visita; en ese caso, la caché puede jugar en contra.

También conviene no meter aquí lógica que pertenece a otro sitio:

* Si dependes de un dato concreto, un `watch()` suele expresar mejor la intención.
* Si solo necesitas inicializar una vez, `mounted` o `setup()` suelen ser suficientes.
* Si el componente no está dentro de `<KeepAlive>`, estos hooks no se dispararán.

## Comparación rápida

| Hook          | Cuándo se dispara                                               | Para qué encaja mejor                                         | Error habitual                                                         |
|---------------|-----------------------------------------------------------------|---------------------------------------------------------------|------------------------------------------------------------------------|
| `mounted`     | Cuando la instancia se monta por primera vez                    | Inicialización única                                          | Poner aquí lógica que debería ejecutarse cada vez que la vista regresa |
| `activated`   | En el montaje inicial y en cada reactivación desde caché        | Refrescar, resincronizar o retomar trabajo visible            | Asumir que el componente vuelve desde estado limpio                    |
| `deactivated` | Cuando sale del DOM activo hacia caché y también al desmontarse | Pausar polling, timers, observers o persistir estado temporal | Tratarlo como si equivaliera a destrucción completa                    |
| `unmounted`   | Cuando la instancia realmente se destruye                       | Limpieza final                                                | Esperar que ocurra en cada cambio entre vistas cacheadas               |

La diferencia decisiva es esta: un componente cacheado no muere cuando deja de verse. Simplemente queda en pausa.

## Errores comunes

### 1. Cargar datos solo en `mounted`

Funciona la primera vez, pero suele fallar cuando el usuario sale y vuelve a la vista. Como el componente sigue cacheado, `mounted` no vuelve a ejecutarse y puedes terminar mostrando datos obsoletos.

La corrección habitual es mover la revalidación ligera a `activated`.

### 2. Dejar polling o timers activos mientras la vista está oculta

Un componente desactivado sigue existiendo en memoria. Si no detienes `setInterval`, sockets o listeners, el trabajo continúa aunque la pantalla ya no esté visible.

La solución es pausar en `deactivated` y reanudar en `activated` cuando corresponda.

### 3. Esperar `unmounted` al cambiar entre tabs cacheadas

Cuando cambias entre componentes dentro de `<KeepAlive>`, muchas veces no hay desmontaje inmediato. Lo que ocurre es una desactivación.

Si toda tu limpieza depende de `unmounted`, llegará tarde o no ocurrirá cuando esperabas.

### 4. Confundir conservar estado con conservar frescura

`<KeepAlive>` conserva estado local, pero no garantiza que los datos sigan actualizados. Puedes volver a un formulario con sus valores intactos y, al mismo tiempo, a una lista basada en datos viejos.

Cachear la instancia no reemplaza una estrategia de refresco.

## Ejemplos prácticos

### Volver a una pestaña sin perder filtros

Imagina una vista de reportes con filtros, orden y scroll interno. Sin `<KeepAlive>`, cada cambio de tab puede destruir la instancia y obligar al usuario a empezar otra vez. Con caché, mantienes la experiencia. Con `activated`, además, puedes refrescar solo el resumen o la fecha de última sincronización.

### Pausar trabajo en segundo plano

Si una vista consulta métrica cada 30 segundos, no conviene que siga haciéndolo cuando el usuario ya se movió a otra sección, pero la instancia quedó cacheada. `deactivated` es el lugar natural para detener ese trabajo.

### Retomar sincronización visual

Algunas vistas necesitan recalcular tamaños, gráficos o paneles cuando reaparecen. Como el componente no se recrea, `mounted` ya quedó atrás. Ahí `activated` es el punto correcto para resincronizar la UI.

```vue [Composition API]
<script setup lang="ts">
import { computed, onActivated, onDeactivated, onMounted, ref } from 'vue'

type Task = {
  id: number
  title: string
  done: boolean
}

const tasks = ref<Task[]>([])
const filter = ref<'all' | 'pending' | 'done'>('all')
const status = ref('Esperando carga...')
const lastSync = ref<string | null>(null)
const poller = ref<ReturnType<typeof setInterval> | null>(null)
const initialized = ref(false)

const visibleTasks = computed(() => {
  if (filter.value === 'pending') {
    return tasks.value.filter(task => !task.done)
  }

  if (filter.value === 'done') {
    return tasks.value.filter(task => task.done)
  }

  return tasks.value
})

async function fetchTasks() {
  status.value = 'Sincronizando...'

  const response = await fetch('/api/tasks')
  const data = (await response.json()) as { tasks: Task[] }

  tasks.value = data.tasks
  lastSync.value = new Date().toLocaleTimeString('es-CO')
  status.value = 'Datos actualizados'
}

function startPolling() {
  if (poller.value !== null) return

  poller.value = setInterval(() => {
    void fetchTasks()
  }, 30000)
}

function stopPolling() {
  if (poller.value === null) return

  clearInterval(poller.value)
  poller.value = null
}

onMounted(() => {
  initialized.value = true
})

onActivated(async () => {
  status.value = initialized.value ? 'Vista reactivada' : 'Cargando vista...'
  await fetchTasks()
  startPolling()
})

onDeactivated(() => {
  status.value = 'Vista en pausa'
  stopPolling()
})
</script>

<template>
  <section class="task-report">
    <header>
      <h2>Reporte de tareas</h2>
      <p>{{ status }}</p>
      <p v-if="lastSync">Última sincronización: {{ lastSync }}</p>
    </header>

    <nav class="filters">
      <button @click="filter = 'all'">Todas</button>
      <button @click="filter = 'pending'">Pendientes</button>
      <button @click="filter = 'done'">Completadas</button>
    </nav>

    <ul>
      <li
        v-for="task in visibleTasks"
        :key="task.id"
      >
        {{ task.title }}
      </li>
    </ul>
  </section>
</template>
```
```vue [Options Api]
<script>
export default {
  data() {
    return {
      tasks: [],
      filter: 'all',
      status: 'Esperando carga...',
      lastSync: null,
      poller: null,
      initialized: false
    }
  },

  computed: {
    visibleTasks() {
      if (this.filter === 'pending') {
        return this.tasks.filter(task => !task.done)
      }

      if (this.filter === 'done') {
        return this.tasks.filter(task => task.done)
      }

      return this.tasks
    }
  },

  mounted() {
    this.initialized = true
  },

  async activated() {
    this.status = this.initialized ? 'Vista reactivada' : 'Cargando vista...'
    await this.fetchTasks()
    this.startPolling()
  },

  deactivated() {
    this.status = 'Vista en pausa'
    this.stopPolling()
  },

  methods: {
    async fetchTasks() {
      this.status = 'Sincronizando...'

      const response = await fetch('/api/tasks')
      const data = await response.json()

      this.tasks = data.tasks
      this.lastSync = new Date().toLocaleTimeString('es-CO')
      this.status = 'Datos actualizados'
    },

    startPolling() {
      if (this.poller !== null) return

      this.poller = setInterval(() => {
        void this.fetchTasks()
      }, 30000)
    },

    stopPolling() {
      if (this.poller === null) return

      clearInterval(this.poller)
      this.poller = null
    }
  }
}
</script>

<template>
  <section class="task-report">
    <header>
      <h2>Reporte de tareas</h2>
      <p>{{ status }}</p>
      <p v-if="lastSync">Última sincronización: {{ lastSync }}</p>
    </header>

    <nav class="filters">
      <button @click="filter = 'all'">Todas</button>
      <button @click="filter = 'pending'">Pendientes</button>
      <button @click="filter = 'done'">Completadas</button>
    </nav>

    <ul>
      <li
        v-for="task in visibleTasks"
        :key="task.id"
      >
        {{ task.title }}
      </li>
    </ul>
  </section>
</template>
```

* `onActivated()` cubre tanto la primera activación como cada regreso desde caché.
* `onDeactivated()` pausa el polling para no seguir consumiendo recursos fuera de pantalla.
* El filtro local se conserva porque la instancia no se destruye.
* `onMounted()` queda reservado para trabajo realmente inicial; aquí solo marca que la instancia ya pasó por su montaje inicial.

## Resumen

* `<KeepAlive>` conserva la instancia y su estado local entre cambios de vista.
* `activated` no significa “montar otra vez”, sino “volver a estar activo”.
* `deactivated` es el hook adecuado para pausar trabajo cuando la instancia queda cacheada.
* Conservar estado no evita que tengas que revalidar datos cuando la vista regresa.
* Si el componente debe reiniciarse siempre desde cero, probablemente no deberías cachearlo.
