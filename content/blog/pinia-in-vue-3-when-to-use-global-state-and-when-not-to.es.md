---
title: "Pinia en Vue 3: cuándo usar estado global y cuándo no"
description: "Aprende a decidir si un dato debe vivir en un componente, un subárbol o una store de Pinia según sus consumidores, duración y lógica compartida."
date: 2026-07-24T23:20:00-05:00
updatedAt: 2026-07-26T00:00:00-05:00
draft: false
locale: es
author: TODOvue
series: vue-3-architecture
seriesOrder: 6
seriesTitle: "Arquitectura de aplicaciones en Vue 3"
seriesDescription: "Serie práctica para diseñar aplicaciones Vue 3 mantenibles mediante comunicación clara entre componentes, lógica reutilizable, dependencias acotadas y una gestión intencional del estado."
tags:
  - tag: "Gestión de Estado"
    color: "#FF9800"
  - tag: "Arquitectura"
    color: "#4CAF50"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "SSR"
    color: "#0E9AA7"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1784941922/pinia-in-vue-3-when-to-use-global-state-and-when-not-to_aztyma.png
coverAlt: "Diagrama de decisión para elegir entre estado local, props y eventos, composables o Pinia en Vue 3."
coverCaption: "Referencia visual para decidir el alcance del estado en Vue 3."
keywords:
  - State
  - Pinia
  - Vue 3
  - Gestión de Estado
  - Arquitectura
  - Composables
schemaOrg:
  - type: "BlogPosting"
    headline: "Pinia en Vue 3: cuándo usar estado global y cuándo no"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: 2026-07-24T23:20:00-05:00
---

# Pinia en Vue 3: cuándo usar estado global y cuándo no

Pinia no vuelve escalable una aplicación por sí sola. Una store mal elegida puede ocultar quién posee un dato y convertir una relación sencilla entre componentes en una dependencia global.

La decisión empieza antes de escoger una herramienta: identifica quién consume el estado, quién lo modifica y cuánto tiempo debe vivir. Con esos criterios, Pinia se convierte en una frontera útil cuando el alcance realmente es global.

## Antes de elegir Pinia: define el alcance del estado

Cada instancia de componente ya tiene estado reactivo propio. El estado compartido importa cuando varios componentes o vistas dependen del mismo dato, o cuando distintas acciones deben coordinar sus cambios.

Antes de crear una store, pregunta:

- ¿Un único componente posee este dato?
- ¿Solo lo coordinan componentes de una pantalla o subárbol?
- ¿Debe sobrevivir a una navegación?
- ¿Su cambio representa una operación de negocio reconocible?

Pinia es consecuencia de esas respuestas, no el punto de partida.

## Mapa de decisión: local, subárbol o global

| Situación                                  | Alcance recomendado                     | Ejemplo                      |
|--------------------------------------------|-----------------------------------------|------------------------------|
| Un control visual de un componente         | Estado local con `ref()` o `reactive()` | Abrir un modal de una página |
| Varios descendientes de una pantalla       | Ancestro común con props y eventos      | Filtros de catálogo          |
| Comportamiento reutilizable por instancia  | Composable con estado local por uso     | Lógica de búsqueda           |
| Datos y lógica entre componentes o páginas | Store de Pinia                          | Sesión en la navegación      |
| Proceso que continúa entre rutas           | Store de Pinia                          | Checkout multipágina         |

Un composable concentra comportamiento reutilizable, pero no vuelve global su estado automáticamente. Decide por separado si cada uso necesita una instancia propia o si la aplicación requiere una fuente compartida.

## Cuándo props y eventos son más claros que una store

En una relación padre-hijo, los props y eventos mantienen el flujo explícito: el padre entrega datos y el hijo comunica una intención. El hijo no debe mutar un prop.

Aquí los filtros pertenecen a la pantalla de catálogo. El ancestro conserva el estado y el control descendiente solicita el cambio; ninguna otra ruta necesita conocerlo.

```vue [CatalogPage.vue] {4,14}
<script setup>
import { ref } from 'vue'

const selectedCategory = ref('all')

function selectCategory(category) {
  selectedCategory.value = category
}
</script>

<template>
  <CategoryFilters
    :selected-category="selectedCategory"
    @select-category="selectCategory"
  />
</template>
```

```vue [CategoryFilters.vue] {9}
<script setup>
defineProps({
  selectedCategory: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['select-category'])
</script>

<template>
  <button
    type="button"
    :aria-pressed="selectedCategory === 'books'"
    @click="emit('select-category', 'books')"
  >
    Books
  </button>
</template>
```

El padre declara el propietario real del estado y el hijo emite una intención sin modificar el prop. Si demasiados niveles intermedios vuelven incómodo el árbol, revisa el diseño y el alcance: el prop drilling es una señal para evaluar alternativas, no una orden automática de globalizar.

## Cuándo Pinia sí gana su lugar

Una store de Pinia organiza estado y lógica de negocio fuera del árbol de componentes mediante `state`, getters y actions. Encaja cuando varias partes de la aplicación necesitan la misma fuente de verdad, como una sesión visible en navegación y páginas protegidas, o un formulario complejo que continúa entre páginas.

Una store pequeña debe tener una responsabilidad concreta. En una Option Store, declara todas las propiedades desde `state()`; no las agregues después.

```ts [stores/session.ts] {6-8,11,15-17}
import { defineStore } from 'pinia'

type SessionUser = { id: string; name: string }

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: undefined as SessionUser | undefined,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== undefined,
  },

  actions: {
    setUser(user: SessionUser) {
      this.user = user
    },
    clearSession() {
      this.user = undefined
    },
  },
})
```

`user` es estado almacenado e `isAuthenticated` es estado derivado, por lo que no se duplica como dato mutable. Las actions nombran operaciones de sesión y hacen más fácil localizar por qué cambia el estado compartido. Esto no implica que una action prohíba por sí misma toda mutación directa: la claridad proviene de aplicar y respetar esa frontera.

No uses esta store para la visibilidad de un tooltip o de un modal que solo existe en una página. Ese detalle pertenece al componente o, como máximo, a su pantalla.

## Estado compartido simple y composables: alternativas con límites

Para un caso sencillo de una SPA, Vue permite compartir un objeto `reactive()` importado por varios componentes. El límite importante es el de modificación: si cualquier consumidor escribe cualquier propiedad, el diseño pierde trazabilidad.

```ts [catalogFilters.ts] {5-7}
import { reactive } from 'vue'

export const catalogFilters = reactive({
  category: 'all',
  setCategory(category: string) {
    this.category = category
  },
})
```

Centralizar el cambio en `setCategory()` comunica qué operación ocurre. Evalúa Pinia cuando el estado crece o cuando necesitas convenciones de colaboración, integración con DevTools, HMR o una frontera SSR más robusta.

## SSR: no compartas estado entre solicitudes

En renderizado del lado del servidor, un singleton reactivo creado en ámbito de módulo puede compartir estado entre solicitudes. El aislamiento debe respetar la instancia de cada aplicación.

Pinia trabaja con la instancia de Pinia correspondiente. Si utilizas una store fuera de un componente, hazlo cuando esa instancia esté disponible y usa la asociada a la aplicación actual. Es una regla de aislamiento, no una receta de un framework concreto.

## Errores comunes y una regla práctica

Evita globalizar cada variable reactiva, sustituir props y eventos en una relación padre-hijo sencilla, guardar detalles visuales efímeros de una página en una store, permitir mutaciones compartidas sin una operación con intención clara y crear un singleton manual para SSR.

La regla práctica es empezar con el alcance más pequeño que represente honestamente la propiedad del dato. Amplíalo cuando los consumidores, la duración entre páginas o la lógica de coordinación lo exijan. Pinia aporta valor cuando hace explícita una frontera global real.
