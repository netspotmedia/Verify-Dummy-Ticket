import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimitRequest, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const rl = await rateLimitRequest(request, "order")
  if (!rl.success) return rateLimitResponse(rl.resetIn)

  const body = await request.json()
  const code: string = (body.code || "").trim().toUpperCase()

  if (!code || code.length > 50) {
    return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("code, discount_percent, is_active, max_uses, uses_count, expires_at")
    .eq("code", code)
    .single()

  if (error || !coupon) {
    return NextResponse.json({ valid: false, error: "Coupon not found" }, { status: 200 })
  }

  if (!coupon.is_active) {
    return NextResponse.json({ valid: false, error: "This coupon is no longer active" }, { status: 200 })
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 200 })
  }

  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" }, { status: 200 })
  }

  return NextResponse.json({
    valid: true,
    discountPercent: coupon.discount_percent,
  })
}
