import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  try {
    // Authentication required — anonymous users cannot initialize payment
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, email, currency } = body

    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.json({ error: "PayStack is not configured" }, { status: 503 })
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
    const reference = `VDT_${orderId}_${Date.now()}`

    // Use the DB-authoritative amount — client-supplied amount is completely ignored
    const amountInMinorUnit = Math.round(order.total_amount * 100)

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify({
        email: order.email || email,
        amount: amountInMinorUnit,
        currency: order.currency || currency || "NGN",
        reference,
        callback_url: `${siteUrl}/api/payments/paystack/verify?orderId=${orderId}`,
        metadata: { order_id: orderId, custom_fields: [] },
      }),
    })

    const data = await response.json()

    if (!data.status || !data.data?.authorization_url) {
      return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 502 })
    }

    // Persist the reference so the verify route can look it up and confirm the match
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
