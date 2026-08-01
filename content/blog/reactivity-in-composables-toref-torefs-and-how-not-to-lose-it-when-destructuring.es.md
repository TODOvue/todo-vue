---
title: "Reactividad en composables: `toRef`, `toRefs` y cómo no perderla al desestructurar"
description: "Aprende por qué la desestructuración puede desconectar el estado reactivo y cuándo usar refs directas, `toRef()` o `toRefs()` en composables de Vue."
date: 2026-07-31T19:00:00-05:00
updatedAt: 2026-07-31T19:00:00-05:00
draft: false
locale: es
author: TODOvue
series: vue-reactivity
seriesOrder: 4
seriesTitle: "Reactividad práctica en Vue 3"
seriesDescription: "Ruta práctica para entender cómo Vue rastrea el estado, elegir la API reactiva correcta y optimizar actualizaciones sin perder claridad."
tags:
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "Guías"
    color: "#42B983"
cover: "https://res.cloudinary.com/denj4fg7f/image/upload/v1785525834/reactivity-in-composables-toref-torefs-and-how-not-to-lose-it-when-destructuring_tvgcff.png"
coverAlt: "Diagrama de un composable Vue que conserva la reactividad con toRef y toRefs."
coverCaption: "Referencia visual para una guía sobre utilidades de reactividad de Vue."
keywords:
  - "reactividad en composables Vue"
  - "toRef Vue"
  - "toRefs Vue"
  - "desestructurar reactive Vue"
  - "composables Vue"
schemaOrg:
  - type: "BlogPosting"
    headline: "Reactividad en composables: `toRef`, `toRefs` y cómo no perderla al desestructurar"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-31T19:00:00-05:00"
lab:
  title: "Repara el contrato reactivo de un composable"
  goal: "Rediseñar el retorno de un composable para permitir la desestructuración de sus propiedades reactivas y exponer una clave opcional."
  tasks:
    - "Haz que count y step puedan desestructurarse sin perder reactividad."
    - "Expón status aunque todavía no exista en el objeto reactivo."
    - "Explica por qué usas toRefs() para las propiedades existentes y toRef() para la clave opcional."
  starterCode: |
    import { reactive } from 'vue'

    export function useCounter() {
      const state = reactive<{ count: number; step: number; status?: string }>({
        count: 0,
        step: 1
      })

      function increment() {
        state.count += state.step
      }

      return { state, increment }
    }
  solutionHint: "Convierte las propiedades existentes de state con toRefs(state) y crea una ref separada para status con toRef(state, 'status')."
---

# Reactividad en composables: `toRef`, `toRefs` y cómo no perderla al desestructurar

Un composable puede parecer correcto hasta que quien lo consume hace algo natural: desestructurar su resultado. Si el composable devuelve directamente un objeto creado con `reactive()`, una propiedad primitiva extraída deja de estar conectada al proxy que Vue observa.

El problema no es la desestructuración por sí misma. Es el contrato que expones: ¿la persona consumidora recibe un proxy que debe conservar como objeto, o refs que puede extraer sin perder actualización? Esta guía parte de esa decisión y muestra cuándo usar acceso por propiedad, `toRef()` y `toRefs()`.

Este borrador asume Vue 3.3 o posterior para el ejemplo de `toRef(() => getter)`.

## El problema: desestructurar un objeto `reactive()` desconecta sus propiedades

Vue registra las lecturas reactivas a través del proxy. Por eso `state.count` conserva la conexión; en cambio, `const { count } = state` asigna el valor actual a una variable local. Si es un primitivo, esa variable no vuelve a pasar por el proxy cuando cambia el estado.

```ts [BrokenCounter.ts] {5}
import { reactive } from 'vue'

const state = reactive({ count: 0 })

const { count } = state

function increment() {
  state.count += 1
}

export { count, increment }
```

Después de `increment()`, `state.count` cambia, pero `count` sigue siendo el valor extraído. Mantener el acceso como `state.count` es válido cuando el objeto agrupado forma parte de la API que quieres ofrecer.

Esto es distinto de desestructurar un objeto plano que contiene refs. Extraer una ref no la convierte en un valor ordinario: sigues conservando su objeto ref y su `.value`.

## `toRef()`: una referencia viva a una propiedad

Cuando necesitas exponer una sola propiedad de un objeto reactivo, `toRef(state, 'count')` crea una ref enlazada bidireccionalmente con esa propiedad. Es una referencia a la propiedad, no una copia de su valor actual.

```ts [PropertyLink.vue] {10,11}
<script setup lang="ts">
import { reactive, ref, toRef } from 'vue'

const state = reactive({ count: 0 })
const copiedCount = ref(state.count)
const linkedCount = toRef(state, 'count')

function updateCounts() {
  state.count += 1
  copiedCount.value += 1
  linkedCount.value += 1
}
</script>

<template>
  <button type="button" @click="updateCounts">
    Update counts
  </button>
  <p>State: {{ state.count }}</p>
  <p>Copied: {{ copiedCount }}</p>
  <p>Linked: {{ linkedCount }}</p>
</template>
```

`copiedCount` se inicializa con el número que tenía `state.count`; después evoluciona por separado. `linkedCount`, en cambio, lee y escribe la misma propiedad que `state.count`.

También es la opción para una clave opcional o ausente. `toRefs()` solo crea refs de las propiedades enumerables que existen al ejecutarse. Si `status` todavía no está en el objeto, créala explícitamente con `toRef(state, 'status')`.

```ts [OptionalProperty.ts] {6}
import { reactive, toRef } from 'vue'

const state = reactive<{ count: number; status?: string }>({ count: 0 })
const status = toRef(state, 'status')

status.value = 'ready'
```

## `toRefs()`: devolver estado destructurable desde un composable

Un composable necesita a veces un único objeto reactivo interno porque sus campos pertenecen al mismo estado de una operación. No devuelvas ese proxy directamente si esperas que se desestructure. Convierte sus propiedades existentes en refs y devuelve el objeto plano resultante.

```ts [useCounter.ts] {10}
import { reactive, toRefs } from 'vue'

export function useCounter() {
  const state = reactive({ count: 0, step: 1 })

  function increment() {
    state.count += state.step
  }

  return { ...toRefs(state), increment }
}
```

El estado mutable está dentro de `useCounter()`, así que cada uso recibe su propia instancia. `toRefs(state)` produce refs vinculadas a `count` y `step`; el objeto que retorna el composable ya no es un proxy, sino un objeto plano de refs. Por eso se puede desestructurar de forma segura.

```vue [CounterPanel.vue] {4}
<script setup lang="ts">
import { useCounter } from './useCounter'

const { count, step, increment } = useCounter()
</script>

<template>
  <label>
    Step
    <input v-model.number="step" type="number" min="1">
  </label>
  <button type="button" @click="increment">
    Increment
  </button>
  <p>Count: {{ count }}</p>
</template>
```

No crees un objeto `reactive()` únicamente para terminar llamando a `toRefs()`. Si tus piezas de estado son independientes desde el inicio, declara refs independientes y devuélvelas directamente: `return { data, error }`.

## Elegir entre `state.prop`, `toRef()`, `toRefs()` y refs independientes

La decisión depende de la forma de la API, no de una preferencia universal:

- Conserva `state.prop` cuando el consumidor se beneficia de tratar el estado como un grupo cohesivo.
- Usa `toRef(state, 'prop')` para exponer una propiedad concreta, especialmente si puede no existir todavía.
- Usa `toRefs(state)` al exponer varias propiedades existentes de un objeto reactivo que el consumidor debe poder desestructurar.
- Devuelve refs independientes cuando no hay una razón real para mantener un objeto reactivo único.

Así evitas perder reactividad al extraer valores de un proxy o aplicar `toRefs()` mecánicamente a un estado que ya era más claro como refs independientes.

## Props y entradas reactivas: getters, `toRef()` y `toValue()`

Las props siguen siendo de solo lectura para el componente hijo. En Vue 3.3+, `toRef(() => props.projectId)` ofrece una entrada reactiva basada en una prop, pero no autoriza a asignarle un nuevo valor.

Si un composable acepta un valor estático, una ref o un getter, debe evaluar esa entrada dentro de un efecto reactivo cuando necesita reaccionar a sus cambios. `toValue()` normaliza las tres formas; dentro de `watchEffect()` también permite que Vue registre las dependencias del getter.

```ts [useDisplayId.ts] {6}
import { ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

export function useDisplayId(projectId: MaybeRefOrGetter<string>) {
  const displayId = ref('')

  watchEffect(() => {
    displayId.value = toValue(projectId)
  })

  return { displayId }
}
```

```vue [ProjectHeader.vue] {7}
<script setup lang="ts">
import { toRef } from 'vue'
import { useDisplayId } from './useDisplayId'

const props = defineProps<{ projectId: string }>()

const { displayId } = useDisplayId(toRef(() => props.projectId))
</script>

<template>
  <h2>Project: {{ displayId }}</h2>
</template>
```

El getter mantiene la lectura vinculada a `props.projectId`; `watchEffect()` vuelve a calcular `displayId` cuando cambie. La ref creada desde el getter es de solo lectura, como corresponde a una prop.

## Límites y errores comunes

No sustituyas `toRef(state, 'key')` por `ref(state.key)` si necesitas un enlace vivo: la segunda forma toma un valor ordinario y crea una ref independiente. Tampoco esperes que `toRefs()` incluya claves añadidas después de su llamada ni propiedades opcionales ausentes en ese momento.

Evita presentar una ref derivada de props como una vía para mutarlas. Si el diseño exige una interfaz escribible, define explícitamente quién posee el estado y cómo comunica el cambio.

Por último, no bases esta decisión en Reactivity Transform (`$ref`, `$()` o `$$()`). Fue experimental y se eliminó del core de Vue en la versión 3.4.

## Laboratorio: repara el contrato reactivo de un composable

Parte de un composable que retorna un `reactive()` con `count`, `step` y una clave opcional `status`. Rediseña su retorno para que el componente pueda desestructurar `count` y `step`, y para que `status` pueda exponerse aunque aún no exista.

La regla final es breve: devuelve refs independientes cuando el estado ya es independiente. Si expones varias propiedades de un objeto reactivo y quieres permitir desestructuración, devuelve refs enlazadas con `toRefs(state)`.

Para ampliar el criterio de modelado de estado, consulta [la guía sobre `ref()` frente a `reactive()`](/blog/ref-vs-reactive-como-modelar-el-estado-en-vue-3.es/) y [la guía de composables de Vue](/blog/vue-3-composables-extract-reusable-logic.es/). Fuentes técnicas: [Reactivity API: Utilities](https://vuejs.org/api/reactivity-utilities), [Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html) y [Composables](https://vuejs.org/guide/reusability/composables.html).
