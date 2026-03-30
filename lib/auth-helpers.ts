import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export interface AuthUser {
  id: string
  email: string
  isAdmin: boolean
  role?: string
}

function normalizeRole(role: unknown): string {
  if (typeof role !== "string") return ""
  return role.replace(/"/g, "").trim().toLowerCase()
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: "Unauthorized" }
  }
  
  return { 
    user: { id: user.id, email: user.email || "", isAdmin: false }, 
    error: null 
  }
}

export async function requireAdmin(): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: "Unauthorized" }
  }
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  
  if (profileError || !profile) {
    return { user: null, error: "Forbidden" }
  }
  
  const isAdmin = normalizeRole(profile.role) === "admin"
  
  if (!isAdmin) {
    return { user: null, error: "Forbidden" }
  }
  
  return { 
    user: { 
      id: user.id, 
      email: user.email || "", 
      isAdmin: true,
      role: normalizeRole(profile.role)
    }, 
    error: null 
  }
}

export async function requireUserWithProfile(): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: "Unauthorized" }
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  
  return { 
    user: { 
      id: user.id, 
      email: user.email || "", 
      isAdmin: normalizeRole(profile?.role) === "admin",
      role: normalizeRole(profile?.role)
    }, 
    error: null 
  }
}

export function unauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}