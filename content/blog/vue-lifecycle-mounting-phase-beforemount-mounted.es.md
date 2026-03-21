---
title: "Ciclos de vida en Vue: fase de montaje (beforeMount, mounted)"
description: "Qué ocurre justo antes y justo después de que Vue inserte un componente en el DOM, y cómo usar beforeMount y mounted sin meter lógica donde no corresponde."
date: 2026-03-09T22:00:00-05:00
updatedAt: 2026-03-09T22:00:00-05:00
tags:
  - tag: "Ciclo de Vida"
    color: "#FF6B6B"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Renderizado"
    color: "#E17055"
  - tag: "Básico"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773284431/vue-lifecycle-mounting-phase-beforemount-mounted_wkrzal.png
coverAlt: "Ilustración del ciclo de vida de un componente Vue enfocada en la fase de montaje del DOM"
coverCaption: "La fase de montaje es el momento en el que Vue crea e inserta el DOM del componente en la página."
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 3
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - beforeMount
  - mounted
  - onMounted
  - DOM
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: fase de montaje (beforeMount, mounted)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-09T22:00:00-05:00"
---
# Ciclos de vida en Vue: fase de montaje (`beforeMount`, `mounted`)

Muchos problemas cotidianos en Vue tienen el mismo origen: intentar interactuar con el DOM demasiado pronto o concentrar en `mounted` lógica que en realidad podría ejecutarse antes.

La fase de montaje marca justamente esa frontera. Es el momento en el que Vue deja de preparar el componente “por dentro” y finalmente lo inserta en la página. Entender bien esa transición te ayuda a decidir cuándo enfocar un input, cuándo inicializar una librería externa y cuándo, simplemente, no necesitas ningún hook.

## Concepto clave

Durante la fase de montaje, Vue ya tiene lista la reactividad del componente: props, estado, watchers y el árbol de renderizado ya están preparados. Lo que cambia en esta etapa es que **el DOM real pasa a existir**.

Aquí aparecen dos hooks clásicos del ciclo de vida:

* `beforeMount`: se ejecuta cuando Vue está a punto de montar el componente, pero el DOM real todavía no ha sido insertado.
* `mounted`: se ejecuta cuando el componente ya fue montado y puedes interactuar con nodos reales del DOM.

Si trabajas con Composition API, los equivalentes son:

* `onBeforeMount()`
* `onMounted()`

Una forma práctica de orientarse:

* Si necesitas preparar **estado o lógica que no depende del DOM**, normalmente eso pertenece a `setup`.
* Si necesitas **interactuar con elementos reales de la interfaz**, el punto natural suele ser `mounted`.
* Si estás considerando `beforeMount`, conviene revisar primero si ese código no encaja mejor antes, por ejemplo dentro de `setup`.

Además, en aplicaciones con SSR, **ni `beforeMount` ni `mounted` se ejecutan en el servidor**. Son hooks que solo existen en el cliente.

## Cuándo usarlo

La fase de montaje tiene sentido cuando el componente necesita cruzar la frontera entre el estado reactivo y el navegador real.

Casos típicos:

* Enfocar un campo de búsqueda cuando aparece la vista.
* Inicializar una librería externa que necesita un contenedor del DOM (por ejemplo, un gráfico o un editor).
* Medir tamaños, posiciones o scroll después del primer render.
* Registrar integraciones con API del navegador que dependen de nodos reales.

`beforeMount` tiene menos uso en la práctica, pero puede servir para:

* Dejar trazas o marcas de depuración antes del montaje.
* Ajustar algún estado justo antes de que ocurra el primer render en el navegador.
* Preparar integraciones que necesitan saber que el montaje es inminente, aunque todavía no interactúen con el DOM.

## Cuándo evitarlo

No todo debe resolverse en esta fase.

Evita `beforeMount` y `mounted` cuando:

* Solo estás cargando datos que **no dependen del DOM**.
* La lógica pertenece a un `watch`, un `computed` o a un **composable**.
* Estás usando `mounted` como un cajón de sastre para “todo lo que faltó”.
* Necesitas lógica compatible con **SSR desde el primer render**.

En especial, si el trabajo puede hacerse antes del montaje, suele ser mejor hacerlo antes. Así el componente llega más limpio a la pantalla y el primer render no carga con tareas innecesarias.

## Comparación

| Hook          | Qué ya existe                                      | Qué todavía no deberías asumir                                  | Uso típico                                  |
|---------------|----------------------------------------------------|-----------------------------------------------------------------|---------------------------------------------|
| `beforeMount` | Estado reactivo, props, métodos y render preparado | DOM real disponible                                             | Lógica puntual previa al montaje            |
| `mounted`     | Componente insertado en el DOM                     | Que librerías externas o procesos asíncronos ya hayan terminado | Enfocar, medir, integrar APIs del navegador |

En la mayoría de proyectos modernos, `mounted` aparece con frecuencia y `beforeMount` muy poco. Eso no significa que `beforeMount` esté mal, sino que **casi siempre existe un lugar mejor para esa lógica**.

## Errores comunes

### 1. Intentar leer o modificar el DOM en `beforeMount`

Es un error clásico. En `beforeMount` Vue está a punto de montar el componente, pero los nodos reales todavía no existen.

Si necesitas hacer algo como:

* `focus()`
* `getBoundingClientRect()`
* inicializar una librería sobre un contenedor

Entonces debes esperar a `mounted`.

### 2. Mandar a `mounted` cualquier carga inicial por costumbre

No todo `fetch` debería vivir en `mounted`. Si la petición no depende del DOM, puedes iniciarla antes y evitar retrasar la experiencia visual por una convención innecesaria.

`mounted` **no es el hook principal**. Es simplemente el hook correcto cuando el navegador real entra en la conversación.

Por ejemplo, este tipo de lógica no necesita `mounted`:

```vue [App.vue]
<script setup lang="ts">
import { ref } from 'vue'

const users = ref([])

async function loadUsers() {
  const res = await fetch('/api/users')
  users.value = await res.json()
}

loadUsers()
</script>
```

> Aquí la carga puede empezar directamente en `setup`.

### 3. Crear listeners o timers en `mounted` y olvidarse de limpiarlos

Este error no se nota en el montaje, pero aparece después.

Si registras:

* eventos globales
* `setInterval`
* `ResizeObserver`
* `IntersectionObserver`

en `mounted`, deberías limpiarlos en `beforeUnmount` o `onBeforeUnmount`.

```vue [App.vue]
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

let interval: number

onMounted(() => {
  interval = window.setInterval(() => {
    console.log('tick')
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
```

> Montar bien también implica **dejar preparado el desmontaje**.

### 4. Asumir que estos hooks también corren en SSR

En Nuxt o en cualquier flujo con renderizado del lado del servidor, estos hooks **solo se ejecutan en el cliente**.

Si colocas lógica crítica del HTML inicial dentro de `mounted`, esa lógica **no formará parte del primer render del servidor**.

En Nuxt, por ejemplo, las cargas de datos iniciales suelen vivir en composables o utilidades como `useAsyncData`.

## Ejemplos prácticos

### Enfocar un input al entrar en la vista

Es uno de los ejemplos más simples y útiles: necesitas que el elemento exista antes de llamar a `focus()`.

### Inicializar una librería de terceros

Si usas un gráfico, un calendario o un editor enriquecido, la librería normalmente requiere un contenedor del DOM. Ese momento natural es `mounted`.

### Medir un bloque después del primer render

Algunos componentes necesitan conocer su alto o ancho para decidir animaciones, layout o comportamiento de scroll. Esa medición también pertenece a la fase de montaje.

```vue [Composition API]
<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'

const searchInput = ref<HTMLInputElement | null>(null)
const status = ref('Preparando componente...')

onBeforeMount(() => {
  status.value = 'Vue ya preparó la instancia, pero el input todavía no existe en el DOM.'
})

onMounted(() => {
  searchInput.value?.focus()
  status.value = 'Componente montado. El input ya puede recibir foco.'
})
</script>

<template>
  <section class="search-panel">
    <p>{{ status }}</p>

    <input
      ref="searchInput"
      type="search"
      placeholder="Buscar tareas"
    >
  </section>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      status: 'Preparando componente...'
    }
  },

  beforeMount() {
    this.status = 'Vue está a punto de insertar el DOM del componente.'
  },

  mounted() {
    this.status = 'Componente montado. El input ya puede recibir foco.'

    if (this.$refs.searchInput instanceof HTMLInputElement) {
      this.$refs.searchInput.focus()
    }
  }
}
</script>

<template>
  <section class="search-panel">
    <p>{{ status }}</p>

    <input
      ref="searchInput"
      type="search"
      placeholder="Buscar tareas"
    >
  </section>
</template>
```

> Aquí `onBeforeMount()` solo actualiza un estado informativo. En cambio, `focus()` queda en `onMounted()` porque necesita un nodo real del DOM.

## Resumen

* `beforeMount` existe, pero en la mayoría de componentes no será tu herramienta principal. Si no necesitas el DOM, casi siempre conviene resolver la lógica antes.
* `mounted`, en cambio, tiene un papel muy claro: **es el hook donde el componente se encuentra con el navegador real**. Inputs, mediciones, gráficos, observers y librerías de terceros suelen empezar ahí. 
* La mejor forma de usar esta fase no es meter más cosas en ella, sino **reservarla únicamente para lo que realmente depende del DOM**.
