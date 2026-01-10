import { ref, update, increment } from 'firebase/database'

export const useVisit = () => {
  const { $database } = useNuxtApp()

  const registerVisit = async (rawSlug: string) => {
    if (!rawSlug) return
    const slug = rawSlug.replace(/\.(es|en)$/, '')

    const storageKey = `visited_${slug}`
    const now = Date.now()
    const H24 = 24 * 60 * 60 * 1000

    if (import.meta.client) {
      const lastVisit = localStorage.getItem(storageKey)
      if (lastVisit && (now - parseInt(lastVisit, 10) < H24)) {
        return
      }
    }
    const postRef = ref($database, `visit/${slug}`)

    try {
      await update(postRef, {
        contador: increment(1)
      })

      if (import.meta.client) {
        localStorage.setItem(storageKey, now.toString())
      }
    } catch (error) {
      console.error('Error al registrar visita:', error)
    }
  }

  return {
    registerVisit
  }
}
