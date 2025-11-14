<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'
import { TvMenu } from '@todovue/tv-menu'

const router = useRouter()

const setTheme = (value) => {
  document.documentElement.className = value + '-mode'
  localStorage.setItem('theme', value)
}

const changeValue = (value) => {
  setTheme(value)
}

const { data: posts } = await useAsyncData('app-menu-posts', async () => {
  try {
    return await queryCollection('blog').all()
  } catch (error) {
    console.error(error)
    return []
  }
})

const results = posts.value.map(post => ({
  title: post.title,
  url: post.path,
  id: post.id,
}))

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
  ],
  placeholder: "Search blogs...",
  titleButton: "Search",
  imageMenu: "https://firebasestorage.googleapis.com/v0/b/todovue-blog.appspot.com/o/logo.png?alt=media&token=4d64783f-2259-49cc-a6b4-68e58ce3b227",
  results
};

const handleClickMenu = (menu) => {
  if (typeof menu === 'string') return
  router.push(menu.url)
}
onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const savedTheme = localStorage.getItem('theme')

  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
})
</script>

<template>
  <TvMenu
    :menus="configMenu.menus"
    :placeholder="configMenu.placeholder"
    :title-button="configMenu.titleButton"
    :image-menu="configMenu.imageMenu"
    :results="configMenu.results"
    @click-menu="handleClickMenu"
    @search-menu="handleClickMenu"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <TvThemeButton @change-theme="changeValue"/>
</template>

<style scoped>
img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
