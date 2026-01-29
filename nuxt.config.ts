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
      htmlAttrs: {
        lang: 'es'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#42b883' },
        { name: 'msapplication-TileColor', content: '#42b883' },
        { name: 'msapplication-TileImage', content: '/favicon.ico' },
        { name: 'apple-mobile-web-app-title', content: 'TODOvue' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
        databaseURL: process.env.NUXT_PUBLIC_FIREBASE_DATABASE_URL,
        measurementId: process.env.NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      },
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL
    },
  },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    '@todovue/tv-ui/nuxt',
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
    disallow: [],
    allow: ['/', '/blog/'],
    sitemap: `${process.env.NUXT_PUBLIC_SITE_URL}/sitemap.xml`
  },

  sitemap: {
    urls: blogRoutes,
    xsl: false,
    autoLastmod: true,
    defaults: {
      changefreq: 'weekly',
      priority: 0.7
    }
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

  vue: {
    runtimeCompiler: true
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: true,
      autoSubfolderIndex: true,
      routes: [...blogRoutes, '/rss.xml']
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
