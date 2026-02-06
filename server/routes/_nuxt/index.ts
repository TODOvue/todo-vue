export default defineEventHandler((event) => {
  setResponseStatus(event, 204)
  return ''
})
