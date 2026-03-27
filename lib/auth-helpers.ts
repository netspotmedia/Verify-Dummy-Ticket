import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export interface AuthUser {
  id: string
  email: string
  isAdmin: boolean
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: "Unauthorized" }
  }
  
  // Check admin status from database profiles table, not user metadata
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  
  const isAdmin = profile?.role === "admin"
  
  return { 
    user: { id: user.id, email: user.email || "", isAdmin }, 
    error: null 
  }
}

export async function requireAdmin() {
  const { user, error } = await requireAuth()
  
  if (error || !user) {
    return { user: null, error: "Unauthorized" }
  }
  
  if (!user.isAdmin) {
    return { user: null, error: "Forbidden" }
  }
  
  return { user, error: null }
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}