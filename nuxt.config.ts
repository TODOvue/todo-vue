// https://nuxt.com/docs/api/configuration/nuxt-config
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
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap'
  ],
  site: {
    url: 'https://todovue.com',
  },
  devtools: { enabled: true },

  css: [
    '@/assets/styles/main.css'
  ],

  content: {},

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2025-07-15',

  nitro: {
    prerender: {
      failOnError: true
    }
  },

  fonts: {
    families: [
      { name: 'Lato', provider: 'google', weights: [300], display: 'swap', preload: true },
      { name: 'Kanit', provider: 'google', weights: [600], display: 'swap', preload: true }
    ]
  },
  i18n: {
    baseUrl: 'https://todovue.com',
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
      redirectOn: 'no prefix',
      alwaysRedirect: false,
      fallbackLocale: 'es'
    }
  },
})
