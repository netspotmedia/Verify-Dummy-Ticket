import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, email, currency } = body

    if (!orderId || !amount || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: "PayStack is not configured" }, { status: 503 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const reference = `VDT_${orderId}_${Date.now()}`

    // PayStack expects amounts in kobo (NGN) or cents (USD) — multiply by 100
    const amountInMinorUnit = Math.round(amount * 100)

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify({
        email,
        amount: amountInMinorUnit,
        currency: currency || "NGN",
        reference,
        callback_url: `${siteUrl}/api/payments/paystack/verify?orderId=${orderId}`,
        metadata: { order_id: orderId, custom_fields: [] },
      }),
    })

    const data = await response.json()

    if (!data.status || !data.data?.authorization_url) {
      console.error("PayStack init error:", data)
      return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 502 })
    }

    // Persist the reference so verify route can look it up
    const supabase = await createClient()
    await supabase
      .from("orders")
      .update({ payment_reference: reference })
      .eq("id", orderId)

    return NextResponse.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    })
  } catch (error) {
    console.error("PayStack initialize route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
