// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183906/icono_git_bvxian.png' }
      ],
      meta: [
        { property: 'og:site_name', content: 'TODOvue' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://todovue.blog/default-og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://todovue.blog/default-og-image.png' }
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
    '@nuxtjs/sitemap',
    '@todovue/tv-alert/nuxt',
    '@todovue/tv-article/nuxt',
    '@todovue/tv-breadcrumbs/nuxt',
    '@todovue/tv-button/nuxt',
    '@todovue/tv-card/nuxt',
    '@todovue/tv-hero/nuxt',
    '@todovue/tv-label/nuxt',
    '@todovue/tv-menu/nuxt',
    '@todovue/tv-pagination/nuxt',
    '@todovue/tv-search/nuxt',
    '@todovue/tv-settings/nuxt',
    '@todovue/tv-sidebar/nuxt',
    '@todovue/tv-theme-button/nuxt',
    '@todovue/tv-toc/nuxt'
  ],

  site: {
    url: 'https://todovue.blog',
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
      autoSubfolderIndex: true
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
