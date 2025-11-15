<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'
import { TvMenu } from '@todovue/tv-menu'

const router = useRouter()

const { data: posts } = await useAsyncData('app-menu-posts', async () => {
  const data = await queryCollection('blog').all().catch((err) => {
    console.error('[app-menu-posts] queryCollection error:', err)
    return []
  })

  return Array.isArray(data) ? data : []
})

const results = computed(() =>
  (posts.value ?? []).map((post) => ({
    title: post.title ?? '',
    url: post.path ?? '/',
    id: post.id ?? post._id ?? post._path ?? crypto.randomUUID?.() ?? Math.random().toString(),
  }))
)

const configMenu = {
  menus: [
    {
      id: 1,
      title: "Home",
      url: "/",
    },
    {
      id: 2,
      title: "Blogs",
      url: "/blog",
    },
    {
      id: 3,
      title: "Components",
      url: "/components",
    }
  ],
  placeholder: "Search blogs...",
  titleButton: "Search",
  imageMenu: "https://firebasestorage.googleapis.com/v0/b/todovue-blog.appspot.com/o/logo.png?alt=media&token=4d64783f-2259-49cc-a6b4-68e58ce3b227",
  results: results.value
};

const handleClickMenu = (menu) => {
  if (typeof menu === 'string') return
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
</script>

<template>
  <ClientOnly>
    <TvMenu
      :menus="configMenu.menus"
      :placeholder="configMenu.placeholder"
      :title-button="configMenu.titleButton"
      :image-menu="configMenu.imageMenu"
      :results="configMenu.results"
      @click-menu="handleClickMenu"
      @search-menu="handleClickMenu"
    />
  </ClientOnly>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <TvThemeButton
      @change-theme="changeValue"
    />
  </ClientOnly>
</template>

<style scoped>
img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
