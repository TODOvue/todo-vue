export default defineEventHandler(() => {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://todovue.blog'

    return `User-agent: *
Allow: /
Disallow: /components/
Disallow: /admin/
Disallow: /_nuxt/

Sitemap: ${siteUrl}/sitemap.xml`
})
