export default defineNuxtPlugin((nuxtApp) => {
  const { start, finish } = useGlobalLoader()
  let appMounted = false

  nuxtApp.hook('app:mounted', () => {
    appMounted = true
  })

  nuxtApp.hook('page:start', () => {
    if (!appMounted || nuxtApp.isHydrating) return
    start()
  })

  nuxtApp.hook('page:finish', () => {
    if (!appMounted || nuxtApp.isHydrating) return
    finish()
  })

  nuxtApp.hook('app:error', () => {
    if (!appMounted) return
    finish()
  })
})
