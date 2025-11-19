<script setup>
import { TvHero } from '@todovue/tv-hero'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'

const configHero = {
  description: "Explore our collection of reusable Vue components built with modern best practices.",
  title: "TODOvue components",
};
</script>

<template>
  <main>
    <TvHero
      :config-hero="configHero"
      is-entry
    />
    <div class="main-container">
      <TvBreadcrumbs
        auto-generate
      />
    </div>
  </main>
</template>

<style scoped>

</style>
