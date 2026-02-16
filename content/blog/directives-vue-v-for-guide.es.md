---
title: "Directivas en Vue: v-for"
description: "Aprende a dominar v-for en Vue con ejemplos prácticos desde lo más básico hasta patrones avanzados, uso correcto de key, errores comunes y buenas prácticas en Composition API y Options API."
date: 2026-02-09T21:30:00-05:00
updatedAt: 2026-02-09T21:30:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Listas"
    color: "#1D5BA1"
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770690176/directives-vue-v-for-guide_itbdds.png
coverAlt: "Imagen temporal para portada del artículo sobre v-for en Vue"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-for
  - listas
  - key
  - Composition API
  - Options API
  - renderizado
schemaOrg:
  - type: "BlogPosting"
    headline: "Directiva v-for en Vue: guía completa de básico a avanzado"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-09T21:30:00-05:00"
---

# Directiva `v-for` en Vue: de lo básico a lo avanzado

`v-for` es la directiva de Vue para renderizar listas.
Parece simple, pero usarla bien marca una diferencia enorme en rendimiento, estabilidad visual y legibilidad del código.

La idea clave es esta:

- `v-for` describe cómo repetir estructura en el template.
- `:key` le dice a Vue cómo identificar cada nodo de forma estable.

Si dominas ese par, evitas la mayoría de bugs en listas dinámicas.

## Por qué importa

En aplicaciones reales siempre renderizas listas:

- Tareas
- Productos
- Comentarios
- Notificaciones
- Filas de tablas

Cuando la lista cambia (insertar, borrar, reordenar), Vue necesita saber qué item es cuál.
Si la clave (`key`) no es estable, aparecen errores como:

- Estados internos mezclados entre filas
- Animaciones raras
- Inputs que "saltan" de elemento

## Cuándo usar `v-for`

Úsalo cuando necesitas:

- Renderizar arrays u objetos reactivos
- Repetir componentes con distintos datos
- Mostrar estructuras anidadas (ej: categorías y productos)

## Cuándo evitarlo

Evita usar `v-for` para:

- Hacer filtrado complejo directamente en el template
- Combinar `v-if` y `v-for` en el mismo nodo si puedes prefiltrar con `computed`
- Usar `index` como `key` en listas que cambian de orden

## Sintaxis base

```vue [Composition API] {8}
<script setup>
import { ref } from 'vue'

const frameworks = ref(['Vue', 'React', 'Svelte'])
</script>

<template>
  <li v-for="framework in frameworks" :key="framework">
    {{ framework }}
  </li>
</template>
```
```vue [Options API] {12}
<script>
export default {
  data() {
    return {
      frameworks: ['Vue', 'React', 'Svelte']
    }
  }
}
</script>

<template>
  <li v-for="framework in frameworks" :key="framework">
    {{ framework }}
  </li>
</template>
```

## Ejemplo básico: lista de tareas

Este es el patrón más común y correcto para empezar.

```vue [Composition API] {4-8,13}
<script setup>
import { ref } from 'vue'

const todos = ref([
  { id: 1, text: 'Aprender v-for', done: true },
  { id: 2, text: 'Practicar key estable', done: false },
  { id: 3, text: 'Evitar index como key', done: false }
])
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
        {{ todo.text }}
      </span>
    </li>
  </ul>
</template>
```
```vue [Options API] {5-9,17}
<script>
export default {
  data() {
    return {
      todos: [
        { id: 1, text: 'Aprender v-for', done: true },
        { id: 2, text: 'Practicar key estable', done: false },
        { id: 3, text: 'Evitar index como key', done: false }
      ]
    }
  }
}
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <span :style="{ textDecoration: todo.done ? 'line-through' : 'none' }">
        {{ todo.text }}
      </span>
    </li>
  </ul>
</template>
```

## Nivel intermedio: índice, objetos y `template v-for`

### 1) Índice en `v-for`

Puedes obtener índice cuando realmente lo necesitas:

```vue [Composition API] {8}
<script setup>
import { ref } from 'vue'

const users = ref(['Ana', 'Luis', 'Marta'])
</script>

<template>
  <p v-for="(user, index) in users" :key="user">
    #{{ index + 1 }} - {{ user }}
  </p>
</template>
```
```vue [Options API] {12}
<script>
export default {
  data() {
    return {
      users: ['Ana', 'Luis', 'Marta']
    }
  }
}
</script>

<template>
  <p v-for="(user, index) in users" :key="user">
    #{{ index + 1 }} - {{ user }}
  </p>
</template>
```

### 2) Iterar un objeto

```vue [Composition API] {12}
<script setup>
import { ref } from 'vue'

const profile = ref({
  name: 'Cristian',
  role: 'Frontend Dev',
  country: 'Colombia'
})
</script>

<template>
  <li v-for="(value, key) in profile" :key="key">
    {{ key }}: {{ value }}
  </li>
</template>
```
```vue [Options API] {16}
<script>
export default {
  data() {
    return {
      profile: {
        name: 'Cristian',
        role: 'Frontend Dev',
        country: 'Colombia'
      }
    }
  }
}
</script>

<template>
  <li v-for="(value, key) in profile" :key="key">
    {{ key }}: {{ value }}
  </li>
</template>
```

### 3) Repetir varios nodos con `template`

```vue [Composition API]{11}
<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, title: 'Vue 3', description: 'Framework progresivo' },
  { id: 2, title: 'Pinia', description: 'Estado global moderno' }
])
</script>

<template>
  <template v-for="item in items" :key="item.id">
    <h3>{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <hr />
  </template>
</template>
```
```vue [Options API] {15}
<script>
export default {
  data() {
    return {
      items: [
        { id: 1, title: 'Vue 3', description: 'Framework progresivo' },
        { id: 2, title: 'Pinia', description: 'Estado global moderno' }
      ]
    }
  }
}
</script>

<template>
  <template v-for="item in items" :key="item.id">
    <h3>{{ item.title }}</h3>
    <p>{{ item.description }}</p>
    <hr />
  </template>
</template>
```

## Nivel avanzado: listas derivadas, componentes y anidación

### 1) Prefiltrar y ordenar con `computed`

No hagas lógica pesada dentro del `v-for`.
Deriva la lista antes, con `computed`.

```vue [Composition API] {10-15,19}
<script setup>
import { computed, ref } from 'vue'

const products = ref([
  { id: 1, name: 'Laptop', price: 1200, stock: 5 },
  { id: 2, name: 'Mouse', price: 25, stock: 0 },
  { id: 3, name: 'Keyboard', price: 80, stock: 12 }
])

const inStockSorted = computed(() => {
  return products.value
    .filter(product => product.stock > 0)
    .slice()
    .sort((a, b) => a.price - b.price)
})
</script>

<template>
  <li v-for="product in inStockSorted" :key="product.id">
    {{ product.name }} - ${{ product.price }}
  </li>
</template>
```
```vue [Options API] {12-19,24}
<script>
export default {
  data() {
    return {
      products: [
        { id: 1, name: 'Laptop', price: 1200, stock: 5 },
        { id: 2, name: 'Mouse', price: 25, stock: 0 },
        { id: 3, name: 'Keyboard', price: 80, stock: 12 }
      ]
    }
  },
  computed: {
    inStockSorted() {
      return this.products
        .filter(product => product.stock > 0)
        .slice()
        .sort((a, b) => a.price - b.price)
    }
  }
}
</script>

<template>
  <li v-for="product in inStockSorted" :key="product.id">
    {{ product.name }} - ${{ product.price }}
  </li>
</template>
```

### 2) Renderizar componentes con `v-for`

```vue [Composition API] {12}
<script setup>
import { ref } from 'vue'
import UserCard from '~/components/UserCard.vue'

const users = ref([
  { id: 'u1', name: 'Ana', role: 'Admin' },
  { id: 'u2', name: 'Luis', role: 'Editor' }
])
</script>

<template>
  <UserCard v-for="user in users" :key="user.id" :user="user" />
</template>
```
```vue [Options API]{18}
<script>
import UserCard from '~/components/UserCard.vue'

export default {
  components: { UserCard },
  data() {
    return {
      users: [
        { id: 'u1', name: 'Ana', role: 'Admin' },
        { id: 'u2', name: 'Luis', role: 'Editor' }
      ]
    }
  }
}
</script>

<template>
  <UserCard v-for="user in users" :key="user.id" :user="user" />
</template>
```

### 3) Listas anidadas (categorías y productos)

```vue [Composition API]{17,19}
<script setup>
import { ref } from 'vue'

const categories = ref([
  {
    id: 'c1',
    name: 'Periféricos',
    products: [
      { id: 'p1', name: 'Mouse' },
      { id: 'p2', name: 'Teclado' }
    ]
  }
])
</script>

<template>
  <section v-for="category in categories" :key="category.id">
    <h3>{{ category.name }}</h3>
    <li v-for="product in category.products" :key="product.id">
      {{ product.name }}
    </li>
  </section>
</template>
```
```vue [Options API] {21,23}
<script>
export default {
  data() {
    return {
      categories: [
        {
          id: 'c1',
          name: 'Periféricos',
          products: [
            { id: 'p1', name: 'Mouse' },
            { id: 'p2', name: 'Teclado' }
          ]
        }
      ]
    }
  }
}
</script>

<template>
  <section v-for="category in categories" :key="category.id">
    <h3>{{ category.name }}</h3>
    <li v-for="product in category.products" :key="product.id">
      {{ product.name }}
    </li>
  </section>
</template>
```

## Errores comunes con `v-for`

### 1) Usar `index` como `key` en listas mutables

```vue [Incorrecto] {1}
<li v-for="(item, index) in items" :key="index">
  {{ item.name }}
</li>
```

Esto puede romper el estado de cada fila al reordenar o insertar elementos.
> Usa una clave estable (`item.id`) cuando exista.

### 2) Mezclar `v-if` y `v-for` en el mismo nodo

```vue [Evitar] {1}
<li v-for="user in users" v-if="user.active" :key="user.id">
  {{ user.name }}
</li>
```

> Crea una lista `computed` filtrada e itera esa lista.

### 3) Mutar directamente el resultado de un `computed`

Si derives una lista ordenada/filtrada, no la mutas directamente.
La fuente de verdad debe seguir siendo el estado original.

### 4) `key` duplicadas

Si dos elementos comparten la misma `key`, Vue no puede hacer diff correctamente.
Resultado: renders inconsistentes y bugs visuales difíciles de depurar.

## Buenas prácticas rápidas

- Usa `id` estable para `:key`.
- Prefiltra y ordena con `computed`.
- Evita lógica compleja en el template.
- Mantén los bloques `v-for` pequeños y legibles.
- En listas grandes, considera paginación o virtualización.

## Conclusión

`v-for` no es solo "pintar arrays".
Es una pieza central del renderizado declarativo en Vue.

Si aplicas estas reglas:

- `key` estable
- Listas derivadas con `computed`
- Estructura limpia del template

Vas a tener componentes más predecibles, más performantes y mucho más fáciles de mantener.
