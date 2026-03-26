"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, Star, GripVertical } from 'lucide-react'
import Link from 'next/link'
import { RichTextEditor } from '@/components/rich-text-editor'
import type { Testimonial } from '@/lib/supabase'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/landing/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const newItem = {
      name: 'New Customer',
      location: 'City, Country',
      rating: 5,
      comment: 'Customer testimonial here...',
      is_active: true,
    }

    try {
      const res = await fetch('/api/landing/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      if (res.ok) {
        const data = await res.json()
        setTestimonials([...testimonials, data])
        toast.success('Testimonial added!')
      }
    } catch (error) {
      toast.error('Failed to add testimonial')
    }
  }

  const handleUpdate = async (item: Testimonial) => {
    try {
      const res = await fetch('/api/landing/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })

      if (res.ok) {
        const data = await res.json()
        setTestimonials(testimonials.map((t) => (t.id === data.id ? data : t)))
        toast.success('Testimonial updated!')
      }
    } catch (error) {
      toast.error('Failed to update testimonial')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    try {
      const res = await fetch(`/api/landing/testimonials?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id))
        toast.success('Testimonial deleted!')
      }
    } catch (error) {
      toast.error('Failed to delete testimonial')
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
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer testimonials</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < (item.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <CardDescription>{item.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {testimonials.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>{item.location}</CardDescription>
                  </div>
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
                  <Label>Name</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, name: e.target.value } : t)))}
                    onBlur={() => handleUpdate(item)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={item.location || ''}
                    onChange={(e) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, location: e.target.value } : t)))}
                    onBlur={() => handleUpdate(item)}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleUpdate({ ...item, rating })}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${rating <= (item.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Comment</Label>
                <RichTextEditor
                  value={item.comment || ''}
                  onChange={(value) => setTestimonials(testimonials.map((t) => (t.id === item.id ? { ...t, comment: value } : t)))}
                  onBlur={() => handleUpdate(item)}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No testimonials found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Testimonial
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
