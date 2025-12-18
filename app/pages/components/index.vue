<script setup>
import { TvHero } from '@todovue/tv-hero'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'
const { t } = useI18n()

const configHero = computed(() => ({
  description: t('components.hero.description'),
  title: t('components.hero.title'),
}))

useSeoMeta({
  title: () => t('seo.components.title'),
  description: () => t('seo.components.description'),
  ogTitle: () => t('seo.components.title'),
  ogDescription: () => t('seo.components.description'),
  twitterTitle: () => t('seo.components.title'),
  twitterDescription: () => t('common.componentsDescription')
});
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
