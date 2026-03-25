"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Star, Plus, Pencil, Trash2, Loader2, Eye, Check, X } from "lucide-react"
import { toast } from "sonner"

interface Testimonial {
  id: string
  name: string
  location: string | null
  rating: number
  content: string
  is_featured: boolean
  is_approved: boolean
  created_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rating: 5,
    content: "",
    is_featured: false,
    is_approved: true,
  })

  const supabase = createClient()

  useEffect(() => {
    loadTestimonials()
  }, [])

  async function loadTestimonials() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Failed to load testimonials:", error)
      toast.error("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  function openEditDialog(testimonial: Testimonial) {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      location: testimonial.location || "",
      rating: testimonial.rating,
      content: testimonial.content,
      is_featured: testimonial.is_featured,
      is_approved: testimonial.is_approved,
    })
    setIsDialogOpen(true)
  }

  function openAddDialog() {
    setEditingTestimonial(null)
    setFormData({
      name: "",
      location: "",
      rating: 5,
      content: "",
      is_featured: false,
      is_approved: true,
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Name and content are required")
      return
    }

    setSaving(true)
    try {
      const data = {
        name: formData.name,
        location: formData.location || null,
        rating: formData.rating,
        content: formData.content,
        is_featured: formData.is_featured,
        is_approved: formData.is_approved,
      }

      let error
      if (editingTestimonial) {
        const { error: updateError } = await supabase
          .from("testimonials")
          .update(data)
          .eq("id", editingTestimonial.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from("testimonials")
          .insert([data])
        error = insertError
      }

      if (error) throw error

      toast.success(editingTestimonial ? "Testimonial updated" : "Testimonial created")
      setIsDialogOpen(false)
      loadTestimonials()
    } catch (error) {
      console.error("Failed to save testimonial:", error)
      toast.error("Failed to save testimonial")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id)

      if (error) throw error

      setTestimonials(testimonials.filter(t => t.id !== id))
      toast.success("Testimonial deleted")
    } catch (error) {
      toast.error("Failed to delete testimonial")
    }
  }

  async function toggleApproved(testimonial: Testimonial) {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_approved: !testimonial.is_approved })
        .eq("id", testimonial.id)

      if (error) throw error

      setTestimonials(testimonials.map(t =>
        t.id === testimonial.id ? { ...t, is_approved: !t.is_approved } : t
      ))
      toast.success(testimonial.is_approved ? "Testimonial hidden" : "Testimonial published")
    } catch (error) {
      toast.error("Failed to update testimonial")
    }
  }

  async function toggleFeatured(testimonial: Testimonial) {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ is_featured: !testimonial.is_featured })
        .eq("id", testimonial.id)

      if (error) throw error

      setTestimonials(testimonials.map(t =>
        t.id === testimonial.id ? { ...t, is_featured: !testimonial.is_featured } : t
      ))
      toast.success(testimonial.is_featured ? "Removed from featured" : "Added to featured")
    } catch (error) {
      toast.error("Failed to update testimonial")
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage customer testimonials and reviews
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {testimonials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No testimonials yet. Add your first testimonial.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <Badge variant={testimonial.is_approved ? "default" : "secondary"}>
                        {testimonial.is_approved ? "Published" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        {testimonial.location && (
                          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(testimonial.rating)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {testimonial.content}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={testimonial.is_featured}
                        onCheckedChange={() => toggleFeatured(testimonial)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleApproved(testimonial)}
                          title={testimonial.is_approved ? "Hide" : "Publish"}
                        >
                          {testimonial.is_approved ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(testimonial)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? "Update the testimonial details below."
                : "Fill in the testimonial details below."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${rating <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Testimonial content..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Published</Label>
                <p className="text-sm text-muted-foreground">Show on website</p>
              </div>
              <Switch
                checked={formData.is_approved}
                onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">Show on homepage</p>
              </div>
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingTestimonial ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
