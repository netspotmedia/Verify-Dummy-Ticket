"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Plane, Building2, Shield, User, Mail, Clock, MapPin } from "lucide-react"
import { calculatePriceBreakdown, formatCurrency } from "@/lib/types"
import type { DeliverySpeed } from "@/lib/types"

const DELIVERY_OPTIONS: { value: DeliverySpeed; label: string; time: string; description: string; price: number }[] = [
  { value: "normal", label: "Normal", time: "24 hours", description: "Standard delivery", price: 0 },
  { value: "fast", label: "Fast", time: "12 hours", description: "Great for same-day applications", price: 5 },
  { value: "express", label: "Express", time: "6 hours", description: "Best for urgent visa appointments", price: 10 },
]

export function StepReview() {
  const { formData, setDeliverySpeed, nextStep, prevStep } = useOrderStore()
  const { services, travelerCount, travelers, email, customerCountry, customerCountryCode, separatePnrPerTraveler, flightDetails, hotelDetails, insuranceDetails, deliverySpeed } = formData

  // Calculate pricing
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
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Services */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Selected Services</Label>
            <div className="flex flex-wrap gap-2">
              {services.includes("flight") && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                  <Plane className="h-4 w-4" />
                  Flight Reservation
                </div>
              )}
              {services.includes("hotel") && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                  <Building2 className="h-4 w-4" />
                  Hotel Confirmation
                </div>
              )}
              {services.includes("insurance") && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                  <Shield className="h-4 w-4" />
                  Travel Insurance
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Country:</span>
              <span className="font-medium">{customerCountry}</span>
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Travelers ({travelerCount})</Label>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {travelers.map((traveler, index) => (
                <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{traveler.title} {traveler.firstName} {traveler.lastName}</span>
                </div>
              ))}
            </div>
            {separatePnrPerTraveler && (
              <p className="text-sm text-accent">Separate PNR for each traveler</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      {services.includes("flight") && flightDetails && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Trip Type:</span>
                <span className="ml-2 font-medium capitalize">{flightDetails.tripType.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Validity:</span>
                <span className="ml-2 font-medium">{flightDetails.validity} Days</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Itinerary:</span>
              <p className="mt-1 p-2 bg-muted rounded text-xs">{flightDetails.flightDetails}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {services.includes("hotel") && hotelDetails && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hotel Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span className="ml-2 font-medium">
              {hotelDetails.type === "separate_per_traveler" ? "Separate for each traveler" : "One for all travelers"}
            </span>
          </CardContent>
        </Card>
      )}

      {services.includes("insurance") && insuranceDetails && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
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
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Delivery Speed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {DELIVERY_OPTIONS.map((option) => (
              <div
                key={option.value}
                onClick={() => setDeliverySpeed(option.value)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  deliverySpeed === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  <span className={option.price === 0 ? "text-green-600 font-semibold" : "text-primary font-semibold"}>
                    {option.price === 0 ? "Free" : `+$${option.price}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{option.time}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Price Breakdown</CardTitle>
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
          
          <div className="flex items-center justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(pricing.total, pricing.currency)}</span>
          </div>

          {isNigeria && (
            <p className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
              Prices are shown in Naira. Payment available via Paystack only.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} className="gap-2">
          Continue to Payment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
