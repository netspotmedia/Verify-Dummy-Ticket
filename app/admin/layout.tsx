import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { isAdminUser } from "@/lib/admin-role"

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const isAdmin = isAdminUser(profile?.role, user)

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
