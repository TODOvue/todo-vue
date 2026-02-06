export default defineNuxtPlugin((nuxtApp) => {
  const { start, finish } = useGlobalLoader()

  nuxtApp.hook('page:start', () => {
    start()
  })

  nuxtApp.hook('page:finish', () => {
    finish()
  })
})
