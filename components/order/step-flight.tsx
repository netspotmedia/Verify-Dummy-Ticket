"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
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
      <section className="space-y-3">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Trip Type
        </Label>

        <div className="grid gap-3 md:grid-cols-3">
          {TRIP_TYPES.map((type) => {
            const active = tripType === type.value

            return (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setFlightDetails({
                    ...formData.flightDetails,
                    tripType: type.value,
                    validity: formData.flightDetails?.validity || "3d",
                    flightDetails: formData.flightDetails?.flightDetails || "",
                  } as any)
                }
                className={cn(
                  "group relative overflow-hidden rounded-[26px] p-[1px] text-left transition-all",
                  active
                    ? "bg-gradient-to-r from-[#c8143d] via-[#d94a6d] to-[#efc5d0] shadow-[0_16px_30px_rgba(200,20,61,0.12)]"
                    : "bg-transparent"
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-[25px] px-5 py-5 transition-all",
                    active
                      ? "bg-white"
                      : "bg-[#e9edf5] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                  )}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                        active
                          ? "bg-[#c8143d] text-white"
                          : "bg-white text-slate-500 shadow-sm"
                      )}
                    >
                      <Route className="h-5 w-5" />
                    </div>

                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        type.price === 0
                          ? "bg-[#dcfce7] text-[#15803d]"
                          : active
                          ? "bg-[#fff1f4] text-[#c8143d]"
                          : "bg-white text-slate-600"
                      )}
                    >
                      {type.price === 0 ? "Free" : `+$${type.price}`}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">{type.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{type.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <Label
          htmlFor="flightDetails"
          className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]"
        >
          Flight Itinerary Details
        </Label>

        <div className="rounded-[28px] bg-[#e9edf5] p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2 text-slate-600">
            <Plane className="h-4 w-4" />
            <span className="text-sm font-medium">Route and travel dates</span>
          </div>

          <Textarea
            id="flightDetails"
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
            rows={5}
            className="min-h-[140px] rounded-[24px] border-0 bg-white px-5 py-4 text-sm leading-6 text-slate-700 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c8143d] resize-none"
          />

          <p className="mt-3 text-xs text-slate-500">
            Provide your route and dates. Be detailed for accurate booking.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
            Flight Validity
          </Label>
        </div>

        <p className="text-sm text-slate-500">
          How long should the reservation remain valid?
        </p>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {VALIDITY_OPTIONS.map((option) => {
            const active = validity === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFlightDetails({
                    ...formData.flightDetails,
                    tripType: formData.flightDetails?.tripType || "one_way",
                    validity: option.value,
                    flightDetails: formData.flightDetails?.flightDetails || "",
                  } as any)
                }
                className={cn(
                  "rounded-[22px] px-4 py-4 text-center transition-all",
                  active
                    ? "bg-white shadow-[0_12px_24px_rgba(15,23,42,0.07)] ring-1 ring-[#f0ccd5]"
                    : "bg-[#e9edf5] hover:bg-white"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-[#c8143d]" : "text-slate-800"
                  )}
                >
                  {option.label}
                </div>
                <div
                  className={cn(
                    "mt-1 text-xs font-medium",
                    option.price === 0
                      ? "text-[#15803d]"
                      : active
                      ? "text-[#c8143d]"
                      : "text-slate-500"
                  )}
                >
                  {option.price === 0 ? "Free" : `+$${option.price}`}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-[30px] bg-[#eef2fa] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#c8143d] shadow-sm">
              <Plane className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                Flight Cost
              </p>
              <p className="mt-1 text-sm text-slate-500">
                ${totalFlightCost} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
              Total
            </p>
            <p className="mt-1 text-3xl font-semibold text-[#c8143d]">
              ${totalFlightCost * travelerCount}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          className="h-12 rounded-full border-[#ead8dd] bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-[#fff7f9]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={nextStep}
          disabled={!isValid()}
          className="h-12 rounded-full bg-[#c90039] px-7 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(201,0,57,0.2)] hover:bg-[#b50033]"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}