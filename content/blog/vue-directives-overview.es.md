---
title: "Directivas en Vue: Una Visión General"
description: "Explora las directivas esenciales de Vue.js, su sintaxis y casos de uso comunes."
date: 2026-02-03T20:00:00-05:00
updatedAt: 2026-02-19T08:00:00-05:00
readingTime: 6
tags:
  - tag: "Directivas"
    color: "#6C5CE7"
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Renderizado Condicional"
    color: "#E056FD"
  - tag: "Listas"
    color: "#1D5BA1"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1770161262/vue-directives-overview_qyrngz.png
coverAlt: "Directivas en Vue: Una Visión General"
coverCaption: "Imagen destacada que representa las directivas en Vue.js."
locale: es
series: directivas-en-vue
seriesOrder: 1
seriesTitle: "Directivas en Vue"
seriesDescription: "Ruta paso a paso para dominar las directivas principales de Vue."
author: TODOvue
keywords:
  - Vue.js
  - Directivas
  - Desarrollo Frontend
  - Buenas Prácticas
schemaOrg:
  - type: "BlogPosting"
    headline: "Directivas en Vue: Una Visión General"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-02-03T20:00:00-05:00"
---
# Directivas en Vue 3: guía completa para entenderlas bien

Las directivas en Vue son **atributos especiales** que permiten aplicar lógica reactiva directamente sobre el DOM.
Todas comienzan con `v-` y existen para **reducir código imperativo** y hacer que el template sea más expresivo y declarativo.

Esta entrada es un **mapa general**: no profundiza al extremo, pero te deja claro **qué hace cada directiva, cuándo usarla y qué problema resuelve**.
Cada una tendrá luego su artículo dedicado.

## `v-if`, `v-else-if`, `v-else`

Sirven para **renderizar o eliminar elementos del DOM** según una condición reactiva.
Si la condición es falsa, el elemento **no existe en el DOM**.

Úsala cuando:

* El contenido es pesado
* No siempre debe existir
* Depende de permisos o estados críticos

```vue [Composition API]{8-9}
<script setup>
import { ref } from 'vue'

const isLogged = ref(true)
</script>

<template>
  <p v-if="isLogged">Bienvenido</p>
  <p v-else>No has iniciado sesión</p>
</template>
```
```vue [Options API]{12-13}
<script>
export default {
  data() {
    return {
      isLogged: true
    }
  }
}
</script>

<template>
  <p v-if="isLogged">Bienvenido</p>
  <p v-else>No has iniciado sesión</p>
</template>
```

> Si quieres conocer más lee la guía de [Directivas en Vue: v-if, v-else y v-show](/blog/directives-vue-v-if-v-else-v-show-guide.es/).

## `v-show`

Controla la visibilidad usando CSS (`display: none`), pero **el elemento siempre existe en el DOM**.

Úsala cuando:

* El elemento se muestra y oculta con frecuencia
* No quieres pagar el costo de montar y desmontar el nodo

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'
  
const isVisible = ref(true)
</script>

<template>
  <p v-show="isVisible">Contenido visible</p>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      isVisible: true
    }
  }
}
</script>

<template>
  <p v-show="isVisible">Contenido visible</p>
</template>
```

> Si quieres conocer más lee la guía de [Directivas en Vue: v-if, v-else y v-show](/blog/directives-vue-v-if-v-else-v-show-guide.es/).

## `v-for`

Permite renderizar listas a partir de arreglos u objetos reactivos.

Clave mental:

> `v-for` describe **estructura**, no lógica.

```vue [Composition API]{11-13}
<script setup>
import { ref } from 'vue'
  
const items = ref([
  { id: 1, name: 'Vue' },
  { id: 2, name: 'React' }
])
</script>

<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```
```vue [Options API]{15-17}
<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Vue' },
        { id: 2, name: 'React' }
      ]
    }
  }
}
</script>

<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

`key` **no es opcional**. Nunca lo fue.
Es esencial para que Vue pueda optimizar correctamente el renderizado.

> Si quieres conocer más lee la guía de [Directivas en Vue: v-for](/blog/directives-vue-v-for-guide.es/).

## `v-bind`

Vincula dinámicamente atributos HTML o props de componentes.

Piensa en `v-bind` como:

> “Este atributo depende del estado”

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const imageUrl = ref('https://example.com/image.jpg')
</script>

<template>
  <img v-bind:src="imageUrl" alt="Imagen dinámica" />
</template>
```
```vue [Options API]{13}
<script>
export default {
  data() {
    return {
      imageUrl: '/logo.png',
      description: 'Logo'
    }
  }
}
</script>

<template>
  <img :src="imageUrl" :alt="description" />
</template>
```
> Si quieres conocer más lee la guía de [Directivas en Vue: v-bind](/blog/directives-vue-v-bind-guide.es/).

## `v-model`

Crea una **sincronización bidireccional** entre el estado y un input o componente.

Es ideal para:

* Formularios
* Inputs controlados
* Componentes reutilizables

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const username = ref('')
</script>

<template>
  <input v-model="username" placeholder="Ingresa tu nombre de usuario" />
  <p>Hola, {{ username }}!</p>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      username: ''
    }
  }
}
</script>

<template>
  <input v-model="username" placeholder="Ingresa tu nombre de usuario" />
  <p>Hola, {{ username }}!</p>
</template>
```

Internamente, combina props y eventos (`modelValue` + `update:modelValue`).
No es magia, pero se le parece bastante.

> Si quieres conocer más lee la guía de [Directivas en Vue: v-model](/blog/directives-vue-v-model-guide.es/).

## `v-on`

Escucha eventos del DOM y ejecuta lógica reactiva.

```vue [Composition API]{11}
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => {
  count.value++
}
</script>

<template>
  <button v-on:click="increment">Has hecho clic {{ count }} veces</button>
</template>
```
```vue [Options API]{17}
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

<template>
  <button v-on:click="increment">Clickeame</button>
  <p>Has clickeado {{ count }} veces.</p>
</template>
```

Soporta **modificadores** (`.stop`, `.prevent`, `.once`, etc.) que evitan código innecesario.

> Si quieres conocer más lee la guía de [Directivas en Vue: v-on](/blog/directives-vue-v-on-guide.es/).

## `v-text`

Inserta texto plano en un elemento, reemplazando su contenido.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const message = ref('Hola Mundo')
</script>

<template>
  <div v-text="message"></div>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      message: 'Hola Vue'
    }
  }
}
</script>

<template>
  <div v-text="message"></div>
</template>
```

No se usa mucho, pero existe para casos muy específicos donde no quieres interpolaciones.

> Si quieres conocer más lee la guía de [Directivas en Vue: v-text y v-html](/blog/directives-vue-v-text-v-html-guide.es/).

## `v-html`

Inserta HTML sin escapar.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const rawHtml = ref('<strong>Texto en negrita</strong>')
</script>

<template>
  <div v-html="rawHtml"></div>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      rawHtml: '<strong>HTML dinámico</strong>'
    }
  }
}
</script>

<template>
  <div v-html="rawHtml"></div>
</template>
```

> ⚠️ **Nunca lo uses con contenido no confiable**.
Es una puerta directa a XSS si no sabes exactamente lo que estás renderizando.

> Si quieres conocer más lee la guía de [Directivas en Vue: v-text y v-html](/blog/directives-vue-v-text-v-html-guide.es/).

## `v-slot`

Permite definir contenido dinámico dentro de componentes mediante slots.

```vue [Composition API]{6,10}
<script setup>
</script>

<template>
  <MyCard>
    <template v-slot:header>
      <h1>Encabezado Personalizado</h1>
    </template>
    <p>Contenido del cuerpo de la tarjeta.</p>
    <template v-slot:footer>
      <button>Acción</button>
    </template>
  </MyCard>
</template>
```
```vue [Options API]{9,13}
<script>
export default {
  components: { MyCard }
}
</script>

<template>
  <MyCard>
    <template v-slot:header>
      <h1>Encabezado Personalizado</h1>
    </template>
    <p>Contenido del cuerpo de la tarjeta.</p>
    <template v-slot:footer>
      <button>Acción</button>
    </template>
  </MyCard>
</template>
```

Es clave para crear componentes **flexibles, composables y reutilizables**.

> Si quieres conocer más lee la guía de [Directivas en Vue: v-slot](/blog/directives-vue-v-slot-guide.es/).

## `v-once`

Renderiza el contenido **una sola vez** y lo excluye del sistema reactivo.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'
  
const count = ref(0)
</script>

<template>
  <p v-once>Este texto no cambiará: {{ count }}</p>
  <button @click="count++">Incrementar</button>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>

<template>
  <p v-once>Este texto no cambiará: {{ count }}</p>
  <button @click="count++">Incrementar</button>
</template>
```

Útil cuando el contenido no debe actualizarse jamás, incluso si el estado cambia.

## `v-memo`

Evita renderizados innecesarios cuando las dependencias no cambian.

```vue [Composition API]{8}
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div v-memo="[count]">
    <p>Este bloque solo se re-renderiza si 'count' cambia: {{ count }}</p>
  </div>
  <button @click="count++">Incrementar</button>
</template>
```
```vue [Options API]{12}
<script>
export default {
  data() {
    return {
      value: 10
    }
  }
}
</script>

<template>
  <div v-memo="[value]">
    <p>El valor es: {{ value }}</p>
  </div>
</template>
```

Es una **optimización avanzada**.
No está pensada para usarse “porque sí”, sino en cuellos de botella reales.

## `v-pre`

Evita que Vue compile el contenido del nodo.

```vue [Composition API]{5}
<script setup>
</script>

<template>
  <div v-pre>
    {{ esto_no_se_evaluará }}
  </div>
</template>
```
```vue [Options API]{6}
<script>
export default {}
</script>

<template>
  <div v-pre>
    {{ esto_no_se_evaluará }}
  </div>
</template>
```

Perfecta para mostrar snippets, ejemplos literales o templates de demostración.

## `v-cloak`

Oculta el template hasta que Vue termine de montar la aplicación.

```vue [Composition API]{5}
<script setup>
</script>

<template>
  <div v-cloak>
    {{ mensaje }}
  </div>
</template>
```
```vue [Options API]{6}
<script>
export default {}
</script>

<template>
  <div v-cloak>
    {{ mensaje }}
  </div>
</template>
```

Evita el parpadeo inicial en aplicaciones renderizadas del lado del cliente.

## Directivas personalizadas

Permiten extender Vue para manipular directamente el DOM cuando no hay otra opción más declarativa.

```js [main.js]{4-8}
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})
```
```vue [App.vue]{2}
<template>
  <input v-focus />
</template>
```

Son poderosas, pero deben usarse con cuidado:
si abusas de ellas, probablemente estás rompiendo el modelo mental de Vue.

## Conclusión

Las directivas no son solo sintaxis bonita.
Son **contratos claros entre el estado y el DOM**.

Este artículo es el punto de partida.
Cada directiva tendrá su entrada individual, con:

* Casos reales
* Errores comunes
* Buenas y malas prácticas

Este mapa ya te permite **leer código Vue con criterio**.
Lo demás es profundidad, no confusión.
