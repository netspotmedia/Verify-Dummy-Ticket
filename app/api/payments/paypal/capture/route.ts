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

function internalHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET
  if (secret) return { "Content-Type": "application/json", "x-internal-secret": secret }
  return { "Content-Type": "application/json" }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token   = searchParams.get("token")
  const orderId = searchParams.get("orderId")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (!token || !orderId) {
    return NextResponse.redirect(`${siteUrl}/order?error=missing_token`)
  }

  try {
    const supabase = await createClient()

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, payment_status, payment_reference, email, services, total_amount, currency")
      .eq("id", orderId)
      .single()

    if (!existingOrder) {
      return NextResponse.redirect(`${siteUrl}/order?error=invalid_order`)
    }

    if (existingOrder.payment_status === "paid") {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=success`)
    }

    if (existingOrder.payment_reference && existingOrder.payment_reference !== token) {
      console.error("PayPal token mismatch", { orderId })
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const clientId     = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode         = process.env.PAYPAL_MODE || "sandbox"

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const { accessToken, baseUrl } = await getPayPalAccessToken(clientId, clientSecret, mode)

    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    })

    if (!captureResponse.ok) {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const captureData = await captureResponse.json()

    if (captureData.status === "COMPLETED") {
      // Amount verification: compare captured amount to stored order total
      const capturedUnit   = captureData.purchase_units?.[0]?.payments?.captures?.[0]
      if (capturedUnit) {
        const capturedAmount = parseFloat(capturedUnit.amount?.value || "0")
        const ngnRate        = parseFloat(process.env.NGN_RATE || "1650")
        const expectedUsd    = existingOrder.currency === "NGN"
          ? existingOrder.total_amount / ngnRate
          : existingOrder.total_amount
        if (capturedAmount < expectedUsd - 0.01) {
          console.error("PayPal amount mismatch", { orderId, expectedUsd, capturedAmount })
          return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
        }
      }

      // TOCTOU guard: atomic update — only succeeds if order is still unpaid
      const { data: updated, error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status:    "paid",
          payment_method:    "paypal",
          payment_reference: token,
          status:            "processing",
          updated_at:        new Date().toISOString(),
        })
        .eq("id", orderId)
        .neq("payment_status", "paid")
        .select("id")

      if (updateError) {
        console.error("CRITICAL: PayPal payment captured but DB update failed", { orderId })
      }

      // Only send notifications when this invocation performed the update
      if (updated && updated.length > 0) {
        const adminEmailResult = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "support_email")
          .single()
        const adminEmail = adminEmailResult.data?.value

        if (existingOrder.email) {
          fetch(`${siteUrl}/api/email`, {
            method: "POST",
            headers: internalHeaders(),
            body: JSON.stringify({
              to:      existingOrder.email,
              subject: `Payment Confirmed - Order ${orderId.slice(0, 8).toUpperCase()}`,
              type:    "order_processing",
              data:    { name: existingOrder.email.split("@")[0], orderId },
            }),
          }).catch(() => {})
        }

        if (adminEmail) {
          fetch(`${siteUrl}/api/email`, {
            method: "POST",
            headers: internalHeaders(),
            body: JSON.stringify({
              to:      adminEmail,
              subject: `New Paid Order - ${orderId.slice(0, 8).toUpperCase()} (PayPal)`,
              type:    "order_placed",
              data:    { name: "Admin", orderId, services: existingOrder.services || [] },
            }),
          }).catch(() => {})
        }
      }

      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=success`)
    } else {
      await supabase
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .neq("payment_status", "paid")

      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }
  } catch {
    return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=error`)
  }
}
