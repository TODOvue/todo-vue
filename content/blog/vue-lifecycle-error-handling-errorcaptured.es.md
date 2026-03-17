---
title: "Ciclos de vida en Vue: manejo de errores con errorCaptured"
description: "Cómo usar errorCaptured y onErrorCaptured para aislar fallos en componentes hijos, mostrar estados de respaldo y registrar errores sin romper toda la interfaz."
date: 2026-03-16T22:00:00-05:00
updatedAt: 2026-03-16T22:00:00-05:00
tags:
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Componentes"
    color: "#41B883"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
  - tag: "Arquitectura"
    color: "#4CAF50"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1773714502/vue-lifecycle-error-handling-errorcaptured_mn62y7.png
coverAlt: "Ilustración de un componente de Vue con un escudo de protección, simbolizando el manejo de errores con errorCaptured."
coverCaption: "Con errorCaptured, puedes proteger partes específicas de tu UI sin comprometer toda la experiencia."
draft: false
locale: es
series: vue-lifecycle-hooks
seriesOrder: 7
seriesTitle: "Ciclos de vida en Vue"
seriesDescription: "Serie práctica para dominar cada hook del ciclo de vida de Vue, desde los básicos hasta los avanzados."
author: TODOvue
keywords:
  - Vue.js
  - errorCaptured
  - onErrorCaptured
  - manejo de errores
  - error boundaries
schemaOrg:
  - type: "BlogPosting"
    headline: "Ciclos de vida en Vue: manejo de errores con errorCaptured"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-16T22:00:00-05:00"
---
# Ciclos de vida en Vue: manejo de errores con `errorCaptured`

Los errores en la interfaz rara vez avisan. Un widget deja de renderizar, una dependencia de terceros lanza una excepción o una vista hija falla durante una actualización, y de pronto el usuario se queda con un bloque en blanco o una pantalla incompleta.

Ahí es donde `errorCaptured` cobra valor. No evita que ocurran errores, pero te permite contenerlos en el lugar adecuado, registrar contexto útil y ofrecer una salida digna sin comprometer toda la UI.

## Por qué esto importa

A medida que una aplicación crece, no todos los componentes tienen el mismo nivel de confianza. Hay piezas muy estables y otras más frágiles: integraciones con librerías externas, widgets complejos, paneles que dependen de datos cambiantes o componentes en evolución constante.

Si los fallos se propagan sin control, el impacto suele ser desproporcionado. Un error en una tarjeta secundaria puede terminar afectando toda una pantalla. `errorCaptured` permite establecer límites: este bloque puede fallar, pero el resto de la página debe seguir funcionando.

## Concepto clave

`errorCaptured` es un hook de la Options API, y `onErrorCaptured()` es su equivalente en Composition API. Ambos permiten interceptar errores que ocurren en **componentes descendientes** del componente actual.

Esto incluye errores originados en partes habituales del flujo de Vue, como:

* Renderizado
* Event handlers
* Hooks del ciclo de vida
* `setup()`
* Watchers
* Directivas personalizadas
* Hooks de transición

El hook recibe tres argumentos:

* `err`: el error capturado
* `instance`: la instancia del componente que lanzó el error
* `info`: una pista sobre el origen (por ejemplo, si ocurrió en render o en un evento)

Hay dos aspectos clave a tener en cuenta:

* Solo captura errores de componentes hijos (y descendientes). No intercepta errores del mismo componente donde se declara.
* Si devuelve `false`, detiene la propagación del error hacia otros hooks `errorCaptured` superiores y hacia `app.config.errorHandler`.

En la práctica, funciona como un *error boundary* local. Lo habitual es usarlo para tres objetivos simultáneos: registrar el error, mostrar un fallback y evitar que una parte aislada de la interfaz derribe el resto.

## Cuándo usarlo

`errorCaptured` encaja bien cuando necesitas aislar fallos en una zona concreta de la UI.

Casos típicos:

* Un dashboard con widgets independientes donde una tarjeta puede fallar sin romper toda la vista.
* Un editor, gráfico o componente de terceros que conviene encapsular detrás de un fallback.
* Un área de administración donde ciertos módulos se cargan de forma condicional y no deberían comprometer la navegación principal.
* Un layout con bloques reutilizables donde quieres centralizar logging y mostrar mensajes útiles al usuario.

Regla práctica: si un componente hijo puede fallar y quieres contener el impacto, `errorCaptured` es una buena solución.

## Cuándo evitarlo

No conviene usar `errorCaptured` como solución universal.

Evítalo cuando:

* El problema es un error esperado de negocio; en ese caso es mejor modelarlo como estado (`loading`, `empty`, `error`).
* Solo necesitas manejar errores de una operación concreta; un `try/catch` suele ser más claro.
* Se utiliza para ocultar errores sin registrarlos ni corregir su causa.
* La recuperación depende de reiniciar toda la vista; probablemente el boundary está mal ubicado.

`errorCaptured` no reemplaza una estrategia de manejo de errores: la complementa.

## Errores comunes

### 1. Esperar que capture errores del mismo componente

Este hook está diseñado para descendientes. Si el error ocurre en el mismo componente donde se declara, no será interceptado.

La solución es mover el boundary un nivel superior o encapsular la parte frágil en un componente hijo.

### 2. Devolver `false` siempre

Devolver `false` detiene la propagación. Puede ser útil si el error ya fue manejado, pero hacerlo sin criterio puede impedir el monitoreo global.

Devuélvelo solo cuando realmente hayas absorbido el error y registrado lo necesario.

### 3. Mostrar fallback sin ofrecer salida

Un mensaje como “algo salió mal” no es suficiente si el usuario no puede actuar.

Siempre que tenga sentido, añade opciones como reintentar, recargar o volver a un estado válido.

### 4. Usarlo para ocultar código frágil

Si un componente falla con frecuencia, `errorCaptured` no debería convertirse en una solución permanente. Sirve para mitigar impacto, no para normalizar problemas estructurales.

## Ejemplos prácticos

### Dashboard con tarjetas independientes

Si una tarjeta falla, puedes reemplazar solo ese bloque y mantener funcional el resto del tablero.

### Componentes de terceros

Algunas librerías no fallan de forma controlada. Encapsularlas en un boundary permite evitar que rompan toda la vista.

### Módulos opcionales

En paneles complejos, ciertos módulos no son críticos. Es preferible degradar esa sección sin afectar la navegación principal.

## Ejemplo completo

```vue [Composition API]
<script setup lang="ts">
import { computed, defineComponent, h, onErrorCaptured, ref } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')
const errorSource = ref('')
const retryKey = ref(0)

const RiskyStatsPanel = defineComponent({
  name: 'RiskyStatsPanel',
  setup() {
    const shouldFail = ref(false)

    const stats = computed(() => {
      if (shouldFail.value) {
        throw new Error('No fue posible calcular las métricas del tablero.')
      }

      return [
        { label: 'Pendientes', value: 14 },
        { label: 'Completadas', value: 29 },
        { label: 'Bloqueadas', value: 3 }
      ]
    })

    return () =>
      h('section', { class: 'stats-panel' }, [
        h('h3', 'Resumen de tareas'),
        h(
          'button',
          {
            type: 'button',
            onClick: () => {
              shouldFail.value = true
            }
          },
          'Simular fallo del widget'
        ),
        h(
          'ul',
          stats.value.map(stat =>
            h('li', { key: stat.label }, `${stat.label}: ${stat.value}`)
          )
        )
      ])
  }
})

onErrorCaptured((error, instance, info) => {
  hasError.value = true
  errorMessage.value =
    error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
  errorSource.value = info

  console.error('Widget capturado por el boundary del dashboard', {
    error,
    component: instance?.type,
    info
  })

  return false
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  errorSource.value = ''
  retryKey.value += 1
}
</script>

<template>
  <section class="dashboard-card">
    <header>
      <h2>Estado del dashboard</h2>
      <p>
        Si un widget falla, el resto de la pantalla puede seguir funcionando.
      </p>
    </header>

    <div v-if="hasError" class="error-box">
      <strong>Este bloque no pudo renderizarse.</strong>
      <p>{{ errorMessage }}</p>
      <small>Origen: {{ errorSource }}</small>
      <button type="button" @click="retry">Reintentar</button>
    </div>

    <RiskyStatsPanel v-else :key="retryKey" />
  </section>
</template>
```
```vue [Options API]
<script lang="ts">
const RiskyStatsPanel = {
  name: 'RiskyStatsPanel',
  data() {
    return {
      shouldFail: false
    }
  },
  computed: {
    stats() {
      if (this.shouldFail) {
        throw new Error('No fue posible calcular las métricas del tablero.')
      }

      return [
        { label: 'Pendientes', value: 14 },
        { label: 'Completadas', value: 29 },
        { label: 'Bloqueadas', value: 3 }
      ]
    }
  },
  template: `
    <section class="stats-panel">
      <h3>Resumen de tareas</h3>
      <button
        type="button"
        @click="shouldFail = true"
      >
        Simular fallo del widget
      </button>

      <ul>
        <li
          v-for="stat in stats"
          :key="stat.label"
        >
          {{ stat.label }}: {{ stat.value }}
        </li>
      </ul>
    </section>
  `
}

export default {
  name: 'DashboardErrorBoundary',
  components: {
    RiskyStatsPanel
  },
  data() {
    return {
      hasError: false,
      errorMessage: '',
      errorSource: '',
      retryKey: 0
    }
  },
  errorCaptured(error, instance, info) {
    this.hasError = true
    this.errorMessage =
      error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
    this.errorSource = info

    console.error('Widget capturado por el boundary del dashboard', {
      error,
      component: instance?.type,
      info
    })

    return false
  },
  methods: {
    retry() {
      this.hasError = false
      this.errorMessage = ''
      this.errorSource = ''
      this.retryKey += 1
    }
  }
}
</script>

<template>
  <section class="dashboard-card">
    <header>
      <h2>Estado del dashboard</h2>
      <p>Si un widget falla, el resto de la pantalla puede seguir funcionando.</p>
    </header>

    <div v-if="hasError" class="error-box">
      <strong>Este bloque no pudo renderizarse.</strong>
      <p>{{ errorMessage }}</p>
      <small>Origen: {{ errorSource }}</small>
      <button type="button" @click="retry">Reintentar</button>
    </div>

    <RiskyStatsPanel v-else :key="retryKey" />
  </section>
</template>
```
El patrón clave es claro: el error ocurre en el hijo, el padre lo captura, registra contexto y cambia a un estado de respaldo sin afectar el resto del árbol.
> En ambos enfoques, la responsabilidad es la misma: el componente padre delimita la zona de riesgo y decide cómo degradar la experiencia si algo falla en su árbol descendiente.

## Resumen

`errorCaptured` no existe para ocultar excepciones, sino para gestionar mejor su impacto. Bien utilizado, permite construir interfaces más resilientes: una parte puede fallar sin comprometer todo el flujo.

La idea clave: captura localmente, registra con contexto y ofrece una salida clara al usuario.
