<script setup>
const route = useRoute()
const { setPageSeo } = useSeo()

const componentName = computed(() => {
  const name = route.params.name
  return typeof name === 'string' ? name : ''
})

setPageSeo({
  title: `${componentName.value} - Componente`,
  description: `Documentación y ejemplos del componente ${componentName.value} de TODOvue`
})
</script>

<template>
  <h1>Name component</h1>
</template>

<style scoped>

</style>
