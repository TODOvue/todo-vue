import { queryCollection } from '@nuxt/content/server'
import type { H3Event } from 'h3'

const DEFAULT_FEED_IMAGE = '/default-og-image.png'

const FEED_CONFIG = {
  es: {
    title: 'TODOvue Blog',
    description: 'Tu guia completa para aprender Vue.js desde cero hasta nivel avanzado',
    language: 'es',
    path: '/rss.xml'
  },
  en: {
    title: 'TODOvue Blog (English)',
    description: 'Your complete guide to learning Vue.js from beginner to advanced level',
    language: 'en',
    path: '/rss.en.xml'
  }
} as const

type FeedLocale = keyof typeof FEED_CONFIG

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toAbsoluteUrl(siteUrl: string, value?: string | null) {
  if (!value) return null

  try {
    return new URL(value, siteUrl).toString()
  } catch {
    return null
  }
}

export async function buildRssFeed(event: H3Event, locale: FeedLocale) {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://todovue.blog'
  const feed = FEED_CONFIG[locale]
  const feedImage = toAbsoluteUrl(siteUrl, DEFAULT_FEED_IMAGE) || `${siteUrl}${DEFAULT_FEED_IMAGE}`

  const docs = (await queryCollection(event, 'blog').all())
    .filter(doc => doc.draft !== true && (doc.locale || 'es') === locale)
    .sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime()
      const dateB = new Date(b.date || 0).getTime()
      return dateB - dateA
    })

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>${feed.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}${feed.path}`)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${escapeXml(feedImage)}</url>
      <title>${escapeXml(feed.title)}</title>
      <link>${escapeXml(siteUrl)}</link>
    </image>
    ${docs.map((doc) => {
      const link = `${siteUrl}${doc.path}`
      const safeDate = doc.date ? new Date(doc.date) : new Date()
      const cover = toAbsoluteUrl(siteUrl, doc.cover)
      const coverAlt = doc.coverAlt || doc.title

      return `
    <item>
      <title><![CDATA[${doc.title}]]></title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${safeDate.toUTCString()}</pubDate>
      <description><![CDATA[${doc.description || ''}]]></description>
      ${cover ? `<media:content url="${escapeXml(cover)}" medium="image" />
      <media:title><![CDATA[${coverAlt}]]></media:title>` : ''}
    </item>`
    }).join('')}
  </channel>
</rss>`
}
