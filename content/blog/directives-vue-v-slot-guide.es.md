---
title: "Directivas en Vue: v-slot"
description: "Aprende a dominar v-slot en Vue 3: slots por defecto, nombrados y con props (scoped slots), con ejemplos claros en Composition API y Options API."
date: 2026-02-19T08:00:00-05:00
updatedAt: 2026-02-19T08:00:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771508914/directives-vue-v-slot-guide_wr2iyy.png
coverAlt: "Portada del artículo Directivas en Vue: v-slot"
coverCaption: "Usa v-slot para construir componentes más flexibles y reutilizables."
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-slot
  - slots
  - scoped slots
  - componentes reutilizables
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directivas en Vue: v-slot con ejemplos claros y prácticos"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-19T08:00:00-05:00"
---
# Directivas en Vue: `v-slot`

`v-slot` permite decidir, desde el componente padre, qué contenido se renderizará dentro de zonas específicas definidas por el componente hijo.
En términos simples: el hijo define “huecos” y el padre decide qué colocar en ellos.

Es una de las herramientas más potentes de Vue 3 para construir componentes reutilizables sin perder control sobre el renderizado.

## Por qué importa

Sin slots, muchos componentes terminan siendo rígidos:

* Con textos y botones “quemados” dentro del hijo.
* Con demasiadas props para cubrir casos muy específicos.
* Difíciles de reutilizar en pantallas diferentes.

> Con `v-slot`, puedes diseñar componentes base (cards, modals, tablas, layouts) que se adapten a distintos contextos sin duplicar lógica ni sacrificar claridad.

## Concepto base

Un componente hijo define `<slot />`, y el padre inyecta contenido:

```vue [BaseCard.vue] {3}
<template>
  <section class="card">
    <slot />
  </section>
</template>
```
```vue [App.vue] {2,5}
<template>
  <BaseCard>
    <h2>Título dinámico</h2>
    <p>Contenido personalizado desde el padre.</p>
  </BaseCard>
</template>
```

Tipos de slots:

* **Slot por defecto**: `<slot />`
* **Slots nombrados**: `<slot name="header" />`
* **Slots con props (scoped slots)**: `<slot name="row" :item="item" />`

Sintaxis común en el padre:

* `#default` para el slot por defecto.
* `#header`, `#footer`, etc. para slots nombrados.
* `#row="{ item }"` para recibir props desde el hijo.

> `#` es la forma abreviada de `v-slot:`.

## Cuándo usarlo

Usa `v-slot` cuando:

* Tienes un componente estructural (card, modal, layout) cuyo contenido cambia según la vista.
* Necesitas exponer datos internos del hijo al padre para personalizar el render (`scoped slots`).
* Quieres una API flexible sin proliferar props booleanas como `showHeader`, `showFooter`, etc.

## Cuándo evitarlo

Evítalo cuando:

* El componente tiene estructura y contenido completamente fijos.
* Estás usando slots para esconder lógica que debería vivir en composables o en el store.
* El template se vuelve excesivamente complejo por anidación profunda de slots.

> En estos casos, menos flexibilidad suele traducirse en mayor mantenibilidad.

## Errores comunes

### 1) Usar `v-slot` en un elemento que no es componente o `<template>`

`v-slot` solo puede usarse en:

* Un componente.
* Un `<template>` que envuelve contenido para un slot específico.

```vue [Incorrecto.vue] {1}
<div v-slot:header>
  Título
</div>
```
```vue [Correcto.vue]{2,4}
<BaseCard>
  <template #header>
    Título
  </template>
</BaseCard>
```

### 2) No destructurar las props de un scoped slot

Si el hijo expone `:item="row"`, el padre debe capturar ese objeto correctamente:

```vue [DataTable.vue]{1,2}
<DataTable :rows="users">
  <template #row="{ item }">
    <strong>{{ item.name }}</strong>
  </template>
</DataTable>
```

Si no se destructura correctamente, perderás acceso explícito a las props del slot.

### 3) Convertir los slots en “prop drilling visual”

Cuando todo pasa por slots y casi nada por props o eventos bien definidos, la API del componente se vuelve confusa.

Regla práctica:

* **Props** → configuración.
* **Slots** → estructura/contenido.
* **Emits** → eventos.

> Separar responsabilidades mantiene la API clara y predecible.

### 4) No definir fallback en el hijo

Si el padre no provee contenido para un slot, puede quedar un espacio vacío inesperado.

Siempre que tenga sentido, define contenido por defecto:

```vue [BaseCard.vue]
<slot>
  Fallback por defecto
</slot>
```

## Ejemplos prácticos

### 1) Slot por defecto con fallback

```vue [BaseCard.vue]{3,5}
<template>
  <article class="card">
    <slot>
      <p>Contenido por defecto de la tarjeta.</p>
    </slot>
  </article>
</template>
```

### 2) Slots nombrados para estructurar un layout

```vue [BaseLayout.vue]{4,8,12}
<template>
  <section class="layout">
    <header>
      <slot name="header" />
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <slot name="footer" />
    </footer>
  </section>
</template>
```

### 3) Scoped slot para personalizar filas de una tabla

```vue [DataTable.vue]{6,8}
<template>
  <table>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>
          <slot name="row" :item="row">
            {{ row.name }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

### 4) `v-slot` con argumento dinámico

Vue permite argumentos dinámicos usando la misma sintaxis que otras directivas dinámicas:

```vue [Padre.vue]{3}
<template>
  <WidgetShell>
    <template v-slot:[zonaActiva]>
      <p>Este bloque entra en una zona dinámica.</p>
    </template>
  </WidgetShell>
</template>
```

> Úsalo con moderación. Si existen muchas zonas dinámicas, probablemente la API del componente necesite simplificarse.

# Ejemplo con Composition API

El hijo expone una tabla base y el padre decide cómo renderizar la celda de acciones.

```vue [DataTable.vue]
<script setup>
defineProps({
  rows: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        <th class="text-left">Nombre</th>
        <th class="text-left">Rol</th>
        <th class="text-left">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in rows" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.role }}</td>
        <td>
          <slot name="actions" :user="user">
            <button type="button">Ver perfil</button>
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```
```vue [UsersView.vue]
<script setup>
import { ref } from "vue";
import DataTable from "./DataTable.vue";

const users = ref([
  { id: 1, name: "Ana", role: "Admin", active: true },
  { id: 2, name: "Luis", role: "Editor", active: false },
]);

function toggleStatus(user) {
  user.active = !user.active;
}
</script>

<template>
  <DataTable :rows="users">
    <template #actions="{ user }">
      <button type="button" @click="toggleStatus(user)">
        {{ user.active ? "Desactivar" : "Activar" }}
      </button>
    </template>
  </DataTable>
</template>
```

# Ejemplo con Options API

El mismo comportamiento, ahora utilizando Options API para mantener equivalencia conceptual.

```vue [DataTable.vue]
<script>
export default {
  props: {
    rows: {
      type: Array,
      required: true,
    },
  },
};
</script>

<template>
  <table class="min-w-full border-collapse">
    <thead>
      <tr>
        <th class="text-left">Nombre</th>
        <th class="text-left">Rol</th>
        <th class="text-left">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in rows" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.role }}</td>
        <td>
          <slot name="actions" :user="user">
            <button type="button">Ver perfil</button>
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```
```vue [UsersView.vue]
<script>
import DataTable from "./DataTable.vue";

export default {
  components: { DataTable },
  data() {
    return {
      users: [
        { id: 1, name: "Ana", role: "Admin", active: true },
        { id: 2, name: "Luis", role: "Editor", active: false },
      ],
    };
  },
  methods: {
    toggleStatus(user) {
      user.active = !user.active;
    },
  },
};
</script>

<template>
  <DataTable :rows="users">
    <template #actions="{ user }">
      <button type="button" @click="toggleStatus(user)">
        {{ user.active ? "Desactivar" : "Activar" }}
      </button>
    </template>
  </DataTable>
</template>
```

## Resumen

* `v-slot` transforma componentes rígidos en piezas reutilizables y expresivas.
* Usa el slot por defecto para el contenido principal.
* Usa slots nombrados para estructura (`header`, `footer`, etc.).
* Usa scoped slots cuando el hijo deba compartir datos y el padre controlar el render.
* Define fallback cuando tenga sentido para evitar huecos vacíos.
* Mantén la API clara: props para configuración, slots para contenido y emits para eventos.
