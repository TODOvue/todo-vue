import { ref } from 'vue'

type NavigateToPath = (path: string) => unknown
type HandleLabelClick<TLabel> = (label: TLabel) => unknown

export interface UseCardNavigationOptions<TLabel> {
  navigateToPath: NavigateToPath
  onLabelClick: HandleLabelClick<TLabel>
}

export interface UseCardNavigationReturn<TLabel> {
  handleCardClick: (event: MouseEvent, path: string) => void
  handleCardKeydown: (event: KeyboardEvent, path: string) => void
  handleCardButtonClick: (path: string) => void
  handleCardLabelClick: (label: TLabel) => void
}

export function useCardNavigation<TLabel>(
  options: UseCardNavigationOptions<TLabel>
): UseCardNavigationReturn<TLabel> {
  const suppressCardNavigation = ref(false)

  const isInteractiveTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false
    return Boolean(target.closest('a, button, input, select, textarea, [role="button"]'))
  }

  const navigate = (path: string): void => {
    void options.navigateToPath(path)
  }

  const handleCardClick = (event: MouseEvent, path: string): void => {
    if (suppressCardNavigation.value) {
      suppressCardNavigation.value = false
      return
    }
    if (isInteractiveTarget(event.target)) return
    navigate(path)
  }

  const handleCardKeydown = (event: KeyboardEvent, path: string): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    navigate(path)
  }

  const handleCardButtonClick = (path: string): void => {
    suppressCardNavigation.value = true
    navigate(path)
    setTimeout(() => {
      suppressCardNavigation.value = false
    }, 0)
  }

  const handleCardLabelClick = (label: TLabel): void => {
    suppressCardNavigation.value = true
    void options.onLabelClick(label)
    setTimeout(() => {
      suppressCardNavigation.value = false
    }, 0)
  }

  return {
    handleCardClick,
    handleCardKeydown,
    handleCardButtonClick,
    handleCardLabelClick,
  }
}
