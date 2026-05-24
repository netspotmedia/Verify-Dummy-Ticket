"use client"

import { useState } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TripType, FlightValidity } from "@/lib/types"

const TRIP_TYPES: { value: TripType; label: string; price: number; description: string }[] = [
  { value: "one_way", label: "One Way", price: 5, description: "Single destination" },
  { value: "return_trip", label: "Return Trip", price: 8, description: "Round trip booking" },
  { value: "multi_city", label: "Multi-City", price: 15, description: "Multiple destinations" },
]

const VALIDITY_OPTIONS: { value: FlightValidity; label: string; price: number }[] = [
  { value: "3d", label: "3 Days (72 hrs)", price: 0 },
  { value: "7d", label: "7 Days", price: 5 },
  { value: "14d", label: "14 Days (2 weeks)", price: 10 },
  { value: "21d", label: "21 Days (3 weeks)", price: 15 },
  { value: "30d", label: "30 Days (1 month)", price: 20 },
]

const MIN_DETAILS_LENGTH = 10

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-[#c8143d] animate-in fade-in slide-in-from-top-1 duration-150">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

function Req() {
  return <span aria-hidden="true" className="text-[#c8143d] ml-0.5">*</span>
}

export function StepFlight() {
  const { formData, setFlightDetails, nextStep, prevStep } = useOrderStore()
  const { flightDetails, travelerCount } = formData

  const tripType = flightDetails?.tripType || null
  const validity = flightDetails?.validity || null
  const flightDetailsText = flightDetails?.flightDetails || ""

  const tripTypePrice = TRIP_TYPES.find((t) => t.value === tripType)?.price || 0
  const validityPrice = VALIDITY_OPTIONS.find((v) => v.value === validity)?.price || 0
  const totalFlightCost = tripTypePrice + validityPrice

  const [tried, setTried] = useState(false)
  const [detailsTouched, setDetailsTouched] = useState(false)

  const getErrors = () => {
    const e: Record<string, string> = {}
    if (!tripType) e.tripType = "Please select a trip type"
    if (flightDetailsText.trim().length < MIN_DETAILS_LENGTH)
      e.details = flightDetailsText.trim().length === 0
        ? "Flight itinerary details are required"
        : "Please provide more detail (at least 10 characters)"
    if (!validity) e.validity = "Please select a validity period"
    return e
  }

  const allErrors = getErrors()
  const showDetails = (key: string) => (tried || (key === "details" && detailsTouched)) ? allErrors[key] : undefined

  const handleContinue = () => {
    setTried(true)
    if (Object.keys(allErrors).length > 0) return
    nextStep()
  }

  return (
    <div className="space-y-4 font-outfit">
      <div className="space-y-0.5">
        <p className="text-xs text-slate-400">
          Fields marked <span className="text-[#c8143d] font-semibold">*</span> are required
        </p>
      </div>

      {/* Trip Type */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium uppercase tracking-wider text-black">
            Trip Type <Req />
          </Label>
          {showDetails("tripType") && (
            <span className="flex items-center gap-1 text-xs text-[#c8143d]">
              <AlertCircle className="h-3 w-3" />
              Required
            </span>
          )}
        </div>

        <div
          className={cn(
            "space-y-1 rounded-lg p-1 transition-all",
            showDetails("tripType") && "ring-1 ring-[#c8143d]/40 bg-[#fff5f6]"
          )}
        >
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
                <div className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                  active ? "border-[#c8143d]" : "border-slate-300"
                )}>
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
                  <span className="text-sm text-slate-500 ml-2">{type.description}</span>
                </div>
                <span className={cn("text-sm font-semibold", type.price === 0 ? "text-green-600" : "text-[#c8143d]")}>
                  {type.price === 0 ? "Free" : `+$${type.price}`}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      {/* Flight Details */}
      <section className="space-y-2">
        <Label className="text-sm font-medium uppercase tracking-wider text-black">
          Flight Itinerary Details <Req />
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
          onBlur={() => setDetailsTouched(true)}
          rows={4}
          aria-invalid={!!showDetails("details")}
          className={cn(
            "rounded-md border-slate-200 bg-white text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c8143d] resize-none",
            showDetails("details") && "border-[#c8143d]"
          )}
        />
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showDetails("details")
              ? <FieldError message={showDetails("details")} />
              : <p className="text-xs text-slate-500">Provide your route and dates. Be detailed for accurate booking.</p>
            }
          </div>
          <span className={cn(
            "ml-2 shrink-0 text-xs",
            flightDetailsText.trim().length < MIN_DETAILS_LENGTH ? "text-slate-400" : "text-green-600"
          )}>
            {flightDetailsText.length} chars
          </span>
        </div>
      </section>

      {/* Flight Validity */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium uppercase tracking-wider text-black">
              Flight Validity <Req />
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              How long you need the reservation to remain valid
            </p>
          </div>
          {showDetails("validity") && (
            <span className="flex items-center gap-1 text-xs text-[#c8143d]">
              <AlertCircle className="h-3 w-3" />
              Required
            </span>
          )}
        </div>

        <div
          className={cn(
            "space-y-1 rounded-lg p-1 transition-all",
            showDetails("validity") && "ring-1 ring-[#c8143d]/40 bg-[#fff5f6]"
          )}
        >
          {VALIDITY_OPTIONS.map((option) => {
            const active = validity === option.value
            return (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded cursor-pointer border transition-all",
                  active
                    ? "border-[#c8143d] bg-[#fff7f9]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                  active ? "border-[#c8143d]" : "border-slate-300"
                )}>
                  {active && <div className="h-2 w-2 rounded-full bg-[#c8143d]" />}
                </div>
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
                <div className="flex-1">
                  <span className={cn("text-sm font-medium", active ? "text-[#c8143d]" : "text-slate-900")}>
                    {option.label}
                  </span>
                </div>
                <span className={cn("text-sm font-semibold shrink-0", option.price === 0 ? "text-green-600" : active ? "text-[#c8143d]" : "text-slate-600")}>
                  {option.price === 0 ? "Free" : `+$${option.price}`}
                </span>
              </label>
            )
          })}
        </div>
      </section>

      {/* Cost summary */}
      <section className="flex items-center justify-between p-3 border border-slate-200 rounded">
        <div>
          <p className="text-sm text-slate-500">Flight Cost</p>
          <p className="text-xs text-slate-600">${totalFlightCost} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}</p>
        </div>
        <p className="text-lg font-semibold text-[#c8143d]">${totalFlightCost * travelerCount}</p>
      </section>

      {/* Error banner */}
      {tried && Object.keys(allErrors).length > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-[#c8143d]/30 bg-[#fff5f6] px-3 py-2 text-xs text-[#c8143d]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Please complete all required sections before continuing.</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
        <Button onClick={handleContinue} className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] font-medium text-xs">
          Continue
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
