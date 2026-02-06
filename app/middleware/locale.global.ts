type SiteLocale = 'es' | 'en'

const LOCALE_COOKIE_KEY = 'todovue-locale'

const isSupportedLocale = (value: unknown): value is SiteLocale => value === 'es' || value === 'en'

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

  if (i18n.locale.value !== targetLocale) {
    if (typeof (i18n as unknown as { setLocale?: (locale: SiteLocale) => Promise<void> | void }).setLocale === 'function') {
      await (i18n as unknown as { setLocale: (locale: SiteLocale) => Promise<void> | void }).setLocale(targetLocale)
    } else {
      i18n.locale.value = targetLocale
    }
  }

  if (!to.path.startsWith('/blog/')) {
    return
  }

  const rawSlug = Array.isArray(to.params.slug) ? to.params.slug[0] : to.params.slug
  if (!rawSlug) return

  const baseSlug = String(rawSlug).replace(/\.(es|en)$/i, '')
  const localizedSlug = `${baseSlug}.${targetLocale}`

  if (String(rawSlug).toLowerCase() === localizedSlug.toLowerCase()) {
    return
  }

  return navigateTo({
    path: `/blog/${localizedSlug}/`,
    query: to.query,
    hash: to.hash
  }, { replace: true, redirectCode: 302 })
})
