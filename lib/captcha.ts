export function getCaptchaSecret(): string | null {
  const secret = process.env.CAPTCHA_SECRET

  if (secret && secret.trim().length >= 32) {
    return secret
  }

  if (process.env.NODE_ENV === "production") {
    return null
  }

  return "dev-captcha-secret-not-for-production-please-change"
}
