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
    '@todovue/tv-sidebar/nuxt',
    '@todovue/tv-theme-button/nuxt'
  ],
  devtools: { enabled: true },

  css: [
    '@/assets/styles/main.css'
  ],

  content: {
    experimental: {
      nativeSqlite: true
    }
  }, compatibilityDate: '2025-07-15',

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
  }
})
