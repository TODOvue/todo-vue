// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/hints',
    '@nuxt/fonts',
    '@todovue/tv-card/nuxt',
    '@todovue/tv-alert/nuxt',
    '@todovue/tv-article/nuxt',
    '@todovue/tv-breadcrumbs/nuxt',
    '@todovue/tv-button/nuxt',
    '@todovue/tv-hero/nuxt',
    '@todovue/tv-label/nuxt',
    '@todovue/tv-menu/nuxt',
    '@todovue/tv-pagination/nuxt',
    '@todovue/tv-search/nuxt',
    '@todovue/tv-settings/nuxt',
    '@todovue/tv-sidebar/nuxt',
    '@todovue/tv-theme-button/nuxt',
    '@todovue/tv-toc/nuxt',
    '@nuxtjs/i18n'
  ],
  devtools: { enabled: true },

  css: [
    '@/assets/styles/main.css'
  ],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2025-07-15',

  nitro: {
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true,
      autoSubfolderIndex: false
    }
  },

  fonts: {
    families: [
      { name: 'Lato', provider: 'google', weights: [300], display: 'swap', preload: true },
      { name: 'Kanit', provider: 'google', weights: [600], display: 'swap', preload: true }
    ]
  },
  i18n: {
    defaultLocale: 'es',
    langDir: 'locales',
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    }
  },
})
