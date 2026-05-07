import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function internalHeaders() {
  const secret = process.env.INTERNAL_API_SECRET
  return {
    "Content-Type": "application/json",
    ...(secret ? { "x-internal-secret": secret } : {}),
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference") || searchParams.get("trxref")
  const orderId = searchParams.get("orderId")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (!reference || !orderId) {
    return NextResponse.redirect(`${siteUrl}/order?error=missing_reference`)
  }

  try {
    const supabase = await createClient()

    // Verify the order exists and the stored reference matches the incoming one
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

    // Authorization: stored reference must match the incoming reference
    if (existingOrder.payment_reference && existingOrder.payment_reference !== reference) {
      console.error("Paystack reference mismatch", { orderId, reference, stored: existingOrder.payment_reference })
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
    )

    if (!response.ok) {
      console.error("Paystack verify HTTP error", response.status)
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const data = await response.json()

    if (data.status && data.data?.status === "success") {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: "paystack",
          payment_reference: reference,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        // Payment captured but DB update failed — log for manual reconciliation
        console.error("CRITICAL: Paystack payment verified but DB update failed", { orderId, reference, updateError })
      }

      const adminEmail = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "support_email")
        .single()
        .then(r => r.data?.value)

      // Customer: order processing notification
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
            subject: `New Paid Order - ${orderId.slice(0, 8).toUpperCase()} (Paystack)`,
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
    console.error("PayStack verify error:", error)
    return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=error`)
  }
}
