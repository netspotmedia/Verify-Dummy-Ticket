"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Plane, Building2, Shield, User, Mail, Clock, MapPin, Check } from "lucide-react"
import { calculatePriceBreakdown, formatCurrency } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { DeliverySpeed } from "@/lib/types"

const DELIVERY_OPTIONS: { value: DeliverySpeed; label: string; time: string; description: string; price: number; badge?: string }[] = [
  { value: "normal", label: "Standard", time: "24 hours", description: "Standard delivery", price: 0 },
  { value: "fast", label: "Express", time: "12 hours", description: "Great for same-day", price: 5, badge: "Popular" },
  { value: "express", label: "Priority", time: "6 hours", description: "Best for urgent appointments", price: 10, badge: "Fastest" },
]

export function StepReview() {
  const { formData, setDeliverySpeed, nextStep, prevStep } = useOrderStore()
  const { services, travelerCount, travelers, email, customerCountry, customerCountryCode, separatePnrPerTraveler, flightDetails, hotelDetails, insuranceDetails, deliverySpeed } = formData

  const pricing = calculatePriceBreakdown(
    services,
    travelerCount,
    customerCountryCode,
    flightDetails || undefined,
    hotelDetails || undefined,
    insuranceDetails || undefined,
    deliverySpeed
  )

  const isNigeria = customerCountryCode === "NG"

  return (
    <div className="space-y-8">
      {/* Order Summary Card */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
            Your Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Services Tags */}
          <div className="flex flex-wrap gap-2">
            {services.includes("flight") && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Plane className="h-3.5 w-3.5" />
                Flight
              </span>
            )}
            {services.includes("hotel") && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Building2 className="h-3.5 w-3.5" />
                Hotel
              </span>
            )}
            {services.includes("insurance") && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-3.5 w-3.5" />
                Insurance
              </span>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Country:</span>
              <span className="font-medium">{customerCountry}</span>
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm text-muted-foreground">{travelerCount} Traveler{travelerCount > 1 ? "s" : ""}</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {travelers.map((traveler, index) => (
                <span key={index} className="px-2 py-1 bg-background rounded-lg text-sm">
                  {traveler.title} {traveler.firstName} {traveler.lastName}
                </span>
              ))}
            </div>
            {separatePnrPerTraveler && (
              <p className="text-sm text-accent font-medium">Separate PNR per traveler</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Details Accordion */}
      {services.includes("flight") && flightDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium capitalize">{flightDetails.tripType.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Validity:</span>
                <span className="ml-2 font-medium">{flightDetails.validity}</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-xs">
              {flightDetails.flightDetails}
            </div>
          </CardContent>
        </Card>
      )}

      {services.includes("hotel") && hotelDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Hotel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-medium">
              {hotelDetails.type === "separate_per_traveler" ? "Separate for each" : "Shared confirmation"}
            </span>
          </CardContent>
        </Card>
      )}

      {services.includes("insurance") && insuranceDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground">Area:</span>
                <span className="ml-2 font-medium capitalize">{insuranceDetails.area.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">{insuranceDetails.duration}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Speed */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Delivery Speed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {DELIVERY_OPTIONS.map((option) => (
              <div
                key={option.value}
                onClick={() => setDeliverySpeed(option.value)}
                className={cn(
                  "relative rounded-xl border-2 p-4 cursor-pointer transition-all",
                  deliverySpeed === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                {option.badge && (
                  <span className={cn(
                    "absolute -top-2 right-3 px-2 py-0.5 rounded-full text-xs font-medium",
                    option.badge === "Popular" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {option.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{option.label}</span>
                  <span className={cn(
                    "font-bold",
                    option.price === 0 ? "text-green-600" : "text-primary"
                  )}>
                    {option.price === 0 ? "Free" : `+$${option.price}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{option.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Order Total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pricing.lines.map((line, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{line.label}</span>
                {line.pricingType === "per_traveler" && (
                  <span className="text-muted-foreground ml-2">
                    (${line.unitPriceUSD} × {line.qty})
                  </span>
                )}
              </div>
              <span>{formatCurrency(line.totalPriceUSD, pricing.currency)}</span>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-2xl text-primary">{formatCurrency(pricing.total, pricing.currency)}</span>
          </div>

          {isNigeria && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Prices shown in Naira. Payment via Paystack only.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2 rounded-xl px-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} className="gap-2 rounded-xl px-8">
          Continue to Payment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
