import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "default-captcha-secret-change-me"
const CAPTCHA_EXPIRY = 5 * 60 * 1000

interface CaptchaToken {
  answer: number
  timestamp: number
}

function generateCaptcha(): { token: string; question: string } {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  const answer = a + b
  
  const payload: CaptchaToken = {
    answer,
    timestamp: Date.now()
  }
  
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payloadBase64)
    .digest("base64url")
  
  const token = `${payloadBase64}.${signature}`
  const question = `${a} + ${b} = ?`
  
  return { token, question }
}

function verifyCaptcha(token: string): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: "No token provided" }
  }
  
  try {
    const parts = token.split(".")
    if (parts.length !== 2) {
      return { valid: false, error: "Invalid token format" }
    }
    
    const [payloadBase64, signature] = parts
    
    const expectedSignature = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(payloadBase64)
      .digest("base64url")
    
    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid signature" }
    }
    
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString()) as CaptchaToken
    
    if (Date.now() - payload.timestamp > CAPTCHA_EXPIRY) {
      return { valid: false, error: "Token expired" }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid token" }
  }
}

function verifyAnswer(token: string, userAnswer: number): { valid: boolean; error?: string } {
  const validation = verifyCaptcha(token)
  if (!validation.valid) {
    return validation
  }
  
  try {
    const parts = token.split(".")
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as CaptchaToken
    
    if (userAnswer !== payload.answer) {
      return { valid: false, error: "Incorrect answer" }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid token" }
  }
}

export async function GET() {
  const { token, question } = generateCaptcha()
  
  return NextResponse.json({ token, question })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, answer } = body
    
    if (typeof answer !== "number") {
      return NextResponse.json({ valid: false, error: "Answer must be a number" }, { status: 400 })
    }
    
    const result = verifyAnswer(token, answer)
    
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 })
  }
}

export { verifyCaptcha, verifyAnswer }
