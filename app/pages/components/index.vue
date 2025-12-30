<script setup>
import { TvHero } from '@todovue/tv-hero'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'
const { t } = useI18n()

const configHero = computed(() => ({
  description: t('components.hero.description'),
  title: t('components.hero.title'),
}))

const { setPageSeo } = useSeo()

setPageSeo({
  title: t('seo.components.title'),
  description: t('seo.components.description')
})
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
