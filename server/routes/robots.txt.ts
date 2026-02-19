export default defineEventHandler(() => {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://todovue.blog'

    return `User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`
})
