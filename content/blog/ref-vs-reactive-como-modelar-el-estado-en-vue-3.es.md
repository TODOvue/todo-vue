---
title: "ref() vs reactive(): cómo modelar el estado en Vue 3"
description: "Aprende a elegir entre ref(), reactive(), toRefs() y useState() según el tipo de dato, la desestructuración y el alcance SSR."
date: 2026-07-27T18:31:41-05:00
updatedAt: 2026-07-27T18:31:41-05:00
draft: false
locale: es
author: TODOvue
series: vue-reactivity
seriesOrder: 2
seriesTitle: "Reactividad práctica en Vue 3"
seriesDescription: "Ruta práctica para entender cómo Vue rastrea el estado, elegir la API reactiva correcta y optimizar actualizaciones sin perder claridad."
tags:
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Gestión de Estado"
    color: "#FF9800"
  - tag: "Guías"
    color: "#42B983"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "SSR"
    color: "#0E9AA7"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1785199207/ref-vs-reactive-como-modelar-el-estado-en-vue-3_j8hzro.png
coverAlt: "Comparación entre ref() y reactive() para modelar estado reactivo en Vue 3"
coverCaption: "Referencia oficial de Vue sobre los fundamentos de la reactividad"
keywords:
  - "ref() vs reactive()"
  - "reactividad en Vue 3"
  - "estado en Vue 3"
  - "toRefs()"
  - "useState() en Nuxt"
  - "Composition API"
schemaOrg:
  - type: "BlogPosting"
    headline: "ref() vs reactive(): cómo modelar el estado en Vue 3"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-27T18:31:41-05:00"
---

# ref() vs reactive(): cómo modelar el estado en Vue 3

Elegir entre `ref()` y `reactive()` no consiste en memorizar dos formas equivalentes de escribir estado. La decisión afecta a cómo reemplazas valores, cómo expones datos desde un composable y cómo conservas la reactividad al desestructurar.

Como regla general, empieza con `ref()`. Es adecuado para valores primitivos, resultados asíncronos, valores que pueden reemplazarse y estado que viajará entre composables. Elige `reactive()` deliberadamente cuando tengas un objeto estable y quieras modificar sus propiedades directamente.

En Nuxt aparece una decisión adicional: el alcance del estado. El estado local puede vivir dentro de `setup()`, mientras que el estado compartido entre componentes o instancias debe mantener aislada cada solicitud SSR y tener en cuenta la serialización y la hidratación.

## La decisión rápida: `ref()` como opción general

| Necesidad                                    | Opción habitual | Motivo                                                    |
|----------------------------------------------|-----------------|-----------------------------------------------------------|
| Booleano, número o string                    | `ref()`         | Puede contener cualquier tipo de valor.                   |
| Resultado asíncrono reemplazable             | `ref()`         | El valor puede pasar de `null` a un resultado nuevo.      |
| Estado entre composables                     | `ref()`         | Se puede devolver y desestructurar sin perder el vínculo. |
| Objeto estable con varias propiedades        | `reactive()`    | Las propiedades se modifican in situ.                     |
| Estado compartido compatible con SSR en Nuxt | `useState()`    | Añade una clave y participa en la hidratación de Nuxt.    |

La elección describe el contrato del estado: qué se reemplaza, qué se muta y quién lo consume.

## Qué ofrece `ref()`: un contenedor explícito y reemplazable

`ref()` devuelve un objeto reactivo mutable. En JavaScript, lees y escribes su valor mediante `.value`. Esto hace explícita la operación que modifica el estado y funciona igual para un booleano, un número, un string o un objeto.

Este ejemplo se centra en el modelo de estado con `ref()`. El botón usa semántica nativa y actualiza un resultado visible. Para un toggle de producción, añade `aria-pressed` enlazado a `isEnabled` para exponer programáticamente su estado; el texto cambiante no sustituye esa semántica.

```vue [FeatureToggle.vue] {2,4}
<script setup lang='ts'>
import { ref } from 'vue'

const isEnabled = ref(false)

function toggleEnabled() {
  isEnabled.value = !isEnabled.value
}
</script>

<template>
  <button type='button' @click='toggleEnabled'>
    {{ isEnabled ? 'Disable' : 'Enable' }}
  </button>
  <p>{{ isEnabled ? 'Feature enabled' : 'Feature disabled' }}</p>
</template>
```

La diferencia importante está en JavaScript: `isEnabled.value` es la lectura o escritura del valor. En un template, Vue puede desempaquetar automáticamente refs que son propiedades de primer nivel del contexto de renderizado.

`ref()` también resulta natural para un resultado que empieza vacío y después se reemplaza. En TypeScript, por ejemplo, `ref<User | null>(null)` expresa que el estado todavía no contiene una persona y que más adelante recibirá un objeto `User`. La misma idea se aplica a respuestas HTTP, selecciones y resultados de búsquedas.

Si el valor interno de un ref es un objeto, Vue lo convierte profundamente en reactivo. Cuando quieres conservar la reactividad solo en `.value` y evitar esa conversión profunda, `shallowRef()` es una alternativa específica; no es el punto de partida habitual para formularios u objetos pequeños.

## Qué ofrece `reactive()`: un proxy para objetos estables

`reactive()` recibe un objeto, un array o una colección y devuelve un proxy profundamente reactivo. Es cómodo cuando el dominio se entiende como una unidad con varias propiedades relacionadas: un formulario, filtros o una configuración local.

```vue [ProfileForm.vue] {2,4-7}
<script setup lang='ts'>
import { reactive } from 'vue'

const profile = reactive({
  displayName: '',
  email: ''
})

function resetProfile() {
  profile.displayName = ''
  profile.email = ''
}
</script>

<template>
  <form @submit.prevent='resetProfile'>
    <label>
      Display name
      <input v-model='profile.displayName' type='text' />
    </label>

    <label>
      Email
      <input v-model='profile.email' type='email' />
    </label>

    <button type='submit'>Reset</button>
  </form>
</template>
```

Aquí `profile.displayName` y `profile.email` son operaciones directas sobre el proxy. `reactive()` no sirve para contener directamente un string, un número o un booleano como valor raíz. Para esos casos, `ref()` expresa mejor la intención.

También debes conservar la referencia creada por `reactive()`. Modificar `profile.email` mantiene la conexión reactiva; reemplazar libremente todo `profile` por otro objeto no conserva la conexión con el proxy original. Si necesitas reemplazar el objeto completo, un `ref()` de objeto suele ser una representación más adecuada.

## Los límites que cambian la decisión: referencias, desestructuración y desempaquetado

Una fuente frecuente de errores es desestructurar directamente propiedades primitivas de un objeto reactivo:

```ts
const { email } = profile
```

La variable `email` deja de estar conectada a la propiedad reactiva. Cuando necesitas exponer una propiedad concreta, usa `toRef()`. Cuando quieres exponer varias propiedades, usa `toRefs()`.

```ts [useProfileFilters.ts] {1,4-7,15}
import { reactive, toRefs } from 'vue'

export function useProfileFilters() {
  const filters = reactive({
    query: '',
    activeOnly: false
  })

  function resetFilters() {
    filters.query = ''
    filters.activeOnly = false
  }

  return {
    ...toRefs(filters),
    resetFilters
  }
}
```

El objeto devuelto es plano y contiene refs enlazados. Por eso quien consume el composable puede escribir `const { query, activeOnly } = useProfileFilters()` sin romper la reactividad. `toRef(filters, 'query')` sería la opción apropiada si solo necesitas una propiedad.

El desempaquetado también tiene límites. Un ref puede desempaquetarse como propiedad de un objeto profundamente reactivo, pero no necesariamente al accederlo como elemento de un array reactivo o de una colección nativa como `Map`. En esos casos, sigue siendo necesario acceder a `.value`.

Tampoco conviene confundir JavaScript con templates. En templates, el desempaquetado automático se aplica a propiedades de primer nivel del contexto de renderizado; una propiedad anidada no obtiene necesariamente el mismo tratamiento.

## Diseñar composables y tipos alrededor del contrato del estado

La documentación de composables recomienda devolver un objeto plano con varias refs. Este formato representa bien una API reutilizable: cada consumidor puede desestructurar las refs y conservar sus vínculos reactivos.

Devuelve un objeto `reactive()` cuando quieras que la identidad del objeto forme parte del contrato y esperes que el consumidor trabaje con `state.field`. Devuelve refs cuando el consumidor deba reemplazar valores, desestructurarlos o combinar algunos de ellos con `computed()` y otras APIs.

TypeScript infiere el tipo de `ref()` desde su valor inicial. Si el estado empieza vacío, usa un tipo explícito, como `ref<User | null>(null)`. `reactive()` también infiere tipos, pero Vue desaconseja pasarle directamente un genérico sin considerar que el tipo resultante incorpora el desempaquetado anidado de refs. En la práctica, suele ser más claro tipar la estructura inicial y dejar que `reactive()` la infiera.

## En Nuxt: elegir según el alcance SSR

El estado local debe permanecer dentro de `setup()` cuando pertenece a un componente o a una instancia concreta. Evita exportar un singleton mutable desde el ámbito de módulo en una aplicación con SSR: varias solicitudes podrían observar o modificar el mismo estado.

Cuando necesitas compartir estado entre componentes o instancias de Nuxt y quieres conservarlo durante la hidratación, `useState()` ofrece una alternativa compatible con SSR mediante una clave única. Cada solicitud debe conservar su propio aislamiento; `useState()` no convierte el estado en almacenamiento mutable compartido entre requests:

```vue [CartBadge.vue] {2,11}
<script setup lang='ts'>
const cartCount = useState('cart-count', () => 0)

function addToCart() {
  cartCount.value++
}
</script>

<template>
  <button type='button' @click='addToCart'>
    Add item ({{ cartCount }})
  </button>
</template>
```

El valor de `useState()` debe ser serializable. No guardes clases, funciones o símbolos en ese estado compartido. Nuxt puede serializar y restaurar refs y objetos reactivos dentro de su payload de datos, mientras que las respuestas de rutas API se serializan mediante JSON.

Nuxt autoimporta APIs de Vue como `ref()` y `computed()` en el contexto de la aplicación. Si prefieres imports explícitos, Nuxt también proporciona el alias `#imports`. La elección entre autoimport y import explícito no cambia el contrato de reactividad.

## Regla práctica y errores frecuentes

Empieza con `ref()`. Cambia a `reactive()` cuando tengas un objeto estable que se modifica por propiedades y esa forma haga más claro el código. Usa `toRef()` o `toRefs()` cuando necesites exponer propiedades sin perder el vínculo. Reserva `useState()` para el estado compartido de Nuxt cuyo alcance y ciclo de hidratación requieren integración con SSR.

Revisa estos errores antes de cerrar una implementación:

- olvidar `.value` en JavaScript;
- usar `reactive()` con un primitivo;
- reemplazar un objeto `reactive()` esperando conservar su conexión;
- desestructurar propiedades sin `toRef()` o `toRefs()`;
- asumir que refs dentro de arrays o `Map` se desempaquetan;
- confundir el desempaquetado de templates con el de JavaScript;
- exportar estado mutable en el ámbito de módulo durante SSR;
- guardar valores no serializables en `useState()`.

## Laboratorio: justificar la API elegida

Modela tres casos y escribe una breve justificación para cada uno:

1. Un toggle local que cambia entre `true` y `false`.
2. Un formulario con nombre y correo que se edita campo por campo.
3. Un contador compartido entre componentes de Nuxt que debe sobrevivir a la hidratación.

Usa `ref()`, `reactive()` y `useState()` respectivamente. Después, transforma el formulario en un composable que devuelva refs mediante `toRefs()`. Para estudiar el reemplazo de referencias, realiza una prueba separada con `let state = reactive({ email: '' })` y una variable `replacement`: asignar `state = replacement` deja de usar el proxy original, mientras que `Object.assign(state, replacement)` conserva el proxy y actualiza sus propiedades. Si necesitas reemplazar el objeto completo como operación habitual, compara ese diseño con `ref({ email: '' })`. Finalmente, desestructura las propiedades y explica qué vínculo se rompe sin `toRefs()`.

La decisión no es elegir una API para siempre. Es hacer explícito si el estado representa un valor reemplazable, un objeto estable o un recurso compartido cuyo alcance incluye SSR.
