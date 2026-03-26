"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, CheckCircle, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import type { GuaranteeItem } from '@/lib/supabase'

export default function GuaranteesPage() {
  const [items, setItems] = useState<GuaranteeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/landing/guarantees')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch guarantees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const newItem = {
      title: 'New Guarantee',
      description: 'Guarantee description...',
      icon: 'CheckCircle',
      is_active: true,
    }

    try {
      const res = await fetch('/api/landing/guarantees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      if (res.ok) {
        const data = await res.json()
        setItems([...items, data])
        toast.success('Guarantee added!')
      }
    } catch (error) {
      toast.error('Failed to add guarantee')
    }
  }

  const handleUpdate = async (item: GuaranteeItem) => {
    try {
      const res = await fetch('/api/landing/guarantees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })

      if (res.ok) {
        const data = await res.json()
        setItems(items.map((i) => (i.id === data.id ? data : i)))
        toast.success('Guarantee updated!')
      }
    } catch (error) {
      toast.error('Failed to update guarantee')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guarantee?')) return

    try {
      const res = await fetch(`/api/landing/guarantees?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setItems(items.filter((i) => i.id !== id))
        toast.success('Guarantee deleted!')
      }
    } catch (error) {
      toast.error('Failed to delete guarantee')
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
          <h1 className="text-3xl font-bold tracking-tight">Guarantees</h1>
          <p className="text-muted-foreground">Manage trust badges and guarantees</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guarantee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{item.title}</CardTitle>
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
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => setItems(items.map((i) => (i.id === item.id ? { ...i, title: e.target.value } : i)))}
                  onBlur={() => handleUpdate(item)}
                />
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
                  placeholder="CheckCircle, Shield, Zap..."
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No guarantees found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Guarantee
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
