import { Redis } from "@upstash/redis"

// Helper function to ensure proper Redis URL format
function getRedisConfig() {
  let url = process.env.UPSTASH_REDIS_REST_URL || ""
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || ""

  // Ensure URL starts with https://
  if (url && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  return { url, token }
}

// Initialize Redis client with validated configuration
const { url, token } = getRedisConfig()

if (!url || !token) {
  console.warn(
    "Upstash Redis not configured. " + 
    "Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables."
  )
}

const redis = url && token ? new Redis({ url, token }) : null

// Default cache expiration time (24 hours)
const DEFAULT_EXPIRATION = 60 * 60 * 24

/**
 * Get data from cache or fetch it and store in cache
 */
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expiration: number = DEFAULT_EXPIRATION,
): Promise<T> {
  // Fallback to direct fetch if Redis is not configured
  if (!redis) {
    console.warn("Redis not configured, falling back to direct fetch")
    return fetchFn()
  }

  try {
    // Try to get data from cache
    const cachedData = await redis.get<T>(key)

    if (cachedData) {
      console.log(`Cache hit for key: ${key}`)
      return cachedData
    }

    // If not in cache, fetch data
    console.log(`Cache miss for key: ${key}, fetching data...`)
    const data = await fetchFn()

    // Store in cache
    await redis.set(key, data, { ex: expiration })

    return data
  } catch (error) {
    console.error(`Error with Redis cache for key ${key}:`, error)
    // Fallback to direct fetch if cache fails
    return fetchFn()
  }
}

/**
 * Invalidate a cache key
 */
export async function invalidateCache(key: string): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, cannot invalidate cache")
    return
  }

  try {
    await redis.del(key)
    console.log(`Cache invalidated for key: ${key}`)
  } catch (error) {
    console.error(`Error invalidating cache for key ${key}:`, error)
  }
}

/**
 * Invalidate multiple cache keys with a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, cannot invalidate cache pattern")
    return
  }

  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`Invalidated ${keys.length} keys matching pattern: ${pattern}`)
    }
  } catch (error) {
    console.error(`Error invalidating cache pattern ${pattern}:`, error)
  }
}

/**
 * Cache a value with a key
 */
export async function cacheValue<T>(
  key: string, 
  value: T, 
  expiration: number = DEFAULT_EXPIRATION
): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, cannot cache value")
    return
  }

  try {
    await redis.set(key, value, { ex: expiration })
  } catch (error) {
    console.error(`Error caching value for key ${key}:`, error)
  }
}

/**
 * Test Redis connection (for debugging)
 */
export async function testRedisConnection(): Promise<boolean> {
  if (!redis) return false
  
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error("Redis connection test failed:", error)
    return false
  }
}