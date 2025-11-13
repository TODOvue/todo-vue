<script setup>
import TvArticle from '@todovue/tv-article'

const route = useRoute()

const { data: post } = await useAsyncData(
  `blog-${route.params.slug}`,
  async () => {
    const slug = route.params.slug
    if (!slug || typeof slug !== 'string') {
      console.error('Slug inválido:', slug)
      return null
    }

    try {
      const allPosts = await queryCollection('blog').all()
      const result = allPosts.find(p => p.stem === `blog/${slug}`)
      return result || null
    } catch (error) {
      console.error('Error al buscar post:', error)
      return null
    }
  }
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

const articleData = computed(() => ({
  title: post.value.title,
  description: post.value.description,
  date: post.value.date,
  readingTime: post.value.meta?.readingTime,
  tags: post.value.tags,
  cover: post.value.meta?.cover,
  coverAlt: post.value.meta?.coverAlt,
  coverCaption: post.value.meta?.coverCaption,
  body: post.value.body
}));
</script>

<template>
  <div>
    <TvArticle v-if="post" :content="articleData" lang="en" />
  </div>
</template>
