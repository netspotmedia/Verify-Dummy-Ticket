import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimitRequest, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const { success, resetIn } = await rateLimitRequest(request, "support")
  if (!success) return rateLimitResponse(resetIn)

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { subject, message, priority, orderId } = body
    
    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return NextResponse.json({ error: "Subject must be at least 3 characters" }, { status: 400 })
    }
    
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 })
    }
    
    const validPriorities = ["low", "normal", "high", "urgent"]
    const ticketPriority = validPriorities.includes(priority) ? priority : "normal"
    
    const sanitizedSubject = subject.trim().slice(0, 200)
    const sanitizedMessage = message.trim().slice(0, 5000)
    
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        subject: sanitizedSubject,
        priority: ticketPriority,
        order_id: orderId || null,
        user_id: user.id,
        status: "open",
      })
      .select()
      .single()
    
    if (ticketError) {
      console.error("Ticket creation error:", ticketError.code)
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
    }
    
    const { error: messageError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      user_id: user.id,
      message: sanitizedMessage,
      is_admin_message: false,
    })
    
    if (messageError) {
      console.error("Message creation error:", messageError)
    }
    
    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Support ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Fetch tickets error:", error.code)
      return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch tickets error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
