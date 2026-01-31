export default defineNuxtPlugin((nuxtApp) => {
  const { start, finish } = useGlobalLoader()

  nuxtApp.hook('page:start', () => {
    start()
  })

  nuxtApp.hook('page:finish', () => {
    finish()
  })

  const originalFetch = globalThis.$fetch
  const newFetch = async (...args: any[]) => {
    start()
    try {
      const response = await (originalFetch as any)(...args)
      finish()
      return response
    } catch (error) {
      finish()
      throw error
    }
  }

  Object.assign(newFetch, originalFetch)

  globalThis.$fetch = newFetch as any
})
