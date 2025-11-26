import {computed, readonly} from 'vue'
import {queryCollection} from '#imports'

export const useBlogStore = () => {
  // Usar useState de Nuxt para persistir datos entre servidor y cliente
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
      blogPosts.value = Array.isArray(posts)
        ? posts.sort((a, b) => {
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
    return blogPosts.value.find((p) => p.stem === `blog/${slug}`) || null
  }

  const postToCardConfig = (post) => ({
    title: post.title ?? 'Untitled post',
    description: post.description ?? '',
    id: post.id ?? post._id ?? post._path ?? '',
    primaryButtonText: 'Read blog',
    alt: post.title ?? 'Blog cover',
    image: post.meta?.cover ?? '',
    labels: Array.isArray(post.tags)
      ? post.tags.map((tag, index) => ({
          id: index + 1,
          name: typeof tag === 'string' ? tag : tag.tag ?? '',
          color: typeof tag === 'object' ? tag.color : undefined,
        }))
      : [],
    path: post.path ?? post._path ?? '/',
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
    title: 'Blog Labels',
    labels: getAllLabels.value,
  }))
  
  const getMostPopular = computed(() => {
    const sortedPosts = [...blogPosts.value].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    )
    return {
      title: 'Most Popular Blogs',
      list: sortedPosts.slice(0, 5).map((post, index) => ({
        id: index + 1,
        title: post.title ?? 'Untitled',
        link: post.path ?? post._path ?? '/',
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
