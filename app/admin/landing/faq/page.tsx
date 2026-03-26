"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Plus, Trash2, HelpCircle, GripVertical } from 'lucide-react'
import Link from 'next/link'
import type { FaqItem } from '@/lib/supabase'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { RichTextEditor, renderRichText } from '@/components/rich-text-editor'

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/landing/faq')
      if (res.ok) {
        const data = await res.json()
        setFaqs(data)
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const newFaq = {
      question: 'New Question',
      answer: 'Answer to the question...',
      sort_order: faqs.length + 1,
      is_active: true,
    }

    try {
      const res = await fetch('/api/landing/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaq),
      })

      if (res.ok) {
        const data = await res.json()
        setFaqs([...faqs, data])
        toast.success('FAQ added!')
      }
    } catch (error) {
      toast.error('Failed to add FAQ')
    }
  }

  const handleUpdate = async (faq: FaqItem) => {
    try {
      const res = await fetch('/api/landing/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq),
      })

      if (res.ok) {
        const data = await res.json()
        setFaqs(faqs.map((f) => (f.id === data.id ? data : f)))
        toast.success('FAQ updated!')
      }
    } catch (error) {
      toast.error('Failed to update FAQ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      const res = await fetch(`/api/landing/faq?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setFaqs(faqs.filter((f) => f.id !== id))
        toast.success('FAQ deleted!')
      }
    } catch (error) {
      toast.error('Failed to delete FAQ')
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
          <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
          <p className="text-muted-foreground">Manage frequently asked questions with rich text formatting</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>See how your FAQs look on the landing page</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger dangerouslySetInnerHTML={{ __html: faq.question }} />
                <AccordionContent>
                  <div dangerouslySetInnerHTML={{ __html: renderRichText(faq.answer) }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={faq.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={faq.is_active ?? false}
                      onChange={(e) => handleUpdate({ ...faq, is_active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    Active
                  </label>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(faq.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <RichTextEditor
                  value={faq.question}
                  onChange={(value) => setFaqs(faqs.map((f) => (f.id === faq.id ? { ...f, question: value } : f)))}
                  onBlur={() => handleUpdate(faq)}
                  placeholder="Enter question..."
                  className="rounded-lg"
                  minHeight="60px"
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <RichTextEditor
                  value={faq.answer}
                  onChange={(value) => setFaqs(faqs.map((f) => (f.id === faq.id ? { ...f, answer: value } : f)))}
                  onBlur={() => handleUpdate(faq)}
                  placeholder="Enter answer with formatting..."
                  className="rounded-lg"
                  minHeight="150px"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={faq.sort_order || 0}
                  onChange={(e) => setFaqs(faqs.map((f) => (f.id === faq.id ? { ...f, sort_order: parseInt(e.target.value) } : f)))}
                  onBlur={() => handleUpdate(faq)}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {faqs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No FAQs found</p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First FAQ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
