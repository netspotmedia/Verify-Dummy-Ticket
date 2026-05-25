"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Globe, Mail, Image, Upload, X, Key } from "lucide-react"
import { toast } from "sonner"

interface SiteSettings {
  site_name: string
  site_phone: string
  support_email: string
  support_phone: string
  whatsapp_number: string
  address: string
  logo_url: string
  footer_company_name: string
  footer_copyright: string
  footer_facebook: string
  footer_instagram: string
  footer_twitter: string
  resend_api_key: string
}

const SETTINGS_KEYS = [
  "site_name",
  "site_phone",
  "support_email",
  "support_phone",
  "whatsapp_number",
  "address",
  "logo_url",
  "footer_company_name",
  "footer_copyright",
  "footer_facebook",
  "footer_instagram",
  "footer_twitter",
  "resend_api_key",
]

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: process.env.NEXT_PUBLIC_SITE_NAME || "My Travel Services",
    site_phone: process.env.NEXT_PUBLIC_SITE_PHONE || "+27 68 707 6011",
    support_email: "support@example.com",
    support_phone: "+27 68 707 6011",
    whatsapp_number: "+27 68 707 6011",
    address: "",
    logo_url: "",
    footer_company_name: process.env.NEXT_PUBLIC_SITE_NAME || "My Travel Services",
    footer_copyright: `© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "My Travel Services"}. All rights reserved.`,
    footer_facebook: "https://facebook.com",
    footer_instagram: "https://instagram.com",
    footer_twitter: "https://twitter.com",
    resend_api_key: "",
  })
  const [previewLogo, setPreviewLogo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")

      if (error) throw error

      const settingsMap: Record<string, any> = {}
      data?.forEach((item: { key: string; value: any }) => {
        settingsMap[item.key] = item.value
      })

      setSettings({
        site_name: settingsMap.site_name || process.env.NEXT_PUBLIC_SITE_NAME || "My Travel Services",
        site_phone: settingsMap.site_phone || process.env.NEXT_PUBLIC_SITE_PHONE || "+27 68 707 6011",
        support_email: settingsMap.support_email || "",
        support_phone: settingsMap.support_phone || "",
        whatsapp_number: settingsMap.whatsapp_number || "",
        address: settingsMap.address || "",
        logo_url: settingsMap.logo_url || "",
        footer_company_name: settingsMap.footer_company_name || process.env.NEXT_PUBLIC_SITE_NAME || "My Travel Services",
        footer_copyright: settingsMap.footer_copyright || `© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_SITE_NAME || "My Travel Services"}. All rights reserved.`,
        footer_facebook: settingsMap.footer_facebook || "https://facebook.com",
        footer_instagram: settingsMap.footer_instagram || "https://instagram.com",
        footer_twitter: settingsMap.footer_twitter || "https://twitter.com",
        resend_api_key: settingsMap.resend_api_key || "",
      })
      if (settingsMap.logo_url) {
        setPreviewLogo(settingsMap.logo_url)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath)

      const logoUrl = urlData.publicUrl
      setPreviewLogo(logoUrl)
      setSettings({ ...settings, logo_url: logoUrl })

      toast.success("Logo uploaded successfully")
    } catch (error) {
      console.error("Logo upload error:", error)
      toast.error("Failed to upload logo. Make sure the storage bucket exists.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  async function removeLogo() {
    setPreviewLogo(null)
    setSettings({ ...settings, logo_url: "" })
    toast.success("Logo removed")
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      const settingsToSave = [
        { category: "general", key: "site_name", value: settings.site_name },
        { category: "general", key: "site_phone", value: settings.site_phone },
        { category: "general", key: "support_email", value: settings.support_email },
        { category: "general", key: "support_phone", value: settings.support_phone },
        { category: "general", key: "whatsapp_number", value: settings.whatsapp_number },
        { category: "general", key: "address", value: settings.address },
        { category: "general", key: "logo_url", value: settings.logo_url },
        { category: "general", key: "resend_api_key", value: settings.resend_api_key },
        { category: "landing", key: "footer_company_name", value: settings.footer_company_name },
        { category: "landing", key: "footer_copyright", value: settings.footer_copyright },
        { category: "landing", key: "footer_facebook", value: settings.footer_facebook },
        { category: "landing", key: "footer_instagram", value: settings.footer_instagram },
        { category: "landing", key: "footer_twitter", value: settings.footer_twitter },
      ]

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(setting, { onConflict: "category,key" })

        if (error) throw error
      }

      toast.success("Settings saved successfully")
    } catch (err) {
      console.error("Save settings error:", err)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your site settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Site Logo
            </CardTitle>
            <CardDescription>Upload your site logo (max 2MB, PNG, JPG, or SVG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-6">
              {previewLogo ? (
                <div className="relative">
                  <img
                    src={previewLogo}
                    alt="Site logo"
                    className="h-24 w-auto rounded-lg border bg-white"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-24 w-48 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                  <div className="text-center text-muted-foreground">
                    <Image className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No logo</p>
                  </div>
                </div>
              )}

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Logo"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended size: 200x60px or similar aspect ratio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="My Travel Services"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Enter your business address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Support contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                placeholder="support@example.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  type="tel"
                  value={settings.support_phone}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  placeholder="+27 68 707 6011"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="+27 68 707 6011"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Email API Settings
            </CardTitle>
            <CardDescription>Configure email delivery provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resendApiKey">Resend API Key</Label>
              <Input
                id="resendApiKey"
                type="password"
                value={settings.resend_api_key}
                onChange={(e) => setSettings({ ...settings, resend_api_key: e.target.value })}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Footer Settings
            </CardTitle>
            <CardDescription>Customize footer content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="footerCompanyName">Company Name</Label>
              <Input
                id="footerCompanyName"
                value={settings.footer_company_name}
                onChange={(e) => setSettings({ ...settings, footer_company_name: e.target.value })}
                placeholder="My Travel Services"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerCopyright">Copyright Text</Label>
              <Input
                id="footerCopyright"
                value={settings.footer_copyright}
                onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                placeholder="© {year} My Travel Services. All rights reserved."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="footerFacebook">Facebook URL</Label>
                <Input
                  id="footerFacebook"
                  value={settings.footer_facebook}
                  onChange={(e) => setSettings({ ...settings, footer_facebook: e.target.value })}
                  placeholder="https://facebook.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerInstagram">Instagram URL</Label>
                <Input
                  id="footerInstagram"
                  value={settings.footer_instagram}
                  onChange={(e) => setSettings({ ...settings, footer_instagram: e.target.value })}
                  placeholder="https://instagram.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerTwitter">Twitter URL</Label>
                <Input
                  id="footerTwitter"
                  value={settings.footer_twitter}
                  onChange={(e) => setSettings({ ...settings, footer_twitter: e.target.value })}
                  placeholder="https://twitter.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
