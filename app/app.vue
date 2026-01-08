<script setup>
import { TvThemeButton } from '@todovue/tv-theme-button'
import { TvMenu } from '@todovue/tv-menu'
import { TvAlert, useAlert } from '@todovue/tv-alert'
import { TvSettings } from '@todovue/tv-settings'
import { TvButton } from '@todovue/tv-button'
import { TvScrollTop } from '@todovue/tv-scroll-top'
import { TvFooter } from '@todovue/tv-footer'

import GitHubIcon from '~/assets/icons/github.svg'
import GitHubWhiteIcon from '~/assets/icons/github-white.svg'
import TODOvueIcon from '~/assets/icons/TODOvue.svg'

const router = useRouter()
const route = useRoute()

const { api } = useAlert()
const alert = api()

const isDarkMode = ref(false)
const language = ref('es')

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
      id: 1,
      title: t('menu.home'),
      url: '/'
    },
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
  imageMenu: 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183906/icono_git_bvxian.png',
  results: results.value
}))

const handleClickMenu = (menu) => {
  if (menu?.url === '/components') {
    window.open('https://ui.todovue.blog/', '_blank')
    return
  }

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
  isDarkMode.value = value === 'dark'
  if (toButton) {
    alert.info(value === 'dark'
      ? t('menu.theme.dark')
      : t('menu.theme.light')
        , {
      position: 'top-right',
      timeout: 4000
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
    position: 'top-right',
    timeout: 4000
  })
  await blogStore.fetchBlogPosts(true)
  await refreshNuxtData('app-menu-posts')
  language.value = lang
  if (route.path.startsWith('/blog/') && route.params.slug) {
    const currentSlug = String(route.params.slug).replace(/\.(es|en)$/, '')
    const post = await blogStore.getBlogBySlug(currentSlug)

    if (post && post.path) {
      await router.push(post.path)
    }
  }
}

const getRandomPosts = (posts, count = 3) => {
  const shuffled = [...posts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

watchEffect(() => {
  if (!import.meta.client) return
  isDarkMode.value = document.documentElement.classList.contains('dark-mode')
})

const iconUrl = computed(() => {
  return isDarkMode.value ? GitHubWhiteIcon : GitHubIcon
})

const configFooter = computed(() => ({
  brand: {
    logo: 'https://res.cloudinary.com/dcdfhi8qz/image/upload/v1763663056/uqqtkgp1lg3xdplutpga.png',
    url: '/'
  },
  social: [
    {
      label: 'GitHub',
      url: 'https://github.com/TODOvue',
      iconUrl: iconUrl.value
    },
    {
      label: 'TODOvue UI',
      url: 'https://ui.todovue.blog',
      iconUrl: TODOvueIcon
    }
  ],
  navigation: [
    {
      title: t('footer.navigation.title'),
      items: [
        { label: t('footer.navigation.home'), url: '/' },
        { label: t('footer.navigation.blogs'), url: '/blog' },
        { label: t('footer.navigation.components'), url: 'https://ui.todovue.blog' }
      ]
    },
    {
      title: t('home.sections.lastestPosts'),
      items: (posts.value ?? [])
        .filter(post => post.path?.endsWith(`.${locale.value}`))
        .slice(0, 3)
        .map(post => ({
          label: post.title,
          url: post.url ?? post.path
        }))
    },
    {
      title: t('home.sections.lastPost'),
      items: getRandomPosts(
        (posts.value ?? []).filter(post => post.path?.endsWith(`.${locale.value}`)),
        3
      ).map(post => ({
        label: post.title,
        url: post.url ?? post.path
      }))
    },
  ],
  version: '0.1.4',
  legal: [
    { label: 'TODOvue UI', url: 'https://ui.todovue.blog', },
  ],
  copyright: t('footer.copyright', { year: new Date().getFullYear() })
}))

onMounted(() => {
  if (!import.meta.client) return

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const stored = localStorage.getItem('theme')
  const theme = stored || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
  blogStore.fetchBlogPosts()
})

const img = 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183779/todovue_bg_veizqy.png'

useSeoMeta({
  titleTemplate: '%s - TODOvue',
  ogSiteName: 'TODOvue',
  ogType: 'website',
  ogImage: img,
  twitterCard: 'summary_large_image',
  twitterImage: img
})
</script>

<template>
  <div class="menu-container">
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
  </div>
  <div class="settings-container">
    <TvSettings direction="left" :label="t('home.settings.label')">
      <template #default>
        <div class="settings-content">
          <TvThemeButton @change-theme="changeValue" />
          <TvButton
            :aria-label="t('home.settings.language.button.aria')"
            rounded
            @click="changeLanguage(locale === 'es' ? 'en' : 'es')"
          >
            {{ locale === 'es' ? t('home.settings.language.button.en') : t('home.settings.language.button.es') }}
          </TvButton>
        </div>
      </template>
    </TvSettings>
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <TvFooter
    :key="`${isDarkMode}-${language}`"
    :config="configFooter"
  />
  <TvAlert />
  <TvScrollTop />
</template>

<style scoped>
:deep(.tv-menu-image img) {
  width: 40px !important;
  height: 40px !important;
}

.menu-container {
  max-width: 80%;
  margin: 0 auto;
  padding: 1rem 0;
}

.settings-container {
  position: fixed;
  bottom: 40px;
  left: 20px;
  z-index: 1000;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

img {
  max-width: 100%;
  max-height: 450px;
  background-size: cover;
}
</style>
