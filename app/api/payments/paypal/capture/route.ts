import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

async function getPayPalAccessToken(clientId: string, clientSecret: string, mode: string) {
  const baseUrl = mode === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com"

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

function internalHeaders() {
  const secret = process.env.INTERNAL_API_SECRET
  return {
    "Content-Type": "application/json",
    ...(secret ? { "x-internal-secret": secret } : {}),
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")   // PayPal sends this
  const orderId = searchParams.get("orderId")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (!token || !orderId) {
    return NextResponse.redirect(`${siteUrl}/order?error=missing_token`)
  }

  try {
    const supabase = await createClient()

    // Verify the order exists and the stored reference matches this token
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, payment_status, payment_reference, email, services")
      .eq("id", orderId)
      .single()

    if (!existingOrder) {
      return NextResponse.redirect(`${siteUrl}/order?error=invalid_order`)
    }

    // Idempotency: already marked paid — redirect to success
    if (existingOrder.payment_status === "paid") {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=success`)
    }

    // Authorization: stored reference must match the incoming token
    if (existingOrder.payment_reference && existingOrder.payment_reference !== token) {
      console.error("PayPal token mismatch", { orderId, token, stored: existingOrder.payment_reference })
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode = process.env.PAYPAL_MODE || "sandbox"

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const { accessToken, baseUrl } = await getPayPalAccessToken(clientId, clientSecret, mode)

    // Capture the approved PayPal order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!captureResponse.ok) {
      console.error("PayPal capture HTTP error", captureResponse.status)
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const captureData = await captureResponse.json()

    if (captureData.status === "COMPLETED") {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: "paypal",
          payment_reference: token,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        // Payment captured but DB update failed — log for manual reconciliation
        console.error("CRITICAL: PayPal payment captured but DB update failed", { orderId, token, updateError })
      }

      const adminEmail = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "support_email")
        .single()
        .then(r => r.data?.value)

      // Customer: order processing notification (fire-and-forget is acceptable for email)
      if (existingOrder.email) {
        fetch(`${siteUrl}/api/email`, {
          method: "POST",
          headers: internalHeaders(),
          body: JSON.stringify({
            to: existingOrder.email,
            subject: `Payment Confirmed - Order ${orderId.slice(0, 8).toUpperCase()}`,
            type: "order_processing",
            data: { name: existingOrder.email.split("@")[0], orderId },
          }),
        }).catch(console.error)
      }

      // Admin: new paid order alert
      if (adminEmail) {
        fetch(`${siteUrl}/api/email`, {
          method: "POST",
          headers: internalHeaders(),
          body: JSON.stringify({
            to: adminEmail,
            subject: `New Paid Order - ${orderId.slice(0, 8).toUpperCase()} (PayPal)`,
            type: "order_placed",
            data: { name: "Admin", orderId, services: existingOrder.services || [] },
          }),
        }).catch(console.error)
      }

      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=success`)
    } else {
      await supabase
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId)

      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }
  } catch (error) {
    console.error("PayPal capture error:", error)
    return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=error`)
  }
}
