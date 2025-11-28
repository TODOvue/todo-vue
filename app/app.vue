<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'
import { TvMenu } from '@todovue/tv-menu'
import { TvAlert, useAlert } from '@todovue/tv-alert'
import { TvSettings } from '@todovue/tv-settings'
import { useI18n } from 'vue-i18n'

const router = useRouter()

const { api } = useAlert()
const alert = api()

const blogStore = useBlogStore()
const { t } = useI18n()

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
    {
      id: 3,
      title: t('menu.components'),
      url: '/components'
    }
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

onMounted(() => {
  if (!import.meta.client) return

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const stored = localStorage.getItem('theme')
  const theme = stored || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
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
        </div>
      </template>
    </TvSettings>
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <TvAlert />
</template>

<style scoped>
.settings-container {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.settings-content {
  padding: 20px;
}

img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
