---
title: "Ciclos de vida en Vue: Una visión general"
description: "Un mapa claro de todos los ciclos de vida de Vue 3 para entender cuándo usar cada hook."
date: 2026-03-04T21:30:00-05:00
updatedAt: 2026-03-04T21:30:00-05:00
readingTime: 8
tags:
  - tag: "Básico"
    color: "#B173BF"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Arquitectura"
    color: "#4CAF50"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772676391/vue-lifecycle-hooks-overview_ovnxzy.png
coverAlt: "Ciclos de vida en Vue: Una visión general"
coverCaption: "Panorama de los hooks del ciclo de vida en Vue 3."
locale: es
series: vue-lifecycle-hooks
seriesOrder: 1
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - Ciclos de vida
  - Composition API
  - Options API
  - Hooks
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: Una visión general"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-04T21:30:00-05:00"
---
# Ciclos de vida en Vue: guía práctica y cuándo usar cada hook

## Por qué esto importa

Entender el **ciclo de vida de un componente** te permite saber exactamente **cuándo ejecutar cada tipo de lógica**: inicialización, acceso al DOM, sincronización con API, limpieza de efectos secundarios o depuración.

# Concepto clave

Un componente en **Vue 3** atraviesa varias fases:

1. **Creación**
2. **Montaje**
3. **Actualización**
4. **Desmontaje**

Además, existen hooks especiales para:

* Componentes cacheados con `<KeepAlive>`
* Manejo de errores
* Depuración del sistema reactivo
* **SSR (Server-Side Rendering)**

En las siguientes secciones veremos **cuándo se ejecuta cada hook y para qué sirve**, con ejemplos.

## Mapa de la serie

Si quieres profundizar en cada grupo de hooks, aquí tienes la ruta completa de esta serie:

* [Ciclos de vida en Vue: fase de creación (beforeCreate, created, setup)](/blog/vue-lifecycle-creation-phase-beforecreate-created-setup.es/)
* [Ciclos de vida en Vue: fase de montaje (beforeMount, mounted)](/blog/vue-lifecycle-mounting-phase-beforemount-mounted.es/)
* [Ciclos de vida en Vue: fase de actualización (beforeUpdate, updated)](/blog/vue-lifecycle-update-phase-beforeupdate-updated.es/)
* [Ciclos de vida en Vue: fase de desmontaje (beforeUnmount, unmounted)](/blog/vue-lifecycle-unmounting-phase-beforeunmount-unmounted.es/)
* [Ciclos de vida en Vue: componentes cacheados con KeepAlive (activated, deactivated)](/blog/vue-lifecycle-keepalive-activated-deactivated.es/)
* [Ciclos de vida en Vue: manejo de errores con errorCaptured](/blog/vue-lifecycle-error-handling-errorcaptured.es/)
* [Ciclos de vida en Vue: depuración del render (renderTracked, renderTriggered)](/blog/vue-lifecycle-render-debug-rendertracked-rendertriggered.es/)
* [Ciclos de vida en Vue: renderizado del lado del servidor (serverPrefetch)](/blog/vue-lifecycle-ssr-serverprefetch.es/)

# Creación del componente

En esta fase Vue **crea la instancia del componente y configura la reactividad**, pero **todavía no existe el DOM**.

Aquí normalmente se inicializa estado, configuración o llamadas iniciales.

## `beforeCreate`

Se ejecuta **antes de que Vue configure la reactividad**.

```vue [App.vue]{3}
<script>
export default {
  beforeCreate() {
    console.log('El componente está iniciando')
  }
}
</script>
```

> No es posible usar `beforeCreate` en Composition API, ya que `setup()` se ejecuta antes de cualquier otro hook.

## `created`

El estado reactivo ya está disponible, pero **el DOM aún no existe**.

Se suele usar para:

* Llamadas HTTP
* Inicializar estado
* Preparar lógica de negocio

```vue [App.vue]{8}
<script>
export default {
  data() {
    return {
      users: []
    }
  },
  async created() {
    this.users = await fetch('/api/users').then(r => r.json())
  }
}
</script>
```

> No es posible usar `created` en Composition API, ya que `setup()` se ejecuta antes de cualquier otro hook.

## `setup()`

Es el **punto de entrada principal en Composition API**.

Aquí se define:

* Estado reactivo
* Composables
* Watchers
* Lógica inicial del componente

```vue [App.vue]{1}
<script setup>
import { ref } from 'vue'

const count = ref(0)

console.log('Setup ejecutado')
</script>
```
> No es posible usar `setup()` en Options API, ya que es exclusivo de Composition API.

> Si quieres profundizar en esta etapa, lee la guía [Ciclos de vida en Vue: fase de creación (beforeCreate, created, setup)](/blog/vue-lifecycle-creation-phase-beforecreate-created-setup.es/).

# Montaje del componente

En esta fase Vue **crea e inserta el DOM del componente**.

Aquí ya es seguro usar:

* API del navegador
* Librerías externas
* Manipulación del DOM

## `onBeforeMount` / `beforeMount`

Se ejecuta **justo antes de insertar el DOM en la página**.

No es muy común usarlo, pero puede servir para lógica previa al render final.

```vue [Composition API]{4}
<script setup>
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  console.log('El componente está por montarse')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  beforeMount() {
    console.log('Antes de montar el componente')
  }
}
</script>
```

## `onMounted` / `mounted`

Se ejecuta **después de que el componente fue insertado en el DOM**.

Este es uno de los hooks **más usados**.

Usos típicos:

* Inicializar charts
* Registrar listeners
* Enfocar inputs
* Integrar librerías externas

```vue [Composition API]{4}
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Componente montado en el DOM')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  mounted() {
    console.log('Componente montado')
  }
}
</script>
```

> Si quieres profundizar en esta etapa, lee la guía [Ciclos de vida en Vue: fase de montaje (beforeMount, mounted)](/blog/vue-lifecycle-mounting-phase-beforemount-mounted.es/).

# Actualización del componente

Cuando cambia el estado reactivo, Vue **vuelve a renderizar el componente**.

Estos hooks permiten reaccionar antes o después de que el DOM cambie.

## `onBeforeUpdate` / `beforeUpdate`

Se ejecuta **antes de que Vue actualice el DOM**.

Puede usarse para inspeccionar el estado previo.

```vue [Composition API]{4}
<script setup>
import { onBeforeUpdate } from 'vue'

onBeforeUpdate(() => {
  console.log('Antes de actualizar el DOM')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  beforeUpdate() {
    console.log('Antes del update')
  }
}
</script>
```

## `onUpdated` / `updated`

Se ejecuta **después de que Vue actualiza el DOM**.

Útil cuando necesitas medir o interactuar con el DOM actualizado.

> ⚠️ No debe usarse como reemplazo de `watch`.

```vue [Composition API]{4}
<script setup>
import { onUpdated } from 'vue'

onUpdated(() => {
  console.log('El DOM ya fue actualizado')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  updated() {
    console.log('DOM actualizado')
  }
}
</script>
```

> Si quieres profundizar en esta etapa, lee la guía [Ciclos de vida en Vue: fase de actualización (beforeUpdate, updated)](/blog/vue-lifecycle-update-phase-beforeupdate-updated.es/).

# Desmontaje del componente

Cuando un componente deja de existir, Vue ejecuta hooks de limpieza.

Esto es **clave para evitar fugas de memoria**.

## `onBeforeUnmount` / `beforeUnmount`

Se ejecuta **justo antes de destruir el componente**.

```vue [Composition API]{4}
<script setup>
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  console.log('El componente será destruido')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  beforeUnmount() {
    console.log('Antes de desmontar')
  }
}
</script>
```

## `onUnmounted` / `unmounted`

Se ejecuta **después de que el componente fue destruido**.

Ideal para limpiar:

* Timers
* Sockets
* Event listeners

```vue [Composition API]{6,12}
<script setup>
import { onMounted, onUnmounted } from 'vue'

let timer

onMounted(() => {
  timer = setInterval(() => {
    console.log('tick')
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
```
```vue [Options API]{3,8}
<script>
export default {
  mounted() {
    this.timer = setInterval(() => {
      console.log('tick')
    }, 1000)
  },
  unmounted() {
    clearInterval(this.timer)
  }
}
</script>
```

> Si quieres profundizar en esta etapa, lee la guía [Ciclos de vida en Vue: fase de desmontaje (beforeUnmount, unmounted)](/blog/vue-lifecycle-unmounting-phase-beforeunmount-unmounted.es/).

# Hooks de `<KeepAlive>`

Cuando un componente está dentro de `<KeepAlive>`, **no se destruye**, solo se activa o desactiva.

## `onActivated` / `activated`

Se ejecuta cuando el componente **vuelve a mostrarse**.

```vue [Composition API]{4}
<script setup>
import { onActivated } from 'vue'

onActivated(() => {
  console.log('Componente reactivado')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  activated() {
    console.log('Componente reactivado')
  }
}
</script>
```

## `onDeactivated` / `deactivated`

Se ejecuta cuando el componente **se oculta, pero sigue en memoria**.

```vue [Composition API]{4}
<script setup>
import { onDeactivated } from 'vue'

onDeactivated(() => {
  console.log('Componente desactivado')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  deactivated() {
    console.log('Componente desactivado')
  }
}
</script>
```

> Si quieres profundizar en este tema, lee la guía [Ciclos de vida en Vue: componentes cacheados con `<KeepAlive>` (activated, deactivated)](/blog/vue-lifecycle-keepalive-activated-deactivated.es/).

# Manejo de errores

## `onErrorCaptured` / `errorCaptured`

Permite capturar errores de **componentes hijos**.

```vue [Composition API]{4}
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((error) => {
  console.error('Error capturado:', error)
  return false
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  errorCaptured(error) {
    console.error('Error capturado:', error)
    return false
  }
}
</script>
```

> Si quieres profundizar en este tema, lee la guía [Ciclos de vida en Vue: manejo de errores con errorCaptured](/blog/vue-lifecycle-error-handling-errorcaptured.es/).

# Hooks de depuración del render

Estos hooks ayudan a entender **por qué un componente se vuelve a renderizar**.

No deben usarse normalmente en producción.

## `onRenderTracked`

Se ejecuta cuando Vue **rastrea una dependencia reactiva durante el render**.

```vue [Composition API]{4}
<script setup>
import { onRenderTracked } from 'vue'

onRenderTracked((event) => {
  console.debug('Dependencia rastreada:', event.key)
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  renderTracked(event) {
    console.debug('Dependencia rastreada:', event.key)
  }
}
</script>
```

## `onRenderTriggered`

Se ejecuta cuando **una dependencia dispara un re-render**.

```vue [Composition API]{4}
<script setup>
import { onRenderTriggered } from 'vue'

onRenderTriggered((event) => {
  console.debug('Re-render causado por:', event.key)
})
</script>
```
``` vue [Options API]{3}
<script>
export default {
  renderTriggered(event) {
    console.debug('Re-render causado por:', event.key)
  }
}
</script>
```

> Si quieres profundizar en este tema, lee la guía [Ciclos de vida en Vue: depuración del render (renderTracked, renderTriggered)](/blog/vue-lifecycle-render-debug-rendertracked-rendertriggered.es/).

# SSR (Server Side Rendering)

## `onServerPrefetch` / `serverPrefetch`

Permite **cargar datos antes de renderizar el HTML en el servidor**.

Esto evita pantallas vacías durante el primer render.

```vue [Composition API]{4}
<script setup>
import { onServerPrefetch } from 'vue'

onServerPrefetch(async () => {
  await fetch('/api/data')
})
</script>
```
```vue [Options API]{3}
<script>
export default {
  async serverPrefetch() {
    await fetch('/api/data')
  }
}
</script>
```

> Si quieres profundizar en este tema, lee la guía [Ciclos de vida en Vue: renderizado del lado del servidor (serverPrefetch)](/blog/vue-lifecycle-ssr-serverprefetch.es/).

# Cuándo usar hooks (y cuándo no)

## Úsalos cuando:

* Necesitas **acceder al DOM real** (`onMounted`)
* Haces **limpieza de recursos** (`onUnmounted`)
* Trabajas con **SSR** (`onServerPrefetch`)
* Necesitas reaccionar a **fases del ciclo del componente**

## Evítalos cuando:

* Un **`computed`** resuelve el problema
* Un **`watch`** es suficiente
* Solo quieres reaccionar a **cambios de estado específicos**

Los hooks coordinan **momentos del ciclo**, no deberían contener toda la lógica del componente.

# Resumen

Los hooks del ciclo de vida permiten controlar **momentos clave del componente**:

| Fase          | Hooks principales              |
|---------------|--------------------------------|
| Creación      | `setup`, `created`             |
| Montaje       | `onMounted`, `mounted`         |
| Actualización | `onUpdated`, `updated`         |
| Desmontaje    | `onUnmounted`, `unmounted`     |
| Cache         | `onActivated`, `onDeactivated` |
| SSR           | `onServerPrefetch`             |

> Si dudas qué hook usar, pregúntate primero:
> **¿En qué momento de la vida del componente necesito ejecutar esta lógica?**
