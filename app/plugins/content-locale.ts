import { defineNuxtPlugin } from '#app'
import { getLocalizedPosts, FALLBACK_LOCALE } from '@/utils/contentLocale'
import type { BlogPost } from '@/types/composables'
import type { ContentLocalePluginApi } from '@/types/plugins'

export default defineNuxtPlugin(() => {
  const cache = new Map<string, BlogPost[]>()

  const getCached = (key: string): BlogPost[] | undefined => cache.get(key)
  const setCached = (key: string, value: BlogPost[]): void => {
    cache.set(key, value)
  }

  const getLocalized: ContentLocalePluginApi['getLocalized'] = (posts, currentLocale) => {
    const signature = Array.isArray(posts)
      ? posts
        .map((post) => post?._id ?? post?.id ?? post?._path ?? post?.path ?? '')
        .join('|')
      : 'no-posts'
    const key = `${currentLocale}-${signature}`
    const cached = getCached(key)
    if (cached) return cached
    const localized = getLocalizedPosts(posts, currentLocale, FALLBACK_LOCALE) as BlogPost[]
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
