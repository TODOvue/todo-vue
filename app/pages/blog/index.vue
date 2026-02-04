<script setup>
import {
  TvBreadcrumbs,
  TvCard,
  TvHero,
  TvLabel,
  TvPagination,
  TvSidebar,
} from '@todovue/tv-ui'

import IconGrid from '~/assets/icons/IconGrid.vue'
import IconList from '~/assets/icons/IconList.vue'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const { t } = useI18n()
const pageSize = 6
const filters = ref(null)
const labelFilters = ref(null)

const currentPage = ref(parseInt(String(route.query.page || '1')) || 1)

const isHorizontalView = ref(false)

onMounted(() => {
  const savedView = localStorage.getItem('blog-view-preference')
  if (savedView === 'horizontal') {
    isHorizontalView.value = true
  } else if (savedView === 'grid') {
    isHorizontalView.value = false
  }
})

await useAsyncData('blog-index-posts', async () => {
  return await blogStore.fetchBlogPosts()
})

const safePosts = computed(() => {
  let posts = blogStore.blogPosts.value || []

  if (route.query.search) {
    const query = String(route.query.search).toLowerCase()
    posts = posts.filter(post => {
      const title = (post.title ?? '').toLowerCase()
      const description = (post.description ?? '').toLowerCase()
      return title.includes(query) || description.includes(query)
    })
  }

  if (route.query.label) {
    const label = String(route.query.label)
    posts = posts.filter(post => {
      if (!Array.isArray(post.tags)) return false
      return post.tags.some(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.tag
        return tagName === label
      })
    })
  }

  return posts
})

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return safePosts.value.slice(start, end)
})

const configCards = computed(() =>
  paginatedPosts.value.map((post) => blogStore.postToCardConfig(post))
)

const renderLabels = blogStore.getLabelsConfig

const renderMostPopular = blogStore.getMostPopular

const handleSidebar = (label) => {
  if (label) {
    const labelValue = label.name || label.tag
    if (labelValue) {
      labelFilters.value = {
        name: labelValue,
        color: label.color,
        id: label.id
      }
      router.push({ query: { ...route.query, label: labelValue, page: '1' } })
    }
  }
}

const handleLinkBlog = (blog) => {
  router.push(blog.link)
}

const configHero = computed(() => ({
  description: t('blogs.hero.description'),
  title: t('blogs.hero.title'),
}))

const handleButton = (path) => {
  router.push(path)
}

const toggleView = () => {
  isHorizontalView.value = !isHorizontalView.value
  localStorage.setItem('blog-view-preference', isHorizontalView.value ? 'horizontal' : 'grid')
}

const filtersPage = () => {
  if (route.query.search) {
    filters.value.push({
      id: route.query.search,
      name: route.query.search,
      color: '#2196F3',
    })
  }
  if (route.query.label) {
    const label = labelFilters.value
    filters.value.push({
      id: label?.id || route.query.label,
      name: label?.name || route.query.label,
      color: label?.color || '#4CAF50',
    })
  }
}

const removeFilter = (filterId) => {
  const query = { ...route.query }

  if (query.search === filterId) delete query.search
  if (query.label === filterId) {
    labelFilters.value = {}
    delete query.label
  }

  query.page = '1'
  router.push({ query })
}

watch(
  () => route.query,
  () => {
    currentPage.value = parseInt(String(route.query.page || '1')) || 1
    filters.value = []
    filtersPage()
  },
  { immediate: true }
)

watch(currentPage, (newPage) => {
  router.push({
    query: { ...route.query, page: newPage.toString() }
  })

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
})

watch(() => route.query.page, (newPageQuery) => {
  const pageNum = parseInt(String(newPageQuery || '1')) || 1
  if (pageNum !== currentPage.value) {
    currentPage.value = pageNum
  }
})

const { setPageSeo } = useSeo()

setPageSeo({
  title: t('seo.blogs.title'),
  description: t('seo.blogs.description')
})
</script>

<template>
  <main>
    <section>
      <TvHero
        :config-hero="configHero"
        is-entry
      />
      <div class="container-main">
        <TvBreadcrumbs auto-generate />
        <div class="mt-5 flex flex-wrap gap-2.5">
          <TvLabel
            v-for="filter in filters"
            :key="filter.id"
            :text-label="filter.name"
            is-remove
            :color="filter.color"
            icon-position="left"
            size="sm"
            @click-label="removeFilter(filter.name)"
          />
        </div>
      </div>
    </section>

    <div
      class="container-main grid grid-cols-1 gap-5 lg:grid-cols-[1fr_350px] lg:gap-[30px]"
    >
      <section>
        <div class="mb-5 flex justify-center sm:justify-end">
          <button
            :aria-label="isHorizontalView ? t('blogs.switch.gridAria') : t('blogs.switch.listAria')"
            class="flex items-center gap-2 rounded-lg border-0 bg-light-card-bg dark:bg-dark-card-bg px-5 py-2.5 text-sm font-medium text-text shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow"
            @click="toggleView"
          >
            <span class="[&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px]">
              <IconGrid v-if="!isHorizontalView" />
              <IconList v-else />
            </span>
            <span class="text-sm">{{ isHorizontalView ? t('blogs.switch.grid') : t('blogs.switch.list') }}</span>
          </button>
        </div>

        <div
          v-if="configCards.length"
          :class="[
            isHorizontalView
              ? 'grid grid-cols-1 gap-px'
              : 'grid grid-cols-1 gap-[15px] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] lg:gap-5'
          ]"
        >
          <TvCard
            v-for="post in configCards"
            :key="post.id"
            :is-horizontal="isHorizontalView"
            :config-card="post"
            @click-button="handleButton(post.path)"
            @click-label="handleSidebar"
          />
        </div>
        <p v-else>{{ t('blogs.empty') }}</p>

        <ClientOnly>
          <div v-if="safePosts.length > pageSize" class="mt-10 flex justify-center">
            <TvPagination
              v-model="currentPage"
              :total-items="safePosts.length"
              :page-size="pageSize"
              show-icons
              :show-first-last="false"
            />
          </div>
        </ClientOnly>
      </section>

      <section class="static flex flex-col gap-10 lg:sticky lg:top-5 lg:h-fit">
        <TvSidebar
          :data="renderMostPopular"
          @click="handleLinkBlog"
        />
        <TvSidebar
          searchable
          :search-placeholder="t('blogs.sidebar.searchPlaceholder')"
          :new-label-text="t('blogs.sidebar.newLabelText')"
          is-label
          :data="renderLabels"
          @click="handleSidebar"
        />
      </section>
    </div>
  </main>
</template>
