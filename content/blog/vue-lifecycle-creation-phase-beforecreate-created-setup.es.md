---
title: "Ciclos de vida en Vue: fase de creación (beforeCreate, created, setup)"
description: "Qué pasa realmente en la fase de creación de un componente Vue y cómo decidir entre beforeCreate, created y setup."
date: 2026-03-06T20:00:00-05:00
updatedAt: 2026-03-06T20:00:00-05:00
readingTime: 7
tags:
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772844495/vue-lifecycle-creation-phase-beforecreate-created-setup_c9z7py.png
coverAlt: "Ilustración de un ciclo de vida de un componente Vue, destacando la fase de creación con beforeCreate, created y setup"
coverCaption: "En esta imagen se muestra el ciclo de vida de un componente Vue, con énfasis en la fase de creación donde se ejecutan los hooks beforeCreate, created y setup."
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 2
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - beforeCreate
  - created
  - setup
  - Composition API
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: fase de creación (beforeCreate, created, setup)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-06T20:00:00-05:00"
---
# Ciclos de vida en Vue: fase de creación (`beforeCreate`, `created`, `setup`)

Cuando empiezas a escribir un componente en Vue, una de las preguntas más comunes es: **¿dónde debería colocar la lógica inicial?**

La respuesta depende principalmente de si estás trabajando con **Options API** o con **Composition API**.

La **fase de creación** es el momento en el que Vue construye la instancia del componente, inicializa su sistema de reactividad y prepara su estado interno. En esta etapa, el componente todavía **no ha sido montado en el DOM**.

## Qué ocurre en esta fase

En términos prácticos, el orden clásico del ciclo de vida con **Options API** es:

1. `beforeCreate`
2. `created`
3. montaje (`beforeMount` / `mounted`)

Con **Composition API**, el punto de entrada es `setup()`, que se ejecuta **antes de los hooks de ciclo de vida de Options API**, incluidos `beforeCreate` y `created`.

Si quieres quedarte con una idea simple:

* **`beforeCreate`** → punto extremadamente temprano; rara vez necesario hoy.
* **`created`** → estado reactivo disponible en Options API.
* **`setup`** → punto de arranque principal en Composition API.

## `beforeCreate`: cuándo aparece y por qué casi no se usa

`beforeCreate` se ejecuta **antes de que Vue termine de inicializar el estado reactivo y las opciones de la instancia**.

En este punto:

* `data`
* `computed`
* `methods`

Todavía **no están inicializados**, por lo que el acceso a la instancia es muy limitado.

Por esta razón, en proyectos modernos con Vue 3 este hook rara vez se utiliza. En la mayoría de casos aparece únicamente en **código legado o escenarios muy específicos relacionados con plugins o extensiones del framework**.

```vue [App.vue]{3-5}
<script>
export default {
  beforeCreate() {
    console.log('El componente está arrancando')
  }
}
</script>
```

## `created`: el punto útil en Options API

En el hook `created`, la instancia del componente ya está completamente inicializada en términos de **estado reactivo y métodos**, aunque el **DOM todavía no ha sido renderizado**.

Esto lo convierte en un buen lugar para:

* Inicializar estado derivado de configuración.
* Cargar datos de forma temprana.
* Preparar timers o listeners que no dependan del DOM.

```vue [App.vue]{8-10}
<script>
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    this.users = await fetch('/api/users').then((r) => r.json())
  }
}
</script>
```

## `setup`: el arranque natural en Vue 3

Cuando trabajas con **Composition API**, `setup()` es el verdadero punto de entrada del componente.

Dentro de `setup` defines:

* `ref`
* `reactive`
* `computed`
* `watch`
* composables

Además, `setup` se ejecuta **antes de que el componente sea montado**, por lo que permite preparar todo el estado que la vista necesitará en su primer render.

```vue [App.vue]{7}
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

console.log('setup ejecutado')
</script>

<template>
  <button @click="count++">
    count: {{ count }} / double: {{ double }}
  </button>
</template>
```

## Comparación rápida: `beforeCreate` vs `created` vs `setup`

| Punto          | API         | Qué ya tienes disponible                  | Cuándo elegirlo                          |
|----------------|-------------|-------------------------------------------|------------------------------------------|
| `beforeCreate` | Options     | Instancia en arranque temprano            | Casos muy puntuales o código legado      |
| `created`      | Options     | Estado y métodos disponibles, sin DOM     | Inicialización de datos o lógica sin DOM |
| `setup`        | Composition | Reactividad y composables desde el inicio | Opción principal en Vue 3 moderno        |

## Errores que se repiten con frecuencia

### 1) Intentar manipular el DOM en `created` o al inicio de `setup`

Ni `created` ni el inicio de `setup` garantizan que el DOM exista.

Si necesitas interactuar con elementos reales del DOM, debes usar:

* `mounted` (Options API)
* `onMounted` (Composition API)

### 2) Usar `beforeCreate` por costumbre

Muchos ejemplos antiguos de Vue lo utilizan, pero en Vue 3 **rara vez aporta ventajas reales** frente a `setup` (Composition API) o `created` (Options API).

### 3) Mezclar mentalmente Options API y Composition API

Vue permite combinar ambas API en un proyecto, pero dentro de un componente conviene **tener claro cuál es el punto de entrada principal**. Mezclar ambas sin un criterio claro puede terminar duplicando lógica de inicialización.

## Un ejemplo equivalente en ambos estilos

Supongamos que queremos **cargar usuarios cuando se crea el componente**, sin depender del DOM.

```vue [Composition API]
<script setup>
import { ref } from 'vue'

const users = ref([])

async function loadUsers() {
  users.value = await fetch('/api/users').then((r) => r.json())
}

// Se ejecuta durante setup (fase de creación)
loadUsers()
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    this.users = await fetch('/api/users').then((r) => r.json())
  }
}
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

## Cierre

* En componentes modernos basados en Vue 3, **`setup` suele ser el punto de entrada más claro y consistente** para inicializar estado y lógica.
* Si trabajas en componentes escritos con **Options API**, el hook **`created` sigue siendo completamente válido** para inicialización que no depende del DOM.
* En cambio, **`beforeCreate` ha quedado como una pieza más histórica que práctica** en la mayoría de proyectos actuales.
