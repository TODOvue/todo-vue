---
title: "Vue 3.6 RC y Vapor Mode: estado real, límites y cómo evaluarlo en 2026"
description: "Conoce el estado de Vue 3.6 RC y Vapor Mode, sus límites, riesgos y cómo evaluarlo con pruebas reproducibles antes de adoptarlo."
date: 2026-08-11T10:00:29.882-05:00
updatedAt: 2026-08-11T15:22:20-05:00
draft: false
locale: es
author: TODOvue
tags:
  - tag: "Vapor Mode"
    color: "#41B2A6"
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Rendimiento"
    color: "#D4A017"
  - tag: "Ecosistema"
    color: "#68D4F2"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1786479202/vue-3-6-rc-vapor-mode-status-limits-evaluation-2026_zadbpu.png
coverAlt: "Comparación técnica entre el compilador estándar de Vue y Vapor Mode durante la etapa RC de Vue 3.6."
coverCaption: "Estado, límites y evaluación práctica de Vapor Mode durante la etapa RC de Vue 3.6."
keywords:
  - Vue 3.6 RC y Vapor Mode
  - estado de Vapor Mode
  - límites de Vapor Mode
  - evaluar Vapor Mode
  - Vue 3.6.0-rc.3
  - rendimiento de Vue
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue 3.6 RC y Vapor Mode: estado real, límites y cómo evaluarlo en 2026"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-08-11T10:00:29.882-05:00"
lab:
  title: "Compara el compilador estándar y Vapor"
  goal: "Crear dos variantes equivalentes de un contador y preparar una comparación A/B reproducible sin cambiar sus datos, marcado ni interacciones."
  tasks:
    - "Conserva este componente como referencia del compilador estándar."
    - "Crea una segunda variante y activa Vapor únicamente mediante el atributo documentado en <script setup>."
    - "Ejecuta ambas variantes con el mismo build de producción, navegador, dispositivo y secuencia de interacciones."
    - "Registra el tamaño real del build y un perfil de actualización sin convertir el resultado local en una conclusión general."
  starterCode: |
    <script setup lang="ts">
    import { ref } from 'vue'

    const count = ref(0)

    function increment() {
      count.value += 1
    }
    </script>

    <template>
      <main>
        <h1>Vapor counter</h1>
        <button type="button" @click="increment">Increment</button>
        <p aria-live="polite">Count: {{ count }}</p>
      </main>
    </template>
  solutionHint: "La variante Vapor solo debe añadir vapor a <script setup>; no cambies el estado, el template ni la interacción. Para una aplicación completamente Vapor, revisa después el ejemplo con createVaporApp()."
---

# Vue 3.6 RC y Vapor Mode: estado real, límites y cómo evaluarlo en 2026

Evaluar Vapor Mode no consiste en preguntar si un compilador nuevo es más rápido en abstracto. La decisión real es si el subconjunto admitido, la integración disponible y un cuello de botella medido justifican introducir una versión preliminar en tu contexto.

Al 11 de agosto de 2026, la respuesta exige cautela: [Vue 3.6.0-rc.3](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.3) seguía publicada como prerelease, mientras [Vue 3.5.41](https://github.com/vuejs/core/releases/tag/v3.5.41) figuraba como Latest. Las [etiquetas del registro npm](https://www.npmjs.com/package/vue?activeTab=versions) coincidían: 3.5.41 bajo `latest`, 3.6.0-rc.3 bajo `rc` y 3.6.0-beta.17 bajo `beta`. Por tanto, Vue 3.6 todavía no era estable en la fecha de comprobación.

Esta entrada es una evaluación independiente de la etapa RC. No presupone paridad total, compatibilidad universal ni ganancias de rendimiento transferibles a cualquier aplicación.

## Estado actual: Vue 3.6 todavía está en RC

El canal importa porque una RC busca estabilizar una versión candidata, pero todavía puede recibir cambios antes de la publicación estable. El [changelog incluido en la etiqueta rc.3](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md) registra esa evolución y debe compararse con la versión más reciente antes de instalar o adoptar Vue 3.6.

Una prueba aislada puede aceptar una RC; una aplicación crítica necesita compatibilidad comprobada, política de actualización y plan de reversión. Que Vapor esté completo para su alcance no estabiliza automáticamente el ecosistema.

## De las primeras betas al RC: qué cambió realmente

Vue 3.6.0-beta.1 anunció que el conjunto previsto de Vapor estaba completo y utilizó la expresión *feature parity*. Sin embargo, la [cronología oficial preservada en rc.3](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#360-beta1-2025-12-23) ya enumeraba exclusiones, entre ellas `Suspense` en aplicaciones Vapor puras y varias APIs sin soporte.

Las notas de RC usan una descripción más precisa: Vapor es *feature-complete* para un subconjunto de APIs y ofrece un comportamiento mayormente equivalente dentro de ese subconjunto. Entre las betas y los RC se añadieron o corrigieron hidratación, slots, componentes asíncronos, `KeepAlive`, transiciones e interoperabilidad con regiones VDOM que usan `Suspense` o `Teleport`. Esto representa trabajo real de compatibilidad y estabilización, pero no demuestra equivalencia universal.

RC.2 también cambió la gestión de eventos. Según su [sección de cambios incompatibles](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#breaking-changes), los listeners se conectan directamente al elemento de forma predeterminada; la delegación al documento pasó a ser opt-in mediante `.delegate` para los eventos estáticos admitidos. La sección general del mismo documento aún conserva una explicación anterior sobre delegación automática, pero el cambio versionado de RC.2 es la referencia aplicable. No uses `compilerOptions.eventDelegation`: esa opción fue retirada en RC.2.

RC.3 añadió correcciones de `v-model`, directivas, `KeepAlive`, `Teleport`, hidratación asíncrona e interoperabilidad VDOM, según su [changelog exacto](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#360-rc3-2026-08-11). Que siga corrigiendo estos límites refuerza fijar versiones y evaluar el caso propio.

## Qué es Vapor Mode, qué elimina y qué no promete

Vapor es un modo de compilación opt-in para Single-File Components. Para el subconjunto admitido, el compilador conecta las dependencias reactivas con actualizaciones concretas del DOM sin crear VNodes para cada actualización. Ese es el cambio de modelo: evita el camino habitual de construir y comparar árboles virtuales en esa región.

Una aplicación completamente Vapor puede iniciarse con `createVaporApp()` y, según las [notas oficiales de rc.1](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1), omitir el runtime del Virtual DOM. Esa afirmación deja de ser global cuando existe interoperabilidad. `vaporInteropPlugin` permite combinar componentes Vapor y VDOM, pero vuelve a incluir dicho runtime y reduce el posible beneficio de tamaño base.

Tampoco desaparece el VDOM si el proyecto usa JSX o funciones de render: esos componentes siguen produciendo VNodes y requieren interoperabilidad dentro de una aplicación Vapor. En consecuencia, describir Vapor como “Vue sin Virtual DOM” solo es preciso para una aplicación o región completamente Vapor y dentro del conjunto soportado.

Las notas no prometen que toda biblioteca funcione, que el consumo de memoria disminuya un porcentaje fijo o que cualquier pantalla mejore. La diferencia solo resulta valiosa cuando el coste eliminado era relevante en el caso medido.

## Vapor Mode no es la renovación del sistema de reactividad

Dos líneas de trabajo suelen confundirse. El tracking mediante conteo de versiones y listas doblemente enlazadas fue introducido en Vue 3.5, como documentan el [anuncio de Vue 3.5](https://blog.vuejs.org/posts/vue-3-5) y el [changelog preservado en Vue 3.5.41](https://github.com/vuejs/core/blob/v3.5.41/CHANGELOG.md). No nació con Vapor ni debe presentarse como una optimización original de Vue 3.6.

Vue 3.6 sí contiene una refactorización posterior de `@vue/reactivity` basada en `alien-signals`, registrada desde [Vue 3.6.0-alpha.1](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#360-alpha1-2025-07-12). Ese trabajo pertenece al motor reactivo general. Vapor, en cambio, modifica cómo el compilador representa y aplica las actualizaciones al DOM. Una línea organiza el seguimiento y la propagación de dependencias; la otra cambia el mecanismo de renderizado.

Si necesitas repasar el primer eje, consulta [los componentes internos de la reactividad en Vue 3](/blog/vue-3-reactivity-internals.es/) y la guía sobre [límites reactivos y actualizaciones innecesarias](/blog/reactive-performance-shallowref-readonly-markraw-unnecessary-updates.es/). Separar ambos ejes evita atribuir a Vapor resultados que pertenecen al motor reactivo compartido.

## Límites actuales y riesgos de adopción

Las [notas de Vue 3.6 RC](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1) y el [changelog versionado de rc.3](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md) documentan límites que deben convertirse en una lista de comprobación del proyecto:

- No hay soporte para Options API ni `app.config.globalProperties`. `getCurrentInstance()` devuelve `null` dentro de componentes Vapor.
- No están admitidos los eventos por elemento `@vue:xxx`, `v-memo` ni varias propiedades públicas obtenidas mediante refs de componente, como `$el`, `$props`, `$attrs`, `$slots` y `$refs`.
- Invocar `slots.default()` para inspeccionar contenido no es una operación inocua: en Vapor puede renderizar, crear DOM y efectos reactivos, o reclamar nodos durante la hidratación.
- Las directivas personalizadas usan una interfaz distinta, con un getter reactivo y una función de limpieza opcional. Una directiva existente debe revisarse, no asumirse compatible.

La interoperabilidad cubre props, eventos y slots estándar, pero no todos los casos límite. Las notas advierten de fricción potencial con bibliotecas basadas en VDOM y recomiendan fronteras claras entre regiones Vapor y VDOM en lugar de alternarlas mediante anidamientos repetidos.

Vue core contiene implementación y correcciones de hidratación Vapor. Eso no equivale a una declaración de soporte integral de Nuxt. La [guía oficial de SSR](https://vuejs.org/guide/scaling-up/ssr) define la hidratación como la asociación de la aplicación cliente con el HTML del servidor y la conexión de listeners. Por tanto, compatibilidad de hidratación en core y soporte de un framework SSR completo son preguntas diferentes. La guía interna sobre [ciclo de vida y SSR](/blog/vue-lifecycle-ssr-serverprefetch.es/) ofrece contexto adicional para diseñar esas comprobaciones.

Antes de adoptar, verifica por separado Nuxt, Vue DevTools, bibliotecas UI, plugins, JSX, funciones de render y directivas propias. Si cualquiera es crítico y carece de soporte confirmado, esperar es una decisión técnica válida.

## Cómo probar Vapor de forma segura en un proyecto pequeño

Usa un laboratorio Vue con Vite que no forme parte de una aplicación crítica. Fija `vue@3.6.0-rc.3`, conserva el lockfile y registra la versión exacta del plugin de Vue. Fijar versiones es una estrategia para reproducir la prueba, no un requisito de la API. Si necesitas preparar el entorno, parte de una [configuración de Vue con Vite](/blog/setting-up-vue-with-vite.es/).

Para una prueba por componente, el opt-in documentado evita una configuración global:

```vue [App.vue] {1,4,14}
<script setup vapor lang="ts">
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value += 1
}
</script>

<template>
  <main>
    <h1>Vapor counter</h1>
    <button type="button" @click="increment">Increment</button>
    <p aria-live="polite">Count: {{ count }}</p>
  </main>
</template>
```

El atributo `vapor` de la primera línea selecciona el compilador para este SFC. El estado permanece en Composition API y el botón semántico funciona con teclado sin añadir un estado ARIA innecesario.

Una aplicación de laboratorio completamente Vapor se inicia así:

```ts [main.ts] {1,4}
import { createVaporApp } from 'vue'
import App from './App.vue'

createVaporApp(App).mount('#app')
```

Las formas documentadas también permiten `vapor` en `<script>` o `<template>`; no requieren `.vapor.vue`. Plugin-vue 6.0.8 añadió `features.vapor` para forzar SFC compatibles, según su [changelog](https://github.com/vitejs/vite-plugin-vue/blob/plugin-vue%406.0.8/packages/plugin-vue/CHANGELOG.md#608-2026-07-14) y [PR](https://github.com/vitejs/vite-plugin-vue/pull/766). Aquí no hace falta: el ejemplo se compiló y ejecutó en Edge con Vue 3.6.0-rc.3, plugin-vue 6.0.8 y Vite 7.3.3; montaje y `Count: 0 → Count: 1` pasaron. Esto valida el ejemplo mínimo, no Nuxt ni dependencias externas.

Para la referencia A/B, conserva exactamente el mismo componente, elimina solo el opt-in `vapor` y arranca la variante estándar con `createApp()`. Mantén datos, marcado e interacciones iguales. No añadas interoperabilidad al primer experimento: medir una aplicación Vapor pura y una aplicación mixta responde preguntas distintas.

## Matriz de decisión: estándar, experimentar o esperar

| Criterio | Compilador estándar | Experimento Vapor | Esperar |
|---|---|---|---|
| Producción | Referencia estable en Vue 3.5.41 | Solo con riesgo aceptado y alcance aislado | Si necesitas Vue 3.6 estable |
| SSR e hidratación | Preferible para Nuxt o SSR ya soportado | Solo con integración documentada y pruebas específicas | Si el soporte del framework no está confirmado |
| Ecosistema | Máxima compatibilidad actual | Dependencias auditadas y frontera VDOM clara | Bibliotecas críticas sin verificar |
| Depuración | Flujo conocido por el equipo | Herramientas comprobadas con la RC exacta | DevTools o perfiles no confirmados |
| Equipo | Adecuado para operación normal | Equipo capaz de mantener una prerelease y revertir | Falta tiempo para investigar cambios |
| Mediciones | No existe un cuello de botella atribuible al renderizado | Hay una hipótesis y un caso A/B reproducible | Solo existen benchmarks genéricos |

La matriz no convierte una opción en regla universal. Durante el RC, las [notas oficiales](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1) limitan la recomendación a experimentos parciales en páginas sensibles al rendimiento o aplicaciones nuevas y pequeñas completamente Vapor. No es una recomendación general de migración a producción.

## Cómo medir antes de adoptar

La [guía de rendimiento de Vue](https://vuejs.org/guide/best-practices/performance) separa rendimiento de carga y rendimiento de actualización. Mide ambos porque Vapor puede afectar costes distintos y un resultado favorable en uno no garantiza el otro.

En la comparación, mantén constantes versiones, datos, componentes, rutas, build de producción, minificación, navegador, dispositivo, estado de caché y secuencia de interacciones. Registra varias ejecuciones y su variabilidad. Como mínimo, observa:

- tamaño real de chunks y recursos transferidos;
- LCP e INP en escenarios representativos;
- long tasks y perfiles de actualización;
- tiempo y trabajo de la interacción que motivó la prueba;
- para SSR, HTML del servidor, warnings de mismatch, conservación del DOM, hidratación y primera interacción.

Vue recomienda PageSpeed Insights o WebPageTest para carga en producción y Chrome Performance para perfiles locales. `app.config.performance` y Vue DevTools también forman parte de las herramientas generales, pero su comportamiento con la versión Vapor evaluada debe confirmarse. El tamaño debe medirse en el build real porque depende de imports, tree-shaking e interoperabilidad.

No publiques un porcentaje tomado de un benchmark genérico. Un resultado defendible incluye código, versiones, hardware, navegador, datos, repeticiones y resultados reproducibles. Una medición de memoria también es local al escenario: no constituye una promesa de Vapor.

## Una regla práctica para 2026

Mantén el compilador estándar cuando necesites estabilidad y compatibilidad amplia. Experimenta con Vapor cuando exista un problema medido, puedas aislar la frontera y el equipo acepte trabajar con una RC. Espera cuando dependas de APIs no admitidas o integraciones todavía no verificadas.

Vapor cambia cómo Vue actualiza el DOM, pero la decisión exige comparar el mismo caso, registrar sus condiciones y comprobar de nuevo el canal antes de adoptarlo.

