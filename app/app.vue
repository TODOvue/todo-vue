<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'

const setTheme = (value) => {
  document.documentElement.className = value + '-mode'
  localStorage.setItem('theme', value)
}

const changeValue = (value) => {
  setTheme(value)
}

onMounted(() => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const savedTheme = localStorage.getItem('theme')

  const theme = savedTheme || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <tv-theme-button @change-theme="changeValue"/>
</template>

<style>
img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
