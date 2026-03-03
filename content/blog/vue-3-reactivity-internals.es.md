---
title: "Cómo funciona internamente el sistema de reactividad en Vue 3"
description: "Disección técnica del motor reactivo de Vue 3: dependency tracking, estructura WeakMap->Map->Set, activeEffect, scheduler, batching y errores reales de arquitectura."
date: 2026-03-02T20:00:00-05:00
updatedAt: 2026-03-02T20:00:00-05:00
tags:
  - tag: "Reactividad"
    color: "#1D5BA1"
  - tag: "Avanzado"
    color: "#F54927"
  - tag: "Arquitectura"
    color: "#4CAF50"
  - tag: "Buenas Prácticas"
    color: "#2196F3"
draft: false
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1772497884/vue-3-reactivity-internals_hhru1s.png
coverAlt: "Cómo funciona internamente el sistema de reactividad en Vue 3"
coverCaption: "Portada temporal: reemplazar por arte final de TODOvue"
locale: es
author: TODOvue
keywords:
  - Vue 3
  - reactividad
  - dependency tracking
  - scheduler
  - batching
  - computed
schemaOrg:
  - type: "BlogPosting"
    headline: "Cómo funciona internamente el sistema de reactividad en Vue 3"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-03-02T20:00:00-05:00"
---
# Cómo funciona internamente el sistema de reactividad en Vue 3

Vue 3 introdujo un sistema de reactividad completamente rediseñado respecto a Vue 2, basado en Proxy y en un grafo dinámico de dependencias. Aunque la API pública (`ref`, `reactive`, `computed`, `watch`) resulta simple, su funcionamiento interno responde a un modelo cuidadosamente optimizado para granularidad, rendimiento y previsibilidad. Entender este modelo no es opcional en aplicaciones grandes: es la diferencia entre depurar síntomas y resolver causas.

## Introducción basada en un problema real

En equipos que ya utilizan Vue 3 en producción, las dudas más costosas no suelen ser “cómo usar `ref`”, sino estas:

* ¿Cómo sabe Vue exactamente qué actualizar y qué no tocar?
* ¿Por qué un cambio parece correcto, pero no re-renderiza?
* ¿Por qué una pantalla vuelve a renderizar demasiado y se vuelve lenta?

La respuesta no está en una API aislada. Está en el motor interno: cómo Vue registra dependencias al leer estado y cómo decide qué efectos ejecutar al escribir estado.

Cuando este modelo mental no está claro, se depura a ciegas. Cuando sí lo está, se puede razonar sobre causa raíz, costo de render y comportamiento de `computed` o `watchEffect` con precisión.

## Modelo mental simplificado

### Dependency tracking en una frase

Cada vez que un efecto activo (render, `computed`, `watchEffect`) lee una propiedad reactiva, Vue registra una relación:

```txt [dependency-rule.txt]
efecto X depende de target.key
```

Luego, si `target.key` cambia, Vue solo notifica los efectos suscritos a esa clave.

### Estructura interna: WeakMap → Map → Set

Un modelo simplificado del almacenamiento de dependencias:

* `WeakMap`: índice por objeto reactivo (`target`).
* `Map`: índice por propiedad dentro de ese objeto (`key`).
* `Set`: efectos que dependen de esa propiedad.

```txt [dependency-graph.txt]
bucket (WeakMap)
  -> targetA (Map)
       -> "count" (Set: effectRender, effectComputed)
       -> "ok"    (Set: effectRender)
  -> targetB (Map)
       -> "name"  (Set: effectProfile)
```

Esta estructura permite:

* Evitar memory leaks (gracias a `WeakMap`).
* Tener granularidad por propiedad.
* Ejecutar únicamente los efectos necesarios.

### `activeEffect`: la pieza crítica

Vue mantiene una referencia global temporal al efecto que está ejecutándose: `activeEffect`.

Flujo:

1. Empieza `effect(fn)` → `activeEffect = fn`.
2. Dentro de `fn`, una lectura reactiva ejecuta `track(target, key)`.
3. `track` asocia `activeEffect` al `Set` de `target.key`.
4. Al terminar `fn`, `activeEffect` vuelve al anterior (stack de efectos anidados).

Sin `activeEffect`, no hay tracking.

## Mini implementación desde cero en JavaScript puro

La implementación real es más compleja (maneja tipos de operación, colecciones como `Map`/`Set`, flags internos, etc.), pero este modelo replica las piezas esenciales:

* `track(target, key)`
* `trigger(target, key)`
* `effect(fn)`

```js [reactivity-core.js]
// Grafo global de dependencias.
const bucket = new WeakMap()

// Effect activo y pila para efectos anidados.
let activeEffect = null
const effectStack = []

function cleanup(effectFn) {
  for (const deps of effectFn.deps) {
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const result = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1] ?? null
    return result
  }

  effectFn.deps = []
  effectFn.options = options

  if (!options.lazy) {
    effectFn()
  }

  return effectFn
}

function track(target, key) {
  if (!activeEffect) return

  let depsMap = bucket.get(target)
  if (!depsMap) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  if (!deps.has(activeEffect)) {
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
  }
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const deps = depsMap.get(key)
  if (!deps) return

  const effectsToRun = new Set()
  deps.forEach((effectFn) => {
    if (effectFn !== activeEffect) effectsToRun.add(effectFn)
  })

  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      if (!Object.is(oldValue, value)) {
        trigger(target, key)
      }
      return result
    }
  })
}
```

```js [demo.js]
const state = reactive({ count: 0, ok: true })

effect(() => {
  console.log("render ->", state.ok ? state.count : "hidden")
})

state.count++
state.ok = false
```

### Paso a paso de lo que ocurre

1. `effect` ejecuta la función de render y la marca como activa.
2. Al leer `state.ok` y `state.count`, el `get` del `Proxy` dispara `track`.
3. `track` guarda dependencias en `WeakMap → Map → Set`.
4. Cuando cambias `state.count`, el `set` dispara `trigger`.
5. `trigger` busca el `Set` de esa key y re-ejecuta solo los efectos dependientes.

Este patrón es exactamente el núcleo del sistema de reactividad de Vue 3.

## Conexión con Vue real

### `reactive` usa `Proxy`

`reactive` no “magia” valores: crea un `Proxy` que intercepta operaciones (`get`, `set`, `has`, `deleteProperty`, iteración, etc.).

* En `get` se hace tracking.
* En `set` se hace trigger.
* Para arrays y colecciones (`Map`, `Set`, `WeakMap`, `WeakSet`) existen manejadores específicos.

### `ref` envuelve primitivos

Como un primitivo no puede proxificarse por propiedad, Vue usa un objeto contenedor con getter/setter en `.value`.

Simplificación conceptual:

```js [ref.js]
function ref(raw) {
  const box = {
    get value() {
      track(box, "value")
      return raw
    },
    set value(newValue) {
      if (!Object.is(raw, newValue)) {
        raw = newValue
        trigger(box, "value")
      }
    }
  }
  return box
}
```

En Vue real:

* Los objetos pasados a `ref` se convierten internamente en reactivos.
* En templates, `.value` se desempaqueta automáticamente (ref unwrapping).

### `computed` se construye sobre `effect`

`computed` se implementa usando un `effect` lazy:

1. No se evalúa hasta que alguien lee `.value`.
2. Cachea el resultado.
3. Se invalida cuando cambia una dependencia interna.
4. Expone su propio `track`/`trigger` para quienes dependen del computed.

Internamente, combina:

* Un efecto con `lazy: true`
* Un flag `dirty`
* Un scheduler que marca como inválido en lugar de recalcular inmediatamente

### Scheduler y batching

Vue evita trabajo redundante dentro del mismo tick:

1. En lugar de ejecutar cada efecto inmediatamente, puede encolarlo.
2. Deduplica jobs repetidos.
3. Hace flush en una microtask.

Mini scheduler conceptual:

```js [scheduler.js]
const queue = new Set()
let flushing = false
const p = Promise.resolve()

function scheduler(job) {
  queue.add(job)
  if (flushing) return
  flushing = true
  p.then(() => {
    queue.forEach((j) => j())
    queue.clear()
    flushing = false
  })
}
```

Esto explica por qué 10 mutaciones síncronas pueden producir un único render final.

## Errores comunes

### La desestructuración rompe la reactividad

```js [destructuring-breaks-reactivity.js]
const state = reactive({ count: 0 })
const { count } = state // count deja de estar enlazado
```

Corrección:

* Usar `toRef(state, "count")`
* Acceder como `state.count`.

### Mutaciones fuera del proxy

Si mutas una referencia “raw” fuera del `Proxy`, Vue no puede disparar `trigger`.
Todo acceso/escritura que deba ser reactivo debe pasar por el proxy o por `.value`.

### `shallowRef` vs `ref`

`shallowRef` solo rastrea el reemplazo de `.value`, no mutaciones profundas.

```js [shallow-ref-example.js]
const user = shallowRef({ name: "Ana" })
user.value.name = "Eva" // no dispara por sí solo
user.value = { ...user.value, name: "Eva" } // sí dispara
```

Es útil cuando:

* Manejas estructuras grandes,
* Trabajas con librerías externas,
* Quieres controlar manualmente cuándo invalidar.

### Effects que se ejecutan más de lo esperado

Causas típicas:

* Leer demasiadas fuentes dentro de un mismo `watchEffect`;
* Crear objetos nuevos en cada evaluación de `computed`;
* Usar `watchEffect` cuando `computed` era suficiente;
* Mutar estado dentro de un efecto sin aislar dependencias.

## Conclusión

Cuando entiendes el motor interno de Vue 3, cambia tu forma de construir UI:

* Pasas de ensayo-error a diagnóstico por dependencias;
* Distingues entre problema de tracking y problema de rendering;
* Diseñas estado para reducir renders y costo computacional.

En aplicaciones grandes, esto impacta directamente en:

* Rendimiento estable bajo carga;
* Menos bugs intermitentes de sincronización;
* Decisiones más finas sobre `ref`, `reactive`, `shallowRef`, `computed`, `watch` y scheduling.

> La reactividad de Vue 3 no es magia. Es un grafo de dependencias bien diseñado y un scheduler eficiente. Entenderlo te permite escribir código más predecible, más performante y mucho más fácil de depurar.
