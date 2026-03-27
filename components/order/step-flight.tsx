"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight } from "lucide-react"
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
    <div className="space-y-4 font-outfit">
      <section className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Trip Type
        </Label>

        <div className="space-y-1">
          {TRIP_TYPES.map((type) => {
            const active = tripType === type.value

            return (
              <label
                key={type.value}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded cursor-pointer border transition-all",
                  active
                    ? "border-[#c8143d] bg-[#fff7f9]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    active
                      ? "border-[#c8143d]"
                      : "border-slate-300"
                  )}
                >
                  {active && <div className="h-2 w-2 rounded-full bg-[#c8143d]" />}
                </div>
                <input
                  type="radio"
                  name="tripType"
                  checked={active}
                  onChange={() =>
                    setFlightDetails({
                      ...formData.flightDetails,
                      tripType: type.value,
                      validity: formData.flightDetails?.validity || "3d",
                      flightDetails: formData.flightDetails?.flightDetails || "",
                    } as any)
                  }
                  className="sr-only"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-900">{type.label}</span>
                  <span className="text-xs text-slate-500 ml-2">{type.description}</span>
                </div>
                <span className={cn("text-sm font-semibold", type.price === 0 ? "text-green-600" : "text-[#c8143d]")}>
                  {type.price === 0 ? "Free" : `+$${type.price}`}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Flight Itinerary Details
        </Label>
        <Textarea
          placeholder="Example: Departing June 1, LOS to CDG. Returning June 10, CDG to LOS. Include airline if known."
          value={flightDetailsText}
          onChange={(e) =>
            setFlightDetails({
              ...formData.flightDetails,
              tripType: formData.flightDetails?.tripType || "one_way",
              validity: formData.flightDetails?.validity || "3d",
              flightDetails: e.target.value,
            } as any)
          }
          rows={4}
          className="rounded-md border-slate-200 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c8143d] resize-none"
        />
        <p className="text-xs text-slate-500">
          Provide your route and dates. Be detailed for accurate booking.
        </p>
      </section>

      <section className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Flight Validity
        </Label>
        <p className="text-xs text-slate-500">
          How long should the reservation remain valid?
        </p>

        <div className="grid grid-cols-5 gap-2">
          {VALIDITY_OPTIONS.map((option) => {
            const active = validity === option.value

            return (
              <label
                key={option.value}
                className={cn(
                  "block p-2 rounded cursor-pointer text-center border transition-all",
                  active
                    ? "border-[#c8143d] bg-[#fff7f9]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <input
                  type="radio"
                  name="validity"
                  checked={active}
                  onChange={() =>
                    setFlightDetails({
                      ...formData.flightDetails,
                      tripType: formData.flightDetails?.tripType || "one_way",
                      validity: option.value,
                      flightDetails: formData.flightDetails?.flightDetails || "",
                    } as any)
                  }
                  className="sr-only"
                />
                <div className={cn("text-xs font-semibold", active ? "text-[#c8143d]" : "text-slate-800")}>
                  {option.label}
                </div>
                <div className={cn("text-[10px] mt-0.5", option.price === 0 ? "text-green-600" : active ? "text-[#c8143d]" : "text-slate-500")}>
                  {option.price === 0 ? "Free" : `+$${option.price}`}
                </div>
              </label>
            )
          })}
        </div>
      </section>

      <section className="flex items-center justify-between p-3 border border-slate-200 rounded">
        <div>
          <p className="text-xs text-slate-500">Flight Cost</p>
          <p className="text-xs text-slate-600">${totalFlightCost} × {travelerCount}</p>
        </div>
        <p className="text-lg font-semibold text-[#c8143d]">${totalFlightCost * travelerCount}</p>
      </section>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] font-medium text-xs">
          Continue
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
