<script setup>
const { data: latestPosts } = await useAsyncData('home-latest-posts', () =>
  queryCollection('/blog').sort({ date: -1 }).limit(3).find()
)
</script>

<template>
  <section>
    <h1>TODOvue · Blog & Components</h1>

    <h2>
      Last articles
    </h2>
    <ul v-if="latestPosts?.length">
      <li v-for="post in latestPosts" :key="post._path">
        <NuxtLink :to="post._path">
          {{ post.title }}
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink to="/blog">
      View all articles
    </NuxtLink>
  </section>
</template>
