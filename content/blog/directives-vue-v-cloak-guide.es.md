---
title: "Directivas en Vue: v-cloak"
description: "Aprende a usar v-cloak en Vue 3 para evitar el parpadeo de plantillas sin compilar, con Composition API y Options API, casos reales, errores comunes y buenas prácticas."
date: 2026-02-25T12:30:00-05:00
updatedAt: 2026-02-25T12:30:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Arquitectura"
    color: "#4CAF50"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771976009/directives-vue-v-cloak-guide_vhkz2i.png
coverAlt: "Portada temporal para el artículo sobre v-cloak en Vue"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
series: vue-directives
seriesOrder: 10
seriesTitle: "Directivas en Vue"
seriesDescription: "Ruta paso a paso para dominar las directivas principales de Vue."
author: TODOvue
keywords:
  - Vue.js
  - v-cloak
  - FOUC
  - hydration
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directiva v-cloak en Vue: evita parpadeos antes del montaje"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-25T12:30:00-05:00"
---
# Directivas en Vue: `v-cloak`

`v-cloak` resuelve un problema visual clásico en aplicaciones con **Vue**: el parpadeo de plantillas sin compilar (`{{ ... }}`) antes de que la instancia termine de montarse. Es una directiva simple, pero estratégica cuando te importa la percepción de calidad en la primera carga.

## Por qué importa

Si tu HTML inicial contiene expresiones de Vue, el navegador puede renderizarlas en crudo durante unos milisegundos, especialmente si el bundle aún no se ha descargado o ejecutado.
Ese “flash” degrada la experiencia y transmite sensación de inestabilidad.

`v-cloak` evita ese estado intermedio ocultando el contenido hasta que Vue haya completado el montaje y compilado el template.

**Beneficios directos:**

* El usuario no ve `{{ message }}` ni estructuras sin procesar.
* La carga inicial se percibe más limpia y profesional.
* Reduces ruido visual en landing pages, layouts estáticos o integraciones progresivas.

## Concepto clave

`v-cloak` funciona en conjunto con CSS.
Vue elimina automáticamente el atributo `v-cloak` del nodo cuando la instancia ha sido montada y el template compilado.

**Patrón típico:**

1. Añades una regla CSS global:
```css [style.css]
[v-cloak] {
 display: none;
}
```
2. Marcas el contenedor raíz (o el fragmento necesario) con `v-cloak`.
3. Mientras Vue no monta, el bloque permanece oculto.
4. Cuando Vue monta, elimina el atributo y el contenido aparece ya procesado.

> `v-cloak` no transforma datos ni agrega reactividad. Solo controla la visibilidad durante la fase previa al montaje (`before mount`).

## Consideraciones en Vue 3 y SSR

En aplicaciones con SSR (por ejemplo, usando **Nuxt 4**), el HTML ya llega compilado desde el servidor, por lo que normalmente no existe riesgo de mostrar interpolaciones en crudo.

En esos casos:

* `v-cloak` suele ser innecesario.
* No corrige problemas de hydration mismatch.
* No sustituye una estrategia adecuada de loading o streaming.

Su utilidad es mayor en:

* Integraciones progresivas sobre HTML existente.
* Aplicaciones SPA donde el bundle puede tardar en ejecutarse.
* Entornos donde el HTML inicial contiene marcadores Vue sin procesar.

## Cuándo usarlo

Usa `v-cloak` cuando:

* Sirves HTML inicial con plantillas Vue visibles (CMS, integración progresiva).
* La app tarda perceptiblemente en montar por tamaño del bundle o red lenta.
* Quieres blindar la primera impresión visual de componentes críticos (hero, login, pricing).

## Cuándo evitarlo

Evítalo cuando:

* No existe riesgo real de mostrar interpolaciones.
* Puedes resolver el estado inicial con skeletons o placeholders más ricos.
* Ocultar el contenedor completo afecta accesibilidad o continuidad visual.
* Estás en SSR donde el HTML ya llega procesado correctamente.

> `v-cloak` no es una estrategia de performance; es un ajuste de acabado visual.

## Errores comunes

### 1) Usar `v-cloak` sin CSS

Si no defines `[v-cloak] { display: none; }`, la directiva no tendrá efecto visible.

### 2) Declarar la regla en un `<style scoped>`

Si la regla vive en un `<style scoped>` de otro componente, no afectará al nodo marcado.
Declárala en estilos globales (por ejemplo, en `main.css` o en el layout raíz).

### 3) Ocultar demasiado contenido

Aplicar `v-cloak` al wrapper completo puede dejar la pantalla vacía durante el arranque.
En vistas complejas, úsalo solo en fragmentos donde exista riesgo real de parpadeo.

### 4) Esperar que resuelva hydration mismatches

`v-cloak` no corrige diferencias entre el HTML del servidor y el render del cliente.
Los hydration mismatches deben resolverse alineando la lógica de renderizado entre servidor y cliente.

## Ejemplos prácticos

### 1) Uso mínimo global

```css [style.css]
[v-cloak] {
  display: none;
}
```
> Con esa regla global, cualquier bloque marcado con `v-cloak` permanecerá oculto hasta que Vue elimine el atributo tras el montaje.

### 2) Hero con texto reactivo

```vue [Composition API] {8}
<script setup lang="ts">
import { ref } from "vue";

const headline = ref("Aprende Vue sin fricción");
</script>

<template>
  <section v-cloak class="hero">
    <h1>{{ headline }}</h1>
    <p>Guías prácticas para equipos frontend.</p>
  </section>
</template>
```
```vue [Options API] {12}
<script lang="ts">
export default {
  data() {
    return {
      headline: "Aprende Vue sin fricción",
    };
  },
};
</script>

<template>
  <section v-cloak class="hero">
    <h1>{{ headline }}</h1>
    <p>Guías prácticas para equipos frontend.</p>
  </section>
</template>
```
```css [style.css]{1-3}
[v-cloak] {
  display: none;
}

.hero {
  background: linear-gradient(135deg, #6C5CE7, #B173BF);
  color: white;
  padding: 2rem;
  border-radius: 8px;
}
```

### 3) Integración progresiva en HTML existente

Cuando montas Vue en una sección específica de una página legacy (por ejemplo, un bloque de login o un widget interactivo), `v-cloak` evita mostrar marcadores sin procesar durante el bootstrap inicial.

### 4) Ejemplo completo con estado asíncrono

```vue [Composition API]
<script setup lang="ts">
import { onMounted, ref } from "vue";

const user = ref<{ name: string } | null>(null);

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 350));
  user.value = { name: "Cristhian" };
});
</script>

<template>
  <aside v-cloak class="welcome-card">
    <h2>Panel</h2>
    <p v-if="user">Hola, {{ user.name }}</p>
    <p v-else>Cargando perfil...</p>
  </aside>
</template>
```
```vue [Options API]
<script lang="ts">
export default {
  name: "WelcomeCard",
  data() {
    return {
      user: null as null | { name: string },
    };
  },
  async mounted() {
    await new Promise((resolve) => setTimeout(resolve, 350));
    this.user = { name: "Cristhian" };
  },
};
</script>

<template>
  <aside v-cloak class="welcome-card">
    <h2>Panel</h2>
    <p v-if="user">Hola, {{ user.name }}</p>
    <p v-else>Cargando perfil...</p>
  </aside>
</template>
```
```css [style.css]
[v-cloak] {
  display: none;
}
```

## Resumen

`v-cloak` es una directiva de acabado visual: no modifica tu lógica ni tu modelo de reactividad, pero sí mejora la calidad percibida del render inicial en contextos donde el template puede mostrarse sin compilar.

**Puntos clave:**

* Requiere una regla CSS global: `[v-cloak] { display: none; }`.
* Previene el flash de interpolaciones sin procesar.
* No sustituye optimización de rendimiento ni resuelve hydration mismatches.
* Debe aplicarse de forma selectiva y consciente del contexto (SPA vs SSR).
