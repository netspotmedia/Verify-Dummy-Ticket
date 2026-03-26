"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Image } from 'lucide-react'
import Link from 'next/link'

interface SiteSettings {
  site_logo?: {
    light?: string
    dark?: string
    favicon?: string
  }
  site_name?: string
  site_tagline?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_logo: { light: '', dark: '', favicon: '' },
    site_name: '',
    site_tagline: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/landing/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          site_logo: data.site_logo || { light: '', dark: '', favicon: '' },
          site_name: data.site_name || '',
          site_tagline: data.site_tagline || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: 'site_logo', value: settings.site_logo, category: 'general' },
        { key: 'site_name', value: settings.site_name, category: 'general' },
        { key: 'site_tagline', value: settings.site_tagline, category: 'general' },
      ]

      for (const update of updates) {
        await fetch('/api/landing/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        })
      }

      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
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
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground">Manage global site settings including logo</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Logo Settings
            </CardTitle>
            <CardDescription>Upload and manage your site logos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Light Logo URL</Label>
                <Input
                  value={settings.site_logo?.light || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    site_logo: { ...settings.site_logo!, light: e.target.value }
                  })}
                  placeholder="/logo-light.svg"
                />
                <p className="text-xs text-muted-foreground">For light backgrounds</p>
              </div>
              <div className="space-y-2">
                <Label>Dark Logo URL</Label>
                <Input
                  value={settings.site_logo?.dark || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    site_logo: { ...settings.site_logo!, dark: e.target.value }
                  })}
                  placeholder="/logo-dark.svg"
                />
                <p className="text-xs text-muted-foreground">For dark backgrounds</p>
              </div>
              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input
                  value={settings.site_logo?.favicon || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    site_logo: { ...settings.site_logo!, favicon: e.target.value }
                  })}
                  placeholder="/favicon.ico"
                />
                <p className="text-xs text-muted-foreground">Browser tab icon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic site information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={settings.site_name || ''}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="VerifyDummyTickets"
                />
              </div>
              <div className="space-y-2">
                <Label>Site Tagline</Label>
                <Input
                  value={settings.site_tagline || ''}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  placeholder="Your tagline here"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
