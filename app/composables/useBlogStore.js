import {computed, readonly} from 'vue'
import {queryCollection, useNuxtApp, useI18n, useLocalePath } from '#imports'
import { FALLBACK_LOCALE, matchesSlug, getLocalizedPosts } from '@/utils/contentLocale'

export const useBlogStore = () => {
  const { $localizedContent } = useNuxtApp()
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const blogPosts = useState('blog-posts', () => [])
  const isLoading = useState('blog-loading', () => false)
  const lastFetchTime = useState('blog-last-fetch', () => 0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  const fetchBlogPosts = async (forceRefresh = false) => {
    const now = Date.now()
    const shouldFetch =
      forceRefresh ||
      blogPosts.value.length === 0 ||
      now - lastFetchTime.value > CACHE_DURATION

    if (!shouldFetch) {
      return blogPosts.value
    }

    if (isLoading.value) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(interval)
            resolve(true)
          }
        }, 100)
      })
      return blogPosts.value
    }

    isLoading.value = true
    try {
      const posts = await queryCollection('blog').all()
      const localized = typeof $localizedContent?.getLocalized === 'function'
        ? $localizedContent.getLocalized(posts, locale.value)
        : getLocalizedPosts(posts, locale.value, FALLBACK_LOCALE)
      blogPosts.value = Array.isArray(posts)
        ? localized.sort((a, b) => {
          const dateA = new Date(a.date || 0)
          const dateB = new Date(b.date || 0)
          return dateB - dateA
        })
        : []
      lastFetchTime.value = now
      return blogPosts.value
    } catch (error) {
      console.error('Error loading blog posts:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  const getBlogBySlug = async (slug) => {
    await fetchBlogPosts()
    const normalizedSlug = String(slug).replace(/\.[a-z]{2}$/i, '')
    const direct = blogPosts.value.find((post) => matchesSlug(post, normalizedSlug))
    if (direct) return direct
    return blogPosts.value.find((post) => Array.isArray(post.alternate) && post.alternate.some((alt) => matchesSlug(alt, normalizedSlug))) || null
  }

  const postToCardConfig = (post) => ({
    title: post.title ?? 'Untitled post',
    description: post.description ?? '',
    id: post.id ?? post._id ?? post._path ?? '',
    primaryButtonText: locale.value === 'es' ? 'Leer blog' : 'Read blog',
    alt: post.title ?? 'Blog cover',
    image: post.meta?.cover ?? '',
    labels: Array.isArray(post.tags)
      ? post.tags.map((tag, index) => ({
          id: index + 1,
          name: typeof tag === 'string' ? tag : tag.tag ?? '',
          color: typeof tag === 'object' ? tag.color : undefined,
        }))
      : [],
    path: localePath(post.path ?? post._path ?? '/'),
    limitLabels: 10,
  })

  const getCardsConfig = computed(() => {
    return blogPosts.value.map(postToCardConfig)
  })
  
  const getPaginatedCards = (page, pageSize) => {
    return computed(() => {
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return getCardsConfig.value.slice(start, end)
    })
  }
  
  const getAllLabels = computed(() => {
    const labelMap = new Map()
    blogPosts.value.forEach((post) => {
      if (!Array.isArray(post.tags)) return
      post.tags.forEach((tag) => {
        const tagName = typeof tag === 'string' ? tag : tag.tag
        const tagColor = typeof tag === 'object' ? tag.color : undefined
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
      color: item.color,
    }))
  })
  
  const getLabelsConfig = computed(() => ({
    title: locale.value === 'es' ? 'Etiquetas del blog' : 'Blog Labels',
    labels: getAllLabels.value,
  }))
  
  const getMostPopular = computed(() => {
    const sortedPosts = [...blogPosts.value].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    )
    return {
      title: locale.value === 'es' ? 'Blogs mas populares' : 'Most Popular Blogs',
      list: sortedPosts.slice(0, 5).map((post, index) => ({
        id: index + 1,
        title: post.title ?? 'Untitled',
        link: localePath(post.path ?? post._path ?? '/'),
      })),
    }
  })

  const getLastMostViewedPost = computed(() => {
    if (blogPosts.value.length === 0) return null
    return blogPosts.value[0] ? postToCardConfig(blogPosts.value[0]) : null
  })

  const getPostsByTag = (tagName) => {
    return computed(() => {
      return blogPosts.value.filter((post) => {
        if (!Array.isArray(post.tags)) return false
        return post.tags.some((tag) => {
          const name = typeof tag === 'string' ? tag : tag.tag
          return name === tagName
        })
      })
    })
  }

  const totalPosts = computed(() => blogPosts.value.length)
  const allPosts = computed(() => blogPosts.value)

  return {
    blogPosts: allPosts,
    isLoading: readonly(isLoading),
    totalPosts,

    fetchBlogPosts,
    getBlogBySlug,

    getCardsConfig,
    getPaginatedCards,
    getAllLabels,
    getLabelsConfig,
    getMostPopular,
    getLastMostViewedPost,
    getPostsByTag,
    postToCardConfig,
  }
}
