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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")   // PayPal sends this
  const orderId = searchParams.get("orderId")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (!token || !orderId) {
    return NextResponse.redirect(`${siteUrl}/order?error=missing_token`)
  }

  try {
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

    const captureData = await captureResponse.json()
    const supabase = await createClient()

    if (captureData.status === "COMPLETED") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: "paypal",
          payment_reference: token,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      // Fetch order + admin support email in parallel
      const [{ data: order }, { data: adminSettings }] = await Promise.all([
        supabase.from("orders").select("email, services").eq("id", orderId).single(),
        supabase.from("site_settings").select("key, value").in("key", ["support_email"]),
      ])

      const adminEmail = adminSettings?.find((s: { key: string; value: string }) => s.key === "support_email")?.value

      // Customer: order processing notification
      if (order?.email) {
        fetch(`${siteUrl}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: order.email,
            subject: `Payment Confirmed - Order ${orderId.slice(0, 8).toUpperCase()}`,
            type: "order_processing",
            data: { name: order.email.split("@")[0], orderId },
          }),
        }).catch(console.error)
      }

      // Admin: new paid order alert
      if (adminEmail) {
        fetch(`${siteUrl}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: adminEmail,
            subject: `New Paid Order - ${orderId.slice(0, 8).toUpperCase()} (PayPal)`,
            type: "order_placed",
            data: {
              name: "Admin",
              orderId,
              services: order?.services || [],
            },
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
