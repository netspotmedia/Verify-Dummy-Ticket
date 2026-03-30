import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-helpers"

const ALLOWED_ORDER_STATUSES = new Set(["pending", "processing", "completed", "cancelled"])
const ALLOWED_PAYMENT_STATUSES = new Set(["pending", "paid", "failed", "refunded"])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) {
      return NextResponse.json({ error: authError === "Forbidden" ? "Forbidden" : "Unauthorized" }, { status: authError === "Forbidden" ? 403 : 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, adminNotes } = body

    const updateData: Record<string, unknown> = {}

    if (status !== undefined) {
      if (!ALLOWED_ORDER_STATUSES.has(status)) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
      }
      updateData.status = status
    }

    if (paymentStatus !== undefined) {
      if (!ALLOWED_PAYMENT_STATUSES.has(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
      }
      updateData.payment_status = paymentStatus
    }

    if (adminNotes !== undefined) {
      if (typeof adminNotes !== "string" && adminNotes !== null) {
        return NextResponse.json({ error: "Invalid admin notes" }, { status: 400 })
      }
      updateData.admin_notes = typeof adminNotes === "string" ? adminNotes.slice(0, 5000) : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Order update error:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
