"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import Link from 'next/link'

interface HeroSection {
  id?: string
  badge_text: string
  badge_color: string
  heading: string
  heading_color: string
  subheading: string
  subheading_color: string
  embassy_notice: string
  embassy_notice_color: string
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string
  cta_secondary_link: string
  background_type: string
  background_color: string
  background_image_url: string
}

export default function HeroSectionPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hero, setHero] = useState<HeroSection>({
    badge_text: '',
    badge_color: 'rgb(204, 25, 57)',
    heading: '',
    heading_color: 'rgb(15, 23, 42)',
    subheading: '',
    subheading_color: 'rgb(0, 0, 0)',
    embassy_notice: '',
    embassy_notice_color: 'rgb(221, 24, 59)',
    cta_primary_text: 'Start Your Order',
    cta_primary_link: '/order',
    cta_secondary_text: 'Chat on WhatsApp',
    cta_secondary_link: 'https://wa.me/27687076011',
    background_type: 'gradient',
    background_color: '',
    background_image_url: '',
  })

  useEffect(() => {
    fetchHero()
  }, [])

  const fetchHero = async () => {
    try {
      const res = await fetch('/api/landing/hero')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setHero({ ...hero, ...data })
        }
      }
    } catch (error) {
      console.error('Failed to fetch hero:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/landing/hero', {
        method: hero.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
      })

      if (res.ok) {
        const data = await res.json()
        setHero({ ...hero, id: data.id })
        toast.success('Hero section saved successfully!')
      } else {
        toast.error('Failed to save hero section')
      }
    } catch (error) {
      toast.error('Failed to save hero section')
    } finally {
      setSaving(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Hero Section</h1>
          <p className="text-muted-foreground">Manage your main banner content</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
            <CardDescription>The small text above the main heading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Badge Text</Label>
                <Input
                  value={hero.badge_text}
                  onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                  placeholder="Trusted by 12,653,898+ travelers"
                />
              </div>
              <div className="space-y-2">
                <Label>Badge Color (CSS)</Label>
                <Input
                  value={hero.badge_color}
                  onChange={(e) => setHero({ ...hero, badge_color: e.target.value })}
                  placeholder="rgb(204, 25, 57)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Main Heading</CardTitle>
            <CardDescription>The large title displayed on the hero</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Heading Text</Label>
              <Textarea
                value={hero.heading}
                onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                placeholder="Flight, Hotel & Travel Insurance for Visa Applications"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Heading Color (CSS)</Label>
                <Input
                  value={hero.heading_color}
                  onChange={(e) => setHero({ ...hero, heading_color: e.target.value })}
                  placeholder="rgb(15, 23, 42)"
                />
              </div>
              <div className="space-y-2">
                <Label>Background Type</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  value={hero.background_type}
                  onChange={(e) => setHero({ ...hero, background_type: e.target.value })}
                >
                  <option value="gradient">Gradient</option>
                  <option value="image">Image</option>
                  <option value="color">Solid Color</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subheading</CardTitle>
            <CardDescription>The description text below the heading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subheading Text</Label>
              <Textarea
                value={hero.subheading}
                onChange={(e) => setHero({ ...hero, subheading: e.target.value })}
                placeholder="Get Verify Dummy Ticket & Hotel for visa application..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Subheading Color (CSS)</Label>
              <Input
                value={hero.subheading_color}
                onChange={(e) => setHero({ ...hero, subheading_color: e.target.value })}
                placeholder="rgb(0, 0, 0)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embassy Notice</CardTitle>
            <CardDescription>The italic text below the subheading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notice Text</Label>
              <Textarea
                value={hero.embassy_notice}
                onChange={(e) => setHero({ ...hero, embassy_notice: e.target.value })}
                placeholder="Embassy recommends not to purchase tickets..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Notice Color (CSS)</Label>
              <Input
                value={hero.embassy_notice_color}
                onChange={(e) => setHero({ ...hero, embassy_notice_color: e.target.value })}
                placeholder="rgb(221, 24, 59)"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call to Action Buttons</CardTitle>
            <CardDescription>Configure the CTA buttons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary Button Text</Label>
                <Input
                  value={hero.cta_primary_text}
                  onChange={(e) => setHero({ ...hero, cta_primary_text: e.target.value })}
                  placeholder="Start Your Order"
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Button Link</Label>
                <Input
                  value={hero.cta_primary_link}
                  onChange={(e) => setHero({ ...hero, cta_primary_link: e.target.value })}
                  placeholder="/order"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Secondary Button Text</Label>
                <Input
                  value={hero.cta_secondary_text}
                  onChange={(e) => setHero({ ...hero, cta_secondary_text: e.target.value })}
                  placeholder="Chat on WhatsApp"
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Button Link</Label>
                <Input
                  value={hero.cta_secondary_link}
                  onChange={(e) => setHero({ ...hero, cta_secondary_link: e.target.value })}
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {hero.background_type === 'image' && (
          <Card>
            <CardHeader>
              <CardTitle>Background Image</CardTitle>
              <CardDescription>Set a background image for the hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={hero.background_image_url}
                  onChange={(e) => setHero({ ...hero, background_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
