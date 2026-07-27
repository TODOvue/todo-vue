---
title: "Vue computed vs watch vs watchEffect: cuándo usar cada uno"
description: "Aprende la diferencia práctica entre computed, watch y watchEffect en Vue 3, con ejemplos, errores comunes y una guía de decisión para componentes reales."
date: 2026-07-06T20:00:00-05:00
updatedAt: 2026-07-27T00:00:00-05:00
draft: false
tags:
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Rendimiento"
    color: "#D4A017"
  - tag: "Guías"
    color: "#42B983"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1783385054/vue-computed-watch-watcheffect-guide_vepplp.png
coverAlt: "Conceptos de reactividad en Vue representados como flujos de datos conectados"
coverCaption: "Computed, watchers y efectos en Vue 3 por TODOvue"
locale: es
author: TODOvue
series: vue-reactivity
seriesOrder: 3
seriesTitle: "Reactividad práctica en Vue 3"
seriesDescription: "Ruta práctica para entender cómo Vue rastrea el estado, elegir la API reactiva correcta y optimizar actualizaciones sin perder claridad."
keywords:
  - Vue.js
  - Vue 3
  - computed
  - watch
  - watchEffect
  - reactividad
  - Composition API
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue computed vs watch vs watchEffect: cuándo usar cada uno"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-06T20:00:00-05:00"
lab:
  title: "Elige la herramienta reactiva correcta"
  goal: "Practica el uso de computed para estado derivado, watch para efectos secundarios explícitos y watchEffect para rastreo automático de dependencias."
  tasks:
    - "Crea un input de búsqueda guardado en un ref."
    - "Usa computed para normalizar la búsqueda."
    - "Usa watch para disparar una función tipo fetch solo cuando cambie la búsqueda normalizada."
    - "Usa watchEffect para registrar cada valor reactivo leído dentro del efecto y explica por qué se ejecuta."
  starterCode: |
    <script setup>
    import { computed, ref, watch, watchEffect } from 'vue'

    const query = ref('')
    const page = ref(1)

    const normalizedQuery = computed(() => query.value.trim().toLowerCase())

    watch(normalizedQuery, (value) => {
      page.value = 1
      console.log('Buscar resultados para:', value)
    })

    watchEffect(() => {
      console.log('Estado actual de búsqueda:', normalizedQuery.value, page.value)
    })
    </script>

    <template>
      <input v-model="query" placeholder="Buscar artículos">
      <p>Búsqueda normalizada: {{ normalizedQuery }}</p>
      <p>Página: {{ page }}</p>
    </template>
  solutionHint: "El computed deriva datos sin causar efectos secundarios. El watch reacciona a una fuente explícita. El watchEffect se vuelve a ejecutar cuando cambia cualquier valor que lee."
---
# Vue `computed` vs `watch` vs `watchEffect`: cuándo usar cada uno

Vue te da tres herramientas que suelen aparecer en la misma conversación: `computed`, `watch` y `watchEffect`.

Las tres reaccionan al estado, pero no resuelven el mismo problema.

Si las mezclas sin criterio, los componentes empiezan a sentirse impredecibles. Los valores se actualizan desde demasiados lugares, las llamadas a APIs se disparan más de lo esperado y una lógica que debería ser simple se vuelve difícil de depurar. Si eliges bien la herramienta, el código casi se explica solo.

Esta guía es un mapa práctico de decisión.

## La versión corta

Usa `computed` cuando necesitas un valor.

Usa `watch` cuando necesitas hacer algo porque un valor específico cambió.

Usa `watchEffect` cuando el efecto debe rastrear automáticamente todo lo que lee.

| Herramienta | Ideal para | ¿Debe devolver un valor? | ¿Debe causar efectos secundarios? |
|-------------|------------|---------------------------|-----------------------------------|
| `computed` | Estado derivado | Sí | No |
| `watch` | Reacciones explícitas | No | Sí |
| `watchEffect` | Efectos con rastreo automático | No | Sí, con cuidado |

## Empieza con `computed` cuando necesitas estado derivado

Un computed responde esta pregunta: "¿Qué valor puedo derivar del estado que ya existe?"

Por ejemplo, imagina el resumen de un carrito:

```vue [CartSummary.vue]
<script setup>
import { computed, ref } from 'vue'

const items = ref([
  { id: 1, name: 'Stickers de Vue', price: 6, quantity: 2 },
  { id: 2, name: 'Cuaderno de Nuxt', price: 14, quantity: 1 }
])

const subtotal = computed(() => {
  return items.value.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
})

const hasFreeShipping = computed(() => subtotal.value >= 30)
</script>

<template>
  <p>Subtotal: {{ subtotal }}</p>
  <p>{{ hasFreeShipping ? 'Envío gratis desbloqueado' : 'El envío se calcula al pagar' }}</p>
</template>
```

`subtotal` no es una segunda fuente de verdad. Es un valor derivado de `items`.

Ahí es exactamente donde `computed` brilla:

- Se cachea.
- Se actualiza cuando cambian sus dependencias.
- Mantiene el template legible.
- Evita duplicar estado.

Si tienes la tentación de crear un `ref` y mantenerlo sincronizado manualmente con otro `ref`, pausa. La mayoría de las veces, ese valor sincronizado debería ser un `computed`.

## No uses `watch` para crear un valor derivado

Este es un error común:

```vue [AvoidThis.vue]
<script setup>
import { ref, watch } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')
const fullName = ref('')

watch([firstName, lastName], () => {
  fullName.value = `${firstName.value} ${lastName.value}`
}, { immediate: true })
</script>
```

Funciona, pero hace que el componente sea más difícil de lo necesario. Ahora `fullName` es un estado escribible que debe mantenerse sincronizado para siempre.

Usa `computed`:

```vue [UseComputed.vue]
<script setup>
import { computed, ref } from 'vue'

const firstName = ref('Ada')
const lastName = ref('Lovelace')

const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

La regla es simple: si el resultado puede calcularse desde estado reactivo, prefiere `computed`.

## Usa `watch` para efectos secundarios explícitos

Un watcher responde otra pregunta: "Cuando esta cosa específica cambie, ¿qué debe pasar?"

Ese "pasar" normalmente es un efecto secundario:

- Pedir datos.
- Escribir en `localStorage`.
- Reiniciar paginación.
- Sincronizar la URL.
- Llamar una API del navegador.

Aquí tienes un ejemplo de búsqueda:

```vue [SearchResults.vue]
<script setup>
import { computed, ref, watch } from 'vue'

const query = ref('')
const page = ref(1)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

watch(normalizedQuery, async (value, previousValue) => {
  if (value === previousValue) return

  page.value = 1
  await fetchResults(value)
})

async function fetchResults(value) {
  console.log('Buscando resultados para:', value)
}
</script>

<template>
  <input v-model="query" type="search" placeholder="Buscar">
  <p>Página: {{ page }}</p>
</template>
```

Este es un buen uso de `watch` porque la fuente es explícita: `normalizedQuery`.

Puedes leer el código y saber exactamente por qué ocurre la búsqueda.

## Usa `watchEffect` para rastreo automático

`watchEffect` se ejecuta inmediatamente y rastrea cada valor reactivo leído durante su ejecución.

Eso lo hace cómodo cuando la lista de dependencias es evidente desde el cuerpo:

```vue [AutoTrackedEffect.vue]
<script setup>
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const locale = ref('es')

watchEffect(() => {
  console.log(`Cargar usuario ${userId.value} usando locale ${locale.value}`)
})
</script>
```

El efecto lee `userId.value` y `locale.value`, así que Vue rastrea ambos. Cuando cualquiera cambia, el efecto se ejecuta otra vez.

Esto es expresivo, pero también exige disciplina. Si más adelante lees otros valores reactivos, también agregas más dependencias. A veces eso es justo lo que quieres. Otras veces se convierte en una sorpresa.

## Cuidado con `watchEffect` asíncrono

`watchEffect` solo rastrea las lecturas reactivas que ocurren durante su ejecución síncrona.

Esto sí se rastrea:

```js [tracked-before-await.js]
watchEffect(async () => {
  console.log(userId.value)
  await loadSomething()
})
```

Pero las lecturas reactivas después de `await` son más fáciles de malinterpretar:

```js [after-await.js]
watchEffect(async () => {
  await loadSomething()
  console.log(userId.value)
})
```

Si un efecto asíncrono depende de una fuente específica, `watch` suele ser más claro:

```js [async-watch.js]
watch(userId, async (id) => {
  profile.value = await fetchUserProfile(id)
}, { immediate: true })
```

La dependencia queda explícita. Quien lea el código después no necesita inspeccionar todo el cuerpo para saber qué dispara la petición.

## Un árbol de decisión práctico

Haz estas preguntas en orden:

1. ¿Necesito un valor para el template o para otro cálculo?

Usa `computed`.

2. ¿Necesito ejecutar código porque cambió una fuente específica?

Usa `watch`.

3. ¿Necesito un efecto que dependa naturalmente de todo lo que lee?

Usa `watchEffect`.

4. ¿Estoy escribiendo en otro ref solo para mantenerlo sincronizado?

Probablemente necesitas `computed`.

5. ¿El efecto hace una petición, toca storage o coordina algo fuera de Vue?

Probablemente necesitas `watch`, a menos que el rastreo automático sea realmente la intención.

## Errores comunes

### Mutar estado dentro de `computed`

Un getter de computed no debería cambiar estado.

```js [bad-computed-side-effect.js]
const total = computed(() => {
  analyticsCount.value++
  return items.value.length
})
```

Eso hace que un cálculo se comporte como un efecto. Mantén `computed` puro.

### Observar demasiado

Los watchers profundos pueden ser útiles, pero es fácil abusar de ellos.

```js [deep-watch.js]
watch(settings, saveSettings, { deep: true })
```

Si `settings` es grande, esto puede volverse costoso o demasiado amplio. Cuando puedas, observa el campo específico que importa.

### Usar `watchEffect` cuando necesitas control

`watchEffect` es maravilloso para efectos compactos, pero no tanto cuando el disparador importa.

Si necesitas decir "ejecuta esto solo cuando cambie el id seleccionado", dilo con `watch`.

## Regla final

Si describe datos, usa `computed`.

Si responde a un cambio, usa `watch`.

Si debe rastrear lo que lee, usa `watchEffect`.

Esa pequeña diferencia evita una cantidad sorprendente de caos reactivo.
