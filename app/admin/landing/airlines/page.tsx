"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, GripVertical, Plane, Upload, X, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Airline {
  id: string
  name: string
  code: string
  logo_url: string | null
  sort_order: number | null
  is_active: boolean | null
}

export default function AirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAirlines()
  }, [])

  const fetchAirlines = async () => {
    try {
      const res = await fetch('/api/landing/airlines')
      if (res.ok) {
        const data = await res.json()
        setAirlines(data)
      }
    } catch (error) {
      console.error('Failed to fetch airlines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const newAirline = {
      name: 'New Airline',
      code: 'XX',
      logo_url: null,
      sort_order: airlines.length + 1,
      is_active: true,
    }

    try {
      const res = await fetch('/api/landing/airlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAirline),
      })

      if (res.ok) {
        const data = await res.json()
        setAirlines([...airlines, data])
        toast.success('Airline added!')
      }
    } catch (error) {
      toast.error('Failed to add airline')
    }
  }

  const handleUpdate = async (airline: Airline) => {
    try {
      const res = await fetch('/api/landing/airlines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(airline),
      })

      if (res.ok) {
        const data = await res.json()
        setAirlines(airlines.map((a) => (a.id === data.id ? data : a)))
        toast.success('Airline updated!')
      }
    } catch (error) {
      toast.error('Failed to update airline')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this airline?')) return

    try {
      const res = await fetch(`/api/landing/airlines?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAirlines(airlines.filter((a) => a.id !== id))
        toast.success('Airline deleted!')
      }
    } catch (error) {
      toast.error('Failed to delete airline')
    }
  }

  const handleImageUpload = async (airlineId: string, file: File) => {
    setUploadingId(airlineId)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', `airlines/${airlineId}-${file.name}`)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const url = data.url
        const updatedAirlines = airlines.map((a) => 
          a.id === airlineId ? { ...a, logo_url: url } : a
        )
        setAirlines(updatedAirlines)
        await handleUpdate({ ...airlines.find((a) => a.id === airlineId)!, logo_url: url })
        toast.success('Logo uploaded!')
      } else {
        toast.error('Failed to upload logo')
      }
    } catch (error) {
      toast.error('Failed to upload logo')
    } finally {
      setUploadingId(null)
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
          <h1 className="text-3xl font-bold tracking-tight">Airlines</h1>
          <p className="text-muted-foreground">Manage airline logos for the carousel</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Airline
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {airlines.map((airline) => (
          <Card key={airline.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-muted-foreground">{airline.code}</span>
                </div>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={airline.is_active ?? false}
                    onChange={(e) => handleUpdate({ ...airline, is_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Active
                </label>
              </div>
              <CardTitle className="text-base truncate">{airline.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-slate-50 overflow-hidden transition-colors",
                  airline.logo_url ? "border-solid border-slate-300" : "border-slate-300"
                )}>
                  {airline.logo_url ? (
                    <img src={airline.logo_url} alt={airline.name} className="h-full w-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 w-full">
                  <label className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md cursor-pointer transition-colors",
                    "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  )}>
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(airline.id, file)
                      }}
                      disabled={uploadingId === airline.id}
                    />
                  </label>
                  {airline.logo_url && (
                    <button
                      onClick={() => handleUpdate({ ...airline, logo_url: null })}
                      className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Edit Airline Details</h2>
        {airlines.map((airline) => (
          <Card key={airline.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <CardTitle>{airline.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={airline.is_active ?? false}
                      onChange={(e) => handleUpdate({ ...airline, is_active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Active
                  </label>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(airline.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Airline Name</Label>
                  <Input
                    value={airline.name}
                    onChange={(e) => setAirlines(airlines.map((a) => (a.id === airline.id ? { ...a, name: e.target.value } : a)))}
                    onBlur={() => handleUpdate(airline)}
                    placeholder="Airline Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Airline Code (2 letters)</Label>
                  <Input
                    value={airline.code}
                    onChange={(e) => setAirlines(airlines.map((a) => (a.id === airline.id ? { ...a, code: e.target.value.toUpperCase().slice(0, 2) } : a)))}
                    onBlur={() => handleUpdate(airline)}
                    placeholder="EK"
                    maxLength={2}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={airline.sort_order || 0}
                    onChange={(e) => setAirlines(airlines.map((a) => (a.id === airline.id ? { ...a, sort_order: parseInt(e.target.value) } : a)))}
                    onBlur={() => handleUpdate(airline)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL (or upload above)</Label>
                  <Input
                    value={airline.logo_url || ''}
                    onChange={(e) => setAirlines(airlines.map((a) => (a.id === airline.id ? { ...a, logo_url: e.target.value } : a)))}
                    onBlur={() => handleUpdate(airline)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {airlines.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Plane className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No airlines found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Airline
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
