<script setup lang="ts">
import { TvBreadcrumbs, TvCard, TvHero } from '@todovue/tv-ui'
import type { BlogPost, CardConfig } from '@/types/composables'
import type { BreadcrumbItem, TagLike } from '@/types/views'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const blogStore = useBlogStore()
const { setPageSeo } = useSeo()
const { runNavigation } = useGlobalLoader()

const getRouteSlug = (): string => {
  const slug = route.params.slug
  if (Array.isArray(slug)) return slug[0] ?? ''
  return typeof slug === 'string' ? slug : ''
}

const normalizeSeriesKey = (value: unknown): string => typeof value === 'string' ? value.trim().toLowerCase() : ''
const getDateValue = (value: BlogPost['date']): number => new Date(value ?? 0).getTime()

await useAsyncData('series-page-posts', async () => {
  return await blogStore.fetchBlogPosts()
})

const seriesSlug = computed<string>(() => normalizeSeriesKey(getRouteSlug()))

const seriesPosts = computed<BlogPost[]>(() => {
  if (!seriesSlug.value) return []

  return [...blogStore.blogPosts.value]
    .filter((post) => normalizeSeriesKey(post.series) === seriesSlug.value)
    .sort((first, second) => {
      const firstOrder = typeof first.seriesOrder === 'number' ? first.seriesOrder : Number.MAX_SAFE_INTEGER
      const secondOrder = typeof second.seriesOrder === 'number' ? second.seriesOrder : Number.MAX_SAFE_INTEGER
      if (firstOrder !== secondOrder) return firstOrder - secondOrder
      return getDateValue(first.date) - getDateValue(second.date)
    })
})

if (!seriesPosts.value.length) {
  throw createError({ statusCode: 404, statusMessage: 'Series not found' })
}

const seriesTitle = computed<string>(() => {
  const first = seriesPosts.value[0]
  if (typeof first?.seriesTitle === 'string' && first.seriesTitle.trim()) return first.seriesTitle
  return t('blogs.series.defaultTitle')
})

const seriesDescription = computed<string>(() => {
  const first = seriesPosts.value[0]
  if (typeof first?.seriesDescription === 'string' && first.seriesDescription.trim()) return first.seriesDescription
  return t('blogs.series.defaultDescription')
})

const seriesCards = computed<CardConfig[]>(() => seriesPosts.value.map((post) => blogStore.postToCardConfig(post)))

const configHero = computed(() => ({
  title: seriesTitle.value,
  description: seriesDescription.value
}))

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: seriesTitle.value, href: route.path }
])

setPageSeo({
  title: `${seriesTitle.value} | TODOvue`,
  description: seriesDescription.value
})

const {
  handleCardClick,
  handleCardKeydown,
  handleCardButtonClick,
  handleCardLabelClick
} = useCardNavigation<TagLike>({
  navigateToPath: (path: string) => router.push(path),
  onLabelClick: (label: TagLike) => {
    const labelName = label?.name || label?.tag
    if (!labelName) return
    void runNavigation(() => router.push({ path: '/blog/', query: { label: labelName, page: '1' } }))
  }
})
</script>

<template>
  <main>
    <TvHero :config-hero="configHero" is-entry />
    <section class="container-main mb-20">
      <TvBreadcrumbs :items="breadcrumbs" />

      <div class="mt-8 grid grid-cols-1 gap-[15px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] lg:gap-5 justify-items-center">
        <div
          v-for="(card, index) in seriesCards"
          :key="card.id"
          class="blog-card-shell w-full"
          role="link"
          tabindex="0"
          @click="handleCardClick($event, card.path)"
          @keydown="handleCardKeydown($event, card.path)"
        >
          <p class="text-sm font-semibold text-primary">
            {{ t('blogs.series.chapter', { number: index + 1 }) }}
          </p>
          <TvCard
            :config-card="card"
            @click-button="handleCardButtonClick(card.path)"
            @click-label="handleCardLabelClick"
          />
        </div>
      </div>
    </section>
  </main>
</template>
