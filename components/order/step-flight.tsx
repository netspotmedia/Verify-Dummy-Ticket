"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Plane, Calendar, Route } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TripType, FlightValidity } from "@/lib/types"

const TRIP_TYPES: { value: TripType; label: string; price: number; description: string }[] = [
  { value: "one_way", label: "One Way", price: 5, description: "Single destination" },
  { value: "return_trip", label: "Return Trip", price: 8, description: "Round trip booking" },
  { value: "multi_city", label: "Multi-City", price: 15, description: "Multiple destinations" },
]

const VALIDITY_OPTIONS: { value: FlightValidity; label: string; price: number }[] = [
  { value: "3d", label: "3 Days", price: 0 },
  { value: "7d", label: "7 Days", price: 5 },
  { value: "14d", label: "14 Days", price: 10 },
  { value: "21d", label: "21 Days", price: 15 },
  { value: "30d", label: "30 Days", price: 20 },
]

export function StepFlight() {
  const { formData, setFlightDetails, nextStep, prevStep } = useOrderStore()
  const { flightDetails, travelerCount } = formData

  const tripType = flightDetails?.tripType || null
  const validity = flightDetails?.validity || null
  const flightDetailsText = flightDetails?.flightDetails || ""

  const tripTypePrice = TRIP_TYPES.find((t) => t.value === tripType)?.price || 0
  const validityPrice = VALIDITY_OPTIONS.find((v) => v.value === validity)?.price || 0
  const totalFlightCost = tripTypePrice + validityPrice

  const isValid = () => {
    return tripType && flightDetailsText.length > 5 && validity
  }

  return (
    <div className="space-y-8">
      {/* Trip Type Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Trip Type</Label>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {TRIP_TYPES.map((type) => (
            <div
              key={type.value}
              onClick={() => setFlightDetails({ 
                ...formData.flightDetails, 
                tripType: type.value,
                validity: formData.flightDetails?.validity || "3d",
                flightDetails: formData.flightDetails?.flightDetails || "",
              } as any)}
              className={cn(
                "group relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200",
                tripType === type.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/50 hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <span className={cn(
                  "text-lg font-bold",
                  type.price === 0 ? "text-green-600" : "text-primary"
                )}>
                  {type.price === 0 ? "Free" : `$${type.price}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flight Itinerary */}
      <div className="space-y-3">
        <Label htmlFor="flightDetails" className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-muted-foreground" />
          Flight Itinerary Details
        </Label>
        <Textarea
          id="flightDetails"
          placeholder="Example: Departing June 1, LOS to CDG. Returning June 10, CDG to LOS. Include airline if known."
          value={flightDetailsText}
          onChange={(e) => setFlightDetails({
            ...formData.flightDetails,
            tripType: formData.flightDetails?.tripType || "one_way",
            validity: formData.flightDetails?.validity || "3d",
            flightDetails: e.target.value,
          } as any)}
          rows={4}
          className="rounded-xl resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Provide your route and dates. Be detailed for accurate booking.
        </p>
      </div>

      {/* Validity Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Flight Validity</Label>
        </div>
        <p className="text-sm text-muted-foreground">How long should the reservation remain valid?</p>
        
        <div className="flex flex-wrap gap-3">
          {VALIDITY_OPTIONS.map((option) => (
            <div
              key={option.value}
              onClick={() => setFlightDetails({
                ...formData.flightDetails,
                tripType: formData.flightDetails?.tripType || "one_way",
                validity: option.value,
                flightDetails: formData.flightDetails?.flightDetails || "",
              } as any)}
              className={cn(
                "flex-1 min-w-[100px] rounded-xl border-2 p-4 cursor-pointer transition-all text-center",
                validity === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/30"
              )}
            >
              <div className="font-semibold">{option.label}</div>
              <div className={cn(
                "text-sm font-bold mt-1",
                option.price === 0 ? "text-green-600" : "text-primary"
              )}>
                {option.price === 0 ? "Free" : `+$${option.price}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Flight Cost</p>
              <p className="text-sm text-muted-foreground">
                ${totalFlightCost} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary">${totalFlightCost * travelerCount}</span>
          </div>
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
