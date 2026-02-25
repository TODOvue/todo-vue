<script setup lang="ts">
import { TvBreadcrumbs, TvCard, TvHero } from '@todovue/tv-ui'
import type { BlogPost, CardConfig } from '@/types/composables'
import type { BreadcrumbItem } from '@/types/views'

const router = useRouter()
const { t } = useI18n()
const blogStore = useBlogStore()
const { setPageSeo } = useSeo()
const { runNavigation } = useGlobalLoader()

type SeriesItem = {
  slug: string
  title: string
  description: string
  path: string
  cover: string
  coverAlt: string
  chapters: number
  latestDate: number
  firstOrder: number
}

const normalizeSeriesKey = (value: unknown): string => typeof value === 'string' ? value.trim().toLowerCase() : ''
const getDateValue = (value: BlogPost['date']): number => new Date(value ?? 0).getTime()

await useAsyncData('series-index-posts', async () => {
  return await blogStore.fetchBlogPosts()
})

const seriesList = computed<SeriesItem[]>(() => {
  const seriesMap = new Map<string, SeriesItem>()

  blogStore.blogPosts.value.forEach((post) => {
    const seriesSlug = normalizeSeriesKey(post.series)
    if (!seriesSlug) return

    const existing = seriesMap.get(seriesSlug)
    const postDate = getDateValue(post.date)
    const postTitle = typeof post.seriesTitle === 'string' && post.seriesTitle.trim()
      ? post.seriesTitle
      : t('blogs.series.defaultTitle')
    const postDescription = typeof post.seriesDescription === 'string' && post.seriesDescription.trim()
      ? post.seriesDescription
      : t('blogs.series.defaultDescription')
    const postPath = `/series/${seriesSlug}/`

    if (!existing) {
      const initialOrder = typeof post.seriesOrder === 'number' ? post.seriesOrder : Number.MAX_SAFE_INTEGER
      seriesMap.set(seriesSlug, {
        slug: seriesSlug,
        title: postTitle,
        description: postDescription,
        path: postPath,
        cover: post.meta?.cover ?? '',
        coverAlt: post.meta?.coverAlt ?? postTitle,
        chapters: 1,
        latestDate: postDate,
        firstOrder: initialOrder
      })
      return
    }

    existing.chapters += 1
    if (postDate > existing.latestDate) {
      existing.latestDate = postDate
    }

    const currentOrder = typeof post.seriesOrder === 'number' ? post.seriesOrder : Number.MAX_SAFE_INTEGER
    if (currentOrder < existing.firstOrder && post.meta?.cover) {
      existing.firstOrder = currentOrder
      existing.cover = post.meta.cover
      existing.coverAlt = post.meta?.coverAlt ?? postTitle
    }
  })

  return Array.from(seriesMap.values()).sort((first, second) => second.latestDate - first.latestDate)
})

const seriesCards = computed<CardConfig[]>(() => seriesList.value.map((series, index) => ({
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

const configHero = computed(() => ({
  title: t('home.sections.series'),
  description: t('blogs.series.defaultDescription')
}))

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: t('menu.home'), href: '/' },
  { label: t('home.sections.series'), href: '/series/' }
])

setPageSeo({
  title: `${t('home.sections.series')} | TODOvue`,
  description: t('blogs.series.defaultDescription')
})

const navigateToSeries = (path: string): void => {
  void runNavigation(() => router.push(path))
}

const handleSeriesCardClick = (event: MouseEvent, path: string): void => {
  const target = event.target
  if (target instanceof HTMLElement && target.closest('a, button, input, select, textarea, [role="button"]')) {
    return
  }
  navigateToSeries(path)
}

const handleSeriesCardKeydown = (event: KeyboardEvent, path: string): void => {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  navigateToSeries(path)
}
</script>

<template>
  <main>
    <TvHero :config-hero="configHero" is-entry />
    <section class="container-main mb-20">
      <TvBreadcrumbs :items="breadcrumbs" />

      <p
        v-if="seriesCards.length === 0"
        class="mt-8 text-light-text dark:text-dark-text"
      >
        {{ t('blogs.empty') }}
      </p>

      <div
        v-else
        class="mt-8 grid grid-cols-1 gap-[15px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] lg:gap-5 justify-items-center"
      >
        <div
          v-for="seriesCard in seriesCards"
          :key="seriesCard.id"
          class="blog-card-shell w-full"
          role="link"
          tabindex="0"
          @click="handleSeriesCardClick($event, seriesCard.path)"
          @keydown="handleSeriesCardKeydown($event, seriesCard.path)"
        >
          <TvCard
            :config-card="seriesCard"
            @click-button="navigateToSeries(seriesCard.path)"
          />
        </div>
      </div>
    </section>
  </main>
</template>
