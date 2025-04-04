import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

interface RateLimitOptions {
  limit?: number
  windowInSeconds?: number
  identifier?: (req: NextRequest) => string
}

export async function rateLimit(req: NextRequest, options: RateLimitOptions = {}) {
  const { limit = 10, windowInSeconds = 60, identifier = (req) => req.ip || "anonymous" } = options

  const id = identifier(req)
  const key = `rate-limit:${id}`

  // Get current count and timestamp
  const now = Date.now()
  const windowStart = now - windowInSeconds * 1000

  try {
    // Add current request timestamp to the list
    await redis.zadd(key, { score: now, member: now.toString() })

    // Remove old entries outside the current window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Set expiry on the key
    await redis.expire(key, windowInSeconds * 2)

    // Count requests in the current window
    const count = await redis.zcard(key)

    // Set headers with rate limit info
    const response = NextResponse.next()
    response.headers.set("X-RateLimit-Limit", limit.toString())
    response.headers.set("X-RateLimit-Remaining", Math.max(0, limit - count).toString())
    response.headers.set("X-RateLimit-Reset", (Math.floor(now / 1000) + windowInSeconds).toString())

    // If over limit, return 429 Too Many Requests
    if (count > limit) {
      return NextResponse.json(
        { error: "Too many requests", message: "Please try again later" },
        { status: 429, headers: response.headers },
      )
    }

    return response
  } catch (error) {
    console.error("Rate limiting error:", error)
    // If rate limiting fails, allow the request to proceed
    return NextResponse.next()
  }
}

