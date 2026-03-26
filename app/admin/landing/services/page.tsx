"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Plane, Hotel, Shield, GripVertical } from 'lucide-react'
import Link from 'next/link'
import type { ServiceItem } from '@/lib/supabase'
import { RichTextEditor, renderRichText } from '@/components/rich-text-editor'

const iconOptions = [
  { value: 'Plane', label: 'Flight', icon: Plane },
  { value: 'Hotel', label: 'Hotel', icon: Hotel },
  { value: 'Shield', label: 'Shield', icon: Shield },
]

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/landing/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const newService = {
      title: 'New Service',
      description: '',
      icon: 'Plane',
      price_from: 'From $0',
      sort_order: services.length + 1,
      is_active: true,
    }

    try {
      const res = await fetch('/api/landing/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService),
      })

      if (res.ok) {
        const data = await res.json()
        setServices([...services, data])
        toast.success('Service added!')
      }
    } catch (error) {
      toast.error('Failed to add service')
    }
  }

  const handleUpdate = async (service: ServiceItem) => {
    try {
      const res = await fetch('/api/landing/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      })

      if (res.ok) {
        const data = await res.json()
        setServices(services.map((s) => (s.id === data.id ? data : s)))
        toast.success('Service updated!')
      }
    } catch (error) {
      toast.error('Failed to update service')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const res = await fetch(`/api/landing/services?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setServices(services.filter((s) => s.id !== id))
        toast.success('Service deleted!')
      }
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/landing" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Landing Pages
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage services with rich text descriptions</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const IconComponent = iconOptions.find(i => i.value === service.icon)?.icon || Plane
          return (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <IconComponent className="h-5 w-5 text-red-700" />
                    </div>
                    <div>
                      <CardTitle dangerouslySetInnerHTML={{ __html: renderRichText(service.title) }} />
                      <CardDescription>{service.price_from}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={service.is_active ?? false}
                        onChange={(e) => handleUpdate({ ...service, is_active: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      Active
                    </label>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <RichTextEditor
                      value={service.title}
                      onChange={(value) => setServices(services.map((s) => (s.id === service.id ? { ...s, title: value } : s)))}
                      onBlur={() => handleUpdate(service)}
                      placeholder="Service title..."
                      className="rounded-lg"
                      minHeight="60px"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price From</Label>
                    <Input
                      value={service.price_from || ''}
                      onChange={(e) => setServices(services.map((s) => (s.id === service.id ? { ...s, price_from: e.target.value } : s)))}
                      onBlur={() => handleUpdate(service)}
                      placeholder="From $5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={service.description || ''}
                    onChange={(value) => setServices(services.map((s) => (s.id === service.id ? { ...s, description: value } : s)))}
                    onBlur={() => handleUpdate(service)}
                    placeholder="Service description with formatting..."
                    className="rounded-lg"
                    minHeight="150px"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={service.icon || 'Plane'}
                      onChange={(e) => {
                        setServices(services.map((s) => (s.id === service.id ? { ...s, icon: e.target.value } : s)))
                        handleUpdate({ ...service, icon: e.target.value })
                      }}
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={service.sort_order || 0}
                      onChange={(e) => setServices(services.map((s) => (s.id === service.id ? { ...s, sort_order: parseInt(e.target.value) } : s)))}
                      onBlur={() => handleUpdate(service)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {services.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No services found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
