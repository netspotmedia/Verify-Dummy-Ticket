"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Save, Image, Upload } from 'lucide-react'
import Link from 'next/link'

interface SiteSettings {
  site_logo?: {
    light?: string
    dark?: string
    favicon?: string
  }
  site_name?: string
  site_tagline?: string
  site_phone?: string
  footer_company_name?: string
  footer_copyright?: string
  footer_facebook?: string
  footer_instagram?: string
  footer_twitter?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_logo: { light: '', dark: '', favicon: '' },
    site_name: '',
    site_tagline: '',
    site_phone: '',
    footer_company_name: '',
    footer_copyright: '',
    footer_facebook: '',
    footer_instagram: '',
    footer_twitter: '',
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
        { key: 'site_phone', value: settings.site_phone, category: 'general' },
        { key: 'footer_company_name', value: settings.footer_company_name, category: 'landing' },
        { key: 'footer_copyright', value: settings.footer_copyright, category: 'landing' },
        { key: 'footer_facebook', value: settings.footer_facebook, category: 'landing' },
        { key: 'footer_instagram', value: settings.footer_instagram, category: 'landing' },
        { key: 'footer_twitter', value: settings.footer_twitter, category: 'landing' },
      ]

      // Bulk update in single request
      const res = await fetch('/api/landing/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates }),
      })

      if (!res.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = (type: 'light' | 'dark' | 'favicon', value: string) => {
    setSettings({
      ...settings,
      site_logo: { ...settings.site_logo!, [type]: value },
    })
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
            <CardDescription>
              Enter the URL for your logos. You can host images on Supabase Storage, Cloudinary, or any image hosting service.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Light Logo */}
            <div className="space-y-2">
              <Label>Light Logo URL (Light Backgrounds)</Label>
              <Input
                value={settings.site_logo?.light || ''}
                onChange={(e) => handleLogoChange('light', e.target.value)}
                placeholder="https://your-bucket.supabase.co/storage/v1/object/public/logos/logo-light.png"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 200x50px (SVG, PNG, or JPG)
              </p>
              {settings.site_logo?.light && (
                <div className="mt-2 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img src={settings.site_logo.light} alt="Light Logo" className="h-12 object-contain" />
                </div>
              )}
            </div>

            {/* Dark Logo */}
            <div className="space-y-2">
              <Label>Dark Logo URL (Dark Backgrounds)</Label>
              <Input
                value={settings.site_logo?.dark || ''}
                onChange={(e) => handleLogoChange('dark', e.target.value)}
                placeholder="https://your-bucket.supabase.co/storage/v1/object/public/logos/logo-dark.png"
              />
              <p className="text-xs text-muted-foreground">
                For use on dark backgrounds or navbar
              </p>
              {settings.site_logo?.dark && (
                <div className="mt-2 p-4 bg-slate-900 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Preview:</p>
                  <img src={settings.site_logo.dark} alt="Dark Logo" className="h-12 object-contain brightness-0 invert" />
                </div>
              )}
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <Label>Favicon URL (Browser Tab Icon)</Label>
              <Input
                value={settings.site_logo?.favicon || ''}
                onChange={(e) => handleLogoChange('favicon', e.target.value)}
                placeholder="https://your-bucket.supabase.co/storage/v1/object/public/logos/favicon.ico"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 32x32px or 64x64px (ICO, PNG, or SVG)
              </p>
              {settings.site_logo?.favicon && (
                <div className="mt-2 flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <img src={settings.site_logo.favicon} alt="Favicon" className="h-8 w-8" />
                  <span className="text-sm text-muted-foreground">Current favicon preview</span>
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
                  placeholder="My Travel Services"
                />
              </div>
              <div className="space-y-2">
                <Label>Site Tagline</Label>
                <Input
                  value={settings.site_tagline || ''}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  placeholder="Flight, Hotel & Travel Insurance for Visa Applications"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={settings.site_phone || ''}
                  onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                  placeholder="+234 800 123 4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need to upload images?</CardTitle>
            <CardDescription>How to get your logo URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p><strong>Option 1: Supabase Storage</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Supabase Dashboard → Storage</li>
                <li>Create a new bucket named "logos" (public)</li>
                <li>Upload your logo files</li>
                <li>Copy the public URL and paste above</li>
              </ol>
            </div>
            <div className="space-y-2">
              <p><strong>Option 2: Image Hosting (ImgBB, Cloudinary, etc.)</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Upload your logo to any image hosting service</li>
                <li>Copy the direct image URL</li>
                <li>Paste above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
