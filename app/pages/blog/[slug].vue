<script setup lang="ts">
import {
  TvArticle,
  TvBreadcrumbs,
  TvCard,
  TvHero,
  TvPagination,
  TvSidebar,
  TvToc,
} from '@todovue/tv-ui'

import { useI18n } from 'vue-i18n'
import type { BlogPost, CardConfig, PopularConfig } from '@/types/composables'
import type { BreadcrumbItem, SidebarBlogLink, TagLike, TocData } from '@/types/views'
import { getDocumentSlug } from '@/utils/contentLocale'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()
const { registerVisit } = useVisit()
const { runNavigation } = useGlobalLoader()

const getRouteSlug = (): string | undefined => {
  const slug = route.params.slug
  if (Array.isArray(slug)) return slug[0]
  return slug
}
const getSlugLocale = (value: string): 'es' | 'en' | null => {
  const match = value.match(/\.([a-z]{2})$/i)
  const localeCode = match?.[1]?.toLowerCase()
  if (localeCode === 'es' || localeCode === 'en') return localeCode
  return null
}
const getDateValue = (value: BlogPost['date']): number => new Date(value ?? 0).getTime()
const normalizeSeriesKey = (value: unknown): string => typeof value === 'string' ? value.trim().toLowerCase() : ''
const resolvePostPath = (value: BlogPost): string =>
  String((value.path ?? value._path ?? '/') as string)
const toLocalizedPostPath = (value: BlogPost): string => localePath(resolvePostPath(value))
const isSamePost = (first: BlogPost, second: BlogPost): boolean => {
  const firstPath = resolvePostPath(first)
  const secondPath = resolvePostPath(second)
  if (firstPath && secondPath && firstPath === secondPath) return true
  return getDocumentSlug(first) === getDocumentSlug(second)
}

if (!route.path.endsWith('/')) {
  const fullPath = `${route.path}/${route.fullPath.includes('?') ? route.fullPath.slice(route.fullPath.indexOf('?')) : ''}`
  router.replace(fullPath)
}

const dataKey = computed(() => `blog-${route.params.slug}-${locale.value}`)

const { data: post } = await useAsyncData<BlogPost | null>(
  dataKey,
  async (): Promise<BlogPost | null> => {
    const slug = getRouteSlug()
    if (!slug) {
      console.error('Slug not found:', slug)
      return null
    }

    try {
      const direct = await blogStore.getBlogBySlug(slug)
      if (direct) return direct

      const routeLocale = getSlugLocale(slug)
      if (routeLocale) {
        const byRouteLocale = await blogStore.getBlogBySlug(slug, {
          preferredLocale: routeLocale,
          allowLocaleFallback: true
        })
        if (byRouteLocale) return byRouteLocale
      }
      return null
    } catch (error) {
      console.error('Error searching for post:', error)
      return null
    }
  },
  {
    watch: [() => locale.value]
  }
)

await useAsyncData('blog-slug-sidebar-posts', async () => {
  return await blogStore.fetchBlogPosts()
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const resolvedPost = computed<BlogPost>(() => post.value ?? {})

const articleData = computed(() => ({
  date: resolvedPost.value.date,
  readingTime: resolvedPost.value.meta?.readingTime,
  tags: resolvedPost.value.tags,
  coverCaption: resolvedPost.value.meta?.coverCaption,
  body: resolvedPost.value.body
}))

const currentSeriesKey = computed<string>(() => normalizeSeriesKey(resolvedPost.value.series))

const relatedPosts = computed<CardConfig[]>(() => {
  if (currentSeriesKey.value) return []
  if (!resolvedPost.value.tags) return []
  return blogStore.getRelatedPosts(resolvedPost.value, 9)
})

const seriesPosts = computed<BlogPost[]>(() => {
  const seriesKey = currentSeriesKey.value
  if (!seriesKey) return []

  return [...blogStore.blogPosts.value]
    .filter((item) => normalizeSeriesKey(item.series) === seriesKey)
    .sort((first, second) => {
      const firstOrder = typeof first.seriesOrder === 'number' ? first.seriesOrder : Number.MAX_SAFE_INTEGER
      const secondOrder = typeof second.seriesOrder === 'number' ? second.seriesOrder : Number.MAX_SAFE_INTEGER
      if (firstOrder !== secondOrder) return firstOrder - secondOrder
      return getDateValue(first.date) - getDateValue(second.date)
    })
})

const currentSeriesIndex = computed<number>(() =>
  seriesPosts.value.findIndex((item) => isSamePost(item, resolvedPost.value))
)

const previousSeriesPost = computed<BlogPost | null>(() => {
  const index = currentSeriesIndex.value
  if (index <= 0) return null
  return seriesPosts.value[index - 1] ?? null
})

const nextSeriesPost = computed<BlogPost | null>(() => {
  const index = currentSeriesIndex.value
  if (index < 0 || index >= seriesPosts.value.length - 1) return null
  return seriesPosts.value[index + 1] ?? null
})

const seriesContext = computed(() => {
  const posts = seriesPosts.value
  const currentIndex = currentSeriesIndex.value
  if (!posts.length || currentIndex < 0) return null

  const currentPost = posts[currentIndex]
  const seriesKey = normalizeSeriesKey(currentPost.series)
  if (!seriesKey) return null

  return {
    key: seriesKey,
    title: typeof currentPost.seriesTitle === 'string' && currentPost.seriesTitle.trim()
      ? currentPost.seriesTitle
      : t('blogs.series.defaultTitle'),
    description: typeof currentPost.seriesDescription === 'string' && currentPost.seriesDescription.trim()
      ? currentPost.seriesDescription
      : t('blogs.series.defaultDescription'),
    current: currentIndex + 1,
    total: posts.length,
    path: `/series/${seriesKey}/`
  }
})

const chronologicalPosts = computed<BlogPost[]>(() =>
  [...blogStore.blogPosts.value].sort((first, second) => getDateValue(second.date) - getDateValue(first.date))
)

const chronologicalIndex = computed<number>(() =>
  chronologicalPosts.value.findIndex((item) => isSamePost(item, resolvedPost.value))
)

const newerPost = computed<BlogPost | null>(() => {
  const index = chronologicalIndex.value
  if (index <= 0) return null
  return chronologicalPosts.value[index - 1] ?? null
})

const olderPost = computed<BlogPost | null>(() => {
  const index = chronologicalIndex.value
  if (index < 0 || index >= chronologicalPosts.value.length - 1) return null
  return chronologicalPosts.value[index + 1] ?? null
})

const seriesRelatedPosts = computed<CardConfig[]>(() =>
  seriesPosts.value
    .filter((item) => !isSamePost(item, resolvedPost.value))
    .map((item) => blogStore.postToCardConfig(item))
)
const seriesPageSize = 3
const currentSeriesPage = ref(1)
const paginatedSeriesRelatedPosts = computed<CardConfig[]>(() => {
  const start = (currentSeriesPage.value - 1) * seriesPageSize
  const end = start + seriesPageSize
  return seriesRelatedPosts.value.slice(start, end)
})

watch(seriesRelatedPosts, (items) => {
  const totalPages = Math.max(1, Math.ceil(items.length / seriesPageSize))
  if (currentSeriesPage.value > totalPages) {
    currentSeriesPage.value = totalPages
  }
}, { immediate: true })

const relatedPageSize = 3
const currentRelatedPage = ref(1)
const paginatedRelatedPosts = computed<CardConfig[]>(() => {
  const start = (currentRelatedPage.value - 1) * relatedPageSize
  const end = start + relatedPageSize
  return relatedPosts.value.slice(start, end)
})

watch(relatedPosts, (items) => {
  const totalPages = Math.max(1, Math.ceil(items.length / relatedPageSize))
  if (currentRelatedPage.value > totalPages) {
    currentRelatedPage.value = totalPages
  }
}, { immediate: true })

const showSeriesSection = computed<boolean>(() =>
  Boolean(currentSeriesKey.value) && seriesRelatedPosts.value.length > 0
)

const showRelatedSection = computed<boolean>(() =>
  !currentSeriesKey.value && relatedPosts.value.length > 0
)

const renderLatestPosts = blogStore.getLatestPosts as typeof blogStore.getLatestPosts & { value: PopularConfig }

const tocData = computed<TocData | null>(() => {
  const body = resolvedPost.value.body as { toc?: TocData; value?: unknown[] } | undefined
  const toc = body?.toc ?? null
  if (!toc) return null
  const enhancedToc: TocData = { ...toc }
  if (!enhancedToc.title && resolvedPost.value.title) {
    enhancedToc.title = t('blogs.toc.title')
  }

  const hasH1 = Boolean(enhancedToc.links && enhancedToc.links.length > 0 && enhancedToc.links[0]?.depth === 1)

  if (!hasH1 && resolvedPost.value.title && Array.isArray(body?.value)) {
    const h1Node = body.value.find((node) => Array.isArray(node) && node[0] === 'h1') as [string, { id?: string }] | undefined
    const h1Id = h1Node?.[1]?.id

    if (h1Id) {
      const h1Link = {
        id: h1Id,
        depth: 1,
        text: resolvedPost.value.title
      }
      enhancedToc.links = [h1Link, ...(enhancedToc.links || [])]
    }
  }

  return enhancedToc
})

const hasToc = computed(() => {
  const toc = tocData.value
  return Boolean(toc && Array.isArray(toc.links) && toc.links.length > 0)
})

const configHero = {
  description: resolvedPost.value.description,
  title: resolvedPost.value.title,
  image: resolvedPost.value.meta?.cover,
  alt: resolvedPost.value.meta?.coverAlt
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog/' },
  { label: resolvedPost.value.title ?? '', href: route.path }
])

const ogImage = computed(() => {
  const cover = resolvedPost.value.meta?.cover
  if (!cover) return '/default-og-image.png'
  if (cover.startsWith('http')) return cover
  return cover
})

const handleLabelClick = (label: TagLike): void => {
  if (label) {
    const labelValue = label.name || label.tag
    if (labelValue) {
      void runNavigation(() => router.push({ name: 'blog', query: { label: labelValue, page: '1' } }))
    }
  }
}

const handleSidebarBlogClick = (blog: SidebarBlogLink): void => {
  void runNavigation(() => router.push(blog.link))
}

const {
  handleCardClick,
  handleCardKeydown,
  handleCardButtonClick,
  handleCardLabelClick
} = useCardNavigation<TagLike>({
  navigateToPath: (path: string) => router.push(path),
  onLabelClick: handleLabelClick
})

const { setBlogPostSeo } = useSeo()
const normalizeSeoDate = (value: string | number | Date | undefined): string | Date | undefined => {
  if (typeof value === 'number') return String(value)
  return value
}

setBlogPostSeo({
  title: resolvedPost.value.title ?? '',
  description: resolvedPost.value.description ?? '',
  image: ogImage.value,
  author: 'TODOvue',
  publishedAt: normalizeSeoDate(resolvedPost.value.date),
  updatedAt: normalizeSeoDate(resolvedPost.value.updatedAt || resolvedPost.value.date),
  tags: resolvedPost.value.tags?.map((tag) => typeof tag === 'string' ? tag : tag.tag).filter((tag): tag is string => Boolean(tag)) || [],
  url: route.path,
  locale: locale.value,
  breadcrumbs: breadcrumbs.value
})

const currentSlug = getRouteSlug()
const baseSlug = currentSlug ? currentSlug.replace(/\.(es|en)$/i, '') : ''
const editLocale = computed<'es' | 'en'>(() => {
  const routeLocale = currentSlug ? getSlugLocale(currentSlug) : null
  if (routeLocale) return routeLocale
  return locale.value === 'en' ? 'en' : 'es'
})
const editOnGithubUrl = computed(() => {
  if (!baseSlug) return ''
  const filePath = `content/blog/${baseSlug}.${editLocale.value}.md`
  return `https://github.com/TODOvue/todo-vue/edit/main/${filePath}`
})

const seriesListContainer = ref<HTMLElement | null>(null)
const relatedListContainer = ref<HTMLElement | null>(null)
const scrollOffsetPx = 96
const paginationScrollDurationMs = 520
let paginationScrollFrame: number | null = null

const easeOutCubic = (value: number): number => 1 - ((1 - value) ** 3)

const smoothScrollTo = (targetY: number): void => {
  if (paginationScrollFrame !== null) {
    window.cancelAnimationFrame(paginationScrollFrame)
    paginationScrollFrame = null
  }

  const startY = window.scrollY
  const deltaY = targetY - startY
  if (Math.abs(deltaY) < 2) return

  const startTime = performance.now()

  const animate = (currentTime: number): void => {
    const elapsed = currentTime - startTime
    const progress = Math.min(1, elapsed / paginationScrollDurationMs)
    const easedProgress = easeOutCubic(progress)
    window.scrollTo(0, startY + (deltaY * easedProgress))

    if (progress < 1) {
      paginationScrollFrame = window.requestAnimationFrame(animate)
      return
    }

    paginationScrollFrame = null
  }

  paginationScrollFrame = window.requestAnimationFrame(animate)
}

const maybeScrollListIntoView = (element: HTMLElement | null): void => {
  if (!element) return

  const rect = element.getBoundingClientRect()
  const currentScroll = window.scrollY
  const top = currentScroll + rect.top - scrollOffsetPx
  const shouldScrollUpToList = top < currentScroll - 24

  if (!shouldScrollUpToList) return

  smoothScrollTo(Math.max(0, top))
}

const handleListPaginationChange = (section: 'series' | 'related'): void => {
  nextTick(() => {
    const container = section === 'series' ? seriesListContainer.value : relatedListContainer.value
    maybeScrollListIntoView(container)
  })
}

if (baseSlug) {
  const siteUrl = runtimeConfig.public.siteUrl ?? ''
  const esUrl = `${siteUrl}/blog/${baseSlug}.es/`
  const enUrl = `${siteUrl}/blog/${baseSlug}.en/`
  const canonicalUrl = locale.value === 'en' ? enUrl : esUrl

  useHead({
    link: [
      { rel: 'canonical', href: canonicalUrl },
      { rel: 'alternate', hreflang: 'es', href: esUrl },
      { rel: 'alternate', hreflang: 'en', href: enUrl },
      { rel: 'alternate', hreflang: 'x-default', href: esUrl }
    ]
  })
}

onMounted(() => {
  if (currentSlug) {
    void registerVisit(currentSlug)
  }

  if (route.hash) {
    nextTick(() => {
      setTimeout(() => {
        const element = document.querySelector(route.hash)
        if (element) {
          const offset = 100
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 300)
    })
  }
})

onBeforeUnmount(() => {
  if (paginationScrollFrame !== null) {
    window.cancelAnimationFrame(paginationScrollFrame)
    paginationScrollFrame = null
  }
})

const articleContainer = ref<HTMLElement | null>(null)
</script>

<template>
  <main>
    <div ref="articleContainer" class="container-blog">
      <TvHero
        :config-hero="configHero"
        is-entry
      />
      <div class="container-main">
        <TvBreadcrumbs
          :items="breadcrumbs"
        />
      </div>
      <section
        v-if="post"
        class="container-main mt-0 mb-20 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12"
      >
        <client-only>
          <aside
            v-if="hasToc"
            class="order-1 pt-6 lg:order-2 lg:border-t-0 lg:pt-0"
          >
            <div class="sticky top-5 lg:overflow-auto">
              <TvToc v-if="hasToc" :toc="tocData" compact />
            </div>
          </aside>
        </client-only>
        <div class="order-2 min-w-0 lg:order-1">
          <TvArticle
            :content="articleData"
            :lang="locale"
            @label-click="handleLabelClick"
          />
          <div
            v-if="!seriesContext && (newerPost || olderPost)"
            class="mt-8 rounded-xl border border-primary/30 bg-light-card-bg px-4 py-4 text-light-text dark:bg-dark-card-bg dark:text-dark-text"
          >
            <p class="text-sm font-semibold text-primary">
              {{ t('blogs.navigation.label') }}
            </p>
            <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              <NuxtLink
                v-if="newerPost"
                :to="toLocalizedPostPath(newerPost)"
                class="rounded-lg border border-primary/20 px-3 py-2 text-sm transition-colors hover:bg-primary/5"
              >
                <span class="block text-xs opacity-80">{{ t('blogs.navigation.newer') }}</span>
                <span>{{ newerPost.title }}</span>
              </NuxtLink>
              <NuxtLink
                v-if="olderPost"
                :to="toLocalizedPostPath(olderPost)"
                class="rounded-lg border border-primary/20 px-3 py-2 text-sm transition-colors hover:bg-primary/5"
              >
                <span class="block text-xs opacity-80">{{ t('blogs.navigation.older') }}</span>
                <span>{{ olderPost.title }}</span>
              </NuxtLink>
            </div>
          </div>
          <div
            v-if="seriesContext"
            class="mt-8 rounded-xl border border-primary/30 bg-light-card-bg px-4 py-4 text-light-text dark:bg-dark-card-bg dark:text-dark-text"
          >
            <div class="flex flex-col gap-1">
              <p class="text-sm font-semibold text-primary">
                {{ t('blogs.series.label') }}
              </p>
              <NuxtLink
                :to="seriesContext.path"
                class="text-lg font-bold underline-offset-4 hover:underline focus-visible:underline"
              >
                {{ seriesContext.title }}
              </NuxtLink>
              <p class="text-sm opacity-90">
                {{ seriesContext.description }}
              </p>
              <p class="text-sm font-medium">
                {{ t('blogs.series.progress', { current: seriesContext.current, total: seriesContext.total }) }}
              </p>
            </div>
            <div
              v-if="previousSeriesPost || nextSeriesPost"
              class="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2"
            >
              <NuxtLink
                v-if="previousSeriesPost"
                :to="toLocalizedPostPath(previousSeriesPost)"
                class="rounded-lg border border-primary/20 px-3 py-2 text-sm transition-colors hover:bg-primary/5"
              >
                <span class="block text-xs opacity-80">{{ t('blogs.series.previous') }}</span>
                <span>{{ previousSeriesPost.title }}</span>
              </NuxtLink>
              <NuxtLink
                v-if="nextSeriesPost"
                :to="toLocalizedPostPath(nextSeriesPost)"
                class="rounded-lg border border-primary/20 px-3 py-2 text-sm transition-colors hover:bg-primary/5"
              >
                <span class="block text-xs opacity-80">{{ t('blogs.series.next') }}</span>
                <span>{{ nextSeriesPost.title }}</span>
              </NuxtLink>
            </div>
          </div>
          <div
            v-if="editOnGithubUrl"
            class="mt-8 rounded-xl border border-primary/30 bg-light-card-bg px-4 py-3 text-light-text dark:bg-dark-card-bg dark:text-dark-text"
          >
            <a
              :href="editOnGithubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-primary underline-offset-4 hover:underline focus-visible:underline"
            >
              {{ t('blogs.contribute.editOnGithub') }}
            </a>
            <p class="mt-2 text-sm opacity-90">
              {{ t('blogs.contribute.helpImprove') }}
            </p>
          </div>
        </div>
      </section>

      <section
        v-if="showSeriesSection || showRelatedSection || renderLatestPosts.list.length"
        class="container-main mb-16 pt-20"
      >
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div v-if="showSeriesSection">
              <h2 class="title-main">
                {{ t('blogs.series.label') }}
              </h2>
              <div ref="seriesListContainer" class="mt-8 grid grid-cols-1 justify-items-center gap-8 sm:justify-items-stretch sm:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                <div
                  v-for="seriesPost in paginatedSeriesRelatedPosts"
                  :key="seriesPost.id"
                  class="blog-card-shell w-full"
                  role="link"
                  tabindex="0"
                  @click="handleCardClick($event, seriesPost.path)"
                  @keydown="handleCardKeydown($event, seriesPost.path)"
                >
                  <TvCard
                    :config-card="seriesPost"
                    @click-button="handleCardButtonClick(seriesPost.path)"
                    @click-label="handleCardLabelClick"
                  />
                </div>
              </div>
              <ClientOnly>
                <div v-if="seriesRelatedPosts.length > seriesPageSize" class="mt-10 flex justify-center">
                  <TvPagination
                    v-model="currentSeriesPage"
                    :total-items="seriesRelatedPosts.length"
                    :page-size="seriesPageSize"
                    show-icons
                    :show-first-last="false"
                    @update:model-value="handleListPaginationChange('series')"
                  />
                </div>
              </ClientOnly>
            </div>
            <div v-if="showRelatedSection">
              <h2 class="title-main">
                {{ t('blogs.related') }}
              </h2>
              <div ref="relatedListContainer" class="mt-8 grid grid-cols-1 justify-items-center gap-8 sm:justify-items-stretch sm:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                <div
                  v-for="related in paginatedRelatedPosts"
                  :key="related.id"
                  class="blog-card-shell w-full"
                  role="link"
                  tabindex="0"
                  @click="handleCardClick($event, related.path)"
                  @keydown="handleCardKeydown($event, related.path)"
                >
                  <TvCard
                    :config-card="related"
                    @click-button="handleCardButtonClick(related.path)"
                    @click-label="handleCardLabelClick"
                  />
                </div>
              </div>
              <ClientOnly>
                <div v-if="relatedPosts.length > relatedPageSize" class="mt-10 flex justify-center">
                  <TvPagination
                    v-model="currentRelatedPage"
                    :total-items="relatedPosts.length"
                    :page-size="relatedPageSize"
                    show-icons
                    :show-first-last="false"
                    @update:model-value="handleListPaginationChange('related')"
                  />
                </div>
              </ClientOnly>
            </div>
          </div>
          <div v-if="renderLatestPosts.list.length" class="lg:pt-14">
            <TvSidebar
              :data="renderLatestPosts"
              @click="handleSidebarBlogClick"
            />
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
:deep(.tv-article) {
  padding: 0 !important;
}

:deep(.tv-article .tv-prose ul) {
  list-style-type: disc;
  list-style-position: outside;
}

:deep(.tv-article .tv-prose ol) {
  list-style-type: decimal;
  list-style-position: outside;
}
</style>
