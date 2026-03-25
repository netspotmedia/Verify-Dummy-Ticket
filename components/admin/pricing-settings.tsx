"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DollarSign, 
  Save, 
  Loader2,
  Check
} from "lucide-react"
import { toast } from "sonner"

interface PricingSettings {
  flight_one_way: string
  flight_return_trip: string
  flight_multi_city: string
  hotel_separate: string
  hotel_one_for_all_first: string
  hotel_one_for_all_additional: string
  delivery_normal: string
  delivery_fast: string
  delivery_express: string
}

const DEFAULT_PRICING: PricingSettings = {
  flight_one_way: "5",
  flight_return_trip: "8",
  flight_multi_city: "15",
  hotel_separate: "5",
  hotel_one_for_all_first: "5",
  hotel_one_for_all_additional: "1",
  delivery_normal: "0",
  delivery_fast: "5",
  delivery_express: "10",
}

export function PricingSettings() {
  const [pricing, setPricing] = useState<PricingSettings>(DEFAULT_PRICING)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      for (const [key, value] of Object.entries(pricing)) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            category: key.startsWith("delivery") ? "delivery" : "pricing",
            key,
            value: value,
            updated_at: new Date().toISOString(),
          }, { onConflict: "category,key" })

        if (error) throw error
      }

      setSaved(true)
      toast.success("Pricing settings saved")
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save pricing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Pricing Settings
        </CardTitle>
        <CardDescription>
          Configure base prices in USD for all services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flight Pricing */}
        <div className="space-y-4">
          <h4 className="font-medium">Flight Prices (per traveler)</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>One Way ($)</Label>
              <Input
                type="number"
                value={pricing.flight_one_way}
                onChange={(e) => setPricing({ ...pricing, flight_one_way: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Return Trip ($)</Label>
              <Input
                type="number"
                value={pricing.flight_return_trip}
                onChange={(e) => setPricing({ ...pricing, flight_return_trip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Multi-City ($)</Label>
              <Input
                type="number"
                value={pricing.flight_multi_city}
                onChange={(e) => setPricing({ ...pricing, flight_multi_city: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Hotel Pricing */}
        <div className="space-y-4">
          <h4 className="font-medium">Hotel Prices</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Separate per Traveler ($)</Label>
              <Input
                type="number"
                value={pricing.hotel_separate}
                onChange={(e) => setPricing({ ...pricing, hotel_separate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>One for All - First ($)</Label>
              <Input
                type="number"
                value={pricing.hotel_one_for_all_first}
                onChange={(e) => setPricing({ ...pricing, hotel_one_for_all_first: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>One for All - Additional ($)</Label>
              <Input
                type="number"
                value={pricing.hotel_one_for_all_additional}
                onChange={(e) => setPricing({ ...pricing, hotel_one_for_all_additional: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Delivery Pricing */}
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Prices</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Normal (hours) ($)</Label>
              <Input
                type="number"
                value={pricing.delivery_normal}
                onChange={(e) => setPricing({ ...pricing, delivery_normal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fast (hours) ($)</Label>
              <Input
                type="number"
                value={pricing.delivery_fast}
                onChange={(e) => setPricing({ ...pricing, delivery_fast: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Express (hours) ($)</Label>
              <Input
                type="number"
                value={pricing.delivery_express}
                onChange={(e) => setPricing({ ...pricing, delivery_express: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? "Saved!" : "Save Pricing"}
        </Button>
      </CardContent>
    </Card>
  )
}
