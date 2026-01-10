export const FALLBACK_LOCALE = 'en'
const LOCALE_SUFFIX_REGEX = /\.([a-z]{2})(?:\.md)?$/i

const stripLocaleSuffix = (value = '') => value.replace(LOCALE_SUFFIX_REGEX, '')

const extractLocaleFromId = (value = '') => {
  const match = value.match(LOCALE_SUFFIX_REGEX)
  return match?.[1]?.toLowerCase() ?? null
}

export const getDocumentLocale = (doc) => {
  if (!doc || typeof doc !== 'object') return FALLBACK_LOCALE
  if (typeof doc.locale === 'string' && doc.locale.length) return doc.locale
  if (typeof doc.lang === 'string' && doc.lang.length) return doc.lang
  if (typeof doc._locale === 'string' && doc._locale.length) return doc._locale
  const rawId = typeof doc.id === 'string' ? doc.id : typeof doc._id === 'string' ? doc._id : ''
  const locale = extractLocaleFromId(rawId)
  if (locale) return locale
  return FALLBACK_LOCALE
}

export const getDocumentSlug = (doc) => {
  if (!doc || typeof doc !== 'object') return ''
  if (typeof doc.slug === 'string' && doc.slug.length) return doc.slug
  const fromPath = typeof doc.path === 'string' ? doc.path : typeof doc._path === 'string' ? doc._path : typeof doc.stem === 'string' ? doc.stem : typeof doc.id === 'string' ? doc.id : ''
  const lastSegment = fromPath.split('/').pop() ?? ''
  const sanitized = lastSegment.replace(/\.md$/, '')
  if (!sanitized) return ''
  return stripLocaleSuffix(sanitized)
}

export const getLocalizedPosts = (posts, locale, fallback = FALLBACK_LOCALE) => {
  if (!Array.isArray(posts)) return []
  const localized = posts.filter((post) => getDocumentLocale(post) === locale)
  if (localized.length > 0 || locale === fallback) {
    return localized
  }
  return posts.filter((post) => getDocumentLocale(post) === fallback)
}

export const matchesSlug = (post, slug) => getDocumentSlug(post) === slug
