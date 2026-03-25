"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Globe, Mail, Image, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface SiteSettings {
  site_name: string
  support_email: string
  support_phone: string
  whatsapp_number: string
  address: string
  logo_url: string
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "VerifyDummyTickets",
    support_email: "support@verifydummytickets.com",
    support_phone: "+234 807 007 6011",
    whatsapp_number: "+234 807 007 6011",
    address: "",
    logo_url: "",
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
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .single()

      if (data) {
        setSettings({
          site_name: data.site_name || "VerifyDummyTickets",
          support_email: data.support_email || "",
          support_phone: data.support_phone || "",
          whatsapp_number: data.whatsapp_number || "",
          address: data.address || "",
          logo_url: data.logo_url || "",
        })
        if (data.logo_url) {
          setPreviewLogo(data.logo_url)
        }
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
        { key: "site_name", value: settings.site_name },
        { key: "support_email", value: settings.support_email },
        { key: "support_phone", value: settings.support_phone },
        { key: "whatsapp_number", value: settings.whatsapp_number },
        { key: "address", value: settings.address },
        { key: "logo_url", value: settings.logo_url },
      ]

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: setting.key, value: setting.value }, { onConflict: "key" })

        if (error) throw error
      }

      toast.success("Settings saved successfully")
    } catch {
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
                placeholder="VerifyDummyTickets"
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
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="+234 800 000 0000"
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
