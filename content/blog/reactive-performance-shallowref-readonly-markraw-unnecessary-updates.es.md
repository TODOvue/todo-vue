---
title: "Rendimiento reactivo en Vue: shallowRef, readonly, markRaw y actualizaciones innecesarias"
description: "Aprende a elegir límites de reactividad en Vue, actualizar estado superficial correctamente y distinguir conversiones profundas de renderizados evitables."
date: 2026-08-04T19:00:00-05:00
updatedAt: 2026-08-04T19:00:00-05:00
draft: false
locale: es
author: TODOvue
series: vue-reactivity
seriesOrder: 6
seriesTitle: "Reactividad práctica en Vue 3"
seriesDescription: "Ruta práctica para entender cómo Vue rastrea el estado, elegir la API reactiva correcta y optimizar actualizaciones sin perder claridad."
tags:
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Rendimiento"
    color: "#D4A017"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1785888143/reactive-performance-shallowref-readonly-markraw-unnecessary-updates_ngtda7.png
coverAlt: "Diagrama de límites de reactividad en Vue con shallowRef, readonly y markRaw."
coverCaption: "Diagrama sobre límites de reactividad en Vue."
keywords:
  - rendimiento reactivo en Vue
  - shallowRef
  - readonly
  - markRaw
  - actualizaciones innecesarias en Vue
  - triggerRef
  - computed estable
schemaOrg:
  - type: "BlogPosting"
    headline: "Rendimiento reactivo en Vue: shallowRef, readonly, markRaw y actualizaciones innecesarias"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-08-04T19:00:00-05:00"
lab:
  title: "Repara el flujo de actualización del catálogo"
  goal: "Actualizar un catálogo superficial mediante reemplazo de raíz y clasificar el trabajo restante como reactivo, de componentes o de DOM."
  tasks:
    - "Haz que el botón actualice el nombre del primer elemento sin mutar el arreglo anidado."
    - "Explica si un render adicional observado pertenece a la reactividad, a las props de un componente hijo o al volumen de nodos DOM."
    - "Usa onRenderTriggered() durante el desarrollo antes de añadir otra optimización."
  starterCode: |
    <script setup lang="ts">
    import { shallowRef } from 'vue'

    type CatalogItem = {
      id: string
      name: string
    }

    const catalog = shallowRef<CatalogItem[]>([
      { id: 'catalog-1', name: 'Starter plan' }
    ])

    function renameFirstItem() {
      catalog.value[0].name = 'Updated starter plan'
    }
    </script>

    <template>
      <button @click="renameFirstItem">Rename first item</button>
      <p>{{ catalog[0].name }}</p>
    </template>
  solutionHint: "Crea un arreglo nuevo con map() y asígnalo a catalog.value. La mutación anidada no notifica por sí sola a las dependencias de shallowRef()."
---

# Rendimiento reactivo en Vue: shallowRef, readonly, markRaw y actualizaciones innecesarias

Una interfaz lenta no demuestra por sí sola que Vue esté haciendo demasiada reactividad profunda. El trabajo extra puede venir de la conversión y el seguimiento de un objeto grande, de props inestables que actualizan componentes hijos o de una lista con demasiados nodos DOM. Son problemas relacionados, pero requieren decisiones distintas.

La decisión correcta empieza por observar qué dependencia activa el renderizado. Después, define el límite de reactividad que expresa el contrato de tu estado: reactividad profunda para cambios anidados frecuentes, reemplazo de raíz para estructuras grandes e inmutables, una vista de solo lectura para proteger quién puede mutar y exclusiones puntuales para instancias que Vue no debe proxificar.

## Antes de optimizar: identifica qué trabajo es innecesario

Primero averigua qué provoca la actualización. `onRenderTracked` muestra las dependencias leídas durante el renderizado y `onRenderTriggered` muestra cuál de ellas activó otro renderizado. Estos hooks sirven para diagnóstico en desarrollo; no son una solución de rendimiento por sí mismos.

```vue [RenderDiagnosis.vue] {6-12}
<script setup lang="ts">
import { onRenderTracked, onRenderTriggered, ref } from 'vue'

const selectedId = ref<string | null>(null)

onRenderTracked((event) => {
  console.debug('render tracked', event)
})

onRenderTriggered((event) => {
  console.debug('render triggered', event)
})
</script>

<template>
  <button @click="selectedId = 'catalog-1'">Select catalog item</button>
  <p>Selected: {{ selectedId ?? 'none' }}</p>
</template>
```

Con esa evidencia, separa tres preguntas:

- ¿El coste está en acceder a una estructura grande que Vue convierte y sigue profundamente?
- ¿Un componente hijo recibe props u objetos derivados con una identidad nueva aunque su significado no cambie?
- ¿El cuello de botella es el número de nodos que deben renderizarse?

Cambiar `ref()` por `shallowRef()` solo aborda la primera pregunta. Si una lista sigue teniendo demasiados elementos visibles, evalúa virtualización. Si el problema está en los límites entre componentes, estabiliza props y valores derivados antes de añadir directivas de renderizado.

## shallowRef(): estado grande con actualizaciones por reemplazo

`ref()` convierte profundamente los valores objeto. En cambio, `shallowRef()` solo hace reactivo el acceso a `.value`. Esta diferencia reduce el trabajo de acceso y seguimiento en estructuras grandes que se tratan como inmutables, pero cambia el contrato de actualización: una escritura anidada no notifica por sí misma; reemplazar el valor raíz sí.

El siguiente catálogo usa reemplazo de raíz para expresar una edición. El segundo botón ilustra la operación que no debes esperar que actualice la interfaz automáticamente.

```vue [LargeCatalog.vue] {13-15}
<script setup lang="ts">
import { shallowRef } from 'vue'

type CatalogItem = {
  id: string
  name: string
}

const catalog = shallowRef<CatalogItem[]>([
  { id: 'catalog-1', name: 'Starter plan' },
  { id: 'catalog-2', name: 'Team plan' }
])

function renameFirstItem() {
  catalog.value = catalog.value.map((item, index) =>
    index === 0 ? { ...item, name: 'Updated starter plan' } : item
  )
}

function mutateFirstItemInPlace() {
  catalog.value[0].name = 'Changed without replacing the root'
}
</script>

<template>
  <button @click="renameFirstItem">Rename with root replacement</button>
  <button @click="mutateFirstItemInPlace">Mutate nested value</button>

  <ul>
    <li v-for="item in catalog" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

Las líneas resaltadas crean un arreglo nuevo y asignan una nueva referencia a `.value`; por eso los consumidores reactivos reciben la actualización. La mutación anidada puede modificar el objeto JavaScript, pero no activa los efectos dependientes del `shallowRef` por sí sola.

Usa este patrón cuando el estado sea grande y mayormente inmutable, o cuando Vue solo deba observar el contenedor de un estado externo. Para un objeto pequeño que tu aplicación modifica habitualmente en profundidad, `ref()` o `reactive()` conservan un contrato más claro. Si necesitas revisar esa base, consulta la guía sobre [`ref` y `reactive`](/blog/ref-vs-reactive-como-modelar-el-estado-en-vue-3.es/).

## triggerRef() y estado externo: excepciones controladas

A veces un sistema externo modifica internamente un valor que guardas en un `shallowRef`. `triggerRef()` permite avisar explícitamente a los efectos dependientes después de esa mutación. Es útil como puente controlado, no como modelo principal para datos que puedes actualizar de forma inmutable.

```vue [ExplicitShallowTrigger.vue] {9-10}
<script setup lang="ts">
import { shallowRef, triggerRef } from 'vue'

const draft = shallowRef({
  title: 'Quarterly plan',
  status: 'editing'
})

function saveDraft() {
  draft.value.status = 'saved'
  triggerRef(draft)
}
</script>

<template>
  <button @click="saveDraft">Save draft</button>
  <p>{{ draft.title }} — {{ draft.status }}</p>
</template>
```

Aquí el disparador explícito hace visible una mutación profunda. Si controlas la forma de los datos, prefiere reemplazar la raíz: comunica mejor qué cambió y evita que el resto del código dependa de notificaciones manuales.

## readonly(): proteger la propiedad de las mutaciones

`readonly()` crea una vista de solo lectura profunda. Las lecturas desde esa vista siguen participando en el seguimiento reactivo, y las actualizaciones hechas en el estado original pueden llegar a quienes consumen la vista. Su objetivo principal no es optimizar rendimiento: es dejar claro quién posee las mutaciones.

Este composable expone los elementos como solo lectura y conserva la escritura en una función explícita. El estado vive dentro de la función exportada, por lo que cada uso obtiene su propia instancia.

```ts [useCart.ts] {16}
import { readonly, ref } from 'vue'

type CartItem = {
  id: string
  name: string
}

export function useCart() {
  const items = ref<CartItem[]>([])

  function addItem(item: CartItem) {
    items.value = [...items.value, item]
  }

  return {
    items: readonly(items),
    addItem
  }
}
```

Este límite responde a propiedad y seguridad de la API, no a si el estado debe ser profundo o superficial. Puedes exponer una vista `readonly()` de estado profundo o de un contenedor superficial según el contrato de actualización que hayas elegido.

## markRaw(): excluir instancias que Vue no debe proxificar

`markRaw()` evita que Vue convierta un objeto concreto en proxy. Resérvalo para instancias complejas que no deben ser proxificadas, por ejemplo una instancia administrada por una biblioteca externa. No es una optimización general para objetos de aplicación.

```ts [external-engine.ts] {15}
import { markRaw, reactive } from 'vue'

class ExternalEngine {
  private connected = false

  connect() {
    this.connected = true
  }

  get status() {
    return this.connected ? 'connected' : 'idle'
  }
}

const engine = markRaw(new ExternalEngine())
const state = reactive({ engine })

state.engine.connect()
console.log(state.engine.status)
```

La exclusión de `markRaw()` se aplica en la raíz. Si objetos anidados vuelven a entrar por otro camino en un grafo reactivo, puedes terminar comparando una referencia raw con una versión proxificada. Ese riesgo de identidad es una razón para mantener este límite pequeño y evitar mezclar referencias raw y proxificadas sin una necesidad clara.

## Actualizaciones innecesarias que shallowRef no resuelve

Incluso con un límite reactivo correcto, un valor derivado puede producir trabajo extra si crea un objeto nuevo cada vez. En Vue 3.4 o posterior, un `computed` puede reutilizar el valor anterior cuando una comparación segura demuestra que el resultado semántico no cambió.

```vue [AvailabilityLabel.vue] {11-12}
<script setup lang="ts">
import { computed, ref } from 'vue'

const quantity = ref(1)

const availability = computed<{ label: string }>((previous) => {
  const next = {
    label: quantity.value > 0 ? 'In stock' : 'Sold out'
  }

  if (previous?.label === next.label) return previous
  return next
})
</script>

<template>
  <button @click="quantity += 1">Add one</button>
  <button @click="quantity -= 1">Remove one</button>
  <p>{{ availability.label }}</p>
</template>
```

La comparación se hace después de construir `next`, de modo que el `computed` lee sus dependencias antes de decidir si puede reutilizar el resultado. Cuando la cantidad pasa de uno a dos, la etiqueta sigue siendo la misma y se conserva la identidad anterior. Solo aplica esta técnica si puedes comparar de forma segura el significado que consumen los descendientes.

Las props estables siguen siendo igualmente importantes: mueve cálculos al componente que posee el dato cuando eso permita que los hijos reciban valores que no cambian. Considera `v-memo` o `v-once` únicamente después de medir y de estabilizar el flujo de datos. La guía sobre [depuración de renderizados](/blog/vue-lifecycle-render-debug-rendertracked-rendertriggered.es/) y la guía de [`v-memo` y `v-once`](/blog/directives-vue-v-once-v-memo-v-pre-guide.es/) ayudan a evaluar esos casos.

## Regla de decisión

Elige la API por el contrato de estado, no por su nombre:

| Situación                                                     | Decisión inicial                   |
|---------------------------------------------------------------|------------------------------------|
| Estado pequeño con mutaciones anidadas frecuentes             | `ref()` o `reactive()`             |
| Estructura grande e inmutable, o contenedor de estado externo | `shallowRef()` y reemplazo de raíz |
| Vista pública que los consumidores no deben mutar             | `readonly()`                       |
| Instancia concreta que Vue no debe proxificar                 | `markRaw()`                        |

Antes de aplicar cualquiera de estas opciones, mide o inspecciona el renderizado en desarrollo. Después confirma si el trabajo restante pertenece a reactividad, actualizaciones entre componentes o volumen de DOM.

La optimización útil consiste en poner el límite correcto. Conserva reactividad profunda cuando las mutaciones anidadas son parte del contrato; usa reemplazo superficial cuando la inmutabilidad lo permite; expón `readonly()` para proteger la propiedad de las escrituras y reserva `markRaw()` para excepciones concretas. Así reduces trabajo innecesario sin ocultar las actualizaciones que la interfaz sí necesita.
