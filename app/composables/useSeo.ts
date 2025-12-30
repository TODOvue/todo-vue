export const useSeo = () => {
  const siteConfig = useSiteConfig()
  const route = useRoute()

  const createSiteUrl = (path: string) => {
    const baseUrl = siteConfig.url || ''
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    const trailingSlash = siteConfig.trailingSlash && !cleanPath.endsWith('/') ? '/' : ''
    return `${baseUrl}${cleanPath}${trailingSlash}`
  }

  const setPageSeo = (options: {
    title?: string
    description?: string
    image?: string
    type?: string
    author?: string
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
  }) => {
    const {
      title,
      description,
      image,
      type = 'website',
      author,
      publishedTime,
      modifiedTime,
      section,
      tags = []
    } = options

    const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name

    const canonicalUrl = createSiteUrl(route.path)

    const imageUrl = image
      ? image.startsWith('http') ? image : createSiteUrl(image)
      : createSiteUrl('/default-og-image.png')

    const meta = [
      // Open Graph
      { property: 'og:title', content: title || siteConfig.name },
      { property: 'og:type', content: type },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:site_name', content: siteConfig.name },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title || siteConfig.name },
      { name: 'twitter:image', content: imageUrl },
    ]

    if (description) {
      meta.push(
        { name: 'description', content: description },
        { property: 'og:description', content: description },
        { name: 'twitter:description', content: description }
      )
    }

    if (author) {
      meta.push({ name: 'author', content: author })
    }

    if (type === 'article') {
      if (publishedTime) {
        meta.push({ property: 'article:published_time', content: publishedTime })
      }
      if (modifiedTime) {
        meta.push({ property: 'article:modified_time', content: modifiedTime })
      }
      if (section) {
        meta.push({ property: 'article:section', content: section })
      }
      if (author) {
        meta.push({ property: 'article:author', content: author })
      }
      tags.forEach(tag => {
        meta.push({ property: 'article:tag', content: tag })
      })
    }

    useHead({
      title: fullTitle,
      meta,
      link: [
        { rel: 'canonical', href: canonicalUrl }
      ]
    })
  }

  const setBlogPostSeo = (post: {
    title: string
    description: string
    image?: string
    author?: string
    publishedAt?: string | Date
    updatedAt?: string | Date
    tags?: string[]
  }) => {
    const publishedTime = post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined

    const modifiedTime = post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : undefined

    setPageSeo({
      title: post.title,
      description: post.description,
      image: post.image,
      type: 'article',
      author: post.author,
      publishedTime,
      modifiedTime,
      section: 'Blog',
      tags: post.tags
    })
  }

  return {
    setPageSeo,
    setBlogPostSeo
  }
}

