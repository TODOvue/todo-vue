<script setup lang="ts">
import {
  TvButton,
  TvCard,
  TvHero,
  TvLabel,
} from '@todovue/tv-ui'
import type { CardConfig, CardLabel } from '@/types/composables'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const { runNavigation } = useGlobalLoader()

const configHero = computed(() => ({
  alt: 'TODOvue Logo',
  button: t('home.hero.button'),
  description: t('home.hero.description'),
  image: 'https://res.cloudinary.com/dcdfhi8qz/image/upload/v1763663056/uqqtkgp1lg3xdplutpga.png',
  title: t('home.hero.title'),
  buttonSecondary: t('home.hero.secondary')
}))

const navigateTo = (path: string, isExternal = false): void => {
  if (isExternal) {
    window.open(path, '_self')
    return
  }
  void runNavigation(() => router.push(path))
}

const openInNewTab = (path: string): void => {
  window.open(path, '_blank', 'noopener,noreferrer')
}

await useAsyncData('index-home-blogs', async () => {
  return await blogStore.fetchBlogPosts()
})

const lastBlogPosts = blogStore.getLastMostViewedPost

const latestPosts = computed<CardConfig[]>(() => {
  const allCards = blogStore.getCardsConfig.value
  return allCards.slice(1, 5)
})

const homeSeries = useSeriesAggregation(blogStore.blogPosts, 4)

const seriesCards = computed<CardConfig[]>(() => homeSeries.value.map((series, index) => ({
  title: series.title,
  description: series.description,
  id: `series-${series.slug}-${index + 1}`,
  primaryButtonText: t('home.series.readSeries'),
  alt: series.coverAlt,
  image: series.cover,
  labels: [{
    id: index + 1,
    name: t('home.series.parts', { count: series.chapters }),
    color: '#1D5BA1'
  }],
  path: series.path,
  limitLabels: 1
})))

const popularCategories = computed<CardLabel[]>(() => {
  const allLabels = blogStore.getAllLabels.value
  return allLabels.slice(0, 6)
})

const handleCategoryClick = (label: CardLabel): void => {
  if (label && label.name) {
    void runNavigation(() => router.push({ path: '/blog/', query: { ...route.query, label: label.name, page: '1' } }))
  }
}

const handleSeriesNavigation = (path: string): void => {
  void runNavigation(() => router.push(path))
}

const handleSeriesCardClick = (event: MouseEvent, path: string): void => {
  const target = event.target
  if (target instanceof HTMLElement && target.closest('a, button, input, select, textarea, [role="button"]')) {
    return
  }
  handleSeriesNavigation(path)
}

const handleSeriesCardKeydown = (event: KeyboardEvent, path: string): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  handleSeriesNavigation(path)
}

const {
  handleCardClick,
  handleCardKeydown,
  handleCardButtonClick,
  handleCardLabelClick
} = useCardNavigation<CardLabel>({
  navigateToPath: (path: string) => router.push(path),
  onLabelClick: handleCategoryClick
})

const img = 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183779/todovue_bg_veizqy.png'
const githubIssueUrl = computed(() => {
  const title = encodeURIComponent(t('home.community.issueTitle'))
  const template = encodeURIComponent('correction_suggestion.md')
  return `https://github.com/TODOvue/todo-vue/issues/new?template=${template}&title=${title}`
})

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
      @click-button="navigateTo('/blog/')"
      @click-secondary-button="navigateTo('https://ui.todovue.blog', true)"
    />

    <div class="container-main">
      <div class="mb-8 mt-12">
        <h2 class="title-main">
          {{ t('home.sections.lastPost') }}
        </h2>
      </div>
      <div
        v-if="lastBlogPosts"
        class="blog-card-shell"
        role="link"
        tabindex="0"
        @click="handleCardClick($event, lastBlogPosts.path)"
        @keydown="handleCardKeydown($event, lastBlogPosts.path)"
      >
        <TvCard
          :config-card="lastBlogPosts"
          is-horizontal
          @click-button="handleCardButtonClick(lastBlogPosts.path)"
          @click-label="handleCardLabelClick"
        />
      </div>
    </div>

    <div v-if="latestPosts.length > 0" class="container-main">
      <div class="mb-8 mt-12">
        <h2 class="title-main">
          {{ t('home.sections.lastestPosts') }}
        </h2>
      </div>
      <div class="grid grid-cols-1 justify-items-center gap-5 md:grid-cols-2 md:justify-items-stretch xl:grid-cols-4">
        <div
          v-for="post in latestPosts"
          :key="post.id"
          class="blog-card-shell mx-auto w-full md:mx-0"
          role="link"
          tabindex="0"
          @click="handleCardClick($event, post.path)"
          @keydown="handleCardKeydown($event, post.path)"
        >
          <TvCard
            :config-card="post"
            @click-button="handleCardButtonClick(post.path)"
            @click-label="handleCardLabelClick"
          />
        </div>
      </div>
      <div class="mt-8 flex justify-center">
        <TvButton
          rounded
          large
          :aria-label="t('home.sections.viewAllPosts')"
          @click="navigateTo('/blog/')"
        >
          {{ t('home.sections.viewAllPosts') }}
        </TvButton>
      </div>
    </div>

    <div v-if="seriesCards.length > 0" class="container-main">
      <div class="mb-8 mt-12">
        <h2 class="title-main">
          {{ t('home.sections.series') }}
        </h2>
      </div>
      <div class="grid grid-cols-1 justify-items-center gap-5 md:grid-cols-2 md:justify-items-stretch xl:grid-cols-4">
        <div
          v-for="seriesCard in seriesCards"
          :key="seriesCard.id"
          class="blog-card-shell mx-auto w-full md:mx-0"
          role="link"
          tabindex="0"
          @click="handleSeriesCardClick($event, seriesCard.path)"
          @keydown="handleSeriesCardKeydown($event, seriesCard.path)"
        >
          <TvCard
            :config-card="seriesCard"
            @click-button="handleSeriesNavigation(seriesCard.path)"
          />
        </div>
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

    <div class="container-main">
      <div class="mt-14 rounded-2xl border border-primary/40 bg-light-card-bg p-6 text-light-text shadow-sm md:p-8 dark:bg-dark-card-bg dark:text-dark-text">
        <h2 class="text-2xl font-bold leading-tight md:text-3xl">
          {{ t('home.community.title') }}
        </h2>
        <p class="mt-3 max-w-3xl text-base leading-relaxed opacity-90">
          {{ t('home.community.description') }}
        </p>
        <div class="mt-6">
          <TvButton
            rounded
            :aria-label="t('home.community.button')"
            @click="openInNewTab(githubIssueUrl)"
          >
            {{ t('home.community.button') }}
          </TvButton>
        </div>
      </div>
    </div>
  </section>
</template>

