import type { BlogPost, CardConfig } from '@/types/composables'

export type SeriesItem = {
  slug: string
  title: string
  description: string
  path: string
  cover: string
  coverAlt: string
  chapters: number
  latestDate: number
  firstOrder: number
}

export function useSeriesAggregation(limit?: number) {
  const { t } = useI18n()
  const blogStore = useBlogStore()

  const normalizeSeriesKey = (value: unknown): string =>
    typeof value === 'string' ? value.trim().toLowerCase() : ''

  const getDateValue = (value: BlogPost['date']): number => new Date(value ?? 0).getTime()

  const seriesList = computed<SeriesItem[]>(() => {
    const seriesMap = new Map<string, SeriesItem>()

    blogStore.blogPosts.value.forEach((post) => {
      const seriesSlug = normalizeSeriesKey(post.series)
      if (!seriesSlug) return

      const existing = seriesMap.get(seriesSlug)
      const postDate = getDateValue(post.date)
      const postTitle = typeof post.seriesTitle === 'string' && post.seriesTitle.trim()
        ? post.seriesTitle
        : t('blogs.series.defaultTitle')
      const postDescription = typeof post.seriesDescription === 'string' && post.seriesDescription.trim()
        ? post.seriesDescription
        : t('blogs.series.defaultDescription')
      const postPath = `/series/${seriesSlug}/`

      if (!existing) {
        const initialOrder = typeof post.seriesOrder === 'number' ? post.seriesOrder : Number.MAX_SAFE_INTEGER
        seriesMap.set(seriesSlug, {
          slug: seriesSlug,
          title: postTitle,
          description: postDescription,
          path: postPath,
          cover: post.meta?.cover ?? '',
          coverAlt: post.meta?.coverAlt ?? postTitle,
          chapters: 1,
          latestDate: postDate,
          firstOrder: initialOrder
        })
        return
      }

      existing.chapters += 1
      if (postDate > existing.latestDate) {
        existing.latestDate = postDate
      }

      const currentOrder = typeof post.seriesOrder === 'number' ? post.seriesOrder : Number.MAX_SAFE_INTEGER
      if (currentOrder <= existing.firstOrder && post.meta?.cover) {
        existing.firstOrder = currentOrder
        existing.cover = post.meta.cover
        existing.coverAlt = post.meta?.coverAlt ?? postTitle
      }
    })

    const sorted = Array.from(seriesMap.values()).sort((first, second) => second.latestDate - first.latestDate)
    return limit !== undefined ? sorted.slice(0, limit) : sorted
  })

  const seriesCards = computed<CardConfig[]>(() =>
    seriesList.value.map((series, index) => ({
      title: series.title,
      description: series.description,
      id: `series-${series.slug}-${index + 1}`,
      primaryButtonText: t('home.series.readSeries'),
      alt: series.coverAlt,
      image: series.cover,
      labels: [{
        id: index + 1,
        name: t('home.series.parts', { count: series.chapters }),
        color: '#1D5BA1'
      }],
      path: series.path,
      limitLabels: 1
    }))
  )

  return { seriesList, seriesCards }
}
