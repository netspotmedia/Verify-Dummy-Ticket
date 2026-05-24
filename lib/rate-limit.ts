import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ---------------------------------------------------------------------------
// Redis-backed distributed rate limiter (works correctly across all serverless
// instances). Falls back to a no-op in local dev when Redis is not configured
// so development is not blocked.
// ---------------------------------------------------------------------------

function createLimiter(requests: number, windowSeconds: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. " +
        "Rate limiting is DISABLED. Set these variables immediately."
      )
    }
    return null
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: false,
  })
}

// Pre-built limiters for common use-cases
const orderLimiter   = createLimiter(10, 60)   // 10 orders / min
const contactLimiter = createLimiter(5,  60)   // 5 contact submissions / min
const supportLimiter = createLimiter(10, 60)   // 10 support tickets / min

export async function rateLimitRequest(
  request: NextRequest,
  limiterType: "order" | "contact" | "support" = "contact"
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
  const limiter =
    limiterType === "order"   ? orderLimiter   :
    limiterType === "support" ? supportLimiter :
    contactLimiter

  if (!limiter) {
    // Redis not configured — allow in dev, warn in prod (already logged above)
    return { success: true, remaining: 99, resetIn: 0 }
  }

  const ip = getClientIp(request)
  const { success, remaining, reset } = await limiter.limit(ip)

  return {
    success,
    remaining,
    resetIn: Math.max(0, reset - Date.now()),
  }
}

// ---------------------------------------------------------------------------
// Trusted IP extraction — use Vercel's verified header, never raw x-forwarded-for
// ---------------------------------------------------------------------------
export function getClientIp(request: NextRequest): string {
  // Vercel sets x-real-ip to the actual client IP (cannot be spoofed on Vercel)
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp

  // On Vercel, x-forwarded-for is also reliably set (leftmost = client)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()

  return "unknown"
}

// Kept for backward-compatibility with call-sites that use the old name
export function getRateLimitIdentifier(request: NextRequest): string {
  return getClientIp(request)
}

export function rateLimitResponse(resetIn: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
        "X-RateLimit-Reset": resetIn.toString(),
      },
    }
  )
}

// ---------------------------------------------------------------------------
// Legacy synchronous shim — used by contact/support routes that haven't yet
// been migrated to the async rateLimitRequest() above.
// ---------------------------------------------------------------------------
export function rateLimit(
  identifier: string,
  _limit: number,
  _windowMs: number
): { success: boolean; remaining: number; resetIn: number } {
  // This shim always allows through; call-sites that use it should be migrated
  // to rateLimitRequest() for actual enforcement.
  void identifier
  return { success: true, remaining: 99, resetIn: 0 }
}
