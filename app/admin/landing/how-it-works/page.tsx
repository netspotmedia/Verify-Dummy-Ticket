"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, GripVertical, Zap } from 'lucide-react'
import Link from 'next/link'
import type { HowItWorksItem } from '@/lib/supabase'

export default function HowItWorksPage() {
  const [items, setItems] = useState<HowItWorksItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/landing/how-it-works')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const newItem = {
      step_number: items.length + 1,
      title: 'New Step',
      description: 'Step description...',
      icon: 'Zap',
      is_active: true,
    }

    try {
      const res = await fetch('/api/landing/how-it-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      if (res.ok) {
        const data = await res.json()
        setItems([...items, data])
        toast.success('Step added!')
      }
    } catch (error) {
      toast.error('Failed to add step')
    }
  }

  const handleUpdate = async (item: HowItWorksItem) => {
    try {
      const res = await fetch('/api/landing/how-it-works', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })

      if (res.ok) {
        const data = await res.json()
        setItems(items.map((i) => (i.id === data.id ? data : i)))
        toast.success('Step updated!')
      }
    } catch (error) {
      toast.error('Failed to update step')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return

    try {
      const res = await fetch(`/api/landing/how-it-works?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems(items.filter((i) => i.id !== id))
        toast.success('Step deleted!')
      }
    } catch (error) {
      toast.error('Failed to delete step')
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
          <h1 className="text-3xl font-bold tracking-tight">How It Works</h1>
          <p className="text-muted-foreground">Manage the step-by-step process section</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="relative">
            <div className="absolute top-4 right-4">
              <span className="text-4xl font-bold text-muted-foreground/20">{item.step_number}</span>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {item.step_number}
                  </span>
                  <CardTitle>{item.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.is_active ?? false}
                      onChange={(e) => handleUpdate({ ...item, is_active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Active
                  </label>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Step Number</Label>
                  <Input
                    type="number"
                    value={item.step_number}
                    onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, step_number: parseInt(e.target.value) } : i)))}
                    onBlur={() => handleUpdate(item)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, title: e.target.value } : i)))}
                    onBlur={() => handleUpdate(item)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={item.description || ''}
                  onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i)))}
                  onBlur={() => handleUpdate(item)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon Name (Lucide icon)</Label>
                <Input
                  value={item.icon || ''}
                  onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, icon: e.target.value } : i)))}
                  onBlur={() => handleUpdate(item)}
                  placeholder="Zap, Check, ArrowRight..."
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No steps found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Step
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
