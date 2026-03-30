"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const ticketId = searchParams.get("ticketId")
  
  if (!ticketId) {
    return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
  }
  
  try {
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
    
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Fetch messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
