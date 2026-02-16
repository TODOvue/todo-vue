---
title: "Directivas en Vue: v-model"
description: "Aprende a usar v-model en Vue 3 para formularios y componentes personalizados, con Composition API y Options API, casos reales, errores comunes y buenas practicas."
date: 2026-02-16T13:00:00-05:00
updatedAt: 2026-02-16T13:00:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Formularios"
    color: "#FF7043"
  - tag: "Guías"
    color: "#42B983"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771265788/directives-vue-v-model-guide_ticgya.png
coverAlt: "Imagen temporal para portada del artículo sobre v-model en Vue"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-model
  - formularios
  - two-way binding
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directiva v-model en Vue: guía completa para formularios y componentes"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-16T13:00:00-05:00"
---
# Directivas en Vue: `v-model`

`v-model` reduce fricción en formularios porque sincroniza la UI y el estado con una sola declaración. Bien utilizado, hace que tus componentes sean más legibles y consistentes; mal aplicado, puede ocultar flujos de datos confusos y bugs sutiles.

## Por qué importa

En interfaces reales, gran parte de la experiencia depende de formularios y filtros.
`v-model` te permite declarar la sincronización entre vista y estado sin manipular el DOM manualmente, manteniendo el código más predecible y fácil de mantener.

Con `v-model` puedes:

* Evitar boilerplate repetitivo de `:value` + `@input`.
* Mantener alineado lo que ve el usuario con el estado reactivo.
* Estandarizar la API de componentes de formulario reutilizables.

## Concepto clave

En Vue 3, `v-model` es azúcar sintáctica para enlazar un valor y escuchar su actualización.

### En elementos nativos

* `v-model="email"` equivale a enlazar el valor y escuchar el evento correspondiente.
* Vue adapta automáticamente la prop y el evento según el tipo de control (`input`, `change`, `checkbox`, etc.).

Por ejemplo, en un `<input type="text">`, se traduce a `:value` + `@input`.
En un `<input type="checkbox">`, enlaza `checked` y escucha `change`.

### En componentes

En Vue 3:

* Por defecto usa la prop `modelValue`.
* Espera el evento `update:modelValue`.
* Puedes usar argumentos para modelos adicionales: `v-model:title`, `v-model:filters`.

También soporta modificadores como:

* `.trim`
* `.number`
* `.lazy`

Desde Vue 3.3+, puedes usar `defineModel()` en `<script setup>` para simplificar la definición del contrato del modelo en componentes.

## Cuándo usarlo

Usa `v-model` cuando el objetivo principal sea sincronizar datos de entrada con el estado de la aplicación.

Casos típicos:

* Formularios de registro, login o perfil.
* Filtros de búsqueda en tiempo real.
* Componentes de UI reutilizables (`TextInput`, `Toggle`, `Select`) con contrato consistente.
* Configuraciones rápidas de interfaz (switches, sliders, preferencias).

## Cuándo evitarlo

Evita `v-model` cuando:

* El dato es de solo lectura o derivado (`computed` sin setter).
* Necesitas trazabilidad estricta de cada cambio por reglas de dominio complejas.
* El procesamiento por pulsación es costoso y requiere un pipeline explícito (debounce, throttle, validaciones pesadas).
* Quieres mantener un flujo explícito de eventos de negocio, no solo de UI.

## Errores comunes

### 1) Mutar props directamente en el hijo

Incorrecto:

```vue [Evitar]
<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
props.modelValue = "nuevo valor"
</script>
```

Correcto: emite `update:modelValue` o usa `defineModel`.

> Las props son de solo lectura. Mutarlas rompe el flujo unidireccional de datos.

### 2) Enlazar `v-model` a expresiones no escribibles

Incorrecto:

```vue [Evitar]
<input v-model="user.name.toUpperCase()" />
```

> `v-model` requiere una referencia escribible. Una expresión derivada no tiene setter.

Correcto:

```vue [Recomendado]
<input v-model="user.name" />
```

### 3) No usar modificadores donde sí aportan valor

Ejemplo:

* Sin `.trim`, guardas espacios innecesarios.
* Sin `.number`, recibes `string` cuando esperabas `number`.
* Sin `.lazy`, actualizas en cada pulsación cuando solo necesitabas al perder el foco.

### 4) Meter demasiada lógica en el setter del modelo

Mantén el flujo de `v-model` simple y mueve reglas complejas a funciones o composables.
El modelo debe sincronizar estado; la lógica de negocio no debería vivir en el setter.

# Ejemplos prácticos

## 1) Input de texto con saneamiento básico

```vue [Composition API] {10}
<script setup lang="ts">
import { ref } from "vue";

const fullName = ref("");
</script>

<template>
  <label>
    Nombre completo
    <input v-model.trim="fullName" type="text" />
  </label>
</template>
```
```vue [Options API] {14}
<script lang="ts">
export default {
  data() {
    return {
      fullName: "",
    };
  },
};
</script>

<template>
  <label>
    Nombre completo
    <input v-model.trim="fullName" type="text" />
  </label>
</template>
```

## 2) Input numérico con `v-model.number`

```vue [Composition API] {10}
<script setup lang="ts">
import { ref } from "vue";

const age = ref<number | null>(null);
</script>

<template>
  <label>
    Edad
    <input v-model.number="age" type="number" min="0" />
  </label>
</template>
```
```vue [Options API] {14}
<script lang="ts">
export default {
  data() {
    return {
      age: null,
    };
  },
};
</script>

<template>
  <label>
    Edad
    <input v-model.number="age" type="number" min="0" />
  </label>
</template>
```

## 3) Checkbox para estado booleano

```vue [Composition API] {9}
<script setup lang="ts">
import { ref } from "vue";

const acceptedTerms = ref(false);
</script>

<template>
  <label>
    <input v-model="acceptedTerms" type="checkbox" />
    Acepto términos y condiciones
  </label>
</template>
```
```vue [Options API] {13}
<script lang="ts">
export default {
  data() {
    return {
      acceptedTerms: false,
    };
  },
};
</script>

<template>
  <label>
    <input v-model="acceptedTerms" type="checkbox" />
    Acepto términos y condiciones
  </label>
</template>
```

## 4) Ejemplos completos

### Ejemplo con Composition API

`SearchInput` reutilizable con `defineModel` + pantalla de filtros:

```vue [SearchInput.vue] {9}
<script setup lang="ts">
const model = defineModel<string>({ default: "" });
</script>

<template>
  <label class="field">
    Buscar
    <input
      v-model.trim="model"
      type="text"
      placeholder="Escribe para filtrar..."
    />
  </label>
</template>
```
```vue [ProductFilter.vue]
<script setup lang="ts">
import { computed, ref } from "vue";
import SearchInput from "./SearchInput.vue";

const query = ref("");
const minPrice = ref<number | null>(null);
const onlyInStock = ref(false);

const products = ref([
  { id: 1, name: "Teclado mecánico", price: 89, stock: true },
  { id: 2, name: "Mouse ergonómico", price: 45, stock: false },
  { id: 3, name: 'Monitor 27"', price: 299, stock: true },
]);

const filteredProducts = computed(() =>
  products.value.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.value.toLowerCase());
    const matchesPrice =
      minPrice.value == null || p.price >= minPrice.value;
    const matchesStock = !onlyInStock.value || p.stock;

    return matchesQuery && matchesPrice && matchesStock;
  })
);
</script>

<template>
  <section>
    <h2>Filtros</h2>

    <SearchInput v-model="query" />

    <label>
      Precio mínimo
      <input v-model.number="minPrice" type="number" min="0" />
    </label>

    <label>
      <input v-model="onlyInStock" type="checkbox" />
      Solo disponibles
    </label>

    <ul>
      <li v-for="item in filteredProducts" :key="item.id">
        {{ item.name }} - ${{ item.price }}
        <span v-if="!item.stock">(sin stock)</span>
      </li>
    </ul>
  </section>
</template>
```

### Ejemplo con Options API

Mismo comportamiento usando `modelValue` y `update:modelValue`:

```vue [SearchInput.vue]
<script lang="ts">
export default {
  name: "SearchInput",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
};
</script>

<template>
  <label class="field">
    Buscar
    <input
      :value="modelValue"
      type="text"
      placeholder="Escribe para filtrar..."
      @input="$emit('update:modelValue', $event.target.value.trim())"
    />
  </label>
</template>
```
```vue [ProductFilter.vue]
<script lang="ts">
import SearchInput from "./SearchInput.vue";

export default {
  name: "ProductFilter",
  components: { SearchInput },
  data() {
    return {
      query: "",
      minPrice: null,
      onlyInStock: false,
      products: [
        { id: 1, name: "Teclado mecánico", price: 89, stock: true },
        { id: 2, name: "Mouse ergonómico", price: 45, stock: false },
        { id: 3, name: 'Monitor 27"', price: 299, stock: true },
      ],
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((p) => {
        const matchesQuery = p.name
          .toLowerCase()
          .includes(this.query.toLowerCase());
        const matchesPrice =
          this.minPrice == null || p.price >= Number(this.minPrice);
        const matchesStock = !this.onlyInStock || p.stock;

        return matchesQuery && matchesPrice && matchesStock;
      });
    },
  },
};
</script>

<template>
  <section>
    <h2>Filtros</h2>

    <SearchInput v-model="query" />

    <label>
      Precio mínimo
      <input v-model.number="minPrice" type="number" min="0" />
    </label>

    <label>
      <input v-model="onlyInStock" type="checkbox" />
      Solo disponibles
    </label>

    <ul>
      <li v-for="item in filteredProducts" :key="item.id">
        {{ item.name }} - ${{ item.price }}
        <span v-if="!item.stock">(sin stock)</span>
      </li>
    </ul>
  </section>
</template>
```

## Resumen

`v-model` es la forma idiomática en Vue 3 para sincronizar UI y estado en formularios y componentes.

Úsalo para reducir boilerplate y mantener consistencia, pero evita convertirlo en un atajo para lógica de negocio compleja.

Puntos clave:

* En inputs nativos, simplifica `:value` + eventos.
* En componentes, respeta `modelValue` / `update:modelValue` o usa `defineModel`.
* Aplica modificadores (`.trim`, `.number`, `.lazy`) cuando mejoren la calidad de los datos o el rendimiento.
* Mantén el flujo de datos claro y explícito cuando el dominio lo requiera.
