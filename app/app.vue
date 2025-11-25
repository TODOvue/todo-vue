<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'
import { TvMenu } from '@todovue/tv-menu'
import { TvAlert, useAlert } from '@todovue/tv-alert'

const router = useRouter()

const { api } = useAlert()
const alert = api()

const { data: posts } = await useAsyncData('app-menu-posts', async () => {
  const data = await queryCollection('blog').all().catch((err) => {
    console.error('[app-menu-posts] queryCollection error:', err)
    return []
  })

  return Array.isArray(data) ? data : []
})

const results = computed(() =>
  (posts.value ?? []).map(post => ({
    title: post.title ?? '',
    url: post.path ?? '/',
    id: post.id ?? post._id ?? post._path ?? crypto.randomUUID?.() ?? Math.random().toString()
  }))
)

const configMenu = {
  menus: [
    {
      id: 2,
      title: 'Blogs',
      url: '/blog'
    },
    {
      id: 3,
      title: 'Components',
      url: '/components'
    }
  ],
  placeholder: 'Search blogs...',
  titleButton: 'Search',
  imageMenu: 'https://res.cloudinary.com/dcdfhi8qz/image/upload/v1763663056/uqqtkgp1lg3xdplutpga.png',
  results: results.value
}

const handleClickMenu = (menu) => {
  if (typeof menu === 'string') {
    console.log(menu.trim().length)
    if (menu.trim().length <= 1) {
      alert.error('Please enter a search term', {
        position: 'top-right',
        timeout: 2000
      })
      return
    }
  }
  router.push(menu.url)
}

const setTheme = (value) => {
  if (!import.meta.client) return
  document.documentElement.className = `${value}-mode`
  localStorage.setItem('theme', value)
}

const changeValue = (value) => {
  setTheme(value)
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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <TvThemeButton
    @change-theme="changeValue"
  />
  <TvAlert />
</template>

<style scoped>
img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
