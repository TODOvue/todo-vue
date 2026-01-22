import { queryCollection } from '@nuxt/content/server'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://todovue.blog'

  const docs = await queryCollection(event, 'blog').all()

  docs.sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime()
    const dateB = new Date(b.date || 0).getTime()
    return dateB - dateA
  })

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TODOvue Blog</title>
    <link>${siteUrl}</link>
    <description>Tu guía completa para aprender Vue.js desde cero hasta nivel avanzado</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${docs.map(doc => {
    const link = `${siteUrl}${doc.path}`
    const safeDate = doc.date ? new Date(doc.date) : new Date()
    return `
    <item>
      <title><![CDATA[${doc.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${safeDate.toUTCString()}</pubDate>
      <description><![CDATA[${doc.description || ''}]]></description>
    </item>`
  }).join('')}
  </channel>
</rss>`

  setResponseHeader(event, 'Content-Type', 'application/xml')

  return feed
})
