import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const element = document.querySelector(to.hash)
          if (element) {
            resolve({
              el: to.hash,
              behavior: 'smooth',
              top: 100
            })
          } else {
            resolve({ top: 0, behavior: 'smooth' })
          }
        }, 100)
      })
    }
    return { top: 0, behavior: 'smooth' }
  }
}

