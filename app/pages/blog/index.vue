<script setup>
import { TvCard } from '@todovue/tv-card'
import { TvHero } from '@todovue/tv-hero'
import { TvSidebar } from '@todovue/tv-sidebar'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'
import { TvPagination } from '@todovue/tv-pagination'

const router = useRouter()
const route = useRoute()
const pageSize = 3 // Change later to make it configurable

const currentPage = ref(parseInt(String(route.query.page || '1')) || 1)

const { data: posts } = await useAsyncData('blog-index-posts', async () => {
  try {
    return await queryCollection('blog').all()
  } catch (error) {
    console.error('Error loading posts:', error)
    return []
  }
})

const safePosts = computed(() => Array.isArray(posts.value) ? posts.value : [])

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return safePosts.value.slice(start, end)
})

const configCards = computed(() =>
  paginatedPosts.value.map((post) => ({
    title: post.title ?? 'Untitled post',
    description: post.description ?? '',
    id: post.id ?? post._id ?? post._path,
    primaryButtonText: 'Read blog',
    alt: post.title ?? 'Blog cover',
    image: post.meta?.cover ?? '',
    labels: Array.isArray(post.tags)
      ? post.tags.map((tag, index) => ({
        id: index + 1,
        name: typeof tag === 'string' ? tag : tag.tag,
        color: typeof tag === 'object' ? tag.color : undefined,
      }))
      : [],
    path: post.path ?? post._path ?? '/',
    limitLabels: 10,
  }))
)

const labels = computed(() => {
  const labelMap = new Map()
  safePosts.value.forEach((post) => {
    if (!Array.isArray(post.tags)) return
    post.tags.forEach((tag) => {
      const tagName = typeof tag === 'string' ? tag : tag.tag
      const tagColor = typeof tag === 'object' ? tag.color : undefined
      const current = labelMap.get(tagName)
      if (!current) {
        labelMap.set(tagName, { name: tagName, color: tagColor })
      } else if (!current.color && tagColor) {
        labelMap.set(tagName, { ...current, color: tagColor })
      }
    })
  })
  return Array.from(labelMap.values()).map((item, index) => ({
    id: index + 1,
    name: item.name,
    color: item.color,
  }))
})

const renderLabels = computed(() => ({
  title: 'Blog Labels',
  labels: labels?.value ?? [],
}))

const renderMostPopular = computed(() => {
  const sortedPosts = [...(posts.value || [])].sort((a, b) => (b.views || 0) - (a.views || 0))
  return {
    title: 'Most Popular Blogs',
    list: sortedPosts.slice(0, 5).map((post, index) => ({
      id: index + 1,
      title: post.title,
      link: post.path,
    })),
  }
})

const handleSidebar = (path) => {
  console.log('Clicked sidebar link:', path)
}

const handleLinkBlog = (blog) => {
  router.push(blog.link)
}

const configHero = {
  description: "Discover the latest articles, tutorials, and insights from the TODOvue community. Stay updated with our blog for tips, best practices, and news about Vue.js and web development.",
  title: "TODOvue Blogs",
};

const handleButton = (path) => {
  router.push(path)
}

watch(currentPage, (newPage) => {
  router.push({
    query: { page: newPage.toString() }
  })
})

watch(() => route.query.page, (newPageQuery) => {
  const pageNum = parseInt(String(newPageQuery || '1')) || 1
  if (pageNum !== currentPage.value) {
    currentPage.value = pageNum
  }
})

useSeoMeta({
  title: 'Blog',
  description: 'Discover the latest articles, tutorials, and insights from the TODOvue community. Stay updated with our blog for tips, best practices, and news about Vue.js and web development.',
  ogTitle: 'Blog - TODOvue',
  ogDescription: 'Discover the latest articles, tutorials, and insights from the TODOvue community. Stay updated with our blog for tips, best practices, and news about Vue.js and web development.',
  twitterTitle: 'Blog - TODOvue',
  twitterDescription: 'Discover the latest articles, tutorials, and insights from the TODOvue community. Stay updated with our blog for tips, best practices, and news about Vue.js and web development.'
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
        <div v-if="configCards.length" class="container-cards">
          <TvCard
            v-for="post in configCards"
            :key="post.id"
            :config-card="post"
            @click-button="handleButton(post.path)"
          />
        </div>
        <p v-else>No posts found</p>
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

.container-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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
  }
}
</style>
