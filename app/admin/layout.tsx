import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin from database profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  console.log('[ADMIN LAYOUT] Profile check:', { profile, error, userId: user.id })

  // If profile doesn't exist or query failed, treat as non-admin
  if (error || !profile) {
    console.log('[ADMIN LAYOUT] Profile not found - redirecting')
    redirect("/dashboard")
  }

  const isAdmin = profile.role === "admin"
  console.log('[ADMIN LAYOUT] isAdmin:', isAdmin, 'role:', profile.role)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={user} profile={profile} />
      <SidebarInset>
        <AdminHeader user={user} profile={profile} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
