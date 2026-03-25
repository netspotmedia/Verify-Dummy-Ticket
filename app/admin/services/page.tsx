import { ServicesManagement } from "@/components/admin/services-management"

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Services Management</h1>
        <p className="text-muted-foreground">Create and manage services offered on your platform</p>
      </div>

      <ServicesManagement />
    </div>
  )
}
