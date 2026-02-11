import { computed, onUnmounted, readonly } from 'vue'
import { queryCollection, useI18n, useLocalePath, useNuxtApp, useState } from '#imports'
import { FALLBACK_LOCALE, getDocumentSlug, getLocalizedPosts, matchesSlug } from '@/utils/contentLocale'
import type { Database } from 'firebase/database'
import type {
  BlogPost,
  BlogTag,
  CardConfig,
  CardLabel,
  GetBlogBySlugOptions,
  LocalizedContentApi,
  RelatedItem,
  UseBlogStoreApi,
  VisitCountMap
} from '@/types/composables'

let visitCountsUnsubscribe: (() => void) | null = null
let visitCountsConsumers = 0

const getTagName = (tag: BlogTag): string => (typeof tag === 'string' ? tag : tag.tag ?? '')
const getTagColor = (tag: BlogTag): string | undefined => (typeof tag === 'string' ? undefined : tag.color)
const getDateValue = (value: BlogPost['date']): number => new Date(value ?? 0).getTime()
const getPostId = (post: BlogPost): string | number => post.id ?? post._path ?? post._id ?? ''
const LOCALE_SUFFIX_REGEX = /\.([a-z]{2})$/i
const getSlugLocale = (slug: string): string | null => slug.match(LOCALE_SUFFIX_REGEX)?.[1]?.toLowerCase() ?? null

const getBlogCollection = () => {
  const collection = queryCollection as unknown as (name: string) => { all: () => Promise<BlogPost[]> }
  return collection('blog')
}

const isRelatedItem = (value: RelatedItem | null): value is RelatedItem => value !== null

export const useBlogStore = (): UseBlogStoreApi => {
  const nuxtApp = useNuxtApp()
  const localizedContent = nuxtApp.$localizedContent as LocalizedContentApi | undefined
  const { locale, t } = useI18n()
  const localePath = useLocalePath()

  const blogPosts = useState<BlogPost[]>('blog-posts', () => [])
  const isLoading = useState<boolean>('blog-loading', () => false)
  const lastFetchTime = useState<number>('blog-last-fetch', () => 0)
  const lastFetchLocale = useState<string>('blog-last-fetch-locale', () => '')
  const visitCounts = useState<VisitCountMap>('visit-counts', () => ({}))
  const CACHE_DURATION = 5 * 60 * 1000

  const fetchBlogPosts = async (forceRefresh = false): Promise<BlogPost[]> => {
    const now = Date.now()
    const shouldFetch =
      forceRefresh ||
      blogPosts.value.length === 0 ||
      lastFetchLocale.value !== locale.value ||
      now - lastFetchTime.value > CACHE_DURATION

    if (!shouldFetch) {
      return blogPosts.value
    }

    if (isLoading.value) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
      return blogPosts.value
    }

    isLoading.value = true
    try {
      const posts = await getBlogCollection().all()
      const localized = typeof localizedContent?.getLocalized === 'function'
        ? localizedContent.getLocalized(posts, locale.value)
        : (getLocalizedPosts(posts, locale.value, FALLBACK_LOCALE) as BlogPost[])

      blogPosts.value = Array.isArray(localized)
        ? [...localized].sort((a: BlogPost, b: BlogPost) => getDateValue(b.date) - getDateValue(a.date))
        : []

      lastFetchTime.value = now
      lastFetchLocale.value = locale.value
      return blogPosts.value
    } catch (error) {
      console.error('Error loading blog posts:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getBlogBySlug = async (slug: string, options?: GetBlogBySlugOptions): Promise<BlogPost | null> => {
    const allowLocaleFallback = options?.allowLocaleFallback ?? true
    const preferredLocale = options?.preferredLocale
    const normalizedSlug = String(slug).replace(/\.[a-z]{2}$/i, '')
    const requestedLocale = getSlugLocale(String(slug))
    let allPosts: BlogPost[] = []
    try {
      allPosts = await getBlogCollection().all()
    } catch (error) {
      console.error('Error loading blog collection for slug lookup:', error)
      allPosts = await fetchBlogPosts(true)
    }
    const filterByLocale = (posts: BlogPost[], localeToMatch: string): BlogPost[] =>
      posts.filter((post) => {
        const path = String(post.path ?? post._path ?? '').toLowerCase()
        return path.endsWith(`.${localeToMatch}/`) || path.endsWith(`.${localeToMatch}`)
      })

    if (preferredLocale) {
      const localizedByPreferred = filterByLocale(allPosts, preferredLocale)
      const exactPreferred = localizedByPreferred.find((post) => matchesSlug(post, normalizedSlug))
      if (exactPreferred) return exactPreferred
      if (!allowLocaleFallback) return null
    }

    if (requestedLocale) {
      const localizedByRequested = filterByLocale(allPosts, requestedLocale)
      const exactRequested = localizedByRequested.find((post) => matchesSlug(post, normalizedSlug))
      if (exactRequested) return exactRequested
      if (!allowLocaleFallback) return null
    }

    const localizedByCurrent = filterByLocale(allPosts, locale.value)
    const exactCurrent = localizedByCurrent.find((post) => matchesSlug(post, normalizedSlug))
    if (exactCurrent) return exactCurrent

    const direct = allPosts.find((post) => matchesSlug(post, normalizedSlug))
    if (direct) return direct

    return allPosts.find((post) => {
      if (!Array.isArray(post.alternate)) return false
      return post.alternate.some((alt) => {
        if (typeof alt === 'string') return alt === normalizedSlug
        return matchesSlug(alt, normalizedSlug)
      })
    }) ?? null
  }

  const postToCardConfig = (post: BlogPost): CardConfig => ({
    title: post.title ?? t('blogs.card.untitled'),
    description: post.description ?? '',
    id: post.id ?? post._id ?? post._path ?? '',
    primaryButtonText: t('blogs.card.readBlog'),
    alt: post.title ?? t('blogs.card.cover'),
    image: post.meta?.cover ?? '',
    labels: Array.isArray(post.tags)
      ? post.tags.map((tag: BlogTag, index: number) => ({
        id: index + 1,
        name: getTagName(tag),
        color: getTagColor(tag)
      }))
      : [],
    path: localePath((post.path ?? post._path ?? '/') as string),
    limitLabels: 10
  })

  const getCardsConfig = computed<CardConfig[]>(() => blogPosts.value.map(postToCardConfig))

  const getPaginatedCards = (page: number, pageSize: number) => {
    return computed<CardConfig[]>(() => {
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return getCardsConfig.value.slice(start, end)
    })
  }

  const getAllLabels = computed<CardLabel[]>(() => {
    const labelMap = new Map<string, { name: string; color?: string }>()

    blogPosts.value.forEach((post) => {
      if (!Array.isArray(post.tags)) return
      post.tags.forEach((tag: BlogTag) => {
        const tagName = getTagName(tag)
        const tagColor = getTagColor(tag)
        if (!tagName) return

        const current = labelMap.get(tagName)
        if (!current) {
          labelMap.set(tagName, { name: tagName, color: tagColor })
        } else if (!current.color && tagColor) {
          labelMap.set(tagName, { ...current, color: tagColor })
        }
      })
    })

    return Array.from(labelMap.values()).map((item, index) => ({
      id: index + 1,
      name: item.name,
      color: item.color
    }))
  })

  const getLabelsConfig = computed(() => ({
    title: t('blogs.sidebar.labels'),
    labels: getAllLabels.value
  }))

  const fetchVisitCounts = async (): Promise<void> => {
    if (import.meta.server || visitCountsUnsubscribe) return

    const database = nuxtApp.$database as Database | undefined
    if (!database) {
      console.warn('Firebase database not available')
      return
    }

    try {
      const { onValue, ref } = await import('firebase/database')
      const visitRef = ref(database, 'visit')

      visitCountsUnsubscribe = onValue(visitRef, (snapshot) => {
        const data = snapshot.val() as VisitCountMap | null
        if (data) {
          visitCounts.value = data
        }
      }, (error) => {
        console.error('Firebase read failed:', error)
      })
    } catch (error) {
      console.error('Error initializing Firebase listener:', error)
    }
  }

  const getMostPopular = computed(() => {
    const sortedPosts = [...blogPosts.value].sort((a: BlogPost, b: BlogPost) => {
      const slugA = getDocumentSlug(a)
      const slugB = getDocumentSlug(b)
      const countA = visitCounts.value[slugA]?.contador ?? 0
      const countB = visitCounts.value[slugB]?.contador ?? 0
      return countB - countA
    })

    return {
      title: t('blogs.sidebar.popularBlogs'),
      list: sortedPosts.slice(0, 5).map((post: BlogPost, index: number) => ({
        id: index + 1,
        title: post.title ?? t('blogs.card.untitled'),
        link: localePath((post.path ?? post._path ?? '/') as string),
        isNew: Boolean(post.isNew)
      }))
    }
  })

  if (import.meta.client) {
    visitCountsConsumers += 1
    void fetchVisitCounts()
  }

  onUnmounted(() => {
    if (!import.meta.client) return
    visitCountsConsumers = Math.max(visitCountsConsumers - 1, 0)
    if (visitCountsConsumers === 0 && visitCountsUnsubscribe) {
      visitCountsUnsubscribe()
      visitCountsUnsubscribe = null
    }
  })

  const getLastMostViewedPost = computed<CardConfig | null>(() => {
    const firstPost = blogPosts.value[0]
    if (!firstPost) return null
    return postToCardConfig(firstPost)
  })

  const getPostsByTag = (tagName: string) => {
    return computed<BlogPost[]>(() => blogPosts.value.filter((post) => {
      if (!Array.isArray(post.tags)) return false
      return post.tags.some((tag: BlogTag) => getTagName(tag) === tagName)
    }))
  }

  const getRelatedPosts = (currentPost: BlogPost, limit = 3): CardConfig[] => {
    if (!currentPost || !Array.isArray(currentPost.tags)) return []

    const currentTags = currentPost.tags.map(getTagName).filter(Boolean)
    const currentId = getPostId(currentPost)

    const related = blogPosts.value
      .map((post): RelatedItem | null => {
        if (getPostId(post) === currentId || !Array.isArray(post.tags)) return null

        const postTags = post.tags.map(getTagName).filter(Boolean)
        const matchingTags = postTags.filter((tag) => currentTags.includes(tag))
        if (matchingTags.length === 0) return null

        return { post, matchCount: matchingTags.length }
      })
      .filter(isRelatedItem)

    related.sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount
      }
      return getDateValue(b.post.date) - getDateValue(a.post.date)
    })

    return related.slice(0, limit).map(({ post }) => postToCardConfig(post))
  }

  const totalPosts = computed<number>(() => blogPosts.value.length)
  const allPosts = computed<BlogPost[]>(() => blogPosts.value)

  return {
    blogPosts: allPosts,
    isLoading: readonly(isLoading),
    totalPosts,
    fetchBlogPosts,
    getBlogBySlug,
    fetchVisitCounts,
    getCardsConfig,
    getPaginatedCards,
    getAllLabels,
    getLabelsConfig,
    getMostPopular,
    getLastMostViewedPost,
    getPostsByTag,
    getRelatedPosts,
    postToCardConfig
  }
}
