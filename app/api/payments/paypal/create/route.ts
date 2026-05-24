import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-helpers"

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
    // Authentication required — anonymous users cannot initialize payment
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    const mode = process.env.PAYPAL_MODE || "sandbox"

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal is not configured" }, { status: 503 })
    }

    const supabase = await createClient()

    // Fetch the authoritative total from the DB — never trust client-supplied amount
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total_amount, currency, email, payment_status, user_id")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Ownership: the order must belong to the authenticated user
    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Idempotency: do not re-initialize a payment for an already-paid order
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 409 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const { accessToken, baseUrl } = await getPayPalAccessToken(clientId, clientSecret, mode)

    // PayPal only supports USD, EUR, GBP, etc. — not NGN
    const paypalCurrency = order.currency === "NGN" ? "USD" : (order.currency || "USD")
    const ngnRate = parseFloat(process.env.NGN_RATE || "1650")
    const paypalAmount = order.currency === "NGN"
      ? (order.total_amount / ngnRate).toFixed(2)
      : order.total_amount.toFixed(2)

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
      return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 })
    }

    const orderData = await orderResponse.json()
    const approvalUrl = orderData.links?.find((l: { rel: string; href: string }) => l.rel === "approve")?.href

    if (!approvalUrl) {
      return NextResponse.json({ error: "No PayPal approval URL returned" }, { status: 502 })
    }

    // Store PayPal order ID as the payment reference
    await supabase
      .from("orders")
      .update({ payment_reference: orderData.id })
      .eq("id", orderId)

    return NextResponse.json({ approvalUrl, paypalOrderId: orderData.id })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
