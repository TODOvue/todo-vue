---
title: "Directivas en Vue: v-once / v-memo / v-pre"
description: "Aprende cuándo usar v-once, v-memo y v-pre en Vue 3 para optimizar renderizado, evitar trabajo innecesario y mantener componentes claros."
date: 2026-02-23T21:00:00-05:00
updatedAt: 2026-02-23T21:00:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1771897190/directives-vue-v-once-v-memo-v-pre-guide_ljsdlv.png
coverAlt: "Imagen temporal para portada del artículo sobre v-once, v-memo y v-pre en Vue"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-once
  - v-memo
  - v-pre
  - optimización render
schemaOrg:
  - type: "BlogPosting"
    headline: "Directivas en Vue: v-once, v-memo y v-pre para renderizado eficiente"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-23T21:00:00-05:00"
---
# Directivas en Vue: `v-once` / `v-memo` / `v-pre`

`v-once`, `v-memo` y `v-pre` son directivas enfocadas en rendimiento y control de compilación/render. No son para “poner en todo”, pero en escenarios concretos reducen trabajo innecesario y evitan *re-renders* costosos.

## Por qué importa

En apps grandes, muchos problemas de rendimiento no vienen de una sola operación pesada, sino de miles de renders pequeños que se repiten sin necesidad.

Estas directivas te permiten:

* Congelar fragmentos estáticos (`v-once`).
* Reutilizar subárboles cuando dependencias clave no cambian (`v-memo`).
* Omitir compilación de expresiones para contenido literal (`v-pre`).

Usadas con criterio, mejoran la fluidez sin romper la legibilidad.

## Concepto clave

### `v-once`

Renderiza el nodo una sola vez. En actualizaciones posteriores, Vue reutiliza el resultado y no vuelve a evaluarlo.

Ideal para contenido realmente inmutable (versión de build, texto legal fijo, metadata de entorno, etc.).

### `v-memo`

Memoiza (cachea) un subárbol del template con base en un **arreglo de dependencias**. Si ninguna dependencia cambia, Vue omite el *patch* de ese subárbol.

Útil cuando una porción del template es costosa y depende de pocas señales estables. Nota importante: `v-memo` existe desde Vue **3.2+**.

### `v-pre`

Le dice a Vue que **no compile** ese bloque. Las interpolaciones `{{ ... }}` se muestran como texto literal.

Es perfecto para ejemplos de código o snippets donde quieres imprimir sintaxis de Vue sin evaluarla.

## Cuándo usarlo

Usa estas directivas cuando tengas una razón concreta y medible:

* `v-once`: bloques estáticos que no deben reaccionar a cambios.
* `v-memo`: listas o tarjetas complejas con alto costo de render cuando conoces **dependencias exactas**.
* `v-pre`: documentación, tutoriales o demos donde quieres mostrar moustaches literalmente.

Casos reales:

* Dashboard con cards densas que solo cambian por `id` y estado puntual.
* Pantalla de onboarding con secciones 100% estáticas.
* Vista de documentación dentro de tu app que muestra sintaxis de Vue “en crudo”.

## Cuándo evitarlo

Evítalas cuando solo intentas “optimizar por optimizar”:

* No uses `v-once` en datos que luego deben actualizarse.
* No uses `v-memo` sin entender bien sus dependencias; puede ocultar cambios esperados.
* No uses `v-pre` en bloques que sí necesitan bindings o eventos.

Si no has detectado un problema real de render, primero mide con Vue Devtools antes de complejizar el template.

## Comparación rápida

* `v-once`: congelado permanente después del primer render.
* `v-memo`: congelado condicional según dependencias.
* `v-pre`: sin compilación de plantilla; salida literal.

Regla rápida:

* Quieres “no volver a actualizar nunca”: `v-once`.
* Quieres “actualizar solo si cambian X dependencias”: `v-memo`.
* Quieres “mostrar template sin interpretar”: `v-pre`.

## Errores comunes

### 1) Aplicar `v-once` sobre datos que sí cambian

Si la fuente cambia pero el nodo tiene `v-once`, la UI quedará desfasada.

**Solución:** limita `v-once` a contenido estrictamente inmutable.

### 2) Definir mal dependencias en `v-memo`

Si olvidas una dependencia relevante, Vue puede reutilizar un subárbol viejo.
Si incluyes demasiadas dependencias, pierdes el beneficio.

**Solución:** declara solo señales que realmente afectan el HTML renderizado (y asegúrate de incluir todas).

### 3) Esperar que `v-pre` procese directivas o interpolaciones

Con `v-pre`, Vue no interpreta nada dentro del bloque (ni moustaches, ni directivas anidadas).

**Solución:** usa `v-pre` solo para salida literal/documentación.

### 4) Usarlas sin validar impacto

Agregar estas directivas indiscriminadamente puede aumentar complejidad sin mejorar performance real.

**Solución:** perfila primero y optimiza donde el costo sea comprobable.

## Ejemplos prácticos

### 1) Bloque estático con `v-once`

```vue [Composition API] {11}
<script setup lang="ts">
import { ref } from "vue";

const counter = ref(0);
const buildVersion = "2026.02.24";
</script>

<template>
  <button @click="counter++">Clicks: {{ counter }}</button>

  <p v-once>Build: {{ buildVersion }}</p>
</template>
```

```vue [Options API] {14}
<script lang="ts">
export default {
  data() {
    return {
      counter: 0,
      buildVersion: "2026.02.24",
    };
  },
};
</script>

<template>
  <button @click="counter++">Clicks: {{ counter }}</button>
  <p v-once>Build: {{ buildVersion }}</p>
</template>
```

> Nota: este ejemplo asume que `buildVersion` es inmutable. Si en tu app podría cambiar (p. ej., viene de una llamada async), `v-once` no es lo correcto.

### 2) Segmento pesado con `v-memo`

```vue [Composition API] {18}
<script setup lang="ts">
import { ref } from "vue";

type UserCard = { id: number; name: string; isOnline: boolean; score: number };

const selectedId = ref<number | null>(null);
const users = ref<UserCard[]>([
  { id: 1, name: "Ana", isOnline: true, score: 98 },
  { id: 2, name: "Luis", isOnline: false, score: 77 },
  { id: 3, name: "Marta", isOnline: true, score: 88 },
]);
</script>

<template>
  <article
    v-for="user in users"
    :key="user.id"
    v-memo="[user.id, user.isOnline, selectedId === user.id]"
    class="card"
  >
    <h3>{{ user.name }}</h3>
    <p>Puntaje: {{ user.score }}</p>
    <p>{{ user.isOnline ? "En línea" : "Desconectado" }}</p>
    <button @click="selectedId = user.id">Seleccionar</button>
  </article>
</template>
```

```vue [Options API] {20}
<script lang="ts">
export default {
  data() {
    return {
      selectedId: null as number | null,
      users: [
        { id: 1, name: "Ana", isOnline: true, score: 98 },
        { id: 2, name: "Luis", isOnline: false, score: 77 },
        { id: 3, name: "Marta", isOnline: true, score: 88 },
      ],
    };
  },
};
</script>

<template>
  <article
    v-for="user in users"
    :key="user.id"
    v-memo="[user.id, user.isOnline, selectedId === user.id]"
    class="card"
  >
    <h3>{{ user.name }}</h3>
    <p>Puntaje: {{ user.score }}</p>
    <p>{{ user.isOnline ? "En línea" : "Desconectado" }}</p>
    <button @click="selectedId = user.id">Seleccionar</button>
  </article>
</template>
```

> Importante: el arreglo de `v-memo` debe incluir **todo** lo que afecte el HTML. Si `user.score` puede cambiar, también debería estar en dependencias (si no, el DOM podría quedarse con un puntaje viejo).

### 3) Bloque literal con `v-pre`

```vue [Composition API] {8}
<script setup lang="ts">
const message = "No debe renderizarse dentro del bloque v-pre";
</script>

<template>
  <p>{{ message }}</p>

  <pre v-pre>{{ message }} + {{ 2 + 2 }}</pre>
</template>
```

```vue [Options API] {13}
<script lang="ts">
export default {
  data() {
    return {
      message: "No debe renderizarse dentro del bloque v-pre",
    };
  },
};
</script>

<template>
  <p>{{ message }}</p>
  <pre v-pre>{{ message }} + {{ 2 + 2 }}</pre>
</template>
```

### 4) Ejemplo completo

Componente de lista con cabecera estática (`v-once`), tarjetas memoizadas (`v-memo`) y snippet literal (`v-pre`):

```vue [Composition API]
<script setup lang="ts">
import { computed, ref } from "vue";

type Task = { id: number; title: string; done: boolean; owner: string };

const selectedOwner = ref<"all" | string>("all");
const tasks = ref<Task[]>([
  { id: 1, title: "Configurar CI", done: true, owner: "Ana" },
  { id: 2, title: "Refactor store", done: false, owner: "Luis" },
  { id: 3, title: "Actualizar docs", done: false, owner: "Ana" },
]);

const owners = computed(() => ["all", ...new Set(tasks.value.map((t) => t.owner))]);
const visibleTasks = computed(() =>
  selectedOwner.value === "all"
    ? tasks.value
    : tasks.value.filter((t) => t.owner === selectedOwner.value)
);
</script>

<template>
  <header v-once>
    <h2>Panel de tareas del sprint</h2>
    <p>Contenido institucional estático</p>
  </header>

  <label>
    Filtrar por owner
    <select v-model="selectedOwner">
      <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
    </select>
  </label>

  <section
    v-for="task in visibleTasks"
    :key="task.id"
    v-memo="[task.id, task.done, selectedOwner]"
    class="task-card"
  >
    <h3>{{ task.title }}</h3>
    <p>Owner: {{ task.owner }}</p>
    <p>Estado: {{ task.done ? "Completada" : "Pendiente" }}</p>
  </section>

  <aside>
    <h4>Snippet para docs</h4>
    <code v-pre>{{ title }} - {{ owner }}</code>
  </aside>
</template>
```

```vue [Options API]
<script lang="ts">
export default {
  data() {
    return {
      selectedOwner: "all",
      tasks: [
        { id: 1, title: "Configurar CI", done: true, owner: "Ana" },
        { id: 2, title: "Refactor store", done: false, owner: "Luis" },
        { id: 3, title: "Actualizar docs", done: false, owner: "Ana" },
      ],
    };
  },
  computed: {
    owners() {
      return ["all", ...new Set(this.tasks.map((t) => t.owner))];
    },
    visibleTasks() {
      return this.selectedOwner === "all"
        ? this.tasks
        : this.tasks.filter((t) => t.owner === this.selectedOwner);
    },
  },
};
</script>

<template>
  <header v-once>
    <h2>Panel de tareas del sprint</h2>
    <p>Contenido institucional estático</p>
  </header>

  <label>
    Filtrar por owner
    <select v-model="selectedOwner">
      <option v-for="owner in owners" :key="owner" :value="owner">{{ owner }}</option>
    </select>
  </label>

  <section
    v-for="task in visibleTasks"
    :key="task.id"
    v-memo="[task.id, task.done, selectedOwner]"
    class="task-card"
  >
    <h3>{{ task.title }}</h3>
    <p>Owner: {{ task.owner }}</p>
    <p>Estado: {{ task.done ? "Completada" : "Pendiente" }}</p>
  </section>

  <aside>
    <h4>Snippet para docs</h4>
    <code v-pre>{{ title }} - {{ owner }}</code>
  </aside>
</template>
```

## Resumen

`v-once`, `v-memo` y `v-pre` son herramientas de precisión:

* `v-once` para congelar contenido inmutable.
* `v-memo` para evitar renders cuando dependencias clave no cambian.
* `v-pre` para mostrar template literal sin compilación.

La clave no es usarlas en todo, sino en puntos donde el costo de render sea real y el comportamiento esperado sea claro.
