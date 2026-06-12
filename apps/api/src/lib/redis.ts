import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

// Sliding window rate limiter
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds}s`)
  })
  const { success } = await ratelimit.limit(key)
  return success
}
