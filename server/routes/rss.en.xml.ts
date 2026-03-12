import { buildRssFeed } from '../utils/rss'

export default defineEventHandler(async (event) => {
  try {
    setResponseHeader(event, 'Content-Type', 'application/xml')
    return await buildRssFeed(event, 'en')
  } catch (e) {
    console.error('Error generating English RSS feed:', e)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating English RSS feed',
    })
  }
})
