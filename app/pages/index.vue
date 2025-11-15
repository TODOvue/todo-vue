<script setup>
import { TvHero } from '@todovue/tv-hero'

const router = useRouter()

const configHero = {
  alt: "TODOvue Logo",
  button: "View all blogs",
  description: "Introducing my Vue.js blog! Get ready to dive into the world of Vue.js and discover how this powerful JavaScript framework can help you build beautiful and dynamic user interfaces for your web applications.",
  image: "https://firebasestorage.googleapis.com/v0/b/todovue-blog.appspot.com/o/icono_git.png?alt=media&token=86270c30-8235-4424-b72b-7a585f228685",
  title: "TODOvue Blog",
  buttonSecondary: "View components",
}
</script>

<template>
  <section>
    <ClientOnly>
      <TvHero
        :config-hero="configHero"
        @click-button="router.push('/blog')"
        @click-secondary-button="router.push('/components')"
      />
    </ClientOnly>
  </section>
</template>

<style scoped>
img {
  max-width: 200px !important;
}
</style>
