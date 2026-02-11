<script setup lang="ts">
import {
  TvAlert,
  TvButton,
  TvFooter,
  TvMenu,
  TvProgressBar,
  TvScrollTop,
  TvSettings,
  TvThemeButton,
  useAlert,
} from '@todovue/tv-ui'
import type { BlogPost } from '@/types/composables'
import type { FooterPostLink, MenuSelection } from '@/types/views'

import GitHubIcon from '~/assets/icons/github.svg'
import GitHubWhiteIcon from '~/assets/icons/github-white.svg'
import TODOvueIcon from '~/assets/icons/TODOvue.svg'
import CrisDevIcon from '~/assets/icons/CrisDev.png'
import RssIcon from '~/assets/icons/rss.svg'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const { api } = useAlert()
const alert = api()

const VERSION_APP = String(config.public.version ?? '')
const preferredLocale = useCookie<'es' | 'en' | null>('todovue-locale', {
  default: () => null,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 365
})

const { progress, isLoading, start, finish } = useGlobalLoader()

const isDarkMode = ref(false)
const language = ref<'es' | 'en'>('es')

const blogStore = useBlogStore()
const { t, locale, setLocale } = useI18n()

const { data: posts } = await useAsyncData('app-menu-posts', async () => {
  return await blogStore.fetchBlogPosts()
})

const results = computed(() =>
  (posts.value ?? [])
    .map((post, index) => ({
      title: post.title ?? '',
      url: post.path ?? '/',
      id: post.id ?? post._id ?? post._path ?? `${post.path ?? post.title ?? 'post'}-${index}`
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

const getPostUrl = (post: BlogPost): string => {
  if (typeof post.url === 'string') return post.url
  if (typeof post.path === 'string') return post.path
  if (typeof post._path === 'string') return post._path
  return '/'
}

const handleClickMenu = (menu: MenuSelection): void => {
  if (typeof menu !== 'string' && menu?.url === '/components') {
    start()
    window.open('https://ui.todovue.blog/', '_self')
    return
  }

  if (typeof menu === 'string') {
    const query = menu.trim()
    const len = query.length
    if (len === 0) {
      alert.error(t('menu.search.errors.required'), {
        position: 'top-right',
        timeout: 2000,
        title: t('menu.search.errors.title')
      })
      return
    }
    if (len <= 3) {
      alert.error(t('menu.search.errors.minLength'), {
        position: 'top-right',
        timeout: 2000,
        title: t('menu.search.errors.title')
      })
      return
    }
    start()
    void router.push({ path: '/blog', query: { search: query } })
    return
  }

  start()
  void router.push(menu.url)
}

const setTheme = (value: string, toButton = false): void => {
  if (!import.meta.client) return
  document.documentElement.classList.remove('dark-mode', 'light-mode')
  document.documentElement.classList.add(`${value}-mode`)
  localStorage.setItem('theme', value)
  isDarkMode.value = value === 'dark'
  if (toButton) {
    alert.info(value === 'dark'
      ? t('menu.theme.dark')
      : t('menu.theme.light')
        , {
      position: 'top-right',
      timeout: 4000,
      title: t('menu.theme.title')
    })
  }
}

const changeValue = (value: string): void => {
  setTheme(value, true)
}

const changeLanguage = async (lang: 'es' | 'en'): Promise<void> => {
  start()
  try {
    await setLocale(lang)
    preferredLocale.value = lang

    const langName = lang === 'es' ? t('home.settings.language.es') : t('home.settings.language.en')
    alert.info(t('home.settings.language.changed', { lang: langName }), {
      position: 'top-right',
      timeout: 4000,
      title: t('home.settings.language.title')
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
  } finally {
    finish()
  }
}

const getFooterPosts = (items: BlogPost[], count = 3): BlogPost[] => {
  return items.slice(0, count)
}

const footerPosts = useState<FooterPostLink[]>('footer-posts', () => {
  const p = (posts.value ?? []).filter(post => post.path?.endsWith(`.${locale.value}`))
  return getFooterPosts(p, 3).map(post => ({
    label: post.title ?? '',
    url: getPostUrl(post)
  }))
})

watch([locale, posts], () => {
  const p = (posts.value ?? []).filter(post => post.path?.endsWith(`.${locale.value}`))
  footerPosts.value = getFooterPosts(p, 3).map(post => ({
    label: post.title ?? '',
    url: getPostUrl(post)
  }))
})

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
    },
    {
      label: 'CrisDev',
      url: 'https://cris-dev.com',
      iconUrl: CrisDevIcon
    },
    {
      label: 'RSS Feed',
      url: '/rss.xml',
      iconUrl: RssIcon
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
      title: t('footer.otherEntries'),
      items: footerPosts.value
    },
  ],
  version: VERSION_APP,
  legal: [
    { label: 'TODOvue UI', url: 'https://ui.todovue.blog', },
    { label: 'CrisDev', url: 'https://cris-dev.com', },
  ],
  copyright: t('footer.copyright', { year: new Date().getFullYear() }),
  // newsletter: {
  //   title: t('footer.newsletter.title'),
  //   description: t('footer.newsletter.description'),
  //   placeholder: t('footer.newsletter.placeholder'),
  //   button: t('footer.newsletter.button')
  // }
}))

const validateActiveMenu = computed(() => {
  return configMenu.value.menus.find(m => m.url === route.path)?.id ?? 0
})

const handleClickLinks = ({ url }: { url: string }): void => {
  if (url.startsWith('http') || url === '/rss.xml') {
    window.open(url, '_blank')
    return
  }
  start()
  void router.push(url)
}

const handleSubscribe = (email: string): void => {
  try {
    alert.success(t('footer.newsletter.notification.success', { email }), {
      position: 'top-right',
      timeout: 4000,
      title: t('footer.newsletter.notification.title')
    })
  } catch (error) {
    alert.error(t('footer.newsletter.notification.error'), {
      position: 'top-right',
      timeout: 4000,
      title: t('footer.newsletter.notification.title')
    })
  }
}

onMounted(() => {
  if (!import.meta.client) return

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const stored = localStorage.getItem('theme')
  const theme = stored || (prefersDark ? 'dark' : 'light')
  setTheme(theme)
  start()
  blogStore.fetchBlogPosts()
    .finally(() => {
      finish()
    })
})

const img = 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183779/todovue_bg_veizqy.png'

useSeoMeta({
  titleTemplate: '%s',
  ogSiteName: 'TODOvue',
  ogType: 'website',
  ogImage: img,
  twitterCard: 'summary_large_image',
  twitterImage: img
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'TODOvue',
        url: 'https://todovue.blog',
        logo: 'https://res.cloudinary.com/denj4fg7f/image/upload/v1766183906/icono_git_bvxian.png',
        description: 'Tu guía completa para aprender Vue.js desde cero hasta nivel avanzado',
        sameAs: [
          'https://github.com/TODOvue',
          'https://ui.todovue.blog'
        ]
      })
    }
  ]
})
</script>

<template>
  <div>
    <TvProgressBar
      :model-value="progress"
      :disabled="!isLoading"
    />
    <div class="mx-auto w-[95%] max-w-[1400px] py-4">
      <TvMenu
        :menus="configMenu.menus"
        :placeholder="configMenu.placeholder"
        :title-button="configMenu.titleButton"
        :image-menu="configMenu.imageMenu"
        :results="configMenu.results"
        :active-menu="validateActiveMenu"
        :no-results-text="t('menu.search.noResults')"
        @click-image="handleClickMenu({ url: '/' })"
        @click-menu="handleClickMenu"
        @search-menu="handleClickMenu"
      />
    </div>
    <div class="fixed bottom-5 left-10 z-[1000]">
      <TvSettings direction="top" :label="t('home.settings.label')">
        <template #default>
          <div class="flex flex-col items-center gap-4">
            <TvThemeButton square @change-theme="changeValue" />
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

    <slot />

    <TvFooter
      :key="`${isDarkMode}-${language}`"
      :config="configFooter"
      class="mt-16"
      @link-click="handleClickLinks"
      @subscribe="handleSubscribe"
    />
    <TvAlert />
    <TvScrollTop show-on-scroll-up />
  </div>
</template>

<style scoped>
:deep(.tv-menu-image img) {
  width: 40px !important;
  height: 40px !important;
}
</style>
