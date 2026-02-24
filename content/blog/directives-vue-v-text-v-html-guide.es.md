---
title: "Directivas en Vue: v-text y v-html"
description: "Aprende cuándo usar v-text y v-html en Vue, diferencias clave, riesgos de seguridad, errores comunes y patrones recomendados con ejemplos en Composition API y Options API."
date: 2026-02-20T20:00:00-05:00
updatedAt: 2026-02-20T20:00:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Reactividad"
    color: "#1D5BA1"
draft: false
isNew: true
locale: es
author: TODOvue
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771635700/directives-vue-v-text-v-html-guide_n0cemz.png
coverAlt: "Ejemplo de uso de v-text y v-html en Vue.js"
coverCaption: "Aprende a usar v-text y v-html de forma segura y efectiva en tus proyectos Vue"
series: vue-directives
seriesOrder: 8
seriesTitle: "Directivas en Vue"
seriesDescription: "Ruta paso a paso para dominar las directivas principales de Vue."
keywords:
  - Vue.js
  - v-text
  - v-html
  - XSS
  - renderizado
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directivas en Vue: v-text y v-html"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-20T20:00:00-05:00"
---
# Directivas en Vue: `v-text` vs `v-html`

En Vue, `v-text` y `v-html` permiten renderizar contenido dinámico en el DOM, pero no hacen lo mismo ni implican el mismo nivel de riesgo.

* `v-text` inserta **texto plano**.
* `v-html` inserta **HTML interpretado por el navegador**.

> Entender esta diferencia es clave para evitar bugs de UI y, sobre todo, vulnerabilidades de seguridad como XSS.

## Por qué importa

En proyectos reales es habitual recibir contenido desde APIs, CMS o incluso formularios de usuario. Elegir incorrectamente entre `v-text` y `v-html` puede provocar:

* Diseños rotos por etiquetas inesperadas.
* Exposición a ataques XSS.
* Lógica de sanitización duplicada en múltiples componentes.
* Inconsistencias visuales difíciles de depurar.

> Tomar la decisión correcta desde el inicio mejora la seguridad, el mantenimiento y la coherencia del código.

## Concepto base

### `v-text`

Renderiza el valor como contenido textual del nodo (`textContent`).
Si el valor incluye etiquetas HTML, estas se muestran como texto literal, no se interpretan.

```vue [App.vue]
<p v-text="message"></p>
```

Es equivalente a la interpolación estándar:

```vue [App.vue]
<p>{{ message }}</p>
```

> En la práctica, la interpolación (`{{ }}`) es la forma más común y legible para texto dinámico.

### `v-html`

Renderiza el valor como HTML dentro del nodo (`innerHTML`).
Si el string contiene etiquetas, el navegador las procesa como parte del DOM.

```vue [App.vue]
<div v-html="htmlSnippet"></div>
```

Consideraciones importantes:

* `v-html` **no compila plantillas Vue** dentro del contenido inyectado.
* No enlaza directivas (`v-if`, `@click`, etc.).
* No debe utilizarse con contenido no confiable.
* El contenido inyectado queda fuera del scope del compilador de plantillas.

## Cuándo usar cada uno

### Usa `v-text` cuando:

* Renderizas texto dinámico simple y seguro.
* El contenido puede incluir `<` o `>` y necesitas que se muestren literalmente.
* No necesitas formato enriquecido.
* Quieres la opción más segura por defecto.

### Usa `v-html` cuando:

* Renderizas contenido HTML previamente sanitizado.
* El contenido proviene de un CMS controlado o backend confiable.
* Necesitas respetar formato enriquecido (`<strong>`, `<em>`, listas, enlaces, etc.).
* Existe una estrategia clara y centralizada de sanitización.

## Cuándo evitarlos

### Evita `v-text` cuando:

* Necesitas HTML real con formato enriquecido.

### Evita `v-html` cuando:

* El contenido proviene directamente de input de usuario sin sanitizar.
* No tienes una estrategia centralizada de sanitización.
* El mismo resultado puede lograrse con componentes explícitos (más seguro y mantenible).
* Puedes modelar la estructura con datos y renderizarla con `v-for` y componentes en lugar de inyectar HTML crudo.

## Errores comunes

### 1) Usar `v-html` con contenido no confiable

Incorrecto:

```vue [App.vue]
<div v-html="userBio"></div>
```

Si `userBio` no está sanitizado, puede inyectar `<script>`, atributos peligrosos (`onerror`, `onclick`) o URLs maliciosas.

### 2) Esperar que `v-html` procese directivas de Vue

Esto no funciona:

```js [main.js]
const html = '<button @click="save">Guardar</button>'
```

> Las directivas dentro de un string inyectado con `v-html` **no se compilan ni se enlazan** al contexto del componente.

### 3) Usar `v-html` “por flexibilidad”

Si solo necesitas texto, usa interpolación (`{{ }}`) o `v-text`.
Es más simple, más legible y más seguro.

### 4) Repetir la sanitización en cada componente

La sanitización debe vivir en una función, composable o utility centralizada.
Duplicarla en cada vista aumenta el riesgo de inconsistencias y errores.

## Ejemplos prácticos

### 1) Mensaje dinámico seguro (`v-text`)

```vue [App.vue]
<p class="status" v-text="statusMessage"></p>
```

### 2) Descripción enriquecida desde un CMS (`v-html` + sanitización previa)

```vue [App.vue]
<article class="prose" v-html="safeHtml"></article>
```

### 3) Fallback entre HTML permitido y texto plano

```vue [App.vue]
<div v-if="allowRichText" v-html="safeHtml"></div>
<p v-else v-text="plainText"></p>
```

## Ejemplo completo

```vue [Composition API]
<script setup lang="ts">
import { computed, ref } from "vue";

const allowRichText = ref(true);
const rawFromCms = ref("<h3>Novedades</h3><p><strong>Vue 3</strong> mejora DX.</p>");
const plainFallback = ref("Novedades: Vue 3 mejora DX.");

function sanitizeHtml(input: string) {
  // Placeholder: en producción usa una librería robusta como DOMPurify.
  return input.replace(/<script.*?>.*?<\/script>/gi, "");
}

const safeHtml = computed(() => sanitizeHtml(rawFromCms.value));
</script>

<template>
  <section>
    <h2>Contenido editorial</h2>

    <div v-if="allowRichText" class="prose" v-html="safeHtml"></div>
    <p v-else v-text="plainFallback"></p>
  </section>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      allowRichText: true,
      rawFromCms: "<h3>Novedades</h3><p><strong>Vue 3</strong> mejora DX.</p>",
      plainFallback: "Novedades: Vue 3 mejora DX.",
    };
  },
  computed: {
    safeHtml() {
      return this.sanitizeHtml(this.rawFromCms);
    },
  },
  methods: {
    sanitizeHtml(input) {
      // Placeholder: en producción usa una librería robusta como DOMPurify.
      return input.replace(/<script.*?>.*?<\/script>/gi, "");
    },
  },
};
</script>

<template>
  <section>
    <h2>Contenido editorial</h2>

    <div v-if="allowRichText" class="prose" v-html="safeHtml"></div>
    <p v-else v-text="plainFallback"></p>
  </section>
</template>
```

## Resumen

* `v-text` es para texto plano y es la opción por defecto cuando no necesitas HTML.
* La interpolación (`{{ }}`) suele ser más idiomática que `v-text`.
* `v-html` solo debe usarse con contenido confiable o previamente sanitizado.
* `v-html` no compila ni enlaza directivas Vue.
* Centraliza la sanitización en una capa clara (utility/composable).

> **Regla práctica:** si dudas, empieza con interpolación o `v-text`, y utiliza `v-html` únicamente cuando el caso de uso lo justifique explícitamente.
