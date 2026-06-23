---
title: "Composables en Vue 3: cómo extraer lógica reutilizable sin complicarte"
description: "Aprende qué son los composables en Vue 3, cuándo conviene usarlos y cómo extraer lógica reutilizable con un ejemplo claro usando useToggle."
date: 2026-06-22T20:00:00-05:00
updatedAt: 2026-06-22T20:00:00-05:00
draft: false
tags:
  - tag: "Composables"
    color: "#14B8A6"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Básico"
    color: "#B173BF"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1782172219/vue-3-composables-extract-reusable-logic.es.md_myyutl.png
coverAlt: "Pantalla con código en un entorno de desarrollo"
coverCaption: "Código reutilizable en Vue 3 por TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - Vue 3
  - Composables
  - Composition API
  - useToggle
  - lógica reutilizable
schemaOrg:
  - type: "BlogPosting"
    headline: "Composables en Vue 3: cómo extraer lógica reutilizable sin complicarte"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-06-22T20:00:00-05:00"
lab:
  title: "Crea tu primer composable: useToggle"
  goal: "Extrae una lógica pequeña y repetible para abrir, cerrar y alternar un estado booleano desde cualquier componente."
  tasks:
    - "Crea un archivo useToggle.js o useToggle.ts."
    - "Usa ref() para guardar el estado activo o inactivo."
    - "Expón las funciones open(), close() y toggle()."
    - "Usa el composable desde un componente con un botón."
  starterCode: |
    <script setup>
    import { ref } from 'vue'

    function useToggle(initialValue = false) {
      const isActive = ref(initialValue)

      const open = () => {
        isActive.value = true
      }

      const close = () => {
        isActive.value = false
      }

      const toggle = () => {
        isActive.value = !isActive.value
      }

      return {
        isActive,
        open,
        close,
        toggle
      }
    }

    const menu = useToggle()
    </script>

    <template>
      <button @click="menu.toggle()">
        {{ menu.isActive ? 'Cerrar menu' : 'Abrir menu' }}
      </button>

      <nav v-if="menu.isActive">
        Menu visible
      </nav>
    </template>
  solutionHint: "Si el componente ya no necesita saber cómo cambia el estado, solo cuándo usarlo, el composable está haciendo bien su trabajo."
---
# Composables en Vue 3: cómo extraer lógica reutilizable sin complicarte

Hay una señal bastante clara de que tu componente está pidiendo ayuda: empiezas a copiar la misma lógica en dos, tres o cuatro lugares.

Primero fue un menú que se abre y se cierra. Luego un modal. Después un panel lateral. Cada uno tiene su propio `ref`, su función para abrir, su función para cerrar y un `toggle` casi idéntico. No pasa nada grave al principio, pero el código empieza a sentirse repetido, como si cada componente estuviera resolviendo el mismo problema por su cuenta.

Ahí entran los composables.

## Qué es un composable, sin hacerlo raro

Un composable es una función que encapsula lógica reutilizable usando la Composition API de Vue.

Nada más. No necesita sonar más grande que eso.

Puede guardar estado con `ref()` o `reactive()`, crear valores derivados con `computed()`, escuchar cambios con `watch()` o conectar con APIs del navegador. La idea es que esa lógica viva en un lugar claro y pueda usarse desde varios componentes sin copiar y pegar.

Si un componente debería encargarse de mostrar la interfaz, un composable puede encargarse de una parte de la lógica que la alimenta.

## El problema: lógica repetida dentro del componente

Imagina un menú pequeño:

```vue [MenuButton.vue]
<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <button @click="toggle">
    {{ isOpen ? 'Cerrar menu' : 'Abrir menu' }}
  </button>

  <nav v-if="isOpen">
    Menu visible
  </nav>
</template>
```

Este código está bien. No hay que extraer todo apenas aparece una función. El problema llega cuando la misma idea aparece en un modal, un acordeón, una tarjeta expandible y un panel de filtros.

En ese punto ya no estás escribiendo lógica del menú. Estás escribiendo una pequeña regla reutilizable: algo puede estar activo o inactivo, y necesitas abrirlo, cerrarlo o alternarlo.

## El después: extraer un `useToggle`

Podemos llevar esa lógica a un composable:

```js [composables/useToggle.js]
import { ref } from 'vue'

export function useToggle(initialValue = false) {
  const isActive = ref(initialValue)

  const open = () => {
    isActive.value = true
  }

  const close = () => {
    isActive.value = false
  }

  const toggle = () => {
    isActive.value = !isActive.value
  }

  return {
    isActive,
    open,
    close,
    toggle
  }
}
```

Y ahora el componente queda más enfocado:

```vue [MenuButton.vue]
<script setup>
import { useToggle } from '@/composables/useToggle'

const menu = useToggle()
</script>

<template>
  <button @click="menu.toggle()">
    {{ menu.isActive ? 'Cerrar menu' : 'Abrir menu' }}
  </button>

  <nav v-if="menu.isActive">
    Menu visible
  </nav>
</template>
```

El componente todavía se entiende. De hecho, se entiende mejor: hay un menú y ese menú se puede alternar. La mecánica interna ya no estorba.

## Cuándo sí vale la pena crear un composable

Un composable tiene sentido cuando extrae una intención real, no solo unas líneas de código.

Suele valer la pena cuando:

- La misma lógica aparece en más de un componente.
- El componente está mezclando demasiadas responsabilidades.
- Quieres probar o razonar una parte del comportamiento por separado.
- La lógica tiene un nombre claro: `useToggle`, `useMousePosition`, `useLocalStorage`, `usePagination`.

La clave está en el nombre. Si puedes nombrarlo de forma natural, probablemente hay una idea reutilizable ahí.

## Cuándo no hace falta

No todo necesita convertirse en composable.

Si una lógica solo vive en un componente y se entiende bien ahí, déjala ahí. Extraer demasiado pronto también complica. Terminas saltando entre archivos para entender algo que antes se leía en veinte segundos.

Un buen composable reduce ruido. Uno innecesario lo mueve de lugar.

## Errores comunes

El primero es crear nombres demasiado vagos. `useHelpers`, `useUtils` o `useCommon` no dicen nada. Si el nombre no explica la intención, el archivo se convierte en un cajón de cosas sueltas.

El segundo es meter demasiada lógica en el mismo composable. `useUserDashboardEverything` puede empezar cómodo, pero pronto será más difícil de mantener que el componente original.

El tercero es esconder efectos secundarios. Si un composable hace una petición, escribe en `localStorage` o registra eventos globales, debería ser evidente por su nombre o por cómo se usa.

El cuarto es devolver demasiadas cosas. Si un composable devuelve quince propiedades, quizá todavía no encontraste el límite correcto.

## Una regla práctica

Antes de crear un composable, pregúntate esto:

> ¿Estoy extrayendo una idea o solo estoy moviendo código?

Si estás extrayendo una idea, adelante. Si solo estás moviendo código para que el componente se vea más corto, espera un poco.

Los composables no están para lucirse. Están para que el código respire mejor, para que los componentes hablen de interfaz y para que la lógica repetida tenga una casa propia.
