import { useState } from '#imports'
import type { GlobalLoaderApi } from '@/types/composables'

export const useGlobalLoader = (): GlobalLoaderApi => {
  const progress = useState('global-loader-progress', () => 0)
  const isLoading = useState('global-loader-is-loading', () => false)
  const pendingCount = useState('global-loader-pending-count', () => 0)
  let timer: ReturnType<typeof setInterval> | null = null

  const start = () => {
    pendingCount.value += 1
    if (isLoading.value) return

    isLoading.value = true
    progress.value = 12
    if (timer) clearInterval(timer)

    timer = setInterval(() => {
      if (progress.value >= 95) return

      let step = 0
      if (progress.value < 60) {
        step = 8 + Math.random() * 6
      } else if (progress.value < 80) {
        step = 3 + Math.random() * 4
      } else if (progress.value < 90) {
        step = 1 + Math.random() * 2
      } else {
        step = 0.3 + Math.random() * 0.8
      }

      progress.value = Math.min(95, progress.value + step)
    }, 120)
  }

  const finish = () => {
    pendingCount.value = Math.max(0, pendingCount.value - 1)
    if (pendingCount.value > 0) return

    progress.value = 100
    if (timer) clearInterval(timer)

    setTimeout(() => {
      isLoading.value = false
      progress.value = 0
    }, 500)
  }

  const set = (value: number) => {
    progress.value = value
  }

  return {
    progress,
    isLoading,
    start,
    finish,
    set
  }
}
