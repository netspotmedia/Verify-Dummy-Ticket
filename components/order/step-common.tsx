"use client"

import { useEffect } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Minus, User, Globe, Mail, Users } from "lucide-react"
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
  const { formData, setCustomerInfo, updateTraveler, syncTravelers, nextStep, prevStep } = useOrderStore()
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
    <div className="space-y-8">
      {/* Number of Travelers - Modern Counter */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label className="text-base font-semibold">Number of Travelers</Label>
            <p className="text-sm text-muted-foreground">Maximum 10 travelers per order</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCustomerInfo({ travelerCount: Math.max(1, travelerCount - 1) })}
            disabled={travelerCount <= 1}
            className="h-12 w-12 rounded-xl border-2"
          >
            <Minus className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 text-center">
            <span className="text-4xl font-bold text-primary">{travelerCount}</span>
            <p className="text-sm text-muted-foreground">
              {travelerCount === 1 ? "Traveler" : "Travelers"}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCustomerInfo({ travelerCount: Math.min(10, travelerCount + 1) })}
            disabled={travelerCount >= 10}
            className="h-12 w-12 rounded-xl border-2"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email */}
        <div className="space-y-3">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setCustomerInfo({ email: e.target.value })}
            className="h-12 rounded-xl"
          />
          <p className="text-xs text-muted-foreground">Documents will be delivered to this email</p>
        </div>

        {/* Country */}
        <div className="space-y-3">
          <Label htmlFor="country" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Your Country
          </Label>
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
            <SelectTrigger className="h-12 rounded-xl">
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
        </div>
      </div>

      {/* Nigeria Notice */}
      {customerCountryCode === "NG" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">Nigeria Detected</p>
            <p className="text-sm">Prices will be shown in Naira (NGN). Payment available via Paystack only.</p>
          </div>
        </div>
      )}

      {/* Separate PNR Option */}
      {showSeparatePnr && (
        <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-4">
          <Checkbox
            id="separatePnr"
            checked={separatePnrPerTraveler}
            onCheckedChange={(checked) => setCustomerInfo({ separatePnrPerTraveler: checked as boolean })}
            className="h-5 w-5"
          />
          <Label htmlFor="separatePnr" className="cursor-pointer flex-1">
            <span className="font-medium">Separate PNR for each traveler</span>
            <p className="text-sm text-muted-foreground">Each traveler gets their own reservation code</p>
          </Label>
        </div>
      )}

      {/* Traveler Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base font-semibold">Traveler Information</Label>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">Enter names exactly as they appear on passport</p>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {travelers.map((traveler, index) => (
            <div
              key={index}
              className="bg-card border rounded-2xl p-5 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {index + 1}
                </div>
                <span className="font-medium">Traveler {index + 1}</span>
              </div>
              
              <Select
                value={traveler.title}
                onValueChange={(value) => updateTraveler(index, { title: value as Title })}
              >
                <SelectTrigger className="h-10 rounded-lg">
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
                className="rounded-lg"
              />
              
              <Input
                placeholder="Last Name"
                value={traveler.lastName}
                onChange={(e) => updateTraveler(index, { lastName: e.target.value })}
                className="rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2 rounded-xl px-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2 rounded-xl px-8">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
