import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get("reference") || searchParams.get("trxref")
  const orderId = searchParams.get("orderId")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (!reference || !orderId) {
    return NextResponse.redirect(`${siteUrl}/order?error=missing_reference`)
  }

  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecretKey}` },
      }
    )

    const data = await response.json()

    const supabase = await createClient()

    if (data.status && data.data?.status === "success") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          payment_method: "paystack",
          payment_reference: reference,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      // Send processing email
      const { data: order } = await supabase
        .from("orders")
        .select("email")
        .eq("id", orderId)
        .single()

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

      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=success`)
    } else {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=failed`)
    }
  } catch (error) {
    console.error("PayStack verify error:", error)
    return NextResponse.redirect(`${siteUrl}/order/confirmation?id=${orderId}&payment=error`)
  }
}
