import { ref, update, increment, type Database } from 'firebase/database'
import { useNuxtApp } from '#imports'
import type { UseVisitApi } from '@/types/composables'

export const useVisit = (): UseVisitApi => {
  const { $database } = useNuxtApp()
  const database = $database as Database | undefined

  const registerVisit = async (rawSlug: string): Promise<void> => {
    if (!rawSlug) return
    if (!database) return
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
    const postRef = ref(database, `visit/${slug}`)

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
