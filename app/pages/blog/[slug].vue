<script setup>
import { TvArticle } from '@todovue/tv-article'
import { TvBreadcrumbs } from '@todovue/tv-breadcrumbs'
import { TvHero } from '@todovue/tv-hero'
import { TvToc } from '@todovue/tv-toc'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const { locale } = useI18n()

if (!route.path.endsWith('/')) {
  await navigateTo(`${route.path}/${route.fullPath.includes('?') ? route.fullPath.slice(route.fullPath.indexOf('?')) : ''}`, {
    redirectCode: 301,
    replace: true
  })
}

const dataKey = computed(() => `blog-${route.params.slug}-${locale.value}`)

const { data: post } = await useAsyncData(
  dataKey,
  async () => {
    const slug = route.params.slug
    if (!slug || typeof slug !== 'string') {
      console.error('Slug not found:', slug)
      return null
    }

    try {
      return await blogStore.getBlogBySlug(slug)
    } catch (error) {
      console.error('Error searching for post:', error)
      return null
    }
  },
  {
    watch: [() => locale.value]
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
}))

const tocData = computed(() => post.value.body?.toc ?? null)
const hasToc = computed(() => {
  const toc = tocData.value
  return Boolean(toc && Array.isArray(toc.links) && toc.links.length > 0)
})

const configHero = {
  description: post.value.description,
  title: post.value.title,
  image: post.value.meta?.cover,
  alt: post.value.meta?.coverAlt
}

const breadcrumbs = computed(() => [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: post.value.title, href: route.path }
])

const ogImage = computed(() => {
  const cover = post.value.meta?.cover
  if (!cover) return '/default-og-image.png'
  if (cover.startsWith('http')) return cover
  return cover
})

const handleLabelClick = (label) => {
  if (label && label.tag) {
    router.push({
      name: 'blog',
      query: { label: label.tag, page: '1' }
    })
  }
}

const { setBlogPostSeo } = useSeo()

setBlogPostSeo({
  title: post.value.title,
  description: post.value.description,
  image: ogImage.value,
  author: 'TODOvue',
  publishedAt: post.value.date,
  updatedAt: post.value.date,
  tags: post.value.tags?.map(tag => typeof tag === 'string' ? tag : tag.tag) || []
})

onMounted(() => {
  if (route.hash) {
    nextTick(() => {
      setTimeout(() => {
        const element = document.querySelector(route.hash)
        if (element) {
          const offset = 100
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 300)
    })
  }
})
</script>

<template>
  <main>
    <TvHero
      :config-hero="configHero"
      is-entry
    />
    <div class="main-container">
      <TvBreadcrumbs
        :items="breadcrumbs"
      />
    </div>
    <section
      v-if="post"
      class="main-container blog-reading-zone"
    >
      <client-only>
        <aside
          v-if="hasToc"
          class="blog-reading-zone__toc"
        >
          <div class="blog-reading-zone__toc-inner">
            <TvToc :toc="tocData" />
          </div>
        </aside>
      </client-only>
      <div class="blog-reading-zone__article">
        <TvArticle
          :content="articleData"
          :lang="locale"
          @label-click="handleLabelClick"
        />
      </div>
    </section>
  </main>
</template>

<style scoped>
:deep(.tv-article) {
  padding: 0 !important;
}

.blog-reading-zone {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 0;
}

.blog-reading-zone__article {
  min-width: 0;
}

.blog-reading-zone__toc {
  border-top: 1px solid rgba(148, 163, 184, 0.4);
  padding-top: 1.5rem;
}

.blog-reading-zone__toc-inner {
  position: sticky;
  top: 20px;
}

@media (min-width: 992px) {
  .blog-reading-zone {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 3rem;
  }

  .blog-reading-zone__article {
    order: 1;
  }

  .blog-reading-zone__toc {
    order: 2;
    border-top: none;
    padding-top: 0;
  }

  .blog-reading-zone__toc-inner {
    overflow: auto;
    padding-left: 1.5rem;
    border-left: 1px solid rgba(148, 163, 184, 0.3);
  }
}
</style>
