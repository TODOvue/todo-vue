import { defineNuxtPlugin } from '#app'
import { getLocalizedPosts, FALLBACK_LOCALE } from '@/utils/contentLocale'

export default defineNuxtPlugin(() => {
  const cache = useState('localized-content', () => new Map())

  const getCached = (key) => cache.value.get(key)
  const setCached = (key, value) => cache.value.set(key, value)

  const getLocalized = (posts, currentLocale) => {
    const signature = Array.isArray(posts)
      ? posts
        .map((post) => post?._id ?? post?.id ?? post?._path ?? post?.path ?? '')
        .join('|')
      : 'no-posts'
    const key = `${currentLocale}-${signature}`
    const cached = getCached(key)
    if (cached) return cached
    const localized = getLocalizedPosts(posts, currentLocale, FALLBACK_LOCALE)
    setCached(key, localized)
    return localized
  }

  return {
    provide: {
      localizedContent: {
        getLocalized
      }
    }
  }
})
