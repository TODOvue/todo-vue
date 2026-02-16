---
title: "Directivas en Vue: v-if, v-else y v-show"
description: "Aprende a usar v-if, v-else y v-show en Vue con ejemplos claros, buenas prácticas y notas clave para elegir correctamente entre renderizado condicional y visibilidad."
date: 2026-02-05T12:30:00-05:00
updatedAt: 2026-02-05T12:30:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Renderizado Condicional"
    color: "#E056FD"
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Guías"
    color: "#42B983"
  - tag: "Reactividad"
    color: "#1D5BA1"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771265982/directives-vue-v-if-v-else-v-show-guide_qmtjik.png
coverAlt: "Ilustración conceptual del renderizado condicional en Vue.js"
coverCaption: "Renderizado condicional en Vue.js ilustrado por TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-if
  - v-else
  - v-show
  - conditional rendering
  - directives
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "v-if, v-else y v-show en Vue: cuándo usar cada uno"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-05T12:30:00-05:00"
---
# `v-if`, `v-else` y `v-show` en Vue: cuándo usar cada una

Las directivas `v-if`, `v-else` y `v-show` sirven para **mostrar u ocultar contenido** en función de una condición reactiva.
La diferencia clave —la que evita bugs sutiles y problemas de rendimiento— es esta:

* **`v-if` / `v-else`**: *crean o destruyen* elementos del DOM.
* **`v-show`**: *no destruye nada*; solo alterna `display: none`.

Si lo piensas como **“¿Esto existe?”** vs **“¿Esto se ve?”**, ya vas por buen camino.

## Qué hace cada una

### `v-if`

Renderiza el elemento **solo si** la condición es `true`.
Si es `false`, el elemento **no existe en el DOM**.

**Útil cuando:**

* El contenido es pesado (componentes grandes, listas, gráficos)
* No debería existir si no se cumple la condición (permisos de UI, flujos sensibles)
* Se muestra pocas veces u ocasionalmente

> `v-if` tiene un costo mayor al alternar, porque implica **montaje y desmontaje** del árbol de componentes.

### `v-else` y `v-else-if`

Se usan **inmediatamente después** de un `v-if` o `v-else-if`.

Reglas importantes:

* Deben estar **adyacentes** (sin nodos intermedios).
* Vue los interpreta como **un único bloque condicional**.

### `v-show`

El elemento **siempre se renderiza** (existe en el DOM), pero se muestra u oculta con CSS.

**Útil cuando:**

* La visibilidad cambia con frecuencia (toggles, menús, paneles)
* Quieres evitar el costo de montar/desmontar

> `v-show` **no funciona con `<template>`**, porque no es un elemento real. 
El contenido sigue en el DOM: foco, tab order y accesibilidad pueden verse afectados si no se gestiona bien.

## Resumen rápido: cuál usar

* Usa **`v-if`** cuando el contenido **no debe existir** si la condición no se cumple.
* Usa **`v-show`** cuando el contenido **solo debe ocultarse** y el toggle será **frecuente**.
* Usa **`v-else`** para el caso alternativo inmediato de un `v-if`.

## Ejemplo 1: Login (`v-if` + `v-else`)

Cuando una persona está autenticada, muestras el panel; si no, un CTA para iniciar sesión.

```vue [Composition API]{7,16,21}
<script setup>
import { ref } from "vue";

const isLoggedIn = ref(false);

function toggleLogin() {
  isLoggedIn.value = !isLoggedIn.value;
}
</script>

<template>
  <button @click="toggleLogin">
    {{ isLoggedIn ? "Log out" : "Log in" }}
  </button>

  <section v-if="isLoggedIn">
    <h2>Welcome back</h2>
    <p>You have access to your dashboard.</p>
  </section>

  <section v-else>
    <h2>Please log in</h2>
    <p>You need an account to continue.</p>
  </section>
</template>
```
```vue [Options API]{10,21,26}
<script>
export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  methods: {
    toggleLogin() {
      this.isLoggedIn = !this.isLoggedIn;
    },
  },
};
</script>

<template>
  <button @click="toggleLogin">
    {{ isLoggedIn ? "Log out" : "Log in" }}
  </button>

  <section v-if="isLoggedIn">
    <h2>Welcome back</h2>
    <p>You have access to your dashboard.</p>
  </section>

  <section v-else>
    <h2>Please log in</h2>
    <p>You need an account to continue.</p>
  </section>
</template>
```
> El `<section v-else>` debe ir **justo después** del `v-if`.
Si intercalas un comentario, un `<div>` u otro nodo, Vue deja de asociarlo como `else`.

## Ejemplo 2: Tabs o panel que se abre y cierra (`v-show`)

Un panel de filtros que el usuario abre y cierra constantemente. Aquí **`v-show`** es ideal.

```vue [Composition API]{4,12}
<script setup>
import { ref } from "vue";

const isOpen = ref(false);
</script>

<template>
  <button @click="isOpen = !isOpen">
    {{ isOpen ? "Hide filters" : "Show filters" }}
  </button>

  <aside v-show="isOpen" class="filters">
    <h3>Filters</h3>
    <label>
      <input type="checkbox" />
      Only available items
    </label>
  </aside>
</template>
```
```vue [Options API]{5,16}
<script>
export default {
  data() {
    return {
      isOpen: false,
    };
  },
};
</script>

<template>
  <button @click="isOpen = !isOpen">
    {{ isOpen ? "Hide filters" : "Show filters" }}
  </button>

  <aside v-show="isOpen" class="filters">
    <h3>Filters</h3>
    <label>
      <input type="checkbox" />
      Only available items
    </label>
  </aside>
</template>
```

### Nota de UX y accesibilidad

Como el panel **sigue existiendo**, sus elementos interactivos pueden:

* Conservar estado
* Conservar foco (a veces deseable, a veces no)
* Seguir siendo accesibles para lectores de pantalla si no se manejan roles/ARIA

Si el contenido **no debería existir** en absoluto, usa `v-if`.

## `v-else-if`: múltiples estados (sin anidar `if` innecesarios)

Un patrón común: *loading*, *error* y *success*.

```vue [Composition API]{4,13-16}
<script setup>
import { ref } from "vue";

const status = ref("idle"); // "idle" | "loading" | "error" | "success"
</script>

<template>
  <button @click="status = 'loading'">Simulate loading</button>
  <button @click="status = 'error'">Simulate error</button>
  <button @click="status = 'success'">Simulate success</button>
  <button @click="status = 'idle'">Reset</button>

  <p v-if="status === 'loading'">Loading...</p>
  <p v-else-if="status === 'error'">Something went wrong.</p>
  <p v-else-if="status === 'success'">Done!</p>
  <p v-else>Idle. Click a button.</p>
</template>
```
```vue [Options API]{5,17-20}
<script>
export default {
  data() {
    return {
      status: "idle", // "idle" | "loading" | "error" | "success"
    };
  },
};
</script>

<template>
  <button @click="status = 'loading'">Simulate loading</button>
  <button @click="status = 'error'">Simulate error</button>
  <button @click="status = 'success'">Simulate success</button>
  <button @click="status = 'idle'">Reset</button>

  <p v-if="status === 'loading'">Loading...</p>
  <p v-else-if="status === 'error'">Something went wrong.</p>
  <p v-else-if="status === 'success'">Done!</p>
  <p v-else>Idle. Click a button.</p>
</template>
```

## Errores comunes

### 1) `v-else` separado del `v-if`

Incorrecto:

```vue [App.vue]{2}
<div v-if="ok">Ok</div>
<!-- comentario o nodo -->
<div v-else>No ok</div>
```

> El `v-else` debe ir **inmediatamente** después del `v-if`.

### 2) Usar `v-show` para contenido que no debería existir

Si ocultas con `v-show` algo como un *admin panel*, **sigue en el DOM**.
No es seguridad; es solo presentación. La seguridad va en el backend, pero en la UI al menos usa `v-if`.

### 3) Pensar que `v-if` es “gratis”

Alternar `v-if` muchas veces implica **montajes y desmontajes repetidos**.
Si el usuario va a abrir y cerrar algo constantemente, `v-show` suele ser mejor opción.

## Conclusión

* **`v-if`**: controla la **existencia real** del elemento.
* **`v-else / v-else-if`**: ramas alternativas del mismo bloque condicional.
* **`v-show`**: ocultar/mostrar rápido con CSS, sin destruir el DOM.

> Una UI se vuelve más clara cuando decides conscientemente:
> **¿Quiero que esto exista o solo que se vea?**
