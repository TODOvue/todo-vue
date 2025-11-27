import { defineNuxtPlugin } from '#app'
import { getLocalizedPosts, FALLBACK_LOCALE } from '@/utils/contentLocale'

export default defineNuxtPlugin(() => {
  const cache = useState('localized-content', () => new Map())

  const getCached = (key) => cache.value.get(key)
  const setCached = (key, value) => cache.value.set(key, value)

  const getLocalized = (posts, currentLocale) => {
    const key = `${currentLocale}-${Array.isArray(posts) ? posts.length : 0}`
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
