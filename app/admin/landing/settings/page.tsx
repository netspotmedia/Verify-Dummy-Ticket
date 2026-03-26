"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Image, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputLight = useRef<HTMLInputElement>(null)
  const fileInputDark = useRef<HTMLInputElement>(null)
  const fileInputFavicon = useRef<HTMLInputElement>(null)

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

  const handleFileUpload = async (file: File, type: 'light' | 'dark' | 'favicon') => {
    setUploading(type)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${type}-logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        toast.error(`Failed to upload ${type} logo`)
        console.error('Upload error:', error)
        return null
      }

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
      return null
    } finally {
      setUploading(null)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    const publicUrl = await handleFileUpload(file, type)
    if (publicUrl) {
      setSettings({
        ...settings,
        site_logo: { ...settings.site_logo!, [type]: publicUrl },
      })
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} logo uploaded!`)
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
            <CardDescription>Upload your site logos (SVG, PNG, or JPG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Light Logo */}
            <div className="space-y-2">
              <Label>Light Logo (Light Backgrounds)</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={settings.site_logo?.light || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      site_logo: { ...settings.site_logo!, light: e.target.value }
                    })}
                    placeholder="https://... or upload below"
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputLight}
                  onChange={(e) => handleLogoChange(e, 'light')}
                  accept="image/svg+xml,image/png,image/jpeg"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputLight.current?.click()}
                  disabled={uploading === 'light'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading === 'light' ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {settings.site_logo?.light && (
                <div className="mt-2 p-4 bg-slate-50 rounded-lg">
                  <img src={settings.site_logo.light} alt="Light Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>

            {/* Dark Logo */}
            <div className="space-y-2">
              <Label>Dark Logo (Dark Backgrounds)</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={settings.site_logo?.dark || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      site_logo: { ...settings.site_logo!, dark: e.target.value }
                    })}
                    placeholder="https://... or upload below"
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputDark}
                  onChange={(e) => handleLogoChange(e, 'dark')}
                  accept="image/svg+xml,image/png,image/jpeg"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputDark.current?.click()}
                  disabled={uploading === 'dark'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading === 'dark' ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {settings.site_logo?.dark && (
                <div className="mt-2 p-4 bg-slate-900 rounded-lg">
                  <img src={settings.site_logo.dark} alt="Dark Logo" className="h-12 object-contain brightness-0 invert" />
                </div>
              )}
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <Label>Favicon (Browser Tab Icon)</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={settings.site_logo?.favicon || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      site_logo: { ...settings.site_logo!, favicon: e.target.value }
                    })}
                    placeholder="https://... or upload below"
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputFavicon}
                  onChange={(e) => handleLogoChange(e, 'favicon')}
                  accept="image/svg+xml,image/png,image/x-icon"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputFavicon.current?.click()}
                  disabled={uploading === 'favicon'}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading === 'favicon' ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {settings.site_logo?.favicon && (
                <div className="mt-2 flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                  <img src={settings.site_logo.favicon} alt="Favicon" className="h-8 w-8" />
                  <span className="text-sm text-muted-foreground">Current favicon</span>
                </div>
              )}
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
