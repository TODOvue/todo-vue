<script setup lang="ts">
import {
  TvArticle,
  TvBreadcrumbs,
  TvCard,
  TvHero,
  TvToc,
} from '@todovue/tv-ui'

import { useI18n } from 'vue-i18n'
import type { BlogPost, CardConfig } from '@/types/composables'
import type { BreadcrumbItem, TagLike, TocData } from '@/types/views'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const { locale, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const { registerVisit } = useVisit()

const getRouteSlug = (): string | undefined => {
  const slug = route.params.slug
  if (Array.isArray(slug)) return slug[0]
  return slug
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
      return await blogStore.getBlogBySlug(slug)
    } catch (error) {
      console.error('Error searching for post:', error)
      return null
    }
  },
  {
    watch: [() => locale.value]
  }
)

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

const relatedPosts = computed<CardConfig[]>(() => {
  if (!resolvedPost.value.tags) return []
  return blogStore.getRelatedPosts(resolvedPost.value, 3)
})

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
  { label: 'Blog', href: '/blog' },
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
      void router.push({ name: 'blog', query: { label: labelValue, page: '1' } })
    }
  }
}

const handleRelatedClick = (path: string): void => {
  void router.push(path)
}

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
              <TvToc :toc="tocData" compact />
            </div>
          </aside>
        </client-only>
        <div class="order-2 min-w-0 lg:order-1">
          <TvArticle
            :content="articleData"
            :lang="locale"
            @label-click="handleLabelClick"
          />
        </div>
      </section>

      <section v-if="relatedPosts.length" class="container-main mb-16 mt-20">
        <h2 class="title-main">
          {{ t('blogs.related') }}
        </h2>
        <div class="mt-8 grid grid-cols-1 justify-items-center gap-8 sm:justify-items-stretch sm:[grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          <TvCard
            v-for="related in relatedPosts"
            :key="related.id"
            :config-card="related"
            @click-button="handleRelatedClick(related.path)"
            @click-label="handleLabelClick"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
:deep(.tv-article) {
  padding: 0 !important;
}
</style>
