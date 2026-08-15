---
title: 'useFetch vs useAsyncData vs $fetch en Nuxt 4'
description: 'Aprende a elegir entre useFetch, useAsyncData y $fetch en Nuxt 4 según el tipo de carga, el flujo SSR, el payload, la reactividad y la propiedad del estado con Pinia.'
date: 2026-08-14T21:30:00-05:00
updatedAt: 2026-08-14T21:30:00-05:00
draft: false
locale: es
author: TODOvue
tags:
  - tag: 'Guías'
    color: '#42B983'
  - tag: 'SSR'
    color: '#0E9AA7'
  - tag: 'Composables'
    color: '#14B8A6'
  - tag: 'Reactividad'
    color: '#1D5BA1'
  - tag: 'Gestión de Estado'
    color: '#FF9800'
  - tag: 'Buenas Prácticas'
    color: '#2196F3'
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1786757439/nuxt-4-usefetch-useasyncdata-dollarfetch-ssr_bhosyq.png
coverAlt: 'Comparación visual entre useFetch, useAsyncData y $fetch en Nuxt 4 para SSR, payload e hidratación.'
coverCaption: 'Guía visual para elegir la API de datos adecuada en Nuxt 4.'
keywords:
  - 'useFetch vs useAsyncData vs $fetch'
  - 'Nuxt 4 SSR'
  - 'payload de Nuxt'
  - 'hidratación en Nuxt'
  - 'peticiones duplicadas'
  - 'Pinia en Nuxt'
schemaOrg:
  - type: 'BlogPosting'
    headline: 'useFetch vs useAsyncData vs $fetch en Nuxt 4'
    author:
      type: 'Person'
      name: 'TODOvue'
    datePublished: 2026-08-14T21:30:00-05:00
lab:
  title: 'Laboratorio: diagnosticar y corregir una carga duplicada'
  goal: 'Identifica por qué una lectura inicial puede repetirse durante la hidratación y decide si corresponde usar useFetch, useAsyncData o $fetch, con una identidad de datos y una propiedad de estado coherentes.'
  tasks:
    - 'Explica qué ocurre con la llamada directa a $fetch durante SSR y por qué puede repetirse durante la hidratación.'
    - 'Haz que la URL o la clave representen la categoría y elimina la observación redundante.'
    - 'Decide si la lectura debe permanecer en un composable o si existe estado compartido y comportamiento de dominio que justifiquen Pinia.'
    - 'Define qué estrategia aplicarías después de una mutación: refresh(), invalidación por clave o actualización intencional de la store.'
  starterCode: |
    <script setup lang='ts'>
    import { computed, ref, watch } from 'vue'

    interface CatalogItem {
      id: string
      name: string
    }

    const route = useRoute()
    const category = computed(() => String(route.params.category))
    const items = await $fetch<CatalogItem[]>('/api/catalog')
    const staticKey = 'catalog'
    const storeItems = ref<CatalogItem[]>([])

    watch(category, async () => {
      storeItems.value = await $fetch<CatalogItem[]>('/api/catalog')
    })
    </script>

    <template>
      <p>{{ staticKey }}</p>
      <ul>
        <li v-for='item in items' :key='item.id'>{{ item.name }}</li>
      </ul>
    </template>
  solutionHint: 'El fragmento no usa un composable de datos, ignora category en la URL, mantiene una clave local sin efecto sobre Nuxt y conserva un ref local que no es una store de Pinia. Corrige cada problema por separado y justifica la política posterior a la mutación.'
---

# useFetch vs useAsyncData vs $fetch en Nuxt 4

Elegir una API de datos en Nuxt 4 no consiste solo en decidir cómo hacer una petición HTTP. La misma página puede ejecutarse en el servidor, llegar al navegador, hidratarse y volver a cargarse durante una navegación del cliente. Si no distingues esos momentos, una llamada correcta puede repetirse durante la hidratación o quedar desconectada del estado que realmente necesita tu aplicación.

La regla práctica es esta: empieza con `useFetch` para lecturas de una URL que pertenecen a una vista; elige `useAsyncData` cuando el trabajo asíncrono necesita composición o control adicional; reserva `$fetch` para comandos iniciados por eventos o úsalo dentro de un handler. Después decide explícitamente qué identifica el dato, si la navegación debe esperar y quién es propietario del estado.

## La decisión rápida: qué responsabilidad tiene cada API

| API          | Responsabilidad principal                    | SSR y payload                                                       | Reactividad                                                      | Caso habitual                                                     |
|--------------|----------------------------------------------|---------------------------------------------------------------------|------------------------------------------------------------------|-------------------------------------------------------------------|
| useFetch     | Obtener una URL con configuración compacta   | Es compatible con SSR y transfiere el resultado mediante el payload | La URL y algunas opciones reactivas pueden activar nuevas cargas | Lectura inicial de una página o ruta dinámica                     |
| useAsyncData | Coordinar un handler asíncrono personalizado | Es compatible con SSR y conserva el resultado para la hidratación   | La clave y las dependencias pueden controlar las actualizaciones | Varias peticiones, SDKs, clientes alternativos o transformaciones |
| $fetch       | Ejecutar una petición HTTP                   | No transfiere por sí solo el resultado SSR al cliente               | No crea automáticamente refs de datos, error y estado            | Submit, click, mutación o implementación de un handler            |

`useFetch` combina `useAsyncData` y `$fetch`. Por eso suele ser la primera opción cuando la pregunta es “¿qué URL necesita esta vista?”. `useAsyncData` expresa mejor la pregunta “¿qué trabajo asíncrono debe resolver esta unidad de datos?”. `$fetch` ejecuta la petición, pero no decide cómo conservar su resultado entre servidor e hidratación.

## Qué ocurre en SSR, el payload y la hidratación

Para una lectura inicial con `useFetch` o `useAsyncData`, el recorrido conceptual es:

`servidor → nuxtApp.payload.data → cliente hidratado`

Nuxt puede esperar el resultado durante SSR antes de serializar la página, incluso si no escribes `await` delante del composable. `await` sí controla cuándo continúa el `setup` actual y, durante una navegación del cliente, si la navegación espera a que lleguen los datos.

El resultado se almacena en `nuxtApp.payload.data`. Durante la hidratación, Nuxt puede reutilizar ese valor en lugar de repetir la petición inicial. El payload de `useAsyncData` usa `devalue`, mientras que las respuestas de rutas server tienen las limitaciones de `JSON.stringify`; son mecanismos de serialización distintos.

Con `$fetch` directo, el flujo puede ser diferente:

`SSR: $fetch → HTML`

`hidratación: $fetch otra vez → cliente`

Una ruta interna puede resolverse directamente durante SSR sin una vuelta HTTP adicional. Eso mejora ese paso concreto, pero no convierte a `$fetch` en un mecanismo de payload. Si usas `$fetch` en el nivel superior de un componente universal para datos iniciales, la carga puede ejecutarse otra vez durante la hidratación.

```vue [ProductPage.vue] {7}
<script setup lang='ts'>
interface Product {
  id: string
  name: string
}

const products = await $fetch<Product[]>('/api/products')
</script>

<template>
  <ul>
    <li v-for='product in products' :key='product.id'>
      {{ product.name }}
    </li>
  </ul>
</template>
```

Este ejemplo es válido como llamada HTTP, pero no conserva automáticamente el resultado SSR en el payload de Nuxt. Para una lectura inicial, `useFetch` o `useAsyncData` expresan mejor la intención.

El payload tampoco es automáticamente una caché permanente entre navegaciones. `useNuxtData` sirve para leer reactivamente un valor cacheado cuando existe una clave explícita. `getCachedData` participa en la decisión de obtener un valor cacheado. En cambio, `transform` y `pick` moldean o reducen el resultado que se expone y se añade al payload; no evitan que la respuesta completa se obtenga inicialmente desde la API. La invalidación o recarga posterior pertenece a otra decisión, como `refresh()` o una política explícita por clave.

## useFetch: la opción natural para lecturas basadas en URL

`useFetch` es apropiado cuando la unidad de datos se describe principalmente mediante una URL y sus opciones. Combina las dos primitivas subyacentes, genera una clave y puede ofrecer inferencia de tipos cuando la URL corresponde a una ruta del servidor de la aplicación.

En rutas dinámicas, la identidad real del dato debe aparecer en la URL o en una clave explícita. Los parámetros de ruta, el idioma y los filtros no deberían quedar ocultos detrás de una clave estática.

```vue [CatalogPage.vue] {11-14,16-18}
<script setup lang='ts'>
import { computed, ref } from 'vue'

interface CatalogItem {
  id: string
  name: string
}

const route = useRoute()
const locale = ref('en')
const requestUrl = computed(() => {
  const category = encodeURIComponent(String(route.params.category))
  return `/api/catalog/${category}`
})

const { data: items, status, error } = await useFetch<CatalogItem[]>(requestUrl, {
  query: computed(() => ({ locale: locale.value }))
})
</script>

<template>
  <p v-if='status === "pending"'>Loading catalog...</p>
  <p v-else-if='error'>Could not load the catalog.</p>
  <ul v-else>
    <li v-for='item in items ?? []' :key='item.id'>
      {{ item.name }}
    </li>
  </ul>
</template>
```

La URL y la opción `query` son reactivas. Cuando cambia la categoría o el idioma, `useFetch` puede volver a solicitar los datos. No añadas un `watch` y un `refresh` manuales para repetir el mismo mecanismo. Usa `watch: false` solo cuando quieras desactivar explícitamente la observación automática.

Durante SSR, una URL relativa puede usar el contexto de la petición mediante `useRequestFetch`. Esto permite reenviar cookies y cabeceras permitidas, pero no significa que debas reenviar cualquier cabecera recibida. Las cabeceras sensibles o no apropiadas deben permanecer fuera de ese flujo.

## useAsyncData: cuando el trabajo no es solo una URL

`useAsyncData` ofrece un handler para expresar una operación asíncrona personalizada. Es la opción adecuada cuando necesitas combinar varias peticiones, consumir un SDK, usar un cliente distinto de `$fetch` o transformar el resultado antes de exponerlo a la vista.

```vue [DashboardPage.vue] {12-19}
<script setup lang='ts'>
interface Profile {
  id: string
  name: string
}

interface Notification {
  id: string
  message: string
}

const { data: dashboard, status, error } = await useAsyncData('dashboard', async () => {
  const [profile, notifications] = await Promise.all([
    $fetch<Profile>('/api/profile'),
    $fetch<Notification[]>('/api/notifications')
  ])

  return { profile, notifications }
})
</script>

<template>
  <p v-if='status === "pending"'>Loading dashboard...</p>
  <p v-else-if='error'>Could not load the dashboard.</p>
  <section v-else-if='dashboard'>
    <h2>{{ dashboard.profile.name }}</h2>
    <ul>
      <li v-for='notification in dashboard.notifications' :key='notification.id'>
        {{ notification.message }}
      </li>
    </ul>
  </section>
</template>
```

El ejemplo presupone endpoints públicos. Si los datos dependen de cookies, autenticación o cabeceras de la petición entrante, establece explícitamente un cliente adecuado o aplica el flujo request-aware de `useRequestFetch` para las URLs relativas durante SSR. No atribuyas a `$fetch` una propagación automática que el ejemplo no demuestra.

La clave `dashboard` identifica esta unidad de datos. Si varias llamadas comparten una clave, comparten las refs de `data`, `error` y `status`; por eso las opciones estructurales —como `handler`, `deep`, `transform`, `pick`, `getCachedData` y `default`— deben ser coherentes entre esas llamadas.

El handler debe ser predecible, devolver un valor válido y evitar efectos secundarios. No es el lugar para ejecutar acciones de Pinia, mostrar notificaciones o modificar otro estado de dominio. Para esas acciones existe un flujo separado, como `callOnce` cuando necesitas esperar una acción de una store sin repetir innecesariamente su carga.

`useAsyncData` también ofrece mecanismos relacionados con la concurrencia, como una señal abortable y opciones de deduplicación. Ayudan a coordinar cargas simultáneas, pero no sustituyen una política de invalidación después de una mutación.

## $fetch: comandos, interacciones y construcción de handlers

`$fetch` encaja de forma natural en una acción iniciada por la persona usuaria: enviar un formulario, archivar un registro o ejecutar un comando al pulsar un botón. En ese momento estás cambiando algo y después debes decidir cómo actualizar la lectura.

```vue [ArchiveButton.vue] {15-23}
<script setup lang='ts'>
import { ref } from 'vue'

const props = defineProps<{
  productId: string
}>()

const saving = ref(false)
const message = ref('')

async function archiveProduct() {
  saving.value = true
  message.value = ''

  try {
    await $fetch(`/api/products/${props.productId}`, {
      method: 'POST'
    })
    message.value = 'Product archived.'
  } catch {
    message.value = 'Could not archive the product.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <button type='button' :disabled='saving' @click='archiveProduct'>
    {{ saving ? 'Archiving...' : 'Archive product' }}
  </button>
  <p v-if='message'>{{ message }}</p>
</template>
```

Este bloque demuestra el comando y el feedback local; no pretende demostrar por sí mismo `refresh()`, una invalidación por clave ni una actualización de Pinia. En una implementación final, la región de mensaje debe anunciar los cambios con una semántica accesible, por ejemplo mediante `aria-live`, y distinguir los mensajes de error de los informativos.

Después de la mutación, separa dos decisiones: cómo confirmar el resultado en la interfaz y quién posee el estado actualizado. Puedes llamar a `refresh()` sobre una lectura existente, invalidar o volver a cargar por una clave, o actualizar intencionalmente una store de Pinia. La elección depende de la política de consistencia de tu aplicación.

También puedes usar `$fetch` dentro de un handler de `useAsyncData`. En ese caso, `useAsyncData` conserva la integración SSR y el payload, mientras `$fetch` queda como la implementación HTTP del handler.

## Reactividad, espera y estados de carga

`await` y la reactividad resuelven problemas distintos. `await` decide cuándo continúa el `setup` y si una navegación cliente espera. Las dependencias reactivas deciden cuándo puede cambiar la identidad de la carga y activarse una nueva petición.

La API devuelve refs como `data`, `error` y `status`. Esas refs participan en el modelo de reactividad de Vue: la plantilla se actualiza cuando cambia su valor. No confundas esa reactividad con una política de caché. Que una URL sea reactiva no determina cuánto tiempo conservarás el resultado ni qué ocurrirá después de una mutación.

Si la navegación no debe bloquearse, puedes usar `lazy: true`, `useLazyFetch` o `useLazyAsyncData`. La navegación continuará antes de que el handler termine, así que la interfaz debe representar de forma visible los estados de carga y error.

```vue [LazyCatalog.vue] {7-8}
<script setup lang='ts'>
interface CatalogItem {
  id: string
  name: string
}

const { data: items, status, error } = await useLazyFetch<CatalogItem[]>('/api/catalog')
</script>

<template>
  <p v-if='status === "pending"'>Loading catalog...</p>
  <p v-else-if='error'>Could not load the catalog.</p>
  <ul v-else>
    <li v-for='item in items ?? []' :key='item.id'>
      {{ item.name }}
    </li>
  </ul>
</template>
```

`server: false` es otra decisión: la carga inicial ocurre solo en el cliente y los datos no están disponibles antes de completar la hidratación. No lo uses como solución automática para una petición duplicada; primero decide si esa lectura debe formar parte del HTML renderizado en el servidor.

## Composables, Pinia y propiedad del dato

Una lectura propia de una vista puede permanecer en la página o en un composable si no tiene consumidores ni ciclo de vida compartidos. Esa separación evita convertir cada respuesta HTTP en estado global.

Pinia encaja mejor cuando varios componentes necesitan el mismo estado, cuando existen acciones de dominio o cuando la información debe vivir más allá de una sola vista. Su integración con Nuxt gestiona el contexto SSR y la serialización. Para cargas iniciales de una store, la documentación recomienda un flujo como `callOnce` para esperar la acción sin repetirla innecesariamente.

No copies automáticamente cada respuesta de `useFetch` a Pinia. Hacerlo puede crear dos fuentes de verdad y dos políticas de invalidación: una para la ref de Nuxt y otra para la store. Si decides conservar el dato en Pinia, define qué lectura es autoritativa y cuándo se actualiza.

La diferencia con `useNuxtData` es de responsabilidad: `useNuxtData` permite acceder reactivamente a un valor cacheado por una clave explícita; Pinia representa estado compartido y comportamiento de dominio. Para estado por usuario, respeta el alcance de cada petición SSR y evita declarar un `ref` singleton a nivel de módulo dentro de un composable.

Puedes ampliar este criterio en [Reactividad en composables: toRef, toRefs y cómo no perderla al desestructurar](/blog/reactivity-in-composables-toref-torefs-and-how-not-to-lose-it-when-destructuring.es/) y [Pinia en Vue 3: cuándo usar estado global y cuándo no](/blog/pinia-in-vue-3-when-to-use-global-state-and-when-not-to.es/).

El siguiente fragmento se conserva como punto de partida del laboratorio configurado en el frontmatter. Sus defectos son deliberados: sirve para diagnosticar el flujo, no como código listo para producción.

```vue [BrokenCatalog.vue] {9-17}
<script setup lang='ts'>
import { computed, ref, watch } from 'vue'

interface CatalogItem {
  id: string
  name: string
}

const route = useRoute()
const category = computed(() => String(route.params.category))
const items = await $fetch<CatalogItem[]>('/api/catalog')
const staticKey = 'catalog'
const storeItems = ref<CatalogItem[]>([])

watch(category, async () => {
  storeItems.value = await $fetch<CatalogItem[]>('/api/catalog')
})
</script>

<template>
  <p>{{ staticKey }}</p>
  <ul>
    <li v-for='item in items' :key='item.id'>{{ item.name }}</li>
  </ul>
</template>
```

Aquí no hay todavía una llamada a `useFetch` o `useAsyncData` con `key: 'catalog'`, ni una store de Pinia. `staticKey` es solo una constante local y `storeItems` es un `ref` local que no se renderiza. El diagnóstico debe centrarse en los defectos que sí aparecen: la llamada inicial usa `$fetch` directo, la URL ignora `category` y el watcher vuelve a solicitar datos sin expresar una identidad completa.

## Criterio final

Usa `useFetch` para lecturas basadas en URL de una vista. Usa `useAsyncData` para trabajo asíncrono personalizado. Usa `$fetch` para comandos iniciados por eventos o dentro de un handler. En todos los casos, revisa qué identifica el dato, si la navegación espera, cómo se reutiliza o invalida el resultado y quién es su propietario.

Antes de cerrar una implementación, confirma si el despliegue habilita `experimental.payloadExtraction` cuando necesites una política de caché estática entre navegaciones, si la API externa requiere autenticación o un cliente configurado y qué estrategia aplicarás después de una mutación.
