"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author_name: string | null
  category: string | null
  is_published: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author_name: "Admin",
    category: "",
    is_published: false,
    is_featured: false,
    seo_title: "",
    seo_description: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Failed to load posts:", error)
      toast.error("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  function openEditDialog(post: BlogPost) {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image: post.featured_image || "",
      author_name: post.author_name || "Admin",
      category: post.category || "",
      is_published: post.is_published,
      is_featured: post.is_featured,
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
    })
    setIsDialogOpen(true)
  }

  function openAddDialog() {
    setEditingPost(null)
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image: "",
      author_name: "Admin",
      category: "",
      is_published: false,
      is_featured: false,
      seo_title: "",
      seo_description: "",
    })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }

    const slug = formData.slug || generateSlug(formData.title)

    setSaving(true)
    try {
      const postData = {
        title: formData.title,
        slug,
        excerpt: formData.excerpt || null,
        content: formData.content,
        featured_image: formData.featured_image || null,
        author_name: formData.author_name || "Admin",
        category: formData.category || null,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        published_at: formData.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      let error
      if (editingPost) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", editingPost.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from("blog_posts")
          .insert([postData])
        error = insertError
      }

      if (error) throw error

      toast.success(editingPost ? "Post updated" : "Post created")
      setIsDialogOpen(false)
      loadPosts()
    } catch (error) {
      console.error("Failed to save post:", error)
      toast.error("Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id)

      if (error) throw error

      setPosts(posts.filter(p => p.id !== id))
      toast.success("Post deleted")
    } catch (error) {
      toast.error("Failed to delete post")
    }
  }

  async function togglePublished(post: BlogPost) {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          is_published: !post.is_published,
          published_at: !post.is_published ? new Date().toISOString() : null,
        })
        .eq("id", post.id)

      if (error) throw error

      setPosts(posts.map(p =>
        p.id === post.id ? { ...p, is_published: !p.is_published } : p
      ))
      toast.success(post.is_published ? "Post unpublished" : "Post published")
    } catch (error) {
      toast.error("Failed to update post")
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No blog posts yet. Create your first post.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">/{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.category && (
                        <Badge variant="outline">{post.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.is_featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={post.is_published}
                        onCheckedChange={() => togglePublished(post)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : "Draft"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "New Blog Post"}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? "Update the post details below." : "Fill in the details to create a new blog post."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: e.target.value ? generateSlug(e.target.value) : ""
                    })
                  }}
                  placeholder="Post title"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-slug"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief excerpt for previews..."
                  rows={2}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Post content in markdown..."
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Visa Tips"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Author name"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <Input
                  id="featured_image"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>SEO Settings</Label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="SEO Title (defaults to post title)"
                />
                <Textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder="SEO Description..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-8 col-span-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingPost ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
