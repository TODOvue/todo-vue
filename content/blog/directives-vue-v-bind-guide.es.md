---
title: "Directivas en Vue: v-bind"
description: "Aprende a usar v-bind en Vue desde lo más básico hasta patrones avanzados: atributos dinámicos, class/style reactivos, props en componentes y errores comunes."
date: 2026-02-11T18:30:00-05:00
updatedAt: 2026-02-11T18:30:00-05:00
readingTime: 10
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Guías"
    color: "#42B983"
  - tag: "Reactividad"
    color: "#2196F3"
draft: false
isNew: true
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770849828/directives-vue-v-bind-guide_gqrgyj.png
coverAlt: "Imagen temporal para portada del artículo sobre v-bind en Vue"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue.js
  - v-bind
  - atributos dinámicos
  - class binding
  - style binding
  - Composition API
  - Options API
schemaOrg:
  - type: "BlogPosting"
    headline: "Directiva v-bind en Vue: guía de básico a avanzado"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-11T18:30:00-05:00"
---

# Directivas en Vue: `v-bind`

`v-bind` conecta atributos o props del template con datos reactivos.
Si el estado cambia, el atributo también cambia.

En Vue, `v-bind` es una de las piezas más importantes porque te permite pasar de HTML estático a UI dinámica sin manipular el DOM manualmente.

## Por qué importa

Sin `v-bind`, terminarías escribiendo lógica imperativa para:

- Activar/desactivar botones.
- Cambiar clases según estado.
- Renderizar enlaces o imágenes dinámicas,
- Pasar datos de un componente padre a uno hijo.

Con `v-bind`, todo eso se vuelve declarativo.
Describes la relación entre estado y UI, y Vue se encarga del resto.

## Concepto base

La forma base es:

```vue [App.vue]
<a v-bind:href="url">Ir al sitio</a>
```

Shorthand recomendado:

```vue [App.vue]
<a :href="url">Ir al sitio</a>
```

`v-bind` funciona con:

- Atributos HTML (`href`, `src`, `disabled`, `id`, `title`),
- Props de componentes (`:user="currentUser"`),
- Bindings especiales para `class` y `style`,
- Argumentos dinámicos (`:[attrName]="value"`),
- Spread-like bindings (`v-bind="attrsObject"`).

## Cuándo usarlo

Usa `v-bind` cuando necesites:

- Valores dinámicos en atributos.
- Cambiar presentación según estado (`class` / `style`).
- Pasar datos reactivos a componentes hijos.
- Construir componentes reutilizables con props configurables.

## Cuándo evitarlo

Evítalo cuando:

- El valor es fijo y nunca cambia (puedes dejar HTML estático).
- Metes lógica compleja directamente en el template (mejor mover a `computed`).
- Usas `v-bind` como sustituto de validación o seguridad (eso no lo resuelve el template).

## Errores comunes

### 1) Olvidar que `v-bind` evalúa JavaScript

Incorrecto:

```vue [Incorrecto]
<img :src="/images/avatar.png" />
```

Correcto:

```vue [Correcto]
<img src="/images/avatar.png" />
<!-- o -->
<img :src="avatarUrl" />
```

Si usas `:src`, Vue espera una expresión JS válida.

### 2) Poner demasiada lógica inline en `:class` o `:style`

Incorrecto:

```vue [Evitar]
<button :class="isAdmin && isActive && !isLocked ? 'btn btn-primary' : isLocked ? 'btn btn-muted' : 'btn'">
  Guardar
</button>
```

Mejor: extraer a `computed`.

### 3) Confundir atributo HTML con prop de componente

`v-bind` sirve para ambos, pero en componentes debes pasar la prop exacta definida por el hijo:

```vue [Padre]
<UserCard :user="user" />
```

Si el hijo espera `profile` y tú pasas `user`, no llegará la data correcta.

### 4) Creer que `v-bind` "protege" datos

`v-bind` solo refleja estado en la UI.
No reemplaza validación del backend ni reglas de autorización.

## Ejemplos prácticos

### 1) Básico: enlace dinámico (`href`)

```vue [Composition API] {4,8}
<script setup>
import { ref } from "vue";

const docsUrl = ref("https://vuejs.org/");
</script>

<template>
  <a :href="docsUrl" target="_blank" rel="noopener">Documentación Vue</a>
</template>
```
```vue [Options API] {5,12}
<script>
export default {
  data() {
    return {
      docsUrl: "https://vuejs.org/",
    };
  },
};
</script>

<template>
  <a :href="docsUrl" target="_blank" rel="noopener">Documentación Vue</a>
</template>
```

### 2) Atributo booleano dinámico (`disabled`)

```vue [Composition API] {4,8}
<script setup>
import { ref } from "vue";

const isSaving = ref(false);
</script>

<template>
  <button :disabled="isSaving">
    {{ isSaving ? "Guardando..." : "Guardar cambios" }}
  </button>
</template>
```
```vue [Options API] {5,12}
<script>
export default {
  data() {
    return {
      isSaving: false,
    };
  },
};
</script>

<template>
  <button :disabled="isSaving">
    {{ isSaving ? "Guardando..." : "Guardar cambios" }}
  </button>
</template>
```

### 3) `v-bind:class` con objeto (patrón recomendado)

```vue [Composition API] {4,10-14}
<script setup>
import { ref } from "vue";

const isActive = ref(true);
const hasError = ref(false);
</script>

<template>
  <p
    :class="{
      'text-success': isActive,
      'text-danger': hasError,
      'text-muted': !isActive && !hasError,
    }"
  >
    Estado del sistema
  </p>
</template>
```
```vue [Options API] {5,13-17}
<script>
export default {
  data() {
    return {
      isActive: true,
      hasError: false,
    };
  },
};
</script>

<template>
  <p
    :class="{
      'text-success': isActive,
      'text-danger': hasError,
      'text-muted': !isActive && !hasError,
    }"
  >
    Estado del sistema
  </p>
</template>
```

### 4) `v-bind:style` dinámico con objeto

```vue [Composition API] {4-5,9}
<script setup>
import { ref } from "vue";

const fontSize = ref(16);
const textColor = ref("#1D5BA1");
</script>

<template>
  <p :style="{ fontSize: `${fontSize}px`, color: textColor }">
    Texto con estilo reactivo
  </p>
</template>
```
```vue [Options API] {5-6,13}
<script>
export default {
  data() {
    return {
      fontSize: 16,
      textColor: "#1D5BA1",
    };
  },
};
</script>

<template>
  <p :style="{ fontSize: `${fontSize}px`, color: textColor }">
    Texto con estilo reactivo
  </p>
</template>
```

### 5) Argumento dinámico: `:[attrName]="value"`

Útil cuando el nombre del atributo también depende del estado.

```vue [Composition API] {4-5,9}
<script setup>
import { ref } from "vue";

const attrName = ref("title");
const attrValue = ref("Tooltip dinámico");
</script>

<template>
  <button :[attrName]="attrValue">Hover me</button>
</template>
```
```vue [Options API] {5-6,13}
<script>
export default {
  data() {
    return {
      attrName: "title",
      attrValue: "Tooltip dinámico",
    };
  },
};
</script>

<template>
  <button :[attrName]="attrValue">Hover me</button>
</template>
```

### 6) `v-bind="obj"` para pasar múltiples atributos o props

```vue [Composition API] {4-10,14}
<script setup>
import { ref } from "vue";

const inputAttrs = ref({
  id: "email",
  type: "email",
  placeholder: "tu@email.com",
  autocomplete: "email",
  required: true,
});
</script>

<template>
  <input v-bind="inputAttrs" />
</template>
```
```vue [Options API] {5-11,18}
<script>
export default {
  data() {
    return {
      inputAttrs: {
        id: "email",
        type: "email",
        placeholder: "tu@email.com",
        autocomplete: "email",
        required: true,
      },
    };
  },
};
</script>

<template>
  <input v-bind="inputAttrs" />
</template>
```

> `v-bind="obj"` también es común para forwarding de props en componentes base.

## Ejemplo integrado

Formulario simple con `v-bind` para atributos, clases y estado.

```vue [Composition API]
<script setup>
import { computed, ref } from "vue";

const email = ref("");
const isSubmitting = ref(false);
const hasError = ref(false);

const inputAttrs = computed(() => ({
  type: "email",
  placeholder: "Ingresa tu correo",
  autocomplete: "email",
  required: true,
}));

const buttonClass = computed(() => ({
  "btn-primary": !isSubmitting.value,
  "btn-disabled": isSubmitting.value,
}));

function submit() {
  hasError.value = email.value.trim() === "";
  if (hasError.value) return;
  isSubmitting.value = true;
  setTimeout(() => {
    isSubmitting.value = false;
  }, 1000);
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-bind="inputAttrs" v-model="email" :class="{ 'input-error': hasError }" />

    <button :disabled="isSubmitting" :class="buttonClass">
      {{ isSubmitting ? "Enviando..." : "Enviar" }}
    </button>

    <p :style="{ color: hasError ? '#E74C3C' : '#2ECC71' }">
      {{ hasError ? "El correo es obligatorio." : "Listo para enviar." }}
    </p>
  </form>
</template>
```
```vue [Options API]
<script>
export default {
  data() {
    return {
      email: "",
      isSubmitting: false,
      hasError: false,
    };
  },
  computed: {
    inputAttrs() {
      return {
        type: "email",
        placeholder: "Ingresa tu correo",
        autocomplete: "email",
        required: true,
      };
    },
    buttonClass() {
      return {
        "btn-primary": !this.isSubmitting,
        "btn-disabled": this.isSubmitting,
      };
    },
  },
  methods: {
    submit() {
      this.hasError = this.email.trim() === "";
      if (this.hasError) return;
      this.isSubmitting = true;
      setTimeout(() => {
        this.isSubmitting = false;
      }, 1000);
    },
  },
};
</script>

<template>
  <form @submit.prevent="submit">
    <input v-bind="inputAttrs" v-model="email" :class="{ 'input-error': hasError }" />

    <button :disabled="isSubmitting" :class="buttonClass">
      {{ isSubmitting ? "Enviando..." : "Enviar" }}
    </button>

    <p :style="{ color: hasError ? '#E74C3C' : '#2ECC71' }">
      {{ hasError ? "El correo es obligatorio." : "Listo para enviar." }}
    </p>
  </form>
</template>
```

## Resumen

`v-bind` es la forma declarativa de conectar estado y atributos en Vue.
Dominarlo te permite construir interfaces dinámicas de manera limpia y mantenible.

Qué recordar:

- `:` es shorthand de `v-bind`.
- Úsalo para atributos, props, `class` y `style`.
- Evita lógica compleja inline: mueve reglas a `computed`.
- `v-bind="obj"` es ideal para agrupar atributos/props.

Si entiendes bien `v-bind`, entiendes una parte central de cómo Vue traduce reactividad en UI real.
