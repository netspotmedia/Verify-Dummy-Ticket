"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Check, Eye, EyeOff, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface PaymentSettings {
  paypal_enabled: boolean
  paypal_mode: "sandbox" | "live"
  paypal_client_id: string
  paypal_client_secret: string
  paystack_enabled: boolean
  paystack_public_key: string
  paystack_secret_key: string
  paystack_merchant_email: string
  card_enabled: boolean
}

const DEFAULT_SETTINGS: PaymentSettings = {
  paypal_enabled: true,
  paypal_mode: "sandbox",
  paypal_client_id: "",
  paypal_client_secret: "",
  paystack_enabled: true,
  paystack_public_key: "",
  paystack_secret_key: "",
  paystack_merchant_email: "",
  card_enabled: true,
}

export function PaymentGatewaySettings() {
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPayPalSecret, setShowPayPalSecret] = useState(false)
  const [showPayStackSecret, setShowPayStackSecret] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")

      const settingsMap: Record<string, any> = {}
      data?.forEach((item: { key: string; value: any }) => {
        settingsMap[item.key] = item.value
      })

      setSettings({
        paypal_enabled: settingsMap.paypal_enabled !== false && settingsMap.paypal_enabled !== "false",
        paypal_mode: (settingsMap.paypal_mode as "sandbox" | "live") || "sandbox",
        paypal_client_id: settingsMap.paypal_client_id || "",
        paypal_client_secret: settingsMap.paypal_client_secret || "",
        paystack_enabled: settingsMap.paystack_enabled !== false && settingsMap.paystack_enabled !== "false",
        paystack_public_key: settingsMap.paystack_public_key || "",
        paystack_secret_key: settingsMap.paystack_secret_key || "",
        paystack_merchant_email: settingsMap.paystack_merchant_email || "",
        card_enabled: settingsMap.card_enabled !== false && settingsMap.card_enabled !== "false",
      })
    } catch (error) {
      console.error("Failed to load payment settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSetting(key: string, value: any) {
    // First check if the setting exists
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", key)
      .single()

    if (existing) {
      // Update existing setting
      const { error } = await supabase
        .from("site_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key)

      if (error) throw error
    } else {
      // Insert new setting
      const { error } = await supabase
        .from("site_settings")
        .insert({ key, value, category: "payment", is_public: false })

      if (error) throw error
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await saveSetting("paypal_enabled", settings.paypal_enabled)
      await saveSetting("paypal_mode", settings.paypal_mode)
      await saveSetting("paypal_client_id", settings.paypal_client_id)
      await saveSetting("paypal_client_secret", settings.paypal_client_secret)
      await saveSetting("paystack_enabled", settings.paystack_enabled)
      await saveSetting("paystack_public_key", settings.paystack_public_key)
      await saveSetting("paystack_secret_key", settings.paystack_secret_key)
      await saveSetting("paystack_merchant_email", settings.paystack_merchant_email)
      await saveSetting("card_enabled", settings.card_enabled)

      setSaved(true)
      toast.success("Payment gateway settings saved successfully")
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Failed to save payment settings:", error)
      toast.error("Failed to save payment settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Gateway Settings
        </CardTitle>
        <CardDescription>
          Configure your payment gateway API credentials and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">Card Payments</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Accept Card Payments</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay directly with Credit/Debit cards (Visa, Mastercard, Verve)
              </p>
            </div>
            <Switch
              checked={settings.card_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, card_enabled: checked })}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">PayPal</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Accept PayPal Payments</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to pay with PayPal account or Credit/Debit card
                </p>
              </div>
            <Switch
              checked={settings.paypal_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, paypal_enabled: checked })}
            />
          </div>

          {settings.paypal_enabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Mode</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paypal_mode"
                      checked={settings.paypal_mode === "sandbox"}
                      onChange={() => setSettings({ ...settings, paypal_mode: "sandbox" })}
                      className="mr-2"
                    />
                    <span className="text-sm">Sandbox (Testing)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paypal_mode"
                      checked={settings.paypal_mode === "live"}
                      onChange={() => setSettings({ ...settings, paypal_mode: "live" })}
                      className="mr-2"
                    />
                    <span className="text-sm">Live (Production)</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paypalClientId">Client ID</Label>
                  <Input
                    id="paypalClientId"
                    value={settings.paypal_client_id}
                    onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value })}
                    placeholder="Enter PayPal Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypalClientSecret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="paypalClientSecret"
                      type={showPayPalSecret ? "text" : "password"}
                      value={settings.paypal_client_secret}
                      onChange={(e) => setSettings({ ...settings, paypal_client_secret: e.target.value })}
                      placeholder="Enter PayPal Client Secret"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPayPalSecret(!showPayPalSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPayPalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase text-muted-foreground">PayStack</h3>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Accept PayStack Payments</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay with PayStack (Cards, Bank Transfer, USSD, Mobile Money)
              </p>
            </div>
            <Switch
              checked={settings.paystack_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, paystack_enabled: checked })}
            />
          </div>

          {settings.paystack_enabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="paystackMerchantEmail">Merchant Email</Label>
                <Input
                  id="paystackMerchantEmail"
                  type="email"
                  value={settings.paystack_merchant_email}
                  onChange={(e) => setSettings({ ...settings, paystack_merchant_email: e.target.value })}
                  placeholder="merchant@email.com"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paystackPublicKey">Public Key</Label>
                  <Input
                    id="paystackPublicKey"
                    value={settings.paystack_public_key}
                    onChange={(e) => setSettings({ ...settings, paystack_public_key: e.target.value })}
                    placeholder="Enter PayStack Public Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paystackSecretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="paystackSecretKey"
                      type={showPayStackSecret ? "text" : "password"}
                      value={settings.paystack_secret_key}
                      onChange={(e) => setSettings({ ...settings, paystack_secret_key: e.target.value })}
                      placeholder="Enter PayStack Secret Key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPayStackSecret(!showPayStackSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPayStackSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Settings Saved!" : "Save Payment Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
