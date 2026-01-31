export const useGlobalLoader = () => {
  const progress = useState('global-loader-progress', () => 0)
  const isLoading = useState('global-loader-is-loading', () => false)
  let timer: any = null

  const start = () => {
    isLoading.value = true
    progress.value = 0
    if (timer) clearInterval(timer)

    timer = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 10
      }
    }, 200)
  }

  const finish = () => {
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
