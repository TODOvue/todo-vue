import { useState } from '#imports'
import type { GlobalLoaderApi } from '@/types/composables'

let loaderTimer: ReturnType<typeof setInterval> | null = null
let loaderHideTimer: ReturnType<typeof setTimeout> | null = null

export const useGlobalLoader = (): GlobalLoaderApi => {
  const progress = useState('global-loader-progress', () => 0)
  const isLoading = useState('global-loader-is-loading', () => false)
  const pendingCount = useState('global-loader-pending-count', () => 0)
  const isNavigationLocked = useState('global-loader-navigation-lock', () => false)
  const navigationCount = useState('global-loader-navigation-count', () => 0)

  const stopLoaderTimer = () => {
    if (!loaderTimer) return

    clearInterval(loaderTimer)
    loaderTimer = null
  }

  const clearLoaderHideTimer = () => {
    if (!loaderHideTimer) return

    clearTimeout(loaderHideTimer)
    loaderHideTimer = null
  }

  const syncNavigationState = () => {
    isNavigationLocked.value = navigationCount.value > 0
  }

  const ensureLoader = (restartProgress = false) => {
    clearLoaderHideTimer()
    isLoading.value = true

    if (restartProgress || progress.value <= 0 || progress.value >= 95) {
      progress.value = 12
    }

    stopLoaderTimer()

    loaderTimer = setInterval(() => {
      if (progress.value >= 95) return

      let step: number
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

  const start = () => {
    pendingCount.value += 1
    ensureLoader()
  }

  const finish = () => {
    clearLoaderHideTimer()
    pendingCount.value = Math.max(0, pendingCount.value - 1)
    if (pendingCount.value > 0) return

    progress.value = 100
    stopLoaderTimer()

    loaderHideTimer = setTimeout(() => {
      isLoading.value = false
      progress.value = 0
      loaderHideTimer = null
    }, 500)
  }

  const set = (value: number) => {
    progress.value = value
  }

  const runNavigation = async <T>(task: () => Promise<T> | T): Promise<T | undefined> => {
    navigationCount.value += 1
    syncNavigationState()
    pendingCount.value += 1
    ensureLoader(navigationCount.value > 1)

    try {
      return await task()
    } finally {
      finish()
      navigationCount.value = Math.max(0, navigationCount.value - 1)
      syncNavigationState()
    }
  }

  return {
    progress,
    isLoading,
    isNavigationLocked,
    start,
    finish,
    set,
    runNavigation
  }
}
