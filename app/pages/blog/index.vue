<script setup>
import { TvCard } from '@todovue/tv-card'

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
    title: post.title?.length > 22 ? post.title.slice(0, 22) + '...' : post.title,
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

const handleButton = (path) => {
  router.push(path)
}
</script>

<template>
  <section>
    <h1>Blog</h1>
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
</template>

<style scoped>
.container-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 5px;
  width: 90%;
  margin: 0 auto;
}
</style>
