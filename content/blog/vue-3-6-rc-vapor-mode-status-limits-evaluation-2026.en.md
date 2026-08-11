---
title: "Vue 3.6 RC and Vapor Mode: Current Status, Limits, and How to Evaluate It in 2026"
description: "Explore Vue 3.6 RC and Vapor Mode, their current limits and risks, and how to evaluate adoption through reproducible testing."
date: 2026-08-11T10:00:29.882-05:00
updatedAt: 2026-08-11T15:22:20-05:00
draft: false
locale: en
author: TODOvue
tags:
  - tag: "Vapor Mode"
    color: "#41B2A6"
  - tag: "Advanced"
    color: "#F54927"
  - tag: "Performance"
    color: "#D4A017"
  - tag: "Ecosystem"
    color: "#68D4F2"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1786479202/vue-3-6-rc-vapor-mode-status-limits-evaluation-2026_zadbpu.png
coverAlt: "Technical comparison between Vue's standard compiler and Vapor Mode during the Vue 3.6 RC stage."
coverCaption: "Current status, limits, and practical evaluation of Vapor Mode during the Vue 3.6 RC stage."
keywords:
  - Vue 3.6 RC and Vapor Mode
  - Vapor Mode status
  - Vapor Mode limitations
  - evaluate Vapor Mode
  - Vue 3.6.0-rc.3
  - Vue performance
schemaOrg:
  - type: "BlogPosting"
    headline: "Vue 3.6 RC and Vapor Mode: Current Status, Limits, and How to Evaluate It in 2026"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2026-08-11T10:00:29.882-05:00"
lab:
  title: "Compare the standard compiler and Vapor"
  goal: "Create two equivalent counter variants and prepare a reproducible A/B comparison without changing their data, markup, or interactions."
  tasks:
    - "Keep this component as the standard-compiler baseline."
    - "Create a second variant and enable Vapor only through the documented attribute on <script setup>."
    - "Run both variants with the same production build, browser, device, and interaction sequence."
    - "Record the actual build size and an update profile without turning the local result into a general conclusion."
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
  solutionHint: "The Vapor variant should only add vapor to <script setup>; do not change the state, template, or interaction. For a fully Vapor application, review the createVaporApp() example afterward."
---

# Vue 3.6 RC and Vapor Mode: Current Status, Limits, and How to Evaluate It in 2026

Evaluating Vapor Mode is not a matter of asking whether a new compiler is faster in the abstract. The actual decision is whether its supported subset, available integrations, and a measured bottleneck justify introducing a prerelease into your context.

As of August 11, 2026, that decision still required caution: [Vue 3.6.0-rc.3](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.3) remained a prerelease, while [Vue 3.5.41](https://github.com/vuejs/core/releases/tag/v3.5.41) was marked Latest. The [npm registry tags](https://www.npmjs.com/package/vue?activeTab=versions) agreed: 3.5.41 under `latest`, 3.6.0-rc.3 under `rc`, and 3.6.0-beta.17 under `beta`. Vue 3.6 was therefore not stable on the research date.

This post is an independent evaluation of the RC stage. It does not assume complete parity, universal compatibility, or performance gains that transfer to every application.

## Current status: Vue 3.6 is still an RC

The release channel matters because an RC is intended to stabilize a candidate version, but it can still change before the stable release. The [changelog included in the rc.3 tag](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md) records that evolution and should be compared with the newest release before installing or adopting Vue 3.6.

For a team, this changes the required standard of evidence. An isolated test can accept an RC; a critical application also needs an update policy, verified compatibility, and a clear rollback path if behavior changes. A feature being complete for its intended scope does not automatically make the entire ecosystem stable for that mode.

## From the early betas to the RC: what actually changed

Vue 3.6.0-beta.1 announced that Vapor's intended feature set was complete and used the phrase *feature parity*. However, the [official timeline preserved in rc.3](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#360-beta1-2025-12-23) already listed exclusions, including `Suspense` in pure Vapor applications and several unsupported APIs.

The RC notes use a more precise description: Vapor is feature-complete for a subset of APIs and provides mostly equivalent behavior within that subset. Between the betas and RCs, hydration, slots, async components, `KeepAlive`, transitions, and interoperability with VDOM regions using `Suspense` or `Teleport` were added or corrected. This is substantial compatibility and stabilization work, but it does not establish universal equivalence.

RC.2 also changed event handling. According to its [breaking-changes section](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#breaking-changes), listeners now attach directly to elements by default; document delegation became opt-in through `.delegate` for supported static events. A general section of the same document still contains an older explanation of automatic delegation, but the versioned RC.2 change is the applicable reference. Do not use `compilerOptions.eventDelegation`: that option was removed in RC.2.

RC.3 added another round of compiler and Vapor runtime fixes. Its [exact changelog](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#360-rc3-2026-08-11) includes work on `v-model`, custom directives, `KeepAlive`, `Teleport`, asynchronous hydration, and VDOM slot interoperability. An RC published that same day still correcting these boundaries reinforces the need to pin versions and evaluate your own case.

## What Vapor Mode is, what it removes, and what it does not promise

Vapor is an opt-in compilation mode for Single-File Components. For its supported subset, the compiler connects reactive dependencies to targeted DOM updates without creating VNodes for every update. That is the model change: it bypasses the usual path of constructing and comparing virtual trees in that region.

A fully Vapor application can start with `createVaporApp()` and, according to the [official rc.1 release notes](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1), omit the Virtual DOM runtime. That statement stops being global when interoperability is involved. `vaporInteropPlugin` makes it possible to combine Vapor and VDOM components, but it brings that runtime back and reduces the potential baseline-size benefit.

The VDOM also remains when a project uses JSX or render functions: those components continue to produce VNodes and need interoperability inside a Vapor application. Describing Vapor as “Vue without a Virtual DOM” is therefore accurate only for a fully Vapor application or region operating within the supported set.

The notes do not promise that every library will work, that memory use will fall by a fixed percentage, or that every screen will improve. The distinction is valuable only when the removed work mattered in the measured case.

## Vapor Mode is not the reactivity-system overhaul

Two development tracks are often conflated. Tracking based on version counting and doubly linked lists arrived in Vue 3.5, as documented by the [Vue 3.5 announcement](https://blog.vuejs.org/posts/vue-3-5) and the [changelog preserved in Vue 3.5.41](https://github.com/vuejs/core/blob/v3.5.41/CHANGELOG.md). It did not originate in Vapor and should not be presented as a Vue 3.6 innovation.

Vue 3.6 does contain a later `@vue/reactivity` refactor based on `alien-signals`, recorded since [Vue 3.6.0-alpha.1](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md#360-alpha1-2025-07-12). That work belongs to the general reactive engine. Vapor instead changes how the compiler represents and applies DOM updates. One track organizes dependency tracking and propagation; the other changes the rendering mechanism.

For more context on the first track, see [Vue 3 reactivity internals](/blog/vue-3-reactivity-internals.en/) and the guide to [reactive boundaries and unnecessary updates](/blog/reactive-performance-shallowref-readonly-markraw-unnecessary-updates.en/). Keeping the two tracks separate prevents Vapor from receiving credit for results produced by the shared reactive engine.

## Current limits and adoption risks

The [Vue 3.6 RC release notes](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1) and the [versioned rc.3 changelog](https://github.com/vuejs/core/blob/v3.6.0-rc.3/CHANGELOG.md) document limits that should become a project checklist:

- Options API and `app.config.globalProperties` are unsupported. `getCurrentInstance()` returns `null` inside Vapor components.
- Per-element `@vue:xxx` events, `v-memo`, and several component-ref public properties such as `$el`, `$props`, `$attrs`, `$slots`, and `$refs` are unsupported.
- Calling `slots.default()` to inspect content is not harmless: in Vapor it can render, create DOM and reactive effects, or claim nodes during hydration.
- Custom directives use a different interface with a reactive getter and an optional cleanup function. An existing directive must be reviewed rather than assumed compatible.

Interoperability covers standard props, events, and slots, but not every edge case. The notes warn about possible friction with VDOM-based libraries and recommend clear boundaries between Vapor and VDOM regions instead of repeatedly alternating them through nested components.

Vue core includes Vapor hydration implementation and fixes. That is not the same as a declaration of comprehensive Nuxt support. The [official SSR guide](https://vuejs.org/guide/scaling-up/ssr) defines hydration as attaching the client application to server-rendered HTML and connecting event listeners. Hydration compatibility in core and full support from an SSR framework are therefore separate questions. The internal guide to [lifecycle behavior and SSR](/blog/vue-lifecycle-ssr-serverprefetch.en/) provides additional context for designing those checks.

Before adopting Vapor, independently verify Nuxt, Vue DevTools, UI libraries, plugins, JSX, render functions, and project-specific directives. If any are critical and lack confirmed support, waiting is a valid technical decision.

## How to test Vapor safely in a small project

Use a Vue and Vite lab that is separate from a critical application. Pin `vue@3.6.0-rc.3`, retain the lockfile, and record the exact Vue plugin version. Pinning versions is a reproducibility strategy, not an API requirement. If you need to prepare the environment, start with a [Vue and Vite setup](/blog/setting-up-vue-with-vite.en/).

For a component-level test, the documented opt-in avoids unnecessary global configuration:

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

The `vapor` attribute on the first line selects the compiler for this SFC. State remains in the Composition API, and the semantic button works with a keyboard without introducing an unnecessary ARIA state.

A fully Vapor lab application starts this way:

```ts [main.ts] {1,4}
import { createVaporApp } from 'vue'
import App from './App.vue'

createVaporApp(App).mount('#app')
```

The documented forms also allow `vapor` on `<script>` or `<template>`; they do not require a `.vapor.vue` extension. `@vitejs/plugin-vue` 6.0.8 added `features.vapor` to force compilation globally in compatible Vue 3.6+ SFCs, according to its [version changelog](https://github.com/vitejs/vite-plugin-vue/blob/plugin-vue%406.0.8/packages/plugin-vue/CHANGELOG.md#608-2026-07-14) and [official PR](https://github.com/vitejs/vite-plugin-vue/pull/766). This lab does not need that option. The example above was compiled as a production build and executed in Edge with Vue 3.6.0-rc.3, plugin-vue 6.0.8, and Vite 7.3.3; mounting and the `Count: 0 → Count: 1` interaction passed. This verifies the minimal example, not Nuxt or third-party dependency compatibility.

For the A/B baseline, keep exactly the same component, remove only the `vapor` opt-in, and start the standard variant with `createApp()`. Keep data, markup, and interactions identical. Do not add interoperability to the first experiment: measuring a pure Vapor application and measuring a mixed application answer different questions.

## Decision matrix: standard, experiment, or wait

| Criterion | Standard compiler | Vapor experiment | Wait |
|---|---|---|---|
| Production | Stable reference on Vue 3.5.41 | Only with accepted risk and isolated scope | When Vue 3.6 stable is required |
| SSR and hydration | Preferable for already-supported Nuxt or SSR | Only with documented integration and focused tests | When framework support is unconfirmed |
| Ecosystem | Broadest current compatibility | Audited dependencies and a clear VDOM boundary | Critical libraries remain unverified |
| Debugging | Team's established workflow | Tools checked against the exact RC | DevTools or profiling support is unclear |
| Team | Suitable for normal operations | Team can maintain a prerelease and roll back | No time is available to investigate changes |
| Measurements | No bottleneck attributable to rendering | A hypothesis and reproducible A/B case exist | Evidence consists only of generic benchmarks |

The matrix does not turn any choice into a universal rule. During the RC, the [official notes](https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1) limit their recommendation to partial experiments on performance-sensitive pages or small new applications that are fully Vapor. This is not a general recommendation to migrate production systems.

## How to measure before adopting

Vue's [performance guide](https://vuejs.org/guide/best-practices/performance) separates page-load performance from update performance. Measure both because Vapor can affect different costs, and a favorable result in one does not guarantee the other.

Keep versions, data, components, routes, production build, minification, browser, device, cache state, and interaction sequence constant. Record multiple runs and their variability. At minimum, observe:

- actual chunk and transferred-resource sizes;
- LCP and INP in representative scenarios;
- long tasks and update profiles;
- the duration and work of the interaction that motivated the test;
- for SSR, server HTML, mismatch warnings, DOM preservation, hydration, and the first interaction.

Vue recommends PageSpeed Insights or WebPageTest for production loading and Chrome Performance for local profiles. `app.config.performance` and Vue DevTools are also part of the general toolkit, but their behavior with the tested Vapor version must be confirmed. Bundle size must be measured from the real build because imports, tree-shaking, and interoperability affect it.

Do not publish a percentage copied from a generic benchmark. A defensible result includes source code, versions, hardware, browser, data, repetitions, and reproducible results. A memory measurement is also local to the scenario; it is not a Vapor promise.

## A practical rule for 2026

Keep the standard compiler when you need stability and broad compatibility. Experiment with Vapor when a measured problem exists, you can isolate the boundary, and the team accepts an RC. Wait when the project depends on unsupported APIs or integrations that have not been verified.

Vapor Mode materially changes how Vue can update the DOM, but the decision should not rely on adjectives or somebody else's benchmark. Compare the same case, record its conditions, and check Vue's release channel again before adoption.

