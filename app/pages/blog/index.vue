<script setup>
const { data: posts } = await useAsyncData('blog-list', async () => {
  try {
    const result = await queryCollection('blog').all()
    console.log('Posts encontrados:', result)
    return result
  } catch (error) {
    console.error('Error al cargar posts:', error)
    return []
  }
})

</script>

<template>
  <section>
    <h1>Blog</h1>

    <ul v-if="posts && posts.length">
      <li
          v-for="post in posts"
          :key="post.id"
      >
        <NuxtLink :to="post.path">
          {{ post.title }}
        </NuxtLink>
        <p>{{ post.description }}</p>
      </li>
    </ul>

    <p v-else>No hay posts todavía.</p>
  </section>
</template>
