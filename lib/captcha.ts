export function getCaptchaSecret(): string {
  const secret = process.env.CAPTCHA_SECRET

  if (secret && secret.trim().length >= 32) {
    return secret
  }

  // Fail hard in all environments — do not silently fall back to a weak dev secret.
  // Set CAPTCHA_SECRET (≥32 chars) in your .env.local / Vercel environment variables.
  throw new Error(
    "CAPTCHA_SECRET environment variable is not set or is shorter than 32 characters. " +
    "Generate one with: openssl rand -hex 32"
  )
}
