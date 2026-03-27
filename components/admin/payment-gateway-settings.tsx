"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, Check, CreditCard, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface PaymentGatewayConfig {
  paypal_enabled: boolean
  paypal_mode: "sandbox" | "live"
  paystack_enabled: boolean
  card_enabled: boolean
  hasPayPalSecrets: boolean
  hasPayStackSecrets: boolean
}

export function PaymentGatewaySettings() {
  const [config, setConfig] = useState<PaymentGatewayConfig>({
    paypal_enabled: false,
    paypal_mode: "sandbox",
    paystack_enabled: false,
    card_enabled: true,
    hasPayPalSecrets: false,
    hasPayStackSecrets: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/payment-config")
      if (res.ok) {
        const data = await res.json()
        setConfig({
          paypal_enabled: data.paypal_enabled,
          paypal_mode: data.paypal_mode || "sandbox",
          paystack_enabled: data.paystack_enabled,
          card_enabled: data.card_enabled !== false,
          hasPayPalSecrets: data.hasPayPalSecrets,
          hasPayStackSecrets: data.hasPayStackSecrets,
        })
      }
    } catch (error) {
      console.error("Failed to load payment config:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/admin/payment-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypal_enabled: config.paypal_enabled,
          paypal_mode: config.paypal_mode,
          paystack_enabled: config.paystack_enabled,
          card_enabled: config.card_enabled,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save")
      }

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
          Configure payment gateway enable/disable flags. API credentials are managed via environment variables.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-800">Environment Variables Required</p>
              <p className="text-sm text-yellow-700">
                API credentials are configured via <code className="text-xs bg-yellow-100 px-1 py-0.5 rounded">.env.local</code> file, not the database.
                Please ensure the following variables are set:
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
                <li><code>PAYPAL_CLIENT_ID</code> & <code>PAYPAL_CLIENT_SECRET</code></li>
                <li><code>PAYSTACK_PUBLIC_KEY</code> & <code>PAYSTACK_SECRET_KEY</code></li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

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
              checked={config.card_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, card_enabled: checked })}
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
              {!config.hasPayPalSecrets && (
                <p className="text-sm text-amber-600">API credentials not configured in environment</p>
              )}
            </div>
            <Switch
              checked={config.paypal_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, paypal_enabled: checked })}
              disabled={!config.hasPayPalSecrets}
            />
          </div>

          {config.paypal_enabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label>Mode</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paypal_mode"
                      checked={config.paypal_mode === "sandbox"}
                      onChange={() => setConfig({ ...config, paypal_mode: "sandbox" })}
                      className="mr-2"
                    />
                    <span className="text-sm">Sandbox (Testing)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paypal_mode"
                      checked={config.paypal_mode === "live"}
                      onChange={() => setConfig({ ...config, paypal_mode: "live" })}
                      className="mr-2"
                    />
                    <span className="text-sm">Live (Production)</span>
                  </label>
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
              {!config.hasPayStackSecrets && (
                <p className="text-sm text-amber-600">API credentials not configured in environment</p>
              )}
            </div>
            <Switch
              checked={config.paystack_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, paystack_enabled: checked })}
              disabled={!config.hasPayStackSecrets}
            />
          </div>
        </div>

        <Separator />

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {saved ? "Settings Saved!" : "Save Payment Settings"}
        </Button>
      </CardContent>
    </Card>
  )
}
