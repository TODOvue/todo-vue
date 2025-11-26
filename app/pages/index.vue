<script setup>
import { TvHero } from '@todovue/tv-hero'
import { TvCard } from '@todovue/tv-card'
import { TvButton } from '@todovue/tv-button'
import { TvLabel } from '@todovue/tv-label'

const router = useRouter()
const blogStore = useBlogStore()

const configHero = {
  alt: 'TODOvue Logo',
  button: 'View all blogs',
  description: 'Introducing my Vue.js blog! Get ready to dive into the world of Vue.js and discover how this powerful JavaScript framework can help you build beautiful and dynamic user interfaces for your web applications.',
  image: 'https://firebasestorage.googleapis.com/v0/b/todovue-blog.appspot.com/o/icono_git.png?alt=media&token=86270c30-8235-4424-b72b-7a585f228685',
  title: 'TODOvue Blog',
  buttonSecondary: 'View components'
}

const navigateTo = (path) => {
  router.push(path)
}

await useAsyncData('index-home-blogs', async () => {
  return await blogStore.fetchBlogPosts()
})

const lastBlogPosts = blogStore.getLastMostViewedPost

const latestPosts = computed(() => {
  const allCards = blogStore.getCardsConfig.value
  return allCards.slice(1, 5)
})

const popularCategories = computed(() => {
  const allLabels = blogStore.getAllLabels.value
  return {
    title: 'Popular Categories',
    labels: allLabels.slice(0, 10)
  }
})

const handleCategoryClick = (category) => {
  console.log('Category clicked:', category)
}

useSeoMeta({
  title: 'Home',
  description: 'Introducing my Vue.js blog! Get ready to dive into the world of Vue.js and discover how this powerful JavaScript framework can help you build beautiful and dynamic user interfaces for your web applications.',
  ogTitle: 'Home - TODOvue',
  ogDescription: 'Introducing my Vue.js blog! Get ready to dive into the world of Vue.js and discover how this powerful JavaScript framework can help you build beautiful and dynamic user interfaces for your web applications.',
  twitterTitle: 'Home - TODOvue',
  twitterDescription: 'Introducing my Vue.js blog! Get ready to dive into the world of Vue.js and discover how this powerful JavaScript framework can help you build beautiful and dynamic user interfaces for your web applications.'
});
</script>

<template>
  <section>
    <TvHero
      :config-hero="configHero"
      @click-button="navigateTo('/blog')"
      @click-secondary-button="navigateTo('/components')"
    />

    <div class="main-container">
      <div class="section-header">
        <h2 class="section-title">Latest Post</h2>
      </div>
      <TvCard
        v-if="lastBlogPosts"
        :config-card="lastBlogPosts"
        is-horizontal
        @click-button="navigateTo(lastBlogPosts.path)"
      />
    </div>

    <div class="main-container">
      <div class="section-header">
        <h2 class="section-title">Latest Posts</h2>
      </div>
      <div v-if="latestPosts.length > 0" class="posts-grid">
        <TvCard
          v-for="post in latestPosts"
          :key="post.id"
          :config-card="post"
          @click-button="navigateTo(post.path)"
        />
      </div>
      <div class="see-all-container">
        <TvButton
          rounded
          large
          @click="navigateTo('/blog')"
        >
          See all posts
        </TvButton>
      </div>
    </div>

    <div class="main-container">
      <div class="section-header">
        <h2 class="section-title">Popular Categories</h2>
      </div>
      <div v-if="popularCategories.labels.length > 0" class="categories-container">
        <div class="labels-grid">
          <TvLabel
            v-for="label in popularCategories.labels"
            :key="label.id"
            :text-label="label.name"
            :color="label.color"
            @click="handleCategoryClick(label)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
img {
  max-width: 200px !important;
}

.section-header {
  margin-bottom: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-text);
  margin: 0;
  position: relative;
  display: inline-block;
}

.light-mode .section-title {
  color: var(--light-text);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 4px;
  background: var(--dark-card-bg);
  border-radius: 2px;
}

.light-mode .section-title::after {
  background: var(--light-card-bg);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.see-all-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.categories-container {
  max-width: 100%;
}

.labels-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-header {
    margin-bottom: 20px;
  }
}
</style>
