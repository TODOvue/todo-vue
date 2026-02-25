import { computed } from 'vue'
import { useI18n } from '#imports'
import type { ComputedRef } from 'vue'
import type { BlogPost } from '@/types/composables'

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

const normalizeSeriesKey = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const getDateValue = (value: BlogPost['date']): number =>
  new Date(value ?? 0).getTime()

export function useSeriesAggregation(posts: ComputedRef<BlogPost[]>, limit?: number): ComputedRef<SeriesItem[]> {
  const { t } = useI18n()

  return computed(() => {
    const seriesMap = new Map<string, SeriesItem>()

    posts.value.forEach((post) => {
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

    const sorted = Array.from(seriesMap.values()).sort((a, b) => b.latestDate - a.latestDate)
    return limit !== undefined ? sorted.slice(0, limit) : sorted
  })
}
