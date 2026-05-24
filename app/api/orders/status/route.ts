import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref")?.trim().toUpperCase()

  if (!ref) {
    return NextResponse.json({ error: "Missing order reference" }, { status: 400 })
  }

  // Only alphanumeric + dash allowed — block any injection attempt
  if (!/^[A-Z0-9\-]{3,30}$/.test(ref)) {
    return NextResponse.json({ error: "Invalid order reference format" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select("order_number, status, payment_status, services, currency, total_amount, created_at")
    .eq("order_number", ref)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Deliberately omit PII (email, user_id, payment_reference) from the public response
  return NextResponse.json({
    order_number:   order.order_number,
    status:         order.status,
    payment_status: order.payment_status,
    services:       order.services,
    currency:       order.currency,
    total_amount:   order.total_amount,
    created_at:     order.created_at,
  })
}
