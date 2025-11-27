<script setup>
import { TvCard } from '@todovue/tv-card'
import { TvHero } from '@todovue/tv-hero'
import { TvSidebar } from '@todovue/tv-sidebar'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'
import { TvPagination } from '@todovue/tv-pagination'
import IconGrid from '~/assets/icons/IconGrid.vue'
import IconList from '~/assets/icons/IconList.vue'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const { t } = useI18n()
const pageSize = 6 // Change later to make it configurable

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

const safePosts = blogStore.blogPosts

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

const handleSidebar = (path) => {
  console.log('Clicked sidebar link:', path)
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

watch(currentPage, (newPage) => {
  router.push({
    query: { page: newPage.toString() }
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

useSeoMeta({
  title: () => t('seo.blogs.title'),
  description: () => t('seo.blogs.description'),
  ogTitle: () => t('seo.blogs.title'),
  ogDescription: () => t('seo.blogs.description'),
  twitterTitle: () => t('seo.blogs.title'),
  twitterDescription: () => t('seo.blogs.description')
})
</script>

<template>
  <main>
    <section>
      <TvHero
        :config-hero="configHero"
        is-entry
      />
      <div class="main-container">
       <TvBreadcrumbs
         auto-generate
       />
      </div>
    </section>
    <div class="container main-container">
      <section>
        <div class="view-toggle-container">
          <button
            :aria-label="isHorizontalView ? t('blogs.switch.gridAria') : t('blogs.switch.listAria')"
            class="view-toggle-btn"
            @click="toggleView"
          >
            <IconGrid v-if="!isHorizontalView" />
            <IconList v-else />
            <span>{{ isHorizontalView ? t('blogs.switch.grid') : t('blogs.switch.list') }}</span>
          </button>
        </div>
        <div v-if="configCards.length" class="container-cards" :class="{ 'horizontal': isHorizontalView }">
          <TvCard
            v-for="post in configCards"
            :key="post.id"
            :is-horizontal="isHorizontalView"
            :config-card="post"
            @click-button="handleButton(post.path)"
          />
        </div>
        <p v-else>{{ t('blogs.empty') }}</p>
        <div v-if="safePosts.length > pageSize" class="pagination-container">
          <TvPagination
            v-model="currentPage"
            :total-items="safePosts.length"
            :page-size="pageSize"
            :show-icons="true"
          />
        </div>
      </section>
      <section class="container-sidebar">
        <TvSidebar
          :data="renderMostPopular"
          @click="handleLinkBlog"
        />
        <TvSidebar
          is-label
          :data="renderLabels"
          @click-label="handleSidebar"
        />
      </section>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

.view-toggle-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--dark-card-bg);
  color: var(--dark-text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(var(--dark-card-bg), 0.4);
}

.light-mode {
  .view-toggle-btn {
    background: var(--light-card-bg);
    color: var(--light-text);
    box-shadow: 0 2px 8px rgba(var(--light-card-bg), 0.4);
  }
}

.view-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}

.view-toggle-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-toggle-btn svg {
  width: 20px;
  height: 20px;
}

.container-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.container-cards.horizontal {
  grid-template-columns: 1fr;
  gap: 1px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.container-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
  gap: 50px;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }

  .container-sidebar {
    position: static;
    max-width: 100vw;
  }
}

@media (max-width: 640px) {
  .container {
    width: 100%;
    padding: 0 15px;
    margin: 20px auto;
    gap: 20px;
  }

  .container-cards {
    grid-template-columns: 1fr;
    gap: 15px;
    justify-items: center;
  }

  .view-toggle-container {
    justify-content: center;
  }

  .view-toggle-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .view-toggle-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>
