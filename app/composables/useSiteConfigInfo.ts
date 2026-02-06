import { computed } from 'vue'
import type { SiteConfigInfo } from '@/types/composables'

export const useSiteConfigInfo = (): SiteConfigInfo => {
  const siteConfig = useSiteConfig()

  return {
    siteUrl: computed(() => siteConfig.url),
    siteName: computed(() => siteConfig.name),
    siteDescription: computed(() => siteConfig.description),
    siteLocale: computed(() => siteConfig.defaultLocale),
    isIndexable: computed(() => siteConfig.indexable),
    hasTrailingSlash: computed(() => siteConfig.trailingSlash),
    siteEnv: computed(() => siteConfig.env),

    createSiteUrl: (path: string) => {
      const baseUrl = siteConfig.url || ''
      const cleanPath = path.startsWith('/') ? path : `/${path}`
      const trailingSlash = siteConfig.trailingSlash && !cleanPath.endsWith('/') ? '/' : ''
      return `${baseUrl}${cleanPath}${trailingSlash}`
    },

    isProduction: computed(() => siteConfig.env === 'production'),
  }
}

