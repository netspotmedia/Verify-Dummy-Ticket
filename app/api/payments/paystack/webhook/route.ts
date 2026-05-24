import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

export const runtime = "nodejs"

function internalHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET
  if (secret) return { "Content-Type": "application/json", "x-internal-secret": secret }
  return { "Content-Type": "application/json" }
}

export async function POST(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://verifydummytickets.com"

  // Verify Paystack signature
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecretKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature")
  const expectedSig = crypto
    .createHmac("sha512", paystackSecretKey)
    .update(rawBody)
    .digest("hex")

  if (!signature || signature !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let event: { event: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.event !== "charge.success") {
    // Acknowledge non-charge events without processing
    return NextResponse.json({ received: true })
  }

  const data = event.data
  const reference = data.reference as string
  const status = data.status as string
  const amountKobo = data.amount as number

  if (status !== "success" || !reference) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status, payment_reference, email, services, total_amount, currency")
    .eq("payment_reference", reference)
    .single()

  if (!order) {
    console.warn("Paystack webhook: no order found for reference", reference)
    return NextResponse.json({ received: true })
  }

  if (order.payment_status === "paid") {
    return NextResponse.json({ received: true })
  }

  // Amount verification
  const expectedKobo = Math.round(order.total_amount * 100)
  if (amountKobo < expectedKobo) {
    console.error("Paystack webhook: amount mismatch", { orderId: order.id, expectedKobo, amountKobo })
    return NextResponse.json({ received: true })
  }

  // Atomic update — TOCTOU guard
  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      payment_method: "paystack",
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .neq("payment_status", "paid")
    .select("id")

  if (updateError) {
    console.error("CRITICAL: Paystack webhook DB update failed", { orderId: order.id, error: updateError.message })
    return NextResponse.json({ error: "DB update failed" }, { status: 500 })
  }

  if (updated && updated.length > 0) {
    const adminEmailResult = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "support_email")
      .single()
    const adminEmail = adminEmailResult.data?.value

    if (order.email) {
      fetch(`${siteUrl}/api/email`, {
        method: "POST",
        headers: internalHeaders(),
        body: JSON.stringify({
          to: order.email,
          subject: `Payment Confirmed — Order ${order.id.slice(0, 8).toUpperCase()}`,
          type: "order_processing",
          data: { name: (order.email as string).split("@")[0], orderId: order.id },
        }),
      }).catch(() => {})
    }

    if (adminEmail) {
      fetch(`${siteUrl}/api/email`, {
        method: "POST",
        headers: internalHeaders(),
        body: JSON.stringify({
          to: adminEmail,
          subject: `New Paid Order — ${order.id.slice(0, 8).toUpperCase()} (Paystack webhook)`,
          type: "order_placed",
          data: { name: "Admin", orderId: order.id, services: order.services || [] },
        }),
      }).catch(() => {})
    }

    console.log("Paystack webhook: order marked paid", order.id)
  }

  return NextResponse.json({ received: true })
}
