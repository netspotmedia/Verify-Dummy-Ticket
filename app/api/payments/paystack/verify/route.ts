import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function internalHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET
  if (secret) return { "Content-Type": "application/json", "x-internal-secret": secret }
  return { "Content-Type": "application/json" }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference") || searchParams.get("trxref")
  const orderId    = searchParams.get("orderId")
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (!reference || !orderId) {
    return NextResponse.redirect(`${siteUrl}/order?error=missing_reference`)
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

    if (existingOrder.payment_reference && existingOrder.payment_reference !== reference) {
      console.error("Paystack reference mismatch", { orderId })
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
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const data = await response.json()

    if (data.status && data.data?.status === "success") {
      // Amount verification: Paystack returns the actual charged amount in kobo
      const expectedKobo = Math.round(existingOrder.total_amount * 100)
      const actualKobo   = data.data.amount as number
      if (actualKobo < expectedKobo) {
        console.error("Paystack amount mismatch", { orderId, expectedKobo, actualKobo })
        return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
      }

      // TOCTOU guard: atomic update that only succeeds if the order is still unpaid.
      // If two callbacks arrive simultaneously, exactly one will win the race.
      const { data: updated, error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status:    "paid",
          payment_method:    "paystack",
          payment_reference: reference,
          status:            "processing",
          updated_at:        new Date().toISOString(),
        })
        .eq("id", orderId)
        .neq("payment_status", "paid")
        .select("id")

      if (updateError) {
        console.error("CRITICAL: Paystack payment verified but DB update failed", { orderId })
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
              subject: `New Paid Order - ${orderId.slice(0, 8).toUpperCase()} (Paystack)`,
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
