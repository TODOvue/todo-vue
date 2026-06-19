import type { ComputedRef, DeepReadonly, Ref } from 'vue'

export type BlogTag = string | { tag?: string; color?: string }

export type BlogLabConfig = {
  title: string
  goal: string
  tasks: string[]
  starterCode?: string
  solutionHint?: string
}

export type BlogPost = {
  id?: string | number
  _id?: string
  _path?: string
  path?: string
  title?: string
  description?: string
  cover?: string
  coverAlt?: string
  coverCaption?: string
  date?: string | number | Date
  updatedAt?: string | Date
  tags?: BlogTag[]
  meta?: {
    cover?: string
    readingTime?: string | number
    coverCaption?: string
    coverAlt?: string
  }
  body?: unknown
  alternate?: Array<BlogPost | string>
  isNew?: boolean
  series?: string
  seriesOrder?: number
  seriesTitle?: string
  seriesDescription?: string
  lab?: BlogLabConfig
  [key: string]: unknown
}

export type CardLabel = {
  id: number
  name: string
  color?: string
}

export type CardConfig = {
  title: string
  description: string
  id: string | number
  primaryButtonText: string
  alt: string
  image: string
  labels: CardLabel[]
  path: string
  limitLabels: number
}

export type VisitCountMap = Record<string, { contador?: number }>

export type LocalizedContentApi = {
  getLocalized: (posts: BlogPost[], currentLocale: string) => BlogPost[]
}

export type RelatedItem = {
  post: BlogPost
  matchCount: number
}

export type GetBlogBySlugOptions = {
  preferredLocale?: 'es' | 'en'
  allowLocaleFallback?: boolean
}

export type PopularItem = {
  id: number
  title: string
  link: string
  isNew: boolean
}

export type PopularConfig = {
  title: string
  list: PopularItem[]
}

export type LabelsConfig = {
  title: string
  labels: CardLabel[]
}

export type GlobalLoaderApi = {
  progress: Ref<number>
  isLoading: Ref<boolean>
  isNavigationLocked: Ref<boolean>
  start: () => void
  finish: () => void
  set: (value: number) => void
  runNavigation: <T>(task: () => Promise<T> | T) => Promise<T | undefined>
}

export type SiteConfigInfo = {
  siteUrl: ComputedRef<string | undefined>
  siteName: ComputedRef<string | undefined>
  siteDescription: ComputedRef<string | undefined>
  siteLocale: ComputedRef<string | undefined>
  isIndexable: ComputedRef<boolean | undefined>
  hasTrailingSlash: ComputedRef<boolean | undefined>
  siteEnv: ComputedRef<string | undefined>
  createSiteUrl: (path: string) => string
  isProduction: ComputedRef<boolean>
}

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

export type BreadcrumbItem = { label: string; href: string }

export type GenerateArticleSchemaOptions = {
  title: string
  description: string
  image?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  url: string
  locale?: string
}

export type SetPageSeoOptions = {
  title?: string
  description?: string
  image?: string
  type?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export type SetBlogPostSeoOptions = {
  title: string
  description: string
  image?: string
  author?: string
  publishedAt?: string | Date
  updatedAt?: string | Date
  tags?: string[]
  url?: string
  locale?: string
  breadcrumbs?: BreadcrumbItem[]
}

export type UseSeoApi = {
  setPageSeo: (options: SetPageSeoOptions) => void
  setBlogPostSeo: (post: SetBlogPostSeoOptions) => void
  generateArticleSchema: (options: GenerateArticleSchemaOptions) => Record<string, unknown>
  generateBreadcrumbSchema: (breadcrumbs: BreadcrumbItem[]) => Record<string, unknown>
}

export type UseVisitApi = {
  registerVisit: (rawSlug: string) => Promise<void>
}

export type UseBlogStoreApi = {
  blogPosts: ComputedRef<BlogPost[]>
  isLoading: DeepReadonly<Ref<boolean>>
  totalPosts: ComputedRef<number>
  fetchBlogPosts: (forceRefresh?: boolean) => Promise<BlogPost[]>
  getBlogBySlug: (slug: string, options?: GetBlogBySlugOptions) => Promise<BlogPost | null>
  fetchVisitCounts: () => Promise<void>
  getCardsConfig: ComputedRef<CardConfig[]>
  getPaginatedCards: (page: number, pageSize: number) => ComputedRef<CardConfig[]>
  getAllLabels: ComputedRef<CardLabel[]>
  getLabelsConfig: ComputedRef<LabelsConfig>
  getMostPopular: ComputedRef<PopularConfig>
  getLatestPosts: ComputedRef<PopularConfig>
  getLastMostViewedPost: ComputedRef<CardConfig | null>
  getPostsByTag: (tagName: string) => ComputedRef<BlogPost[]>
  getRelatedPosts: (currentPost: BlogPost, limit?: number) => CardConfig[]
  postToCardConfig: (post: BlogPost) => CardConfig
}
