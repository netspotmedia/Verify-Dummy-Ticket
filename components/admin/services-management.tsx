"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Pencil, Trash2, Save, Check, Plane, Hotel, Shield, Package } from "lucide-react"
import { toast } from "sonner"

interface ServiceType {
  id?: string
  name: string
  description: string
  base_price_usd: number
  base_price_ngn: number
  is_active: boolean
  icon?: string
}

const SERVICE_ICONS: Record<string, any> = {
  flight: Plane,
  hotel: Hotel,
  insurance: Shield,
  default: Package,
}

export function ServicesManagement() {
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingService, setEditingService] = useState<ServiceType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ServiceType>({
    name: "",
    description: "",
    base_price_usd: 0,
    base_price_ngn: 0,
    is_active: true,
    icon: "default",
  })

  const supabase = createClient()

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("name")

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error("Failed to load services:", error)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  function openEditDialog(service: ServiceType) {
    setEditingService(service)
    setFormData({ ...service })
    setIsDialogOpen(true)
  }

  function openAddDialog() {
    setEditingService(null)
    setFormData({
      name: "",
      description: "",
      base_price_usd: 0,
      base_price_ngn: 0,
      is_active: true,
      icon: "default",
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error("Service name is required")
      return
    }

    if (formData.base_price_usd < 0 || formData.base_price_ngn < 0) {
      toast.error("Prices cannot be negative")
      return
    }

    setSaving(true)
    try {
      const serviceData = {
        name: formData.name.toLowerCase().replace(/\s+/g, "_"),
        description: formData.description,
        base_price_usd: formData.base_price_usd,
        base_price_ngn: formData.base_price_ngn,
        is_active: formData.is_active,
        icon: formData.icon,
      }

      let error
      if (editingService?.id) {
        const { error: updateError } = await supabase
          .from("service_types")
          .update(serviceData)
          .eq("id", editingService.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from("service_types")
          .insert([serviceData])
        error = insertError
      }

      if (error) throw error

      toast.success(editingService ? "Service updated successfully" : "Service created successfully")
      setIsDialogOpen(false)
      loadServices()
    } catch (error) {
      console.error("Failed to save service:", error)
      toast.error("Failed to save service")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(service: ServiceType) {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from("service_types")
        .delete()
        .eq("id", service.id)

      if (error) throw error

      toast.success("Service deleted successfully")
      loadServices()
    } catch (error) {
      console.error("Failed to delete service:", error)
      toast.error("Failed to delete service")
    }
  }

  async function handleToggleActive(service: ServiceType) {
    try {
      const { error } = await supabase
        .from("service_types")
        .update({ is_active: !service.is_active })
        .eq("id", service.id)

      if (error) throw error

      setServices(services.map(s => 
        s.id === service.id ? { ...s, is_active: !s.is_active } : s
      ))
      toast.success(`Service ${service.is_active ? "disabled" : "enabled"}`)
    } catch (error) {
      console.error("Failed to toggle service:", error)
      toast.error("Failed to update service")
    }
  }

  function getIconComponent(iconName?: string) {
    return SERVICE_ICONS[iconName || "default"] || SERVICE_ICONS.default
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Services Management
            </CardTitle>
            <CardDescription>
              Create and manage the services offered on your platform
            </CardDescription>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No services configured yet.</p>
            <p className="text-sm">Click &quot;Add Service&quot; to create your first service.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Price (NGN)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const IconComponent = getIconComponent(service.icon)
                return (
                  <TableRow key={service.id} className={!service.is_active ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium capitalize">
                          {service.name.replace(/_/g, " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {service.description || "-"}
                    </TableCell>
                    <TableCell>${service.base_price_usd.toFixed(2)}</TableCell>
                    <TableCell>₦{service.base_price_ngn.toLocaleString()}</TableCell>
                    <TableCell>
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => handleToggleActive(service)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(service)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(service)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? "Update the service details below."
                  : "Fill in the details to create a new service."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Flight Reservation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the service"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceUsd">Price (USD)</Label>
                  <Input
                    id="priceUsd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_price_usd}
                    onChange={(e) => setFormData({ ...formData, base_price_usd: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceNgn">Price (NGN)</Label>
                  <Input
                    id="priceNgn"
                    type="number"
                    min="0"
                    value={formData.base_price_ngn}
                    onChange={(e) => setFormData({ ...formData, base_price_ngn: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  value={formData.icon || "default"}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="flight">Flight</option>
                  <option value="hotel">Hotel</option>
                  <option value="insurance">Insurance</option>
                  <option value="default">Package</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingService ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
