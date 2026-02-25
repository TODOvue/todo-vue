export default defineEventHandler(() => {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://todovue.blog'

    return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`
})
