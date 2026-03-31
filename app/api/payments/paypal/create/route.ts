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

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${await response.text()}`)
  }

  const data = await response.json()
  return { accessToken: data.access_token, baseUrl }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, currency, email } = body

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode = process.env.PAYPAL_MODE || "sandbox"

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const { accessToken, baseUrl } = await getPayPalAccessToken(clientId, clientSecret, mode)

    // PayPal only supports USD, EUR, GBP, etc. — not NGN
    const paypalCurrency = currency === "NGN" ? "USD" : (currency || "USD")
    const paypalAmount = currency === "NGN"
      ? (amount / (parseFloat(process.env.NGN_RATE || "1650"))).toFixed(2)
      : amount.toFixed(2)

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            amount: { currency_code: paypalCurrency, value: paypalAmount },
          },
        ],
        application_context: {
          brand_name: "VerifyDummyTickets",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${siteUrl}/api/payments/paypal/capture?orderId=${orderId}`,
          cancel_url: `${siteUrl}/order/confirmation?id=${orderId}&payment=cancelled`,
        },
      }),
    })

    if (!orderResponse.ok) {
      const errText = await orderResponse.text()
      console.error("PayPal create order error:", errText)
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 })
    }

    const orderData = await orderResponse.json()
    const approvalUrl = orderData.links?.find((l: any) => l.rel === "approve")?.href

    if (!approvalUrl) {
      return NextResponse.json({ error: "No PayPal approval URL returned" }, { status: 502 })
    }

    // Store PayPal order ID as reference
    const supabase = await createClient()
    await supabase
      .from("orders")
      .update({ payment_reference: orderData.id })
      .eq("id", orderId)

    return NextResponse.json({ approvalUrl, paypalOrderId: orderData.id })
  } catch (error) {
    console.error("PayPal create route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
