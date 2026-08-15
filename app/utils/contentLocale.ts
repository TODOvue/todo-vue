export const FALLBACK_LOCALE = 'en'

const LOCALE_SUFFIX_REGEX = /\.([a-z]{2})(?:\.md)?$/i

type LocalizedDocument = {
  locale?: unknown
  lang?: unknown
  _locale?: unknown
  id?: unknown
  _id?: unknown
  slug?: unknown
  path?: unknown
  _path?: unknown
  stem?: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

const stripLocaleSuffix = (value = ''): string => value.replace(LOCALE_SUFFIX_REGEX, '')

const extractLocaleFromId = (value = ''): string | null => {
  const match = value.match(LOCALE_SUFFIX_REGEX)
  return match?.[1]?.toLowerCase() ?? null
}

export const getDocumentLocale = (doc: unknown): string => {
  if (!isRecord(doc)) return FALLBACK_LOCALE

  const fromLocale = asNonEmptyString((doc as LocalizedDocument).locale)
  if (fromLocale) return fromLocale

  const fromLang = asNonEmptyString((doc as LocalizedDocument).lang)
  if (fromLang) return fromLang

  const fromPrivateLocale = asNonEmptyString((doc as LocalizedDocument)._locale)
  if (fromPrivateLocale) return fromPrivateLocale

  const rawId =
    asNonEmptyString((doc as LocalizedDocument).id) ??
    asNonEmptyString((doc as LocalizedDocument)._id) ??
    ''

  const locale = extractLocaleFromId(rawId)
  return locale ?? FALLBACK_LOCALE
}

export const getDocumentSlug = (doc: unknown): string => {
  if (!isRecord(doc)) return ''

  const explicitSlug = asNonEmptyString((doc as LocalizedDocument).slug)
  if (explicitSlug) return explicitSlug

  const fromPath =
    asNonEmptyString((doc as LocalizedDocument).path) ??
    asNonEmptyString((doc as LocalizedDocument)._path) ??
    asNonEmptyString((doc as LocalizedDocument).stem) ??
    asNonEmptyString((doc as LocalizedDocument).id) ??
    ''

  const lastSegment = fromPath.split('/').pop() ?? ''
  const sanitized = lastSegment.replace(/\.md$/, '')
  if (!sanitized) return ''

  return stripLocaleSuffix(sanitized)
}

export const getLocalizedPosts = <T>(
  posts: readonly T[] | unknown,
  locale: string,
  fallback = FALLBACK_LOCALE
): T[] => {
  if (!Array.isArray(posts)) return []

  const localized = posts.filter((post) => getDocumentLocale(post) === locale)
  if (localized.length > 0 || locale === fallback) {
    return localized
  }

  return posts.filter((post) => getDocumentLocale(post) === fallback)
}

export const matchesSlug = (post: unknown, slug: string): boolean =>
  getDocumentSlug(post) === slug

/**
 * Keep collection payloads small when the content body is not needed.
 * Nuxt Content adds the parsed Markdown AST to `body`; serializing the body
 * for every post makes the generated Nuxt payload unnecessarily large.
 */
export const toBlogListPost = <T extends Record<string, unknown>>(post: T): T => {
  const { body: _body, lab: _lab, ...metadata } = post
  return metadata as T
}
