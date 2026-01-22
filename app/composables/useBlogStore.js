import { computed, readonly } from 'vue'
import { queryCollection, useNuxtApp, useI18n, useLocalePath } from '#imports'
import { FALLBACK_LOCALE, matchesSlug, getLocalizedPosts, getDocumentSlug } from '@/utils/contentLocale'

export const useBlogStore = () => {
  const { $localizedContent } = useNuxtApp()
  const { locale, t } = useI18n()
  const localePath = useLocalePath()
  const blogPosts = useState('blog-posts', () => [])
  const isLoading = useState('blog-loading', () => false)
  const lastFetchTime = useState('blog-last-fetch', () => 0)
  const lastFetchLocale = useState('blog-last-fetch-locale', () => '')
  const CACHE_DURATION = 5 * 60 * 1000 // 5 min

  const fetchBlogPosts = async (forceRefresh = false) => {
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
      lastFetchLocale.value = locale.value
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
    title: post.title ?? t('blogs.card.untitled'),
    description: post.description ?? '',
    id: post.id ?? post._id ?? post._path ?? '',
    primaryButtonText: t('blogs.card.readBlog'),
    alt: post.title ?? t('blogs.card.cover'),
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
    title: t('blogs.sidebar.labels'),
    labels: getAllLabels.value,
  }))

  const visitCounts = useState('visit-counts', () => ({}))

  const fetchVisitCounts = async () => {
    if (import.meta.server) return

    const { $database } = useNuxtApp()
    if (!$database) {
      console.warn('Firebase database not available')
      return
    }

    try {
      const { ref, onValue } = await import('firebase/database')
      const visitRef = ref($database, 'visit')

      onValue(visitRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          visitCounts.value = data
        }
      }, (error) => {
        console.error('Firebase read failed:', error)
      })
    } catch (e) {
      console.error('Error initializing Firebase listener:', e)
    }
  }

  const getMostPopular = computed(() => {
    const sortedPosts = [...blogPosts.value].sort((a, b) => {
      const slugA = getDocumentSlug(a)
      const slugB = getDocumentSlug(b)
      const countA = visitCounts.value[slugA]?.contador || 0
      const countB = visitCounts.value[slugB]?.contador || 0

      return countB - countA
    })
    return {
      title: t('blogs.sidebar.popularBlogs'),
      list: sortedPosts.slice(0, 5).map((post, index) => ({
        id: index + 1,
        title: post.title ?? t('blogs.card.untitled'),
        link: localePath(post.path ?? post._path ?? '/'),
        isNew: post.isNew || false,
      })),
    }
  })

  if (import.meta.client) {
    fetchVisitCounts()
  }

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

  const getRelatedPosts = (currentPost, limit = 3) => {
    if (!currentPost || !Array.isArray(currentPost.tags)) return []

    const currentTags = currentPost.tags.map(tag => typeof tag === 'string' ? tag : tag.tag)
    const currentId = currentPost.id ?? currentPost._path

    const related = blogPosts.value.filter(post => {
      const postId = post.id ?? post._path
      if (postId === currentId) return false

      if (!Array.isArray(post.tags)) return false
      const postTags = post.tags.map(tag => typeof tag === 'string' ? tag : tag.tag)
      const matchingTags = postTags.filter(tag => currentTags.includes(tag))
      post._matchCount = matchingTags.length
      return matchingTags.length > 0
    })
    related.sort((a, b) => {
      if (b._matchCount !== a._matchCount) {
        return b._matchCount - a._matchCount
      }
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      return dateB - dateA
    })

    return related.slice(0, limit).map(postToCardConfig)
  }

  const totalPosts = computed(() => blogPosts.value.length)
  const allPosts = computed(() => blogPosts.value)

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
    postToCardConfig,
  }
}
