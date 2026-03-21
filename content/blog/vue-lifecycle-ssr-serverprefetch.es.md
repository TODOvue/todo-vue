---
title: "Ciclos de vida en Vue: renderizado del lado del servidor (serverPrefetch)"
description: "Cómo usar serverPrefetch y onServerPrefetch para cargar datos antes del render SSR, evitar HTML incompleto y coordinar el primer render del servidor con la hidratación del cliente."
date: 2026-03-20T20:00:00-05:00
updatedAt: 2026-03-20T20:00:00-05:00
readingTime: 8
tags:
  - tag: "Ciclo de Vida"
    color: "#FF6B6B"
  - tag: "SSR"
    color: "#0E9AA7"
  - tag: "Arquitectura"
    color: "#4CAF50"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Avanzado"
    color: "#F54927"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1774051488/vue-lifecycle-ssr-serverprefetch_averlr.png
coverAlt: "Ilustración de un servidor entregando HTML con datos ya resueltos, mientras un cliente hidrata sin necesidad de fetch adicional."
coverCaption: "Con `serverPrefetch`, el servidor puede entregar HTML ya completo, mejorando la experiencia y el SEO desde el primer render."
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 9
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - serverPrefetch
  - onServerPrefetch
  - SSR
  - hidratación
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: renderizado del lado del servidor (serverPrefetch)"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-20T20:00:00-05:00"
---
# Ciclos de vida en Vue: renderizado del lado del servidor (`serverPrefetch`)

Cuando una aplicación usa SSR (Server-Side Rendering), el primer render ya no ocurre únicamente en el navegador. El servidor genera el HTML antes de enviarlo y, si los datos importantes llegan tarde, el usuario recibe una página incompleta o poco útil hasta que el cliente vuelve a solicitarlos.

`serverPrefetch` existe precisamente para resolver ese momento. Permite esperar datos asíncronos antes de renderizar el componente en el servidor, de modo que el HTML inicial ya incluya contenido real y no dependa de esqueletos o placeholders que cambian durante la hidratación.

## Por qué esto importa

En SSR, la primera impresión depende del HTML generado en el servidor. Si un producto, un artículo o un resumen de dashboard se cargan solo después de montar el componente en el cliente, se pierden varias ventajas:

* El usuario ve menos contenido útil en el primer paint.
* El SEO recibe un documento más pobre.
* La hidratación puede sentirse inconsistente.
* Se duplica trabajo entre servidor y cliente.

`serverPrefetch` ayuda a que los datos críticos estén disponibles a tiempo para el render inicial. No sustituye toda la estrategia de obtención de datos, pero cubre muy bien la fase previa al render del servidor.

## Concepto clave

`serverPrefetch` (Options API) y `onServerPrefetch()` (Composition API) permiten registrar una función asíncrona que Vue resuelve **antes** de renderizar el componente en el servidor.

Flujo simplificado:

* El componente entra en el árbol SSR.
* Vue ejecuta el hook.
* Si el hook devuelve una promesa, el renderer espera.
* Cuando la promesa se resuelve, Vue genera el HTML con los datos disponibles.

Matices importantes:

* Solo se ejecuta durante **server-side rendering**.
* No reemplaza la carga en cliente cuando el componente aparece fuera del render inicial.
* En **Nuxt**, suele ser preferible usar `useAsyncData()` o `useFetch()`, ya que integran serialización, caché e hidratación automáticamente.

Puedes pensar en este hook como una herramienta de bajo nivel para SSR: útil cuando necesitas control fino dentro de un componente renderizado en servidor.

## Cuándo usarlo

`serverPrefetch` es adecuado cuando el contenido del HTML inicial es crítico:

* Páginas de producto con nombre, precio y disponibilidad.
* Artículos o contenido público que debe ser indexable y visible desde el inicio.
* Componentes que dependen del request actual antes de renderizar.

Regla práctica: si el dato debe existir **antes del render del servidor**, este hook es una buena opción.

## Cuándo evitarlo

No es recomendable usarlo como solución genérica para cualquier fetch.

Evítalo cuando:

* El componente solo se renderiza en cliente.
* La información no es crítica para el HTML inicial.
* Ya usas Nuxt y el caso encaja mejor en `useAsyncData()` o `useFetch()`.
* El fetch depende de API exclusivas del navegador.

Además, evita operaciones costosas o innecesarias: todo lo que ejecutes en `serverPrefetch` impacta directamente en el tiempo de respuesta del servidor.

## Errores comunes

### 1. Asumir que también se ejecuta en navegación cliente

`serverPrefetch` no sustituye `mounted` ni una estrategia completa de carga de datos. Si el componente se renderiza solo en cliente, este hook no se ejecuta.

Solución: añadir un fallback en `onMounted()` o `mounted()` cuando los datos no estén disponibles.

### 2. Usar API del navegador

Durante SSR no existen `window`, `document` ni `localStorage`. El código dentro de `serverPrefetch` debe ser seguro para ejecutarse en servidor.

### 3. Duplicar el fetch innecesariamente

Si el servidor ya obtuvo los datos, no tiene sentido repetir la petición en cliente.

Solución: comprobar si el estado ya existe antes de hacer el fetch en `mounted`.

### 4. Sobrecargar componentes profundos

Multiplicar `serverPrefetch` en muchos componentes puede aumentar el tiempo de respuesta y dificultar el flujo de datos.

Distribuye responsabilidades: página, layout y componentes deben tener roles claros.

## Ejemplo práctico

```vue [Composition API]
<script setup lang="ts">
import { onMounted, onServerPrefetch, ref } from 'vue'

type Product = {
  id: number
  name: string
  price: number
  stock: number
}

const product = ref<Product | null>(null)
const errorMessage = ref('')

async function fetchProduct() {
  const response = await fetch('https://api.example.com/products/42')

  if (!response.ok) {
    throw new Error('No fue posible cargar el producto.')
  }

  product.value = (await response.json()) as Product
}

onServerPrefetch(async () => {
  try {
    await fetchProduct()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Error inesperado en SSR.'
  }
})

onMounted(async () => {
  if (product.value || errorMessage.value) return

  try {
    await fetchProduct()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Error inesperado en cliente.'
  }
})
</script>

<template>
  <article class="product-card">
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <template v-else-if="product">
      <h1>{{ product.name }}</h1>
      <p>Precio: {{ product.price }} USD</p>
      <p>Stock: {{ product.stock }}</p>
    </template>

    <p v-else>Cargando producto...</p>
  </article>
</template>
```
```vue [Options API]
<script lang="ts">
import { defineComponent } from 'vue'

type Product = {
  id: number
  name: string
  price: number
  stock: number
}

export default defineComponent({
  name: 'ProductCardSsr',

  data() {
    return {
      product: null as Product | null,
      errorMessage: ''
    }
  },

  methods: {
    async fetchProduct() {
      const response = await fetch('https://api.example.com/products/42')

      if (!response.ok) {
        throw new Error('No fue posible cargar el producto.')
      }

      this.product = (await response.json()) as Product
    }
  },

  async serverPrefetch() {
    try {
      await this.fetchProduct()
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Error inesperado en SSR.'
    }
  },

  async mounted() {
    if (this.product || this.errorMessage) return

    try {
      await this.fetchProduct()
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Error inesperado en cliente.'
    }
  }
})
</script>

<template>
  <article class="product-card">
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <template v-else-if="product">
      <h1>{{ product.name }}</h1>
      <p>Precio: {{ product.price }} USD</p>
      <p>Stock: {{ product.stock }}</p>
    </template>

    <p v-else>Cargando producto...</p>
  </article>
</template>
```

Este patrón permite que el servidor entregue el contenido resuelto en la primera carga. Si el componente se renderiza posteriormente en una navegación cliente, `onMounted()` actúa como fallback sin duplicar la petición.

Esta versión mantiene la misma intención: resolver los datos antes del render SSR y usar `mounted` como respaldo en escenarios donde no hay estado previo.

## Resumen

`serverPrefetch` permite adelantar datos críticos al render del servidor y generar HTML útil desde la primera respuesta. Su valor está en mejorar el primer render, no en reemplazar toda la estrategia de fetching.

En Vue SSR “manual”, es una herramienta precisa y potente. En Nuxt, suele ser preferible usar utilidades de más alto nivel. En ambos casos, la idea clave es la misma: el contenido importante debe estar listo antes de renderizar la página inicial.
