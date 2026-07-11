---
title: "Arquitectura de componentes en Vue 3: comunicación, reutilización y dependencias"
description: "Aprende a elegir entre props, eventos, slots, atributos heredados, composables y provide/inject para diseñar componentes Vue 3 claros y mantenibles."
date: 2026-07-10T17:19:30-05:00
updatedAt: 2026-07-10T17:19:30-05:00
draft: false
locale: es
author: TODOvue
tags:
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Arquitectura"
    color: "#4CAF50"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "Eventos"
    color: "#2D98DA"
  - tag: "Slots"
    color: "#8E44AD"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1783729357/vue-3-component-architecture_ecetna.png
coverAlt: "Guía de Vue.js sobre arquitectura y componentes reutilizables"
coverCaption: "Referencia oficial de Vue.js sobre componentes"
keywords:
  - Componentes
  - arquitectura de componentes en Vue 3
  - props y eventos
  - slots en Vue 3
  - composables
  - provide/inject
schemaOrg:
  - type: "BlogPosting"
    headline: "Arquitectura de componentes en Vue 3: comunicación, reutilización y dependencias"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-07-10T17:19:30-05:00"
---

# Arquitectura de componentes en Vue 3: comunicación, reutilización y dependencias

Cuando un componente crece, el problema no suele ser la sintaxis: es decidir dónde viven los datos, cómo se comunican las piezas y qué lógica merece reutilizarse. Una arquitectura útil separa estructura visual, entradas, eventos, contenido y dependencias sin crear abstracciones innecesarias.

En Vue 3, puedes pensar en una jerarquía de componentes conectados mediante contratos explícitos. Las props llevan datos hacia abajo, los eventos comunican intenciones hacia arriba, los slots permiten composición visual, los composables extraen lógica y `provide/inject` resuelve dependencias profundas.

## Un modelo mental: componentes como árbol de responsabilidades

Los componentes encapsulan piezas independientes y reutilizables organizadas como un árbol. Cada uso de un componente crea una instancia independiente con su propio estado. En un Single-File Component con `<script setup>`, los componentes importados quedan disponibles automáticamente en la plantilla.

Empieza por una responsabilidad concreta. Un componente puede coordinar otros componentes, pero no debería acumular sin criterio la presentación, la obtención de datos, la validación y la configuración transversal.

## Comunicación explícita: props y eventos

Las props representan entradas. Decláralas explícitamente para que el contrato sea visible y Vue pueda validar tipos y advertir durante el desarrollo cuando un valor no cumple las reglas declaradas. Trátalas como datos de entrada: el hijo no debe mutarlas directamente.

Los eventos personalizados permiten que el hijo comunique una intención al padre. En `<script setup>`, `defineProps` y `defineEmits` hacen visible ese contrato:

```vue [UserCard.vue] {2,6}
<script setup lang="ts">
const props = defineProps<{ userName: string }>()
const emit = defineEmits<{ select: [userName: string] }>()

function selectUser() {
  emit('select', props.userName)
}
</script>

<template>
  <button type="button" @click="selectUser">
    {{ props.userName }}
  </button>
</template>
```

Las líneas resaltadas declaran la entrada y comunican el cambio. Si el padre necesita actualizar un valor, el hijo emite el evento y el padre decide cómo modificar su estado.

## Composición visual con slots y atributos heredados

Usa slots cuando la variación principal sea el contenido o la estructura visual. El padre proporciona fragmentos de plantilla y el hijo define los puntos donde se renderizan:

```vue [BaseLayout.vue] {4-7-10}
<template>
  <div class="layout">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

Los slots con nombre distribuyen contenido en varias regiones. Un scoped slot permite que el hijo exponga datos al contenido proporcionado por el padre. Ese contenido conserva el alcance del padre; no obtiene acceso automático al estado privado del hijo.

Los atributos y listeners que no se declaran como props o emits pueden heredarse en el elemento raíz. Si el componente tiene múltiples nodos raíz, esa herencia automática no existe: enlaza explícitamente `$attrs` en el elemento adecuado cuando corresponda. Si desactivas `inheritAttrs`, recuerda reenlazar `$attrs` de forma intencional.

## Separar lógica y presentación con composables

Un composable es una función basada en Composition API que encapsula y reutiliza lógica con estado. Es una buena opción cuando varios componentes necesitan la misma lógica, pero no comparten una estructura visual.

```ts [useOnlineStatus.ts] {4-8}
import { onMounted, onUnmounted, ref } from 'vue'

export function useOnlineStatus() {
  const isOnline = ref(true)
  const updateStatus = () => { isOnline.value = navigator.onLine }

  onMounted(() => window.addEventListener('online', updateStatus))
  onUnmounted(() => window.removeEventListener('online', updateStatus))

  return { isOnline }
}
```

La limpieza del listener forma parte del contrato del composable. Vue recomienda composables frente a mixins porque el origen de las propiedades es más claro, hay menos riesgo de colisiones de nombres y se reduce la comunicación implícita.

Usa un componente cuando lógica y presentación formen una unidad reutilizable. Usa un composable cuando quieras reutilizar lógica sin imponer una interfaz visual.

## Provide/inject para dependencias profundas

`provide/inject` evita pasar props por cada nivel intermedio cuando una dependencia pertenece a un contexto profundo, como un tema o la configuración de un formulario. La dependencia proporcionada más cercana puede ocultar otra definida más arriba.

Este mecanismo no debe convertirse automáticamente en un sustituto del estado compartido de aplicación. Documenta la clave, el contrato y el ciclo de vida de la dependencia para que la relación siga siendo comprensible.

## Criterios de decisión y errores frecuentes

- Usa props y eventos para contratos directos entre padre e hijo.
- Usa slots cuando la variación sea contenido o estructura visual.
- Usa composables para lógica reutilizable sin estructura visual compartida.
- Usa `provide/inject` para dependencias profundas o configuración contextual.
- No transportes contenido visual complejo mediante eventos si un slot expresa mejor la composición.
- No mutes las props directamente en el hijo.
- No dependas de la herencia automática de atributos en componentes con múltiples raíces.
- No elijas un componente renderless cuando un composable resuelve de forma más directa la lógica pura.
- No presentes mixins ni un event bus global heredado de Vue 2 como estrategia principal para código nuevo.

La decisión central es escoger el mecanismo más pequeño que represente la relación: datos con props, intención con eventos, composición visual con slots, lógica con composables y dependencias profundas con `provide/inject`. Esa separación mantiene los contratos visibles y facilita evolucionar cada componente sin arrastrar responsabilidades ajenas.
