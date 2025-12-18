<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'
import { TvMenu } from '@todovue/tv-menu'
import { TvAlert, useAlert } from '@todovue/tv-alert'
import { TvSettings } from '@todovue/tv-settings'
const router = useRouter()
const route = useRoute()

const { api } = useAlert()
const alert = api()

const blogStore = useBlogStore()
const { t, locale, setLocale } = useI18n()

const { data: posts } = await useAsyncData('app-menu-posts', async () => {
  return await blogStore.fetchBlogPosts()
})

const results = computed(() =>
  (posts.value ?? [])
    .map(post => ({
      title: post.title ?? '',
      url: post.path ?? '/',
      id: post.id ?? post._id ?? post._path ?? crypto.randomUUID?.() ?? Math.random().toString()
    }))
)

const configMenu = computed(() => ({
  menus: [
    {
      id: 2,
      title: t('menu.blogs'),
      url: '/blog'
    },
    // { TODO: Enable when components page is ready
    //   id: 3,
    //   title: t('menu.components'),
    //   url: '/components'
    // }
  ],
  placeholder: t('menu.search.placeholder'),
  titleButton: t('menu.search.button'),
  imageMenu: 'https://res.cloudinary.com/dcdfhi8qz/image/upload/v1763663056/uqqtkgp1lg3xdplutpga.png',
  results: results.value
}))

const handleClickMenu = (menu) => {
  if (typeof menu === 'string') {
    const query = menu.trim()
    const len = query.length
    if (len === 0) {
      alert.error(t('menu.search.errors.required'), { position: 'top-right', timeout: 2000 })
      return
    }
    if (len <= 3) {
      alert.error(t('menu.search.errors.minLength'), { position: 'top-right', timeout: 2000 })
      return
    }
    router.push({ path: '/blog', query: { search: query } })
    return
  }

  router.push(menu.url)
}

const setTheme = (value, toButton = false) => {
  if (!import.meta.client) return
  document.documentElement.className = `${value}-mode`
  localStorage.setItem('theme', value)
  if (toButton) {
    alert.info(value === 'dark'
      ? t('menu.theme.dark')
      : t('menu.theme.light')
        , {
      position: 'top-left',
      timeout: 1000
    })
  }
}

const changeValue = (value) => {
  setTheme(value, true)
}

const changeLanguage = async (lang) => {
  await setLocale(lang)

  const langName = lang === 'es' ? t('home.settings.language.es') : t('home.settings.language.en')
  alert.info(t('home.settings.language.changed', { lang: langName }), {
    position: 'top-left',
    timeout: 2000
  })
  await blogStore.fetchBlogPosts(true)

  if (route.path.startsWith('/blog/') && route.params.slug) {
    const currentSlug = String(route.params.slug).replace(/\.(es|en)$/, '')
    const post = await blogStore.getBlogBySlug(currentSlug)

    if (post && post.path) {
      await router.push(post.path)
    }
  }
}

onMounted(() => {
  if (!import.meta.client) return

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const stored = localStorage.getItem('theme')
  const theme = stored || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
  blogStore.fetchBlogPosts()
})

useSeoMeta({
  titleTemplate: '%s - TODOvue',
  ogSiteName: 'TODOvue',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <TvMenu
    :menus="configMenu.menus"
    :placeholder="configMenu.placeholder"
    :title-button="configMenu.titleButton"
    :image-menu="configMenu.imageMenu"
    :results="configMenu.results"
    @click-image="handleClickMenu({ url: '/' })"
    @click-menu="handleClickMenu"
    @search-menu="handleClickMenu"
  />
  <div class="settings-container">
    <TvSettings direction="right" :label="t('home.settings.label')">
      <template #default>
        <div class="settings-content">
          <TvThemeButton @change-theme="changeValue" />
          <div class="language-selector">
            <div class="language-buttons">
              <button
                class="language-button"
                :class="{ active: locale === 'es' }"
                @click="changeLanguage(locale === 'es' ? 'en' : 'es')"
              >
                {{ locale === 'es' ? 'ES' : 'EN' }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </TvSettings>
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <AppFooter version="v0.1.0" />
  <TvAlert />
</template>

<style scoped>
.settings-container {
  position: fixed;
  bottom: 40px;
  left: 20px;
  z-index: 1000;
}

.settings-content {
  padding: 20px;
}

.language-selector {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.language-label {
  font-size: 14px;
  font-weight: 600;
}

.language-buttons {
  display: flex;
  gap: 8px;
}

.language-button {
  flex: 1;
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background-color: #ffffff;
  color: #1a1a1a;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.language-button:hover {
  background-color: #f5f5f5;
  border-color: #42b983;
}

.language-button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

.dark-mode .language-button {
  background-color: #0E131F;
  color: #CBD5E1;
  border-color: #2d3748;
}

.dark-mode .language-button:hover {
  background-color: #1a202c;
  border-color: #42b983;
}

.dark-mode .language-button.active {
  background-color: #42b983;
  color: white;
  border-color: #42b983;
}

img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
