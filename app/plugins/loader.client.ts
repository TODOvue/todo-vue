export default defineNuxtPlugin((nuxtApp) => {
  const { start, finish } = useGlobalLoader()
  const router = useRouter()

  router.beforeEach(() => {
    start()
  })

  router.afterEach(() => {
    finish()
  })

  nuxtApp.hook('page:start', () => {
    start()
  })

  nuxtApp.hook('page:finish', () => {
    finish()
  })
})
