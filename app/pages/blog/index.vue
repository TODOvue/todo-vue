<script setup>
import { TvCard } from '@todovue/tv-card'
import { TvHero } from '@todovue/tv-hero'
import { TvSidebar } from '@todovue/tv-sidebar'

const router = useRouter()

const { data: posts } = await useAsyncData('blog-list', async () => {
  try {
    return await queryCollection('blog').all()
  } catch (error) {
    console.error('Error al cargar posts:', error)
    return []
  }
})

const configCards = computed(() => {
  if (!posts.value) return []
  return posts.value.map(post => ({
    title: post.title,
    description: post.description,
    id: post.id,
    primaryButtonText: 'Read blog',
    alt: post.title,
    image: post.meta.cover,
    labels: post.tags?.map((tag, index) => ({
      id: index + 1,
      name: typeof tag === 'string' ? tag : tag.tag,
      color: typeof tag === 'object' ? tag.color : undefined
    })) || [],
    path: post.path,
    limitLabels: 10,
  }))
})

const labels = computed(() => {
  const labelMap = new Map()
  posts.value?.forEach(post => {
    post.tags?.forEach(tag => {
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
</script>

<template>
  <main>
    <section>
      <tv-hero
        :config-hero="configHero"
        is-entry
      />
    </section>
    <div class="container">
      <section>
        <div v-if="posts && posts.length" class="container-cards">
          <TvCard
            v-for="post in configCards"
            :key="post.id"
            :config-card="post"
            @click-button="() => handleButton(post.path)"
          />
        </div>
        <p v-else>No hay posts todavía.</p>
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
  margin: 40px auto;
  width: 95%;
  max-width: 1400px;
  gap: 30px;
}

.container-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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
