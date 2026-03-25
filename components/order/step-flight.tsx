"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TripType, FlightValidity } from "@/lib/types"

const TRIP_TYPES: { value: TripType; label: string; price: number }[] = [
  { value: "one_way", label: "One Way", price: 5 },
  { value: "return_trip", label: "Return Trip", price: 8 },
  { value: "multi_city", label: "Multi-City", price: 15 },
]

const VALIDITY_OPTIONS: { value: FlightValidity; label: string; price: number }[] = [
  { value: "3d", label: "3 Days (72 hrs)", price: 0 },
  { value: "7d", label: "7 Days", price: 5 },
  { value: "14d", label: "14 Days (2 weeks)", price: 10 },
  { value: "21d", label: "21 Days (3 weeks)", price: 15 },
  { value: "30d", label: "30 Days (1 month)", price: 20 },
]

export function StepFlight() {
  const { formData, setFlightDetails, nextStep, prevStep } = useOrderStore()
  const { flightDetails, travelerCount } = formData

  const tripType = flightDetails?.tripType || null
  const validity = flightDetails?.validity || null
  const flightDetailsText = flightDetails?.flightDetails || ""

  const tripTypePrice = TRIP_TYPES.find((t) => t.value === tripType)?.price || 0
  const validityPrice = VALIDITY_OPTIONS.find((v) => v.value === validity)?.price || 0
  const totalFlightCost = (tripTypePrice + validityPrice)

  const isValid = () => {
    return tripType && flightDetailsText.length > 5 && validity
  }

  return (
    <div className="space-y-6">
      {/* Trip Type */}
      <div className="space-y-3">
        <Label>Trip Type</Label>
        <div className="grid gap-3 md:grid-cols-3">
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
                "p-4 rounded-lg border-2 cursor-pointer transition-all",
                tripType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{type.label}</span>
                <span className={cn(
                  "font-semibold",
                  type.price === 0 ? "text-green-600" : "text-primary"
                )}>
                  {type.price === 0 ? "Free" : `$${type.price}`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">per traveler</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flight Details */}
      <div className="space-y-2">
        <Label htmlFor="flightDetails">Flight Itinerary Details</Label>
        <Textarea
          id="flightDetails"
          placeholder="Departing on June 1 from Lagos (LOS) to Paris (CDG). Returning on June 10 from Paris (CDG) to Lagos (LOS)."
          value={flightDetailsText}
          onChange={(e) => setFlightDetails({
            ...formData.flightDetails,
            tripType: formData.flightDetails?.tripType || "one_way",
            validity: formData.flightDetails?.validity || "3d",
            flightDetails: e.target.value,
          } as any)}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Provide your flight route and dates. Be as detailed as possible.
        </p>
      </div>

      {/* Flight Validity */}
      <div className="space-y-3">
        <Label>Flight Validity</Label>
        <p className="text-sm text-muted-foreground">
          How long should the flight reservation remain valid?
        </p>
        <div className="grid gap-3 md:grid-cols-5">
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
                "p-3 rounded-lg border-2 cursor-pointer transition-all text-center",
                validity === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className={cn(
                "font-semibold mt-1",
                option.price === 0 ? "text-green-600" : "text-primary"
              )}>
                {option.price === 0 ? "Free" : `+$${option.price}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Cost */}
      <div className="p-4 rounded-lg bg-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            <span className="font-medium">Estimated Flight Cost</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">${totalFlightCost * travelerCount}</span>
            <p className="text-sm text-muted-foreground">
              ${totalFlightCost} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
            </p>
          </div>
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
