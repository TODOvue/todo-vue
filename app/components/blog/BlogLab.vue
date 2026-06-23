<script setup lang="ts">
import type { BlogLabConfig } from '@/types/composables'

defineProps<{
  lab: BlogLabConfig
}>()

const { t } = useI18n()
</script>

<template>
  <section
    class="mt-8 rounded-xl border border-primary/30 bg-light-card-bg px-4 py-5 text-light-text shadow-sm dark:bg-dark-card-bg dark:text-dark-text"
    :aria-label="t('blogs.lab.label')"
  >
    <p class="text-sm font-semibold text-primary">
      {{ t('blogs.lab.label') }}
    </p>
    <h2 class="mt-1 text-2xl font-bold leading-tight">
      {{ lab.title }}
    </h2>

    <div class="mt-4">
      <p class="text-sm font-semibold text-primary">
        {{ t('blogs.lab.goal') }}
      </p>
      <p class="mt-1 leading-relaxed opacity-90">
        {{ lab.goal }}
      </p>
    </div>

    <div v-if="lab.tasks.length" class="mt-5">
      <p class="text-sm font-semibold text-primary">
        {{ t('blogs.lab.tasks') }}
      </p>
      <ol class="mt-2 list-decimal space-y-2 pl-5 leading-relaxed">
        <li v-for="task in lab.tasks" :key="task">
          {{ task }}
        </li>
      </ol>
    </div>

    <div v-if="lab.starterCode" class="mt-5">
      <p class="text-sm font-semibold text-primary">
        {{ t('blogs.lab.starterCode') }}
      </p>
      <pre class="mt-2 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"><code>{{ lab.starterCode }}</code></pre>
    </div>

    <details
      v-if="lab.solutionHint"
      class="mt-5 rounded-lg border border-primary/20 px-3 py-2"
    >
      <summary class="cursor-pointer text-sm font-semibold text-primary">
        {{ t('blogs.lab.solutionHint') }}
      </summary>
      <p class="mt-2 leading-relaxed opacity-90">
        {{ lab.solutionHint }}
      </p>
    </details>
  </section>
</template>
