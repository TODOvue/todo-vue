export default defineNuxtPlugin((nuxtApp) => {
  const { start, finish } = useGlobalLoader()

  nuxtApp.hook('page:start', () => {
    start()
  })

  nuxtApp.hook('page:finish', () => {
    finish()
  })

  const originalFetch = globalThis.$fetch
  const newFetch = Object.assign(
    async (...args: Parameters<typeof originalFetch>) => {
      start()
      try {
        const response = await originalFetch(...args)
        finish()
        return response
      } catch (error) {
        finish()
        if (error instanceof Error) {
          throw error
        }
        throw new Error(error == null ? 'Unknown fetch error' : String(error))
      }
    },
    originalFetch
  )

  globalThis.$fetch = newFetch as typeof globalThis.$fetch
})
