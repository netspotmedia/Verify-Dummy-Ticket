"use client"

import { useEffect } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Minus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title } from "@/lib/types"

const TITLES: { value: Title; label: string }[] = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Master", label: "Master" },
  { value: "Miss", label: "Miss" },
]

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "CH", name: "Switzerland" },
  { code: "IE", name: "Ireland" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "EG", name: "Egypt" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "TR", name: "Turkey" },
  { code: "RU", name: "Russia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
]

export function StepCommon() {
  const { formData, setCustomerInfo, setTravelers, updateTraveler, syncTravelers, nextStep, prevStep } = useOrderStore()
  const { travelerCount, travelers, email, customerCountry, customerCountryCode, separatePnrPerTraveler, services } = formData

  useEffect(() => {
    syncTravelers(travelerCount)
  }, [travelerCount])

  const showSeparatePnr = services.includes("flight") && travelerCount > 1

  const isValid = () => {
    if (travelerCount < 1) return false
    if (!email || !email.includes("@")) return false
    if (!customerCountryCode) return false
    if (travelers.some((t) => !t.firstName || !t.lastName)) return false
    return true
  }

  return (
    <div className="space-y-6">
      {/* Number of Travelers */}
      <div className="space-y-3">
        <Label>Number of Travelers</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCustomerInfo({ travelerCount: Math.max(1, travelerCount - 1) })}
            disabled={travelerCount <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={travelerCount}
            onChange={(e) => setCustomerInfo({ travelerCount: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })}
            className="w-20 text-center"
            min={1}
            max={10}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCustomerInfo({ travelerCount: Math.min(10, travelerCount + 1) })}
            disabled={travelerCount >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Maximum 10 travelers per order</p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address for Delivery</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setCustomerInfo({ email: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">Documents will be sent to this email</p>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country">Your Country</Label>
        <Select
          value={customerCountryCode}
          onValueChange={(code) => {
            const country = COUNTRIES.find((c) => c.code === code)
            setCustomerInfo({ 
              customerCountryCode: code,
              customerCountry: country?.name || "",
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {customerCountryCode === "NG" && (
          <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
            Nigeria detected. Prices will be shown in Naira (NGN). Payment via Paystack only.
          </p>
        )}
      </div>

      {/* Separate PNR (show only for flight + multiple travelers) */}
      {showSeparatePnr && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="separatePnr"
            checked={separatePnrPerTraveler}
            onCheckedChange={(checked) => setCustomerInfo({ separatePnrPerTraveler: checked as boolean })}
          />
          <Label htmlFor="separatePnr" className="cursor-pointer">
            Give each traveler a separate PNR / reservation code
          </Label>
        </div>
      )}

      {/* Traveler Cards */}
      <div className="space-y-4">
        <Label>Traveler Information</Label>
        <p className="text-sm text-muted-foreground">Enter names exactly as they appear on passport</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {travelers.map((traveler, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card space-y-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Traveler {index + 1}
              </div>
              
              <Select
                value={traveler.title}
                onValueChange={(value) => updateTraveler(index, { title: value as Title })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Title" />
                </SelectTrigger>
                <SelectContent>
                  {TITLES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="First Name"
                value={traveler.firstName}
                onChange={(e) => updateTraveler(index, { firstName: e.target.value })}
              />
              <Input
                placeholder="Last Name"
                value={traveler.lastName}
                onChange={(e) => updateTraveler(index, { lastName: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
