"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getRateLimitIdentifier, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const identifier = getRateLimitIdentifier(request)
  const { success, resetIn } = rateLimit(identifier, 30, 60000)
  if (!success) {
    return rateLimitResponse(resetIn)
  }
  
  try {
    const body = await request.json()
    const { ticketId, message } = body
    
    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }
    
    if (!message || typeof message !== "string" || message.trim().length < 1) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }
    
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("user_id, status")
      .eq("id", ticketId)
      .single()
    
    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    
    if (ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized to reply to this ticket" }, { status: 403 })
    }
    
    if (ticket.status === "closed" || ticket.status === "resolved") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 })
    }
    
    const sanitizedMessage = message.trim().slice(0, 5000)
    
    const { data, error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      user_id: user.id,
      message: sanitizedMessage,
      is_admin_message: false,
    })
    
    if (error) {
      console.error("Reply error:", error)
      return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error("Ticket reply error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
