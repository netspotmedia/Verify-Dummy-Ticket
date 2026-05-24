import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCaptchaSecret } from "@/lib/captcha"
import { Redis } from "@upstash/redis"

const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000
const CAPTCHA_EXPIRY_SECS = 5 * 60

// Redis is used to track spent nonces so tokens cannot be replayed.
// Falls back gracefully when Redis is not configured (local dev without Redis).
function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null
}

interface CaptchaToken {
  answer: number
  timestamp: number
  nonce: string
}

function generateCaptcha(): { token: string; question: string } {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const answer = a + b

  const payload: CaptchaToken = {
    answer,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  }

  const secret = getCaptchaSecret()
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadBase64)
    .digest("base64url")

  return { token: `${payloadBase64}.${signature}`, question: `${a} + ${b} = ?` }
}

async function verifyCaptcha(token: string): Promise<{ valid: boolean; error?: string; nonce?: string }> {
  if (!token) return { valid: false, error: "No token provided" }

  try {
    const parts = token.split(".")
    if (parts.length !== 2) return { valid: false, error: "Invalid token format" }

    const [payloadBase64, signature] = parts
    const secret = getCaptchaSecret()

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadBase64)
      .digest("base64url")

    if (signature !== expectedSignature) return { valid: false, error: "Invalid signature" }

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString()) as CaptchaToken

    if (Date.now() - payload.timestamp > CAPTCHA_EXPIRY_MS) {
      return { valid: false, error: "Token expired" }
    }

    return { valid: true, nonce: payload.nonce }
  } catch {
    return { valid: false, error: "Invalid token" }
  }
}

async function verifyAnswer(token: string, userAnswer: number): Promise<{ valid: boolean; error?: string }> {
  const validation = await verifyCaptcha(token)
  if (!validation.valid) return validation

  // Replay protection: mark the nonce as spent in Redis
  const redis = getRedis()
  if (redis && validation.nonce) {
    const nonceKey = `captcha:nonce:${validation.nonce}`
    // SET NX returns null if the key already exists (already spent)
    const set = await redis.set(nonceKey, "1", { nx: true, ex: CAPTCHA_EXPIRY_SECS })
    if (set === null) {
      return { valid: false, error: "Token already used" }
    }
  }

  try {
    const parts = token.split(".")
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as CaptchaToken
    if (userAnswer !== payload.answer) return { valid: false, error: "Incorrect answer" }
    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid token" }
  }
}

export async function GET() {
  try {
    const { token, question } = generateCaptcha()
    return NextResponse.json({ token, question })
  } catch (err) {
    const message = err instanceof Error ? err.message : "CAPTCHA is not configured"
    return NextResponse.json({ valid: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, answer } = body

    if (typeof answer !== "number") {
      return NextResponse.json({ valid: false, error: "Answer must be a number" }, { status: 400 })
    }

    const result = await verifyAnswer(token, answer)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 })
  }
}

export { verifyCaptcha, verifyAnswer }
