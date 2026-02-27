---
title: "Directivas en Vue: Directivas personalizadas"
description: "Aprende a crear directivas personalizadas en Vue 3 con casos reales, ciclo de vida, limpieza correcta y ejemplos equivalentes en Composition API y Options API."
date: 2026-02-27T12:30:00-05:00
updatedAt: 2026-02-27T12:30:00-05:00
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Arquitectura"
    color: "#4CAF50"
  - tag: "Reactividad"
    color: "#1D5BA1"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772207944/directives-vue-custom-directives-guide_nwp7od.png
coverAlt: "Ejemplo de directiva personalizada en Vue 3"
coverCaption: "Ejemplo de directiva personalizada en Vue 3"
locale: es
author: TODOvue
series: vue-directives
seriesOrder: 11
seriesTitle: "Directivas en Vue"
seriesDescription: "Ruta paso a paso para dominar las directivas principales de Vue."
keywords:
  - Vue.js
  - directivas personalizadas
  - custom directives
  - ciclo de vida
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directivas personalizadas en Vue 3"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-27T12:30:00-05:00"
---
# Directivas personalizadas en Vue 3

## Por qué es importante

Las directivas personalizadas te permiten encapsular **manipulación imperativa de DOM** que no encaja bien en un componente o en un composable “puro”. Son especialmente útiles para comportamientos de bajo nivel como:

* Foco automático (`v-autofocus`)
* Atajos de teclado (`v-hotkey`)
* Clic fuera para cerrar (`v-click-outside`)
* Integración con API del navegador o librerías no reactivas (por ejemplo, `IntersectionObserver`, `ResizeObserver`, tooltips)

Si no las diseñas bien, es fácil terminar con **listeners duplicados**, **fugas de memoria** o lógica duplicada en múltiples vistas.

## Concepto clave

Una directiva personalizada es un objeto (o una función abreviada) con hooks que Vue ejecuta sobre un **elemento real del DOM**.

En Vue 3, una directiva puede exponer estos hooks (los más usados en la práctica):

* `mounted`: El elemento ya está en el DOM (ideal para agregar listeners u observers).
* `updated`: El componente se actualizó y necesitas refrescar el comportamiento.
* `unmounted`: Limpieza de listeners, timers, observers, etc.

Y también existen hooks “before-*” que son útiles en algunos casos:

* `beforeMount`, `beforeUpdate`, `beforeUnmount`

El `binding` te da acceso al valor recibido, argumento y modificadores:

* `binding.value`: Valor actual (`v-mi-directiva="valor"`).
* `binding.oldValue`: Valor anterior (solo disponible en `beforeUpdate`/`updated`).
* `binding.arg`: Argumento (`v-mi-directiva:delay="300"`).
* `binding.modifiers`: Modificadores (`v-mi-directiva.once.capture`).

Regla práctica: usa directivas para **comportamiento del elemento**, no para **estado de negocio**.

## Cuándo usar directivas personalizadas

1. Cuando necesitas lógica imperativa de DOM reutilizable en varios componentes.
2. Cuando integras APIs no reactivas (`IntersectionObserver`, `ResizeObserver`, tooltips de terceros).
3. Cuando quieres un contrato declarativo en template para un comportamiento concreto (`v-autofocus`, `v-click-outside`).

## Cuándo evitarlas

1. Cuando la solución real es un componente (estructura visual + estado + eventos).
2. Cuando la lógica se resuelve con bindings o directivas nativas (`v-model`, `v-bind`, `v-on`).
3. Cuando intentas usar una directiva para coordinar estado global o flujos de datos complejos.

## Errores comunes

1. **No limpiar recursos en `unmounted`.**

   * Por qué pasa: se agrega un listener en `mounted` y se olvida removerlo.
   * Solución: guarda referencias (en el elemento o en un closure controlado) y limpia siempre en `unmounted`.

2. **Acoplar la directiva a un caso único.**

   * Por qué pasa: nombres genéricos con lógica demasiado específica.
   * Solución: define un contrato claro con `value`, `arg` y `modifiers`.

3. **Asumir que una directiva aplicada sobre un componente “siempre” afecta un único nodo DOM.**

   * Por qué pasa: se presupone un único root estable o que el componente “forwardea” atributos/directivas como esperamos.
   * Solución: para comportamientos de bajo nivel, prioriza aplicarla a elementos HTML concretos (`input`, `div`, `button`). Si la aplicas sobre un componente, asegúrate de que ese componente tenga un root claro y que no rompa el forwarding (casos como múltiples roots o ciertas configuraciones pueden sorprender).

4. **Capturar un callback y no actualizarlo.**

   * Por qué pasa: se registra un handler en `mounted` que cierra sobre `binding.value` inicial. Si el callback cambia, el listener sigue llamando al antiguo.
   * Solución: guarda el callback “vigente” en el elemento y actualízalo en `updated`.

5. **Ejecutar trabajo pesado en cada `updated`.**

   * Por qué pasa: falta comparación entre valor anterior y actual.
   * Solución: salir temprano cuando corresponda (por ejemplo, comparando `binding.value` y `binding.oldValue` cuando aplique).

## Ejemplos prácticos

* `v-autofocus`: enfoca un input al montar.
* `v-click-outside`: cierra menú o modal al hacer clic fuera.
* `v-intersect`: dispara callback cuando un bloque entra en el viewport.

### `v-click-outside` (con callback actualizable)

```vue [Composition API]
<script setup lang="ts">
import type { Directive } from "vue";
import { ref } from "vue";

type ClickOutsideHandler = (event: MouseEvent) => void;

type ElWithClickOutside = HTMLElement & {
  __clickOutsideHandler__?: (event: MouseEvent) => void;
  __clickOutsideCallback__?: ClickOutsideHandler;
};

const isOpen = ref(false);

const vClickOutside: Directive<ElWithClickOutside, ClickOutsideHandler> = {
  mounted(el, binding) {
    if (typeof binding.value !== "function") return;

    // Guardamos el callback vigente (importante si cambia con el tiempo)
    el.__clickOutsideCallback__ = binding.value;

    const handler = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Si el click es fuera del elemento, llamamos al callback actual
      if (!el.contains(target)) {
        el.__clickOutsideCallback__?.(event);
      }
    };

    el.__clickOutsideHandler__ = handler;

    // Capture ayuda con overlays / stopPropagation dentro del dropdown
    document.addEventListener("click", handler, true);
  },

  updated(el, binding) {
    // Mantén el callback al día si cambió
    if (typeof binding.value === "function") {
      el.__clickOutsideCallback__ = binding.value;
    }
  },

  unmounted(el) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener("click", el.__clickOutsideHandler__, true);
    }
    delete el.__clickOutsideHandler__;
    delete el.__clickOutsideCallback__;
  },
};
</script>

<template>
  <section class="dropdown-demo">
    <button type="button" @click="isOpen = !isOpen">Alternar menú</button>

    <div v-if="isOpen" v-click-outside="() => (isOpen = false)">
      <p>Panel abierto</p>
      <p>Haz click fuera para cerrarlo.</p>
    </div>
  </section>
</template>
```
```vue [Options API]
<script>
export default {
  name: "ClickOutsideExample",
  data() {
    return {
      isOpen: false,
    };
  },
  directives: {
    clickOutside: {
      mounted(el, binding) {
        if (typeof binding.value !== "function") return;

        el.__clickOutsideCallback__ = binding.value;

        el.__clickOutsideHandler__ = (event) => {
          const target = event.target;
          if (target && !el.contains(target)) {
            el.__clickOutsideCallback__?.(event);
          }
        };

        document.addEventListener("click", el.__clickOutsideHandler__, true);
      },
      updated(el, binding) {
        if (typeof binding.value === "function") {
          el.__clickOutsideCallback__ = binding.value;
        }
      },
      unmounted(el) {
        if (el.__clickOutsideHandler__) {
          document.removeEventListener("click", el.__clickOutsideHandler__, true);
        }
        delete el.__clickOutsideHandler__;
        delete el.__clickOutsideCallback__;
      },
    },
  },
};
</script>

<template>
  <section class="dropdown-demo">
    <button type="button" @click="isOpen = !isOpen">Alternar menú</button>

    <div v-if="isOpen" v-click-outside="() => (isOpen = false)">
      <p>Panel abierto</p>
      <p>Haz click fuera para cerrarlo.</p>
    </div>
  </section>
</template>
```

> En `<script setup>`, cualquier variable **camelCase** que empiece por `v` puede usarse como directiva (`vClickOutside` → `v-click-outside`).

## Más ejemplos útiles

### `v-autofocus` (básico y práctico)

```ts [main.ts]
import type { Directive } from "vue";

export const vAutofocus: Directive<HTMLElement, boolean | undefined> = {
  mounted(el, binding) {
    // v-autofocus="false" desactiva el comportamiento
    if (binding.value === false) return;

    // En inputs/textarea suele ser lo esperado
    if (typeof (el as any).focus === "function") {
      (el as any).focus();
    }
  },
};
```
```js [main.js]
export const vAutofocus = {
  mounted(el, binding) {
    // v-autofocus="false" desactiva el comportamiento
    if (binding.value === false) return;
    // En inputs/textarea suele ser lo esperado
    if (typeof el.focus === "function") {
      el.focus();
    }
  },
};
```
```vue [App.vue]
<input v-autofocus />
<input v-autofocus="isDesktop" />
```

### `v-intersect` (IntersectionObserver)

```ts [main.ts]
import type { Directive } from "vue";

type IntersectValue = {
  onEnter?: (entry: IntersectionObserverEntry) => void;
  onLeave?: (entry: IntersectionObserverEntry) => void;
  options?: IntersectionObserverInit;
};

type ElWithObserver = HTMLElement & { __io__?: IntersectionObserver };

export const vIntersect: Directive<ElWithObserver, IntersectValue> = {
  mounted(el, binding) {
    const { onEnter, onLeave, options } = binding.value ?? {};

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);

    io.observe(el);
    el.__io__ = io;
  },
  updated(el, binding) {
    // Si cambian options de forma dinámica, lo más seguro es recrear el observer
    // (micro-optimización: solo recrear si realmente cambian)
    // Aquí lo dejamos simple y explícito:
    el.__io__?.disconnect();
    delete el.__io__;
    const { onEnter, onLeave, options } = binding.value ?? {};
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);
    io.observe(el);
    el.__io__ = io;
  },
  unmounted(el) {
    el.__io__?.disconnect();
    delete el.__io__;
  },
};
```
```js [main.js]
export const vIntersect = {
  mounted(el, binding) {
    const { onEnter, onLeave, options } = binding.value ?? {};
   
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
   }, options);
   
    io.observe(el);
    el.__io__ = io;
  },
  updated(el, binding) {
    // Si cambian options de forma dinámica, lo más seguro es recrear el observer
    // (micro-optimización: solo recrear si realmente cambian)
    // Aquí lo dejamos simple y explícito:
    el.__io__?.disconnect();
    delete el.__io__;
    const { onEnter, onLeave, options } = binding.value ?? {};
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter?.(entry);
        else onLeave?.(entry);
      }
    }, options);
    io.observe(el);
    el.__io__ = io;
  },
  unmounted(el) {
    el.__io__?.disconnect();
    delete el.__io__;
  },
};
```
```vue [App.vue]
<div
  v-intersect="{
    onEnter: () => (visible = true),
    onLeave: () => (visible = false),
    options: { threshold: 0.2 }
  }"
>
  ...
</div>
```

> Si vas a recrear observers en `updated`, intenta comparar `binding.value` vs `binding.oldValue` para evitar trabajo innecesario.

## Resumen

* Las directivas personalizadas son ideales para encapsular **comportamiento de DOM reutilizable**.
* El hook `unmounted` es obligatorio para limpieza y evitar fugas.
* Mantén un contrato simple (`value`, `arg`, `modifiers`) y evita mezclar estado de negocio.
* En Vue 3, **si el callback puede cambiar**, actualízalo en `updated` para no quedarte con una referencia vieja.
* Prioriza Composition API; usa Options API cuando lo necesites por compatibilidad incremental.
