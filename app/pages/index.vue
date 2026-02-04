<script setup>
import {
  TvButton,
  TvCard,
  TvHero,
  TvLabel,
} from '@todovue/tv-ui'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()

const configHero = computed(() => ({
  alt: 'TODOvue Logo',
  button: t('home.hero.button'),
  description: t('home.hero.description'),
  image: 'https://res.cloudinary.com/dcdfhi8qz/image/upload/v1763663056/uqqtkgp1lg3xdplutpga.png',
  title: t('home.hero.title'),
  buttonSecondary: t('home.hero.secondary')
}))

const navigateTo = (path, isExternal = false) => {
  if (isExternal) {
    window.open(path, '_self')
    return
  }
  router.push(path)
}

await useAsyncData('index-home-blogs', async () => {
  return await blogStore.fetchBlogPosts()
})

const lastBlogPosts = blogStore.getLastMostViewedPost

const latestPosts = computed(() => {
  const allCards = blogStore.getCardsConfig.value
  return allCards.slice(1, 5)
})

const popularCategories = computed(() => {
  const allLabels = blogStore.getAllLabels.value
  return allLabels.slice(0, 6)
})

const handleCategoryClick = (label) => {
  if (label && label.name) {
    router.push({  path: '/blog', query: { ...route.query, label: label.name, page: '1' } })
  }
}

const img = 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183779/todovue_bg_veizqy.png'

const { setPageSeo } = useSeo()

setPageSeo({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  image: img
})
</script>

<template>
  <section>
    <TvHero
      :config-hero="configHero"
      @click-button="navigateTo('/blog')"
      @click-secondary-button="navigateTo('https://ui.todovue.blog', true)"
    />

    <div class="container-main">
      <div class="mb-8 mt-12">
        <h2 class="title-main">
          {{ t('home.sections.lastPost') }}
        </h2>
      </div>
      <TvCard
        v-if="lastBlogPosts"
        :config-card="lastBlogPosts"
        is-horizontal
        @click-button="navigateTo(lastBlogPosts.path)"
        @click-label="handleCategoryClick"
      />
    </div>

    <div v-if="latestPosts.length > 0" class="container-main">
      <div class="mb-8 mt-12">
        <h2 class="title-main">
          {{ t('home.sections.lastestPosts') }}
        </h2>
      </div>
      <div class="flex flex-wrap gap-2 justify-center sm:justify-center md:justify-around">
        <TvCard
          v-for="post in latestPosts"
          :key="post.id"
          :config-card="post"
          @click-button="navigateTo(post.path)"
          @click-label="handleCategoryClick"
        />
      </div>
      <div class="mt-8 flex justify-center">
        <TvButton
          rounded
          large
          :aria-label="t('home.sections.viewAllPosts')"
          @click="navigateTo('/blog')"
        >
          {{ t('home.sections.viewAllPosts') }}
        </TvButton>
      </div>
    </div>

    <div class="container-main">
      <div class="mb-8 mt-12">
        <h2 class="title-main">
          {{ t('home.sections.popularCategories') }}
        </h2>
      </div>
      <div v-if="popularCategories.length > 0">
        <div class="flex flex-wrap gap-2 justify-center sm:justify-center md:justify-start">
          <TvLabel
            v-for="label in popularCategories"
            :key="label.id"
            :text-label="label.name"
            :color="label.color"
            :limit="10"
            @click="handleCategoryClick(label)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

