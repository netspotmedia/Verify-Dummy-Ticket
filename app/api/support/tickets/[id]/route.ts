"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { ticketId, action } = body
    
    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }
    
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("user_id")
      .eq("id", ticketId)
      .single()
    
    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    
    if (ticket.user_id !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }
    
    if (action === "close") {
      const { data, error } = await supabase
        .from("support_tickets")
        .update({ status: "closed", closed_at: new Date().toISOString() })
        .eq("id", ticketId)
        .select()
        .single()
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json({ success: true, ticket: data })
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Ticket action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
