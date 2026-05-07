import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-helpers"

const VALID_STATUSES = ["pending", "processing", "completed", "cancelled"]
const VALID_PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "failed"]

function internalHeaders(siteUrl: string) {
  const secret = process.env.INTERNAL_API_SECRET
  return {
    "Content-Type": "application/json",
    ...(secret ? { "x-internal-secret": secret } : {}),
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin()

    if (error || !user) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: error === "Forbidden" ? 403 : 401 }
      )
    }

    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, adminNotes } = body

    // Validate enum values to prevent dirty data
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }
    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status value" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (status)        updateData.status         = status
    if (paymentStatus) updateData.payment_status = paymentStatus
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes

    const { data, error: dbError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("id, email, status")
      .single()

    if (dbError) {
      console.error("Order update error:", dbError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // When admin marks order as completed, notify the customer their documents are ready
    if (status === "completed" && data?.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      fetch(`${siteUrl}/api/email`, {
        method: "POST",
        headers: internalHeaders(siteUrl),
        body: JSON.stringify({
          to: data.email,
          subject: `Your Documents Are Ready - Order ${id.slice(0, 8).toUpperCase()}`,
          type: "order_delivered",
          data: {
            name: data.email.split("@")[0],
            orderId: id,
            trackingUrl: `${siteUrl}/dashboard/orders/${id}`,
          },
        }),
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
