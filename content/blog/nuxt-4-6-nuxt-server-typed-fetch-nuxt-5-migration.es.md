---
title: "Nuxt 4.6: nuxt/server, typed fetch y camino a Nuxt 5"
description: Prepara la migración de Nuxt 4.5.2 a 4.6 con nuxt/server, typed fetch, SSR y una checklist para evaluar los futuros valores de Nuxt 5 paso a paso.
date: 2026-10-28T16:05:03-05:00
updatedAt: 2026-10-29T01:55:58.762Z
draft: false
locale: es
author: TODOvue
tags:
  - tag: Guías
    color: "#42B983"
  - tag: Avanzado
    color: "#F54927"
  - tag: Arquitectura
    color: "#4CAF50"
  - tag: SSR
    color: "#0E9AA7"
cover: https://nuxt.com/assets/blog/v4.6.png
coverAlt: Gráfico oficial del lanzamiento de Nuxt 4.6.
coverCaption: Imagen del anuncio oficial de Nuxt 4.6, publicada por Nuxt.
keywords:
  - Nuxt 4.6 nuxt/server Nuxt 5
  - migración Nuxt 4.6
  - typed fetch en Nuxt
  - SSR e hidratación
  - strictRouteTypes
  - Vapor en Nuxt
schemaOrg:
  - type: BlogPosting
    headline: "Nuxt 4.6: nuxt/server, typed fetch y camino a Nuxt 5"
    author:
      type: Person
      name: TODOvue
    datePublished: 2026-10-28T16:05:03-05:00
lab:
  title: Auditoría de migración Nuxt 4.6
  goal: Comparar los contratos del servidor, la inferencia y el payload antes de activar valores futuros.
  tasks:
    - "Clasifica handlers: migrar ahora, mantener en Nitro o probar de forma aislada."
    - Modifica la respuesta GET y comprueba el diagnóstico del consumidor.
    - Compara payload y solicitudes con la página serialize:false.
    - Activa routeTypedFetch, corrige llamadas y activa strictRouteTypes después.
  starterCode: |-
    <script setup lang="ts">
    const { data: projects, error } = await useFetch('/api/projects')
    </script>

    <template>
      <p v-if="error">No se pudieron cargar los proyectos.</p>
      <ul v-else>
        <li v-for="project in projects ?? []" :key="project.id">{{ project.name }}</li>
      </ul>
    </template>
  solutionHint: Parte de server/api/projects.get.ts y registra tipos, payload y solicitudes en cada punto de control.
---

# Nuxt 4.6 y el camino a Nuxt 5: nuxt/server, typed fetch y checklist de migración

Migrar desde Nuxt 4.5.2 no consiste en actualizar una dependencia y activar todos los valores futuros. Nuxt 4.6 modifica dos límites arquitectónicos: el contrato entre la aplicación y el runtime del servidor, y el contrato de tipos entre las rutas internas y sus consumidores. Si además cambias el builder y pruebas Vapor en la misma iteración, será difícil atribuir cualquier regresión.

La estrategia práctica es separar el trabajo. Primero actualiza al último parche 4.6.x confirmado; durante esta investigación era Nuxt 4.6.3. Después adopta los contratos portables y typed fetch. Finalmente, evalúa por separado los valores anticipados de Nuxt 5, `@nuxt/vite-server` y Vapor.

Nuxt 5 no se había verificado como una versión estable publicada el 28 de octubre de 2026. Su guía en la rama `main` es material anticipado y todavía presenta la integración con Nitro v3 como trabajo en desarrollo.

## De Nuxt 4.5.2 a 4.6.3: qué cambió realmente

La comparación necesita tres puntos:

| Versión | Papel | Decisión práctica |
|---|---|---|
| Nuxt 4.5.2 | Línea base principalmente correctiva | Registra su comportamiento antes de migrar |
| Nuxt 4.6.0 | Versión menor con cambios arquitectónicos | Evalúa sus contratos, pero no la uses como destino final |
| Nuxt 4.6.3 | Último parche confirmado durante la investigación | Actualiza a esta versión o a un parche posterior verificado |

Vite 8 y el streaming SSR llegaron con Nuxt 4.5.0, no con 4.6. Las novedades de 4.6 incluyen la superficie portable del servidor, los tipos de rutas reconstruidos, más valores predeterminados de Nuxt 5 y varias integraciones experimentales.

Tampoco conviene detenerse en 4.6.0. Las versiones 4.6.0–4.6.2 del builder de Vite estuvieron afectadas por una lectura arbitraria de archivos mediante el canal de errores del servidor de desarrollo. Otra corrección de 4.6.3 cubrió un caso en el que las reglas `redirect` no se aplicaban al endpoint alternativo de una página `.server.vue`. Una redirección nunca debe sustituir una comprobación de autorización en el servidor.

Los benchmarks publicados compararon 4.5.2 y 4.6.0 sobre arm64, con Node 24.15 y medianas de cinco ejecuciones. Mostraron mejoras en ese entorno, no garantías para otra aplicación. Úsalos para formular hipótesis y mide tu propio build, instalación y throughput SSR.

En las etiquetas de los ejemplos, `pages/` y `components/` son rutas relativas a `app/`, siguiendo la estructura de Nuxt 4. `server/`, `config/` y `nuxt.config.ts` parten de la raíz del proyecto.

## `nuxt/server`: un contrato portable para el límite del servidor

Antes de 4.6, un handler podía quedar acoplado a una versión concreta de h3 o a detalles de Nitro. `nuxt/server` introduce una superficie explícita que complementa a `nuxt/app`:

- `nuxt/app` corresponde al código universal de la aplicación.
- `nuxt/server` corresponde al código empaquetado por el builder del servidor.
- Nitro 2, Nitro 3 y `@nuxt/vite-server` pueden implementar el contrato portable.

El `RequestEvent` portable expone `req` como `Request`, `url` como `URL`, una respuesta con `status`, `statusText` y `Headers`, y un contexto por petición. El objetivo es evitar que cada handler compatible dependa de detalles concretos del runtime.

La migración conceptual puede revisarse con esta matriz:

| Acoplamiento anterior | Contrato portable |
|---|---|
| Helpers autoimportados de h3 | Imports explícitos y coherentes desde `nuxt/server` |
| `event.node` | `event.req`, `event.url` y `event.res.headers` |
| `statusCode` y `statusMessage` | `status` y `statusText` en `createError` |
| Helper que termina la respuesta | Retorno explícito, por ejemplo `return sendRedirect(...)` |
| Almacenamiento, caché, tareas o plugins de Nitro | Mantener el handler en el runtime específico |

La [guía de imports de servidor de Nuxt 4.6.3](https://github.com/nuxt/nuxt/blob/v4.6.3/docs/3.guide/6.going-further/5.server-imports.md) permite revisar el cambio sobre dos handlers equivalentes. Primero, la variante h3 de Nitro 2:

```ts [server/api/legacy.get.ts] {1,6,8-10}
import { createError, defineEventHandler, getRequestURL, setHeader, setResponseStatus } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (url.searchParams.has('fail')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }
  setHeader(event, 'x-migration', 'legacy')
  setResponseStatus(event, 202, 'Accepted')
  return { method: event.node.req.method, path: url.pathname }
})
```

Su contraparte portable cambia `event.node.req` por `event.req`, obtiene la URL desde `event.url` y modifica la respuesta mediante `Headers`, `status` y `statusText`. También cambia los campos de `createError`; no mezcla familias de helpers:

```ts [server/api/portable.get.ts] {1,5,7-10}
import { createError, defineEventHandler } from 'nuxt/server'

export default defineEventHandler((event) => {
  if (event.url.searchParams.has('fail')) {
    throw createError({ status: 400, statusText: 'Invalid request' })
  }
  event.res.headers.set('x-migration', 'portable')
  event.res.status = 202
  event.res.statusText = 'Accepted'
  return { method: event.req.method, path: event.url.pathname }
})
```

Las dos rutas permiten comparar una respuesta aceptada y el rechazo de `?fail`; sus valores `x-migration` distinguen las variantes. El mismo límite portable puede validar un body antes de consumirlo:

```ts [server/api/projects.post.ts] {1,7-12,16}
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'

interface CreateProjectBody {
  name: string
}

function validateCreateProject(input: unknown): CreateProjectBody {
  const name = (input as { name?: unknown } | null)?.name
  if (typeof name !== 'string' || name.trim().length < 3) {
    throw createError({ status: 400, statusText: 'Invalid project name' })
  }
  return { name: name.trim() }
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, validateCreateProject)
  return { id: 'project-preview', name: body.name }
})
```

En Nuxt 4, un `defineEventHandler` autoimportado sigue perteneciendo a h3. Combinarlo con helpers importados desde `nuxt/server` puede producir `NUXT_E8012`. Migra la familia completa usada por el handler, no un helper aislado.

`nuxt/server` no es un reexport completo de h3 ni reemplaza todas las capacidades de Nitro. Almacenamiento, caché, tareas, plugins de servidor, raw bodies y determinados helpers siguen siendo específicos del runtime. Mantén temporalmente esos handlers en h3 o Nitro.

La frontera de importación también es estricta. No importes `nuxt/server` desde componentes Vue, plugins de aplicación, `shared/`, `nuxt.config.ts` ni el `setup` de un módulo. Consulta también la guía de [arquitectura de componentes](/blog/vue-3-component-architecture.es/) para mantener explícitos los límites entre aplicación, dominio y servidor.

## Typed fetch: del endpoint al cliente sin perder la validación

Los tipos anteriores dependían de `InternalApi` de Nitro y su resolución podía escalar con el número total de rutas. Nuxt 4.6 genera tipos mediante `fetchdts`, de modo que el trabajo se relaciona con los call sites consumidos.

La adopción debe ser gradual: activa primero `routeTypedFetch`, corrige métodos, bodies, queries y headers, y solo después habilita `strictRouteTypes`. El siguiente bloque representa ese segundo punto de control, cuando las rutas conocidas ya fueron corregidas:

```ts [nuxt.config.ts] {3-4}
export default defineNuxtConfig({
  experimental: {
    routeTypedFetch: true,
    strictRouteTypes: true
  }
})
```

El modo estricto convierte una ruta desconocida en un diagnóstico en lugar de degradarla a `unknown`.

Con el endpoint anterior, esta mutación iniciada por el usuario selecciona la ruta y el método `POST` y obtiene el tipo de respuesta del retorno del handler, sin repetir un genérico:

```vue [pages/projects/new.vue] {12-15}
<script setup lang='ts'>
import { ref } from 'vue'

const name = ref('')
const feedback = ref('')

async function submitProject() {
  feedback.value = ''

  try {
    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: { name: name.value }
    })
    feedback.value = `Created ${project.name}.`
  } catch {
    feedback.value = 'Could not create the project.'
  }
}
</script>

<template>
  <form @submit.prevent='submitProject'>
    <label for='project-name'>Project name</label>
    <input id='project-name' v-model='name' required minlength='3'>
    <button type='submit'>Create project</button>
    <p aria-live='polite'>{{ feedback }}</p>
  </form>
</template>
```

La inferencia de la respuesta mejora el desarrollo, pero no protege el endpoint frente a una petición manipulada, un cliente JavaScript sin TypeScript u otro consumidor HTTP. `readValidatedBody` valida el body en runtime y `CreateProjectBody` tipa el valor validado dentro del servidor. Este ejemplo no anota el contrato de solicitud del handler: el validador no exporta por sí solo un tipo estático de body, query o headers al consumidor.

Revisa también los call sites que usen `params` como alias de `query`: los tipos reconstruidos esperan `query`. La guía anticipada de Nuxt 5 presenta typed fetch como comportamiento predeterminado, pero eso no demuestra que Nuxt 5 ya sea estable.

## SSR, payload e hidratación

Typed fetch describe el contrato de la solicitud; no cambia por sí mismo el ciclo SSR. Para los datos iniciales de una página, el flujo sigue siendo:

`handler → useFetch/useAsyncData → payload → hidratación`

`useFetch` y `useAsyncData` pueden transferir el resultado mediante el payload, evitando repetir la misma lectura durante la hidratación. Un `$fetch` ejecutado directamente en el `setup` universal puede ejecutarse en el servidor y nuevamente en el navegador.

Un endpoint GET portable puede alimentar esa lectura:

```ts [server/api/projects.get.ts] {1,4}
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => {
  return [{ id: 'project-preview', name: 'Migration audit' }]
})
```

```vue [pages/projects/index.vue] {2}
<script setup lang='ts'>
const { data: projects, error, status } = await useFetch('/api/projects')
</script>

<template>
  <p v-if='status === "pending"'>Loading projects...</p>
  <p v-else-if='error'>Could not load projects.</p>
  <ul v-else>
    <li v-for='project in projects ?? []' :key='project.id'>
      {{ project.name }}
    </li>
  </ul>
</template>
```

Aquí no se declara otra interfaz `Project` ni se proporciona un genérico: la respuesta procede de los tipos generados para el endpoint. En el laboratorio de Nuxt 4.6.3, cambiar `name` por `label` en el GET y regenerar los tipos produjo `TS2339` al acceder a `project.name` en el consumidor. Restaurar el contrato hizo pasar de nuevo `nuxt typecheck`. Esa prueba comprueba que el consumidor sigue al handler, en lugar de aceptar silenciosamente un modelo duplicado.

Reserva `$fetch` directo para interacciones y mutaciones posteriores, o úsalo dentro de un handler de `useAsyncData`.

Nuxt 4.6 añade `serialize: false` a `useFetch` y `useAsyncData`. La decisión cambia el flujo:

| Configuración | Payload | Hidratación |
|---|---|---|
| Serialización predeterminada | El resultado SSR se incluye | El cliente puede reutilizarlo |
| `serialize: false` | El resultado se excluye | El cliente vuelve a solicitarlo si el componente lo necesita |

La [opción `serialize` documentada para Nuxt 4.6.3](https://github.com/nuxt/nuxt/blob/v4.6.3/docs/4.api/2.composables/use-async-data.md) permite excluir el resultado del payload. Esta variante conserva la llamada en el setup, pero representa un fallback estable con `ClientOnly` hasta que el navegador pueda mostrar los datos:

```vue [pages/projects/unserialized.vue] {2-4,9}
<script setup lang="ts">
const { data: projects, status, error } = await useFetch('/api/projects', {
  key: 'projects-without-payload',
  serialize: false
})
</script>

<template>
  <ClientOnly fallback="Projects load in the browser.">
    <p v-if="status === 'pending'">Loading projects...</p>
    <p v-else-if="error">Could not load projects.</p>
    <ul v-else>
      <li v-for="project in projects ?? []" :key="project.id">{{ project.name }}</li>
    </ul>
  </ClientOnly>
</template>
```

No conserva la lista en el HTML SSR. La lectura puede ejecutarse en el servidor, su resultado no viaja en el payload y el cliente necesita recuperarlo. En este caso, el navegador muestra primero el fallback y después la lista. Con serialización predeterminada se observó una lectura de servidor y ninguna petición adicional del navegador durante la hidratación; con esta variante, una lectura de servidor y otra del navegador. Es un resultado local del ejemplo, no una garantía para otras configuraciones.

No lo trates como una optimización universal. Reducir el payload puede aumentar el coste de refetch y producir diferencias de hidratación si servidor y cliente renderizan información distinta.

Consulta también [useFetch vs useAsyncData vs $fetch en Nuxt 4](/blog/usefetch-vs-useasyncdata-vs-fetch-nuxt-4.es/) y la guía sobre [SSR y ciclo de vida](/blog/vue-lifecycle-ssr-serverprefetch.es/).

## Probar los valores de Nuxt 5 por etapas

`future.compatibilityVersion: 5` no activa una única corrección. En Nuxt 4.6 agrupa typed pages, route-typed fetch, rutas sensibles a mayúsculas, retorno temprano de `navigateTo`, extracción serializable de page meta, extracción de payload en el cliente y otros valores futuros.

Una secuencia más diagnosticable es:

| Fase | Cambio | Condición para avanzar |
|---|---|---|
| 1 | Actualizar a 4.6.3 o a un parche posterior verificado | El comportamiento base permanece estable |
| 2 | Activar `experimental.routeTypedFetch` | Métodos, bodies, queries y headers están corregidos |
| 3 | Añadir `experimental.strictRouteTypes` | No quedan rutas internas desconocidas |
| 4 | Probar typed pages y rutas sensibles a mayúsculas | Navegación y enlaces conservan su comportamiento |
| 5 | Revisar `navigateTo`, page meta y extracción de payload | SSR e hidratación pasan las comprobaciones |
| 6 | Activar `future.compatibilityVersion: 5` | Las fases anteriores tienen líneas base independientes |

Estos puntos de control concretan las opciones recogidas por la [guía de actualización de Nuxt 4.6.3](https://github.com/nuxt/nuxt/blob/v4.6.3/docs/1.getting-started/18.upgrade.md):

```ts [config/migration-stages.ts] {4-7,21-22}
import type { NuxtConfig } from 'nuxt/schema'

export const migrationStages = {
  typedFetch: { experimental: { routeTypedFetch: true } },
  strictRoutes: {
    experimental: { routeTypedFetch: true, strictRouteTypes: true }
  },
  futureDefaults: {
    router: { options: { sensitive: true } },
    experimental: {
      routeTypedFetch: true,
      strictRouteTypes: true,
      typedPages: true,
      normalizePageNames: true,
      extractSerializablePageMeta: true,
      navigateToEarlyReturn: true,
      payloadExtraction: 'client'
    }
  },
  compatibility5: {
    future: { compatibilityVersion: 5 },
    experimental: { strictRouteTypes: true }
  }
} satisfies Record<string, NuxtConfig>
```

Importa `migrationStages` desde `./config/migration-stages` en `nuxt.config.ts`. Selecciona primero `migrationStages.typedFetch` como argumento de `defineNuxtConfig`; después de corregir las llamadas, usa `migrationStages.strictRoutes`. El objeto `futureDefaults` sirve como inventario: incorpora y comprueba cada opción por separado, manteniendo las anteriores que hayas aceptado, en vez de aplicarlo entero en una sola iteración. `router.options.sensitive` prueba el casing de las rutas; `typedPages` y `normalizePageNames`, sus tipos y nombres; las restantes opciones permiten aislar page meta, retorno temprano y extracción de payload. Esta última cambia el tratamiento del payload de páginas prerenderizadas; no equivale a `serialize: false` en un composable.

Deja `migrationStages.compatibility5` para la evaluación final del conjunto. El ejemplo conserva `strictRouteTypes: true` explícitamente porque `compatibilityVersion: 5` no activa esa opción; mantén también tus demás decisiones al componer la configuración final. `future.compatibilityVersion: 5` no instala Nitro 3. La guía anticipada también enumera Nitro v3, h3 v2, autoimports de servidor deshabilitados, `#imports/server` y Vite Environment API. Úsalos como inventario de preparación mientras la integración siga en desarrollo; no inventes una fecha de lanzamiento.

## Vite 8 y el builder de servidor son cambios distintos

Nuxt incorporó Vite 8 en 4.5.0. La auditoría debe buscar plugins y configuraciones que dependan de esbuild, Rollup o comportamientos antiguos de CommonJS y resolución. Vite 8 reemplaza esbuild y Rollup por Rolldown/Oxc; `optimizeDeps.esbuildOptions`, `build.rollupOptions` y `worker.rollupOptions` están deprecadas a favor de sus equivalentes de Rolldown.

`@nuxt/vite-server`, en cambio, sí es un experimento de 4.6. Puede producir una SPA, SSR con entrada Node, un handler basado en estándares web o salida estática, pero carece de almacenamiento, caché, tareas y plugins de servidor de Nitro.

Mantén Nitro como builder predeterminado si necesitas esas capacidades. Prueba el builder de Vite en un laboratorio aislado, con rollback y sobre un parche seguro; no es un requisito para adoptar `nuxt/server` ni typed fetch. La introducción a [Vue con Vite](/blog/setting-up-vue-with-vite.es/) aporta contexto adicional sobre el papel del bundler.

## Vapor en Nuxt 4.6: experimento localizado

Nuxt mantiene la raíz en VDOM y permite que componentes o páginas individuales opten por Vapor mediante interoperabilidad. Para los ejemplos se fijó Vue `3.6.0-rc.6`: la comprobación incluida en Nuxt 4.6.3 exige `>=3.6.0-rc.6`. Con `rc.3`, la preparación desactivó Vapor; con `rc.6`, el compilador reconoció el opt-in. Alinea las versiones del runtime, el compilador y el renderer de Vue. Esta prueba utiliza una versión prerelease y no establece que Vue 3.6 sea estable.

Después de habilitar `vue.vapor` en un experimento separado, limita la primera prueba a una unidad pequeña:

```vue [components/VaporCounter.vue] {1}
<script setup vapor lang='ts'>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value += 1
}
</script>

<template>
  <button type='button' @click='increment'>Increment</button>
  <p aria-live='polite'>Count: {{ count }}</p>
</template>
```

Compáralo con una variante VDOM funcionalmente idéntica. Verifica SSR, hidratación, navegación, layouts, slots, librerías UI y herramientas de depuración antes de ampliar el alcance. No atribuyas mejoras generales sin mediciones reproducibles. La guía [Vue 3.6 RC y Vapor Mode](/blog/vue-3-6-rc-vapor-mode-status-limits-evaluation-2026.es/) desarrolla esa evaluación.

## Checklist de migración por fases

### 1. Establecer la línea base

- Inventaría imports desde `h3`, `nitropack` y `#imports`.
- Busca `event.node`, `statusCode`, `statusMessage`, `params:` y configuración personalizada de Vite o Rollup.
- Registra rutas, pruebas SSR, HTML crítico, payload e hidratación.
- Actualiza al último parche 4.6.x confirmado y verifica la aplicación antes de cambiar contratos.

### 2. Adoptar contratos portables

- Migra solo handlers compatibles y conserva una única familia de helpers en cada archivo.
- Cambia a `status` y `statusText` donde corresponda al nuevo `createError`.
- Mantén en Nitro los handlers dependientes de almacenamiento, caché, tareas, plugins o helpers no portables.
- Conserva autorización y validación en el servidor.

### 3. Activar typed fetch

- Habilita primero `routeTypedFetch`.
- Corrige métodos, bodies, queries y headers; sustituye `params` por `query`.
- Añade `strictRouteTypes` después de corregir las rutas conocidas.
- Mantén validación en runtime para cada entrada no confiable.

### 4. Revisar SSR

- Separa lecturas iniciales de mutaciones iniciadas por interacción.
- Usa `useFetch` o `useAsyncData` cuando el resultado deba viajar en el payload.
- Audita cada `serialize: false` por coste de refetch y riesgo de hidratación.

### 5. Evaluar los experimentos

- Prueba individualmente los comportamientos anticipados de Nuxt 5.
- Activa `compatibilityVersion: 5` solo después de establecer líneas base aisladas.
- Mantén `@nuxt/vite-server` y Vapor en experimentos separados.
- Reconfirma el estado de Nuxt 5 y Vue 3.6 antes de publicar cualquier recomendación.

## Criterio final

Nuxt 4.6 permite preparar la arquitectura antes de Nuxt 5. Actualiza primero al parche seguro; adopta después `nuxt/server` y typed fetch; revisa el flujo SSR; y deja los valores futuros, el builder de Vite y Vapor para pruebas independientes.

Una migración sólida no es la que activa más flags, sino la que reduce acoplamiento, conserva la validación en runtime y permite explicar qué cambio causó cada resultado.
