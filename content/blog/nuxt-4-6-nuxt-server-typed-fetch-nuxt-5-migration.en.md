---
title: "Nuxt 4.6: nuxt/server, typed fetch and the path to Nuxt 5"
description: Prepare your Nuxt 4.5.2 to 4.6 migration with nuxt/server, typed fetch, SSR, and a checklist for evaluating future Nuxt 5 defaults one step at a time.
date: 2026-10-28T16:05:03-05:00
updatedAt: 2026-10-29T01:55:58.762Z
draft: false
locale: en
author: TODOvue
tags:
  - tag: Guides
    color: "#42B983"
  - tag: Advanced
    color: "#F54927"
  - tag: Architecture
    color: "#4CAF50"
  - tag: SSR
    color: "#0E9AA7"
cover: https://nuxt.com/assets/blog/v4.6.png
coverAlt: Official graphic announcing the Nuxt 4.6 release.
coverCaption: Official Nuxt 4.6 announcement image, published by Nuxt.
keywords:
  - Nuxt 4.6 nuxt/server Nuxt 5
  - Nuxt 4.6 migration
  - Nuxt typed fetch
  - SSR and hydration
  - strictRouteTypes
  - Vapor in Nuxt
schemaOrg:
  - type: BlogPosting
    headline: "Nuxt 4.6: nuxt/server, typed fetch and the path to Nuxt 5"
    author:
      type: Person
      name: TODOvue
    datePublished: 2026-10-28T16:05:03-05:00
lab:
  title: Nuxt 4.6 migration audit
  goal: Compare server contracts, inference and payload before enabling future defaults.
  tasks:
    - "Classify handlers: migrate now, keep in Nitro, or test in isolation."
    - Change the GET response and inspect the consumer diagnostic.
    - Compare payload and requests with the serialize:false page.
    - Enable routeTypedFetch, fix calls, then enable strictRouteTypes.
  starterCode: |-
    <script setup lang="ts">
    const { data: projects, error } = await useFetch('/api/projects')
    </script>

    <template>
      <p v-if="error">Could not load projects.</p>
      <ul v-else>
        <li v-for="project in projects ?? []" :key="project.id">{{ project.name }}</li>
      </ul>
    </template>
  solutionHint: Start with server/api/projects.get.ts and record types, payload and requests at each checkpoint.
---

# Nuxt 4.6 and the Path to Nuxt 5: nuxt/server, Typed Fetch, and a Migration Checklist

Migrating from Nuxt 4.5.2 is not a matter of updating one dependency and enabling every future default. Nuxt 4.6 changes two architectural boundaries: the contract between the application and the server runtime, and the type contract between internal routes and their consumers. If you also change the builder and test Vapor in the same iteration, attributing a regression becomes difficult.

The practical strategy is to separate the work. First upgrade to the latest confirmed 4.6.x patch; during this research, that was Nuxt 4.6.3. Then adopt portable contracts and typed fetch. Finally, evaluate anticipated Nuxt 5 defaults, `@nuxt/vite-server`, and Vapor independently.

Nuxt 5 had not been verified as a published stable release on October 28, 2026. Its guide on the `main` branch is forward-looking material and still presents Nitro v3 integration as work in progress.

## From Nuxt 4.5.2 to 4.6.3: What Actually Changed

The comparison needs three points:

| Version | Role | Practical decision |
|---|---|---|
| Nuxt 4.5.2 | Primarily corrective baseline | Record its behavior before migrating |
| Nuxt 4.6.0 | Minor release with architectural changes | Evaluate its contracts, but do not use it as the final target |
| Nuxt 4.6.3 | Latest patch confirmed during research | Upgrade to this version or a newer verified patch |

Vite 8 and SSR streaming arrived with Nuxt 4.5.0, not 4.6. The 4.6 additions include the portable server surface, rebuilt route types, more Nuxt 5 defaults, and several experimental integrations.

You should not stop at 4.6.0 either. Vite builder versions 4.6.0–4.6.2 were affected by arbitrary file reads through the development server's error channel. Another 4.6.3 fix covered a case where `redirect` rules were not applied to the alternate endpoint of a `.server.vue` page. A redirect must never replace a server-side authorization check.

The published benchmarks compared 4.5.2 and 4.6.0 on arm64, using Node 24.15 and five-run medians. They showed improvements in that environment, not guarantees for another application. Use them to form hypotheses and measure your own build, installation, and SSR throughput.

In example labels, `pages/` and `components/` are relative to `app/`, following the Nuxt 4 layout. `server/`, `config/`, and `nuxt.config.ts` start at the project root.

## `nuxt/server`: A Portable Contract for the Server Boundary

Before 4.6, a handler could become coupled to a specific h3 version or Nitro details. `nuxt/server` introduces an explicit surface that complements `nuxt/app`:

- `nuxt/app` belongs to universal application code.
- `nuxt/server` belongs to code bundled by the server builder.
- Nitro 2, Nitro 3, and `@nuxt/vite-server` can implement the portable contract.

The portable `RequestEvent` exposes `req` as a `Request`, `url` as a `URL`, a response with `status`, `statusText`, and `Headers`, and a per-request context. The goal is to prevent each compatible handler from depending on concrete runtime details.

The conceptual migration can be reviewed with this matrix:

| Previous coupling | Portable contract |
|---|---|
| Auto-imported h3 helpers | Explicit, consistent imports from `nuxt/server` |
| `event.node` | `event.req`, `event.url`, and `event.res.headers` |
| `statusCode` and `statusMessage` | `status` and `statusText` in `createError` |
| Helper that terminates the response | Explicit return, such as `return sendRedirect(...)` |
| Nitro storage, caching, tasks, or plugins | Keep the handler on the specific runtime |

The [Nuxt 4.6.3 server imports guide](https://github.com/nuxt/nuxt/blob/v4.6.3/docs/3.guide/6.going-further/5.server-imports.md) lets you examine the change through two equivalent handlers. First, the h3 variant on Nitro 2:

```ts [server/api/legacy.get.ts] {1,6,8-10}
import { createError, defineEventHandler, getRequestURL, setHeader, setResponseStatus } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (url.searchParams.has('fail')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }
  setHeader(event, 'x-migration', 'legacy')
  setResponseStatus(event, 202, 'Accepted')
  return { method: event.node.req.method, path: url.pathname }
})
```

Its portable counterpart replaces `event.node.req` with `event.req`, obtains the URL from `event.url`, and changes the response through `Headers`, `status`, and `statusText`. It also changes the fields passed to `createError`; it does not mix helper families:

```ts [server/api/portable.get.ts] {1,5,7-10}
import { createError, defineEventHandler } from 'nuxt/server'

export default defineEventHandler((event) => {
  if (event.url.searchParams.has('fail')) {
    throw createError({ status: 400, statusText: 'Invalid request' })
  }
  event.res.headers.set('x-migration', 'portable')
  event.res.status = 202
  event.res.statusText = 'Accepted'
  return { method: event.req.method, path: event.url.pathname }
})
```

Both routes let you compare an accepted response and rejection through `?fail`; their `x-migration` values distinguish the variants. The same portable boundary can validate a body before consuming it:

```ts [server/api/projects.post.ts] {1,7-12,16}
import { createError, defineEventHandler, readValidatedBody } from 'nuxt/server'

interface CreateProjectBody {
  name: string
}

function validateCreateProject(input: unknown): CreateProjectBody {
  const name = (input as { name?: unknown } | null)?.name
  if (typeof name !== 'string' || name.trim().length < 3) {
    throw createError({ status: 400, statusText: 'Invalid project name' })
  }
  return { name: name.trim() }
}

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, validateCreateProject)
  return { id: 'project-preview', name: body.name }
})
```

In Nuxt 4, an auto-imported `defineEventHandler` still belongs to h3. Combining it with helpers imported from `nuxt/server` can produce `NUXT_E8012`. Migrate the complete helper family used by the handler, not one helper in isolation.

`nuxt/server` is not a complete h3 re-export or a replacement for every Nitro capability. Storage, caching, tasks, server plugins, raw bodies, and certain helpers remain runtime-specific. Keep those handlers on h3 or Nitro temporarily.

The import boundary is strict as well. Do not import `nuxt/server` from Vue components, application plugins, `shared/`, `nuxt.config.ts`, or module setup. Also see the [component architecture guide](/blog/vue-3-component-architecture.en/) for keeping application, domain, and server boundaries explicit.

## Typed Fetch: From Endpoint to Client Without Losing Validation

The previous types depended on Nitro's `InternalApi`, and their resolution could scale with the total route count. Nuxt 4.6 generates types through `fetchdts`, so the work relates to the consumed call sites.

Adoption should be gradual: enable `routeTypedFetch` first, correct methods, bodies, queries, and headers, and only then enable `strictRouteTypes`. The following block represents that second checkpoint, after known routes have been corrected:

```ts [nuxt.config.ts] {3-4}
export default defineNuxtConfig({
  experimental: {
    routeTypedFetch: true,
    strictRouteTypes: true
  }
})
```

Strict mode turns an unknown route into a diagnostic instead of degrading it to `unknown`.

With the previous endpoint, this user-initiated mutation selects the route and the `POST` method and obtains the response type from the handler’s return value, without repeating a generic:

```vue [pages/projects/new.vue] {12-15}
<script setup lang='ts'>
import { ref } from 'vue'

const name = ref('')
const feedback = ref('')

async function submitProject() {
  feedback.value = ''

  try {
    const project = await $fetch('/api/projects', {
      method: 'POST',
      body: { name: name.value }
    })
    feedback.value = `Created ${project.name}.`
  } catch {
    feedback.value = 'Could not create the project.'
  }
}
</script>

<template>
  <form @submit.prevent='submitProject'>
    <label for='project-name'>Project name</label>
    <input id='project-name' v-model='name' required minlength='3'>
    <button type='submit'>Create project</button>
    <p aria-live='polite'>{{ feedback }}</p>
  </form>
</template>
```

Response inference improves development, but it does not protect the endpoint from a manipulated request, a JavaScript client without TypeScript, or another HTTP consumer. `readValidatedBody` validates the body at runtime, and `CreateProjectBody` types the validated value inside the server. This example does not annotate the handler’s request contract: the validator alone does not export a static body, query, or header type to the consumer.

Also review call sites using `params` as an alias for `query`: rebuilt route types expect `query`. The forward-looking Nuxt 5 guide presents typed fetch as the default, but that does not establish that Nuxt 5 is already stable.

## SSR, Payload, and Hydration

Typed fetch describes the request contract; it does not change the SSR lifecycle by itself. For a page's initial data, the flow remains:

`handler → useFetch/useAsyncData → payload → hydration`

`useFetch` and `useAsyncData` can transfer the result through the payload, preventing the same read from running again during hydration. A `$fetch` call executed directly in universal `setup` can run on the server and again in the browser.

A portable GET endpoint can feed that read:

```ts [server/api/projects.get.ts] {1,4}
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => {
  return [{ id: 'project-preview', name: 'Migration audit' }]
})
```

```vue [pages/projects/index.vue] {2}
<script setup lang='ts'>
const { data: projects, error, status } = await useFetch('/api/projects')
</script>

<template>
  <p v-if='status === "pending"'>Loading projects...</p>
  <p v-else-if='error'>Could not load projects.</p>
  <ul v-else>
    <li v-for='project in projects ?? []' :key='project.id'>
      {{ project.name }}
    </li>
  </ul>
</template>
```

This version declares no separate `Project` interface and supplies no generic: the response comes from the endpoint’s generated types. In the Nuxt 4.6.3 lab, changing `name` to `label` in the GET handler and regenerating types produced `TS2339` when the consumer accessed `project.name`. Restoring the contract made `nuxt typecheck` pass again. That test checks that the consumer follows the handler rather than silently accepting a duplicated model.

Reserve direct `$fetch` for later interactions and mutations, or use it inside a `useAsyncData` handler.

Nuxt 4.6 adds `serialize: false` to `useFetch` and `useAsyncData`. The decision changes the flow:

| Configuration | Payload | Hydration |
|---|---|---|
| Default serialization | The SSR result is included | The client can reuse it |
| `serialize: false` | The result is excluded | The client refetches it if the component needs it |

The [`serialize` option documented for Nuxt 4.6.3](https://github.com/nuxt/nuxt/blob/v4.6.3/docs/4.api/2.composables/use-async-data.md) can exclude the result from the payload. This variant keeps the call in setup but renders a stable `ClientOnly` fallback until the browser can display the data:

```vue [pages/projects/unserialized.vue] {2-4,9}
<script setup lang="ts">
const { data: projects, status, error } = await useFetch('/api/projects', {
  key: 'projects-without-payload',
  serialize: false
})
</script>

<template>
  <ClientOnly fallback="Projects load in the browser.">
    <p v-if="status === 'pending'">Loading projects...</p>
    <p v-else-if="error">Could not load projects.</p>
    <ul v-else>
      <li v-for="project in projects ?? []" :key="project.id">{{ project.name }}</li>
    </ul>
  </ClientOnly>
</template>
```

It does not preserve the list in the SSR HTML. The read can execute on the server, its result does not travel in the payload, and the client needs to retrieve it. Here, the browser shows the fallback first and then the list. Default serialization produced one server read and no additional browser request during hydration; this variant produced one server read and one browser request. That is a local result for this example, not a guarantee for other configurations.

Do not treat it as a universal optimization. Reducing payload size can increase refetch cost and produce hydration differences when the server and client render different information.

Also read [useFetch vs useAsyncData vs $fetch in Nuxt 4](/blog/usefetch-vs-useasyncdata-vs-fetch-nuxt-4.en/) and the guide to the [SSR lifecycle](/blog/vue-lifecycle-ssr-serverprefetch.en/).

## Testing Nuxt 5 Defaults in Stages

`future.compatibilityVersion: 5` does not enable one correction. In Nuxt 4.6 it groups typed pages, route-typed fetch, case-sensitive routes, early return from `navigateTo`, serializable page-meta extraction, client payload extraction, and other future defaults.

A more diagnosable sequence is:

| Stage | Change | Condition for advancing |
|---|---|---|
| 1 | Upgrade to 4.6.3 or a newer verified patch | Baseline behavior remains stable |
| 2 | Enable `experimental.routeTypedFetch` | Methods, bodies, queries, and headers are corrected |
| 3 | Add `experimental.strictRouteTypes` | No unknown internal routes remain |
| 4 | Test typed pages and case-sensitive routes | Navigation and links preserve their behavior |
| 5 | Review `navigateTo`, page meta, and payload extraction | SSR and hydration checks pass |
| 6 | Enable `future.compatibilityVersion: 5` | Previous stages have independent baselines |

These checkpoints make the options in the [Nuxt 4.6.3 upgrade guide](https://github.com/nuxt/nuxt/blob/v4.6.3/docs/1.getting-started/18.upgrade.md) concrete:

```ts [config/migration-stages.ts] {4-7,21-22}
import type { NuxtConfig } from 'nuxt/schema'

export const migrationStages = {
  typedFetch: { experimental: { routeTypedFetch: true } },
  strictRoutes: {
    experimental: { routeTypedFetch: true, strictRouteTypes: true }
  },
  futureDefaults: {
    router: { options: { sensitive: true } },
    experimental: {
      routeTypedFetch: true,
      strictRouteTypes: true,
      typedPages: true,
      normalizePageNames: true,
      extractSerializablePageMeta: true,
      navigateToEarlyReturn: true,
      payloadExtraction: 'client'
    }
  },
  compatibility5: {
    future: { compatibilityVersion: 5 },
    experimental: { strictRouteTypes: true }
  }
} satisfies Record<string, NuxtConfig>
```

Import `migrationStages` from `./config/migration-stages` in `nuxt.config.ts`. First pass `migrationStages.typedFetch` to `defineNuxtConfig`; after fixing calls, use `migrationStages.strictRoutes`. Treat `futureDefaults` as an inventory: add and check each option separately, preserving earlier accepted changes, rather than applying the entire object in one iteration. `router.options.sensitive` tests route casing; `typedPages` and `normalizePageNames` test route types and names; the remaining options isolate page meta, early return, and payload extraction. The last option changes payload handling for prerendered pages; it is not equivalent to `serialize: false` on a composable.

Leave `migrationStages.compatibility5` for the final evaluation of the bundle. The example explicitly preserves `strictRouteTypes: true` because `compatibilityVersion: 5` does not enable that option; retain your other decisions when composing the final configuration. `future.compatibilityVersion: 5` does not install Nitro 3. The forward-looking guide also lists Nitro v3, h3 v2, disabled server auto-imports, `#imports/server`, and the Vite Environment API. Use them as a preparation inventory while integration remains under development; do not invent a release date.

## Vite 8 and the Server Builder Are Different Changes

Nuxt adopted Vite 8 in 4.5.0. The audit should find plugins and configuration that depend on esbuild, Rollup, or older CommonJS and resolution behavior. Vite 8 replaces esbuild and Rollup with Rolldown/Oxc; `optimizeDeps.esbuildOptions`, `build.rollupOptions`, and `worker.rollupOptions` are deprecated in favor of their Rolldown equivalents.

`@nuxt/vite-server`, by contrast, is a 4.6 experiment. It can produce an SPA, SSR with a Node entry, a web-standard handler, or static output, but it lacks Nitro storage, caching, tasks, and server plugins.

Keep Nitro as the default builder when you need those capabilities. Test the Vite builder in an isolated lab, with a rollback path and on a secure patch; it is not required for adopting `nuxt/server` or typed fetch. The introduction to [Vue with Vite](/blog/setting-up-vue-with-vite.en/) provides additional context about the bundler's role.

## Vapor in Nuxt 4.6: A Localized Experiment

Nuxt keeps the root on VDOM and lets individual components or pages opt into Vapor through interoperability. These examples pin Vue `3.6.0-rc.6`: the check included in Nuxt 4.6.3 requires `>=3.6.0-rc.6`. Preparation disabled Vapor with `rc.3`; with `rc.6`, the compiler recognized the opt-in. Align the Vue runtime, compiler, and renderer versions. This test uses a prerelease and does not establish that Vue 3.6 is stable.

After enabling `vue.vapor` in a separate experiment, limit the first test to a small unit:

```vue [components/VaporCounter.vue] {1}
<script setup vapor lang='ts'>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value += 1
}
</script>

<template>
  <button type='button' @click='increment'>Increment</button>
  <p aria-live='polite'>Count: {{ count }}</p>
</template>
```

Compare it with a functionally identical VDOM variant. Verify SSR, hydration, navigation, layouts, slots, UI libraries, and debugging tools before widening the scope. Do not attribute general improvements without reproducible measurements. The [Vue 3.6 RC and Vapor Mode guide](/blog/vue-3-6-rc-vapor-mode-status-limits-evaluation-2026.en/) develops that evaluation.

## Phased Migration Checklist

### 1. Establish the baseline

- Inventory imports from `h3`, `nitropack`, and `#imports`.
- Search for `event.node`, `statusCode`, `statusMessage`, `params:`, and custom Vite or Rollup configuration.
- Record routes, SSR tests, critical HTML, payload, and hydration.
- Upgrade to the latest confirmed 4.6.x patch and verify the application before changing contracts.

### 2. Adopt portable contracts

- Migrate only compatible handlers and keep one helper family in each file.
- Move to `status` and `statusText` where required by the new `createError`.
- Keep handlers depending on storage, caching, tasks, plugins, or non-portable helpers on Nitro.
- Preserve server-side authorization and validation.

### 3. Enable typed fetch

- Enable `routeTypedFetch` first.
- Correct methods, bodies, queries, and headers; replace `params` with `query`.
- Add `strictRouteTypes` after correcting known routes.
- Keep runtime validation at every untrusted input boundary.

### 4. Review SSR

- Separate initial reads from interaction-driven mutations.
- Use `useFetch` or `useAsyncData` when the result must travel in the payload.
- Audit each `serialize: false` use for refetch cost and hydration risk.

### 5. Evaluate experiments

- Test anticipated Nuxt 5 behaviors individually.
- Enable `compatibilityVersion: 5` only after establishing isolated baselines.
- Keep `@nuxt/vite-server` and Vapor in separate experiments.
- Reconfirm the status of Nuxt 5 and Vue 3.6 before publishing any recommendation.

## Final Criterion

Nuxt 4.6 lets you prepare the architecture before Nuxt 5. Upgrade to the secure patch first; then adopt `nuxt/server` and typed fetch; review the SSR flow; and leave future defaults, the Vite builder, and Vapor for independent tests.

A solid migration is not the one that enables the most flags. It is the one that reduces coupling, preserves runtime validation, and lets you explain which change caused each result.
