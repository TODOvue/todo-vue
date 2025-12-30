// https://nuxt.com/docs/api/configuration/nuxt-config
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const blogRoutes = (() => {
  try {
    const dir = join(process.cwd(), 'content', 'blog')
    return readdirSync(dir)
      .filter((name) => name.endsWith('.md'))
      .map((name) => name.replace(/\.md$/, ''))
      .map((slug) => `/blog/${slug}/`)
  } catch (error) {
    console.warn('Could not read blog content directory for prerender:', error)
    return []
  }
})()

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183906/icono_git_bvxian.png' }
      ]
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@todovue/tv-alert/nuxt',
    '@todovue/tv-article/nuxt',
    '@todovue/tv-breadcrumbs/nuxt',
    '@todovue/tv-button/nuxt',
    '@todovue/tv-card/nuxt',
    '@todovue/tv-hero/nuxt',
    '@todovue/tv-label/nuxt',
    '@todovue/tv-menu/nuxt',
    '@todovue/tv-pagination/nuxt',
    '@todovue/tv-scroll-top/nuxt',
    '@todovue/tv-search/nuxt',
    '@todovue/tv-settings/nuxt',
    '@todovue/tv-sidebar/nuxt',
    '@todovue/tv-theme-button/nuxt',
    '@todovue/tv-toc/nuxt'
  ],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    name: process.env.NUXT_PUBLIC_SITE_NAME,
    description: process.env.NUXT_PUBLIC_SITE_DESCRIPTION,
    defaultLocale: process.env.NUXT_PUBLIC_SITE_DEFAULT_LOCALE,
    trailingSlash: process.env.NUXT_PUBLIC_SITE_TRAILING_SLASH === 'true',
    indexable: process.env.NUXT_PUBLIC_SITE_INDEXABLE === 'true' || process.env.NODE_ENV === 'production',
  },

  robots: {
    disallow: ['/components', '/admin'],
    allow: '/'
  },

  sitemap: {
    sources: [
      '/api/sitemap'
    ],
    xsl: false
  },

  ogImage: {
    enabled: true
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'TODOvue',
      url: 'https://todovue.blog',
      logo: 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183906/icono_git_bvxian.png'
    }
  },

  seo: {
    redirectToCanonicalSiteUrl: true
  },

  devtools: { enabled: true },

  css: ['@/assets/styles/main.css'],

  content: {},

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2025-07-15',

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: true,
      autoSubfolderIndex: true,
      routes: blogRoutes
    }
  },

  fonts: {
    families: [
      { name: 'Lato', provider: 'google', weights: [300], display: 'swap', preload: true },
      { name: 'Kanit', provider: 'google', weights: [600], display: 'swap', preload: true }
    ]
  },

  i18n: {
    baseUrl: 'https://todovue.blog',
    defaultLocale: 'es',
    langDir: 'locales',
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    strategy: 'no_prefix',
    trailingSlash: true,
    detectBrowserLanguage: false
  },
})
