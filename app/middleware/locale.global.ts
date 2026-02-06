type SiteLocale = 'es' | 'en'

const LOCALE_COOKIE_KEY = 'todovue-locale'

const isSupportedLocale = (value: unknown): value is SiteLocale => value === 'es' || value === 'en'
const LOCALE_SUFFIX_REGEX = /\.([a-z]{2})$/i
const stripLocaleSuffix = (value: string): string => value.replace(/\.(es|en)$/i, '')
const getLocaleFromSlug = (slug: string): SiteLocale | null => {
  const match = slug.match(LOCALE_SUFFIX_REGEX)
  const locale = match?.[1]?.toLowerCase()
  return isSupportedLocale(locale) ? locale : null
}

const setI18nLocale = async (i18n: ReturnType<typeof useNuxtApp>['$i18n'], locale: SiteLocale): Promise<void> => {
  if (i18n.locale.value === locale) return
  if (typeof (i18n as unknown as { setLocale?: (value: SiteLocale) => Promise<void> | void }).setLocale === 'function') {
    await (i18n as unknown as { setLocale: (value: SiteLocale) => Promise<void> | void }).setLocale(locale)
    return
  }
  i18n.locale.value = locale
}

const blogSlugExistsForLocale = async (baseSlug: string, locale: SiteLocale): Promise<boolean> => {
  try {
    const collection = queryCollection as unknown as (name: string) => { all: () => Promise<Array<{ path?: string; _path?: string }>> }
    const posts = await collection('blog').all()
    return posts.some((post) => {
      const path = post.path ?? post._path ?? ''
      const postSlug = path.split('/').filter(Boolean).pop() ?? ''
      return postSlug.toLowerCase() === `${baseSlug}.${locale}`.toLowerCase()
    })
  } catch (error) {
    console.error('Error validating localized slug in middleware:', error)
    return false
  }
}

const detectFromClient = (): SiteLocale => {
  const browserLanguage = navigator.language || navigator.languages?.[0] || ''
  return browserLanguage.toLowerCase().startsWith('en') ? 'en' : 'es'
}

const detectFromServer = (): SiteLocale => {
  const acceptLanguage = useRequestHeaders(['accept-language'])['accept-language'] ?? ''
  return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'es'
}

export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp()
  const i18n = nuxtApp.$i18n
  const preferredLocale = useCookie<SiteLocale | null>(LOCALE_COOKIE_KEY, {
    default: () => null,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365
  })

  const cookieLocale = preferredLocale.value
  const detectedLocale = import.meta.server ? detectFromServer() : detectFromClient()
  const targetLocale = isSupportedLocale(cookieLocale) ? cookieLocale : detectedLocale

  if (!isSupportedLocale(cookieLocale)) {
    preferredLocale.value = targetLocale
  }

  if (!to.path.startsWith('/blog/')) {
    await setI18nLocale(i18n, targetLocale)
    return
  }

  const rawSlug = Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug
  if (!rawSlug) return
  const normalizedRawSlug = String(rawSlug)
  const routeLocale = getLocaleFromSlug(normalizedRawSlug)

  if (routeLocale) {
    preferredLocale.value = routeLocale
    await setI18nLocale(i18n, routeLocale)
    return
  }

  const baseSlug = stripLocaleSuffix(normalizedRawSlug)
  const localizedSlug = `${baseSlug}.${targetLocale}`
  const targetVariantExists = await blogSlugExistsForLocale(baseSlug, targetLocale)

  if (targetVariantExists) {
    await setI18nLocale(i18n, targetLocale)
    return navigateTo({
      path: `/blog/${localizedSlug}/`,
      query: to.query,
      hash: to.hash
    }, { replace: true, redirectCode: 302 })
  }

  const alternateLocale: SiteLocale = targetLocale === 'es' ? 'en' : 'es'
  const alternateVariantExists = await blogSlugExistsForLocale(baseSlug, alternateLocale)
  if (alternateVariantExists) {
    preferredLocale.value = alternateLocale
    await setI18nLocale(i18n, alternateLocale)
    return navigateTo({
      path: `/blog/${baseSlug}.${alternateLocale}/`,
      query: to.query,
      hash: to.hash
    }, { replace: true, redirectCode: 302 })
  }

  await setI18nLocale(i18n, targetLocale)
})
