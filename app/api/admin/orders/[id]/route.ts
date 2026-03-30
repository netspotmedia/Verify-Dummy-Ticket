import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-helpers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin()
    
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: error === "Forbidden" ? 403 : 401 })
    }

    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, adminNotes } = body

    const updateData: Record<string, unknown> = {}

    const { data, error: dbError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (dbError) {
      console.error("Order update error:", dbError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true, order: data })
  } catch (error) {
    console.error("Order update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
