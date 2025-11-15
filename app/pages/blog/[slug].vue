<script setup>
import { TvArticle } from '@todovue/tv-article'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'
import { TvHero } from "@todovue/tv-hero";

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
  date: post.value.date,
  readingTime: post.value.meta?.readingTime,
  tags: post.value.tags,
  coverCaption: post.value.meta?.coverCaption,
  body: post.value.body
}));

const configHero = {
  description: post.value.description,
  title: post.value.title,
  image: post.value.meta?.cover,
  alt: post.value.meta?.coverAlt,
};
</script>

<template>
  <main>
    <ClientOnly>
      <TvHero
        :config-hero="configHero"
        is-entry
      />
    </ClientOnly>
    <div class="main-container">
      <ClientOnly>
        <TvBreadcrumbs
          auto-generate
        />
      </ClientOnly>
    </div>
    <ClientOnly>
      <TvArticle v-if="post" :content="articleData" lang="en" />
    </ClientOnly>
  </main>
</template>
