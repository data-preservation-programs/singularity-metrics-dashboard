let cache: { [key: string]: any } = {}
let cacheTimestamp: number | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour cache

export const setCache = (key: string, data: any) => {
  cache[key] = data
  cacheTimestamp = Date.now()
}

export const getCache = (key: string) => {
  if (Date.now() - (cacheTimestamp || 0) > CACHE_DURATION) {
    // When the cache is expired
    return null
  }
  return cache[key]
}
