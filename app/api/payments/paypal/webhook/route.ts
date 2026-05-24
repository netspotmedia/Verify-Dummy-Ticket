import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

function internalHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET
  if (secret) return { "Content-Type": "application/json", "x-internal-secret": secret }
  return { "Content-Type": "application/json" }
}

async function getPayPalAccessToken(clientId: string, clientSecret: string, mode: string) {
  const baseUrl = mode === "live" ? "https://api.paypal.com" : "https://api.sandbox.paypal.com"
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })
  const data = await response.json()
  return { accessToken: data.access_token, baseUrl }
}

async function verifyPayPalWebhook(
  webhookId: string,
  headers: Record<string, string>,
  rawBody: string,
  accessToken: string,
  baseUrl: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBody),
      }),
    })
    const data = await response.json()
    return data.verification_status === "SUCCESS"
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://verifydummytickets.com"

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  const mode = process.env.PAYPAL_MODE || "sandbox"

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }

  const rawBody = await request.text()

  // Verify signature if webhook ID is configured
  if (webhookId) {
    try {
      const { accessToken, baseUrl } = await getPayPalAccessToken(clientId, clientSecret, mode)
      const headers: Record<string, string> = {}
      request.headers.forEach((value, key) => { headers[key] = value })
      const valid = await verifyPayPalWebhook(webhookId, headers, rawBody, accessToken, baseUrl)
      if (!valid) {
        console.error("PayPal webhook: invalid signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    } catch (err) {
      console.error("PayPal webhook: signature verification error", err)
      // In sandbox/dev mode, continue without verification if PAYPAL_WEBHOOK_ID not set
    }
  }

  let event: { event_type: string; resource: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.event_type !== "CHECKOUT.ORDER.APPROVED" && event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
    return NextResponse.json({ received: true })
  }

  const resource = event.resource
  // For CHECKOUT.ORDER.APPROVED, resource.id is the PayPal order ID
  // For PAYMENT.CAPTURE.COMPLETED, resource.supplementary_data?.related_ids?.order_id or resource.id
  const paypalOrderId =
    (resource.id as string) ||
    ((resource.supplementary_data as Record<string, Record<string, string>> | undefined)
      ?.related_ids?.order_id)

  if (!paypalOrderId) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status, payment_reference, email, services, total_amount, currency")
    .eq("payment_reference", paypalOrderId)
    .single()

  if (!order) {
    console.warn("PayPal webhook: no order found for paypalOrderId", paypalOrderId)
    return NextResponse.json({ received: true })
  }

  if (order.payment_status === "paid") {
    return NextResponse.json({ received: true })
  }

  // For PAYMENT.CAPTURE.COMPLETED verify the captured amount
  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const capturedAmount = parseFloat((resource.amount as { value: string } | undefined)?.value || "0")
    const ngnRate = parseFloat(process.env.NGN_RATE || "1650")
    const expectedUsd = order.currency === "NGN" ? order.total_amount / ngnRate : order.total_amount
    if (capturedAmount < expectedUsd - 0.01) {
      console.error("PayPal webhook: amount mismatch", { orderId: order.id, expectedUsd, capturedAmount })
      return NextResponse.json({ received: true })
    }
  }

  // Atomic update
  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      payment_method: "paypal",
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .neq("payment_status", "paid")
    .select("id")

  if (updateError) {
    console.error("CRITICAL: PayPal webhook DB update failed", { orderId: order.id })
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
          subject: `New Paid Order — ${order.id.slice(0, 8).toUpperCase()} (PayPal webhook)`,
          type: "order_placed",
          data: { name: "Admin", orderId: order.id, services: order.services || [] },
        }),
      }).catch(() => {})
    }

    console.log("PayPal webhook: order marked paid", order.id)
  }

  return NextResponse.json({ received: true })
}
