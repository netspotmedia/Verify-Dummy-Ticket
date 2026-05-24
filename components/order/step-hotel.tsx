"use client"

import { useEffect, useState } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HotelType } from "@/lib/types"

const HOTEL_OPTIONS: { value: HotelType; title: string; description: string }[] = [
  {
    value: "separate_per_traveler",
    title: "Separate Confirmation",
    description: "Each traveler receives their own individual hotel booking confirmation",
  },
  {
    value: "one_for_all",
    title: "Shared Confirmation",
    description: "One confirmation covering all travelers on the booking",
  },
]

function Req() {
  return <span aria-hidden="true" className="text-[#c8143d] ml-0.5">*</span>
}

export function StepHotel() {
  const { formData, setHotelDetails, nextStep, prevStep } = useOrderStore()
  const { hotelDetails, travelerCount } = formData

  const isSingleTraveler = travelerCount <= 1
  const selectedType = hotelDetails?.type || null
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (isSingleTraveler) {
      setHotelDetails({ type: "separate_per_traveler" } as any)
    }
  }, [isSingleTraveler])

  const calculateHotelCost = (type: HotelType | null) => {
    if (!type) return 0
    if (type === "separate_per_traveler") return travelerCount * 5
    return 5 + Math.max(travelerCount - 1, 0) * 1
  }

  const effectiveType = isSingleTraveler ? "separate_per_traveler" : selectedType
  const hotelCost = calculateHotelCost(effectiveType)
  const isValid = isSingleTraveler ? true : selectedType !== null
  const showError = tried && !isValid

  const handleContinue = () => {
    if (!isValid) { setTried(true); return }
    nextStep()
  }

  return (
    <div className="space-y-4 font-outfit">
      {isSingleTraveler ? (
        <section className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#c8143d]/10 flex items-center justify-center shrink-0">
              <svg className="h-4 w-4 text-[#c8143d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Hotel Booking Confirmation</p>
              <p className="text-xs text-slate-500 mt-0.5">A verified hotel confirmation will be generated for you</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium uppercase tracking-wider text-black">
                Hotel Confirmation Type <Req />
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how you&apos;d like hotel confirmations issued for your group
              </p>
            </div>
            {showError && (
              <span className="flex items-center gap-1 text-xs text-[#c8143d]">
                <AlertCircle className="h-3 w-3" />
                Required
              </span>
            )}
          </div>

          <div
            className={cn(
              "space-y-1 rounded-lg p-1 transition-all",
              showError && "ring-1 ring-[#c8143d]/40 bg-[#fff5f6]"
            )}
          >
            {HOTEL_OPTIONS.map((option) => {
              const cost = calculateHotelCost(option.value)
              const isSelected = selectedType === option.value

              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded cursor-pointer border transition-all",
                    isSelected
                      ? "border-[#c8143d] bg-[#fff7f9]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    isSelected ? "border-[#c8143d]" : "border-slate-300"
                  )}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-[#c8143d]" />}
                  </div>
                  <input
                    type="radio"
                    name="hotelType"
                    checked={isSelected}
                    onChange={() => setHotelDetails({ type: option.value } as any)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-900">{option.title}</span>
                    <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Total</span>
                    <p className={cn("text-sm font-semibold", isSelected ? "text-[#c8143d]" : "text-slate-700")}>
                      ${cost}
                    </p>
                  </div>
                </label>
              )
            })}
          </div>

          {showError && (
            <p role="alert" className="flex items-center gap-1 text-xs text-[#c8143d] animate-in fade-in slide-in-from-top-1 duration-150">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Please select a hotel confirmation type to continue
            </p>
          )}
        </section>
      )}

      <section className="flex items-center justify-between p-3 border border-[#c8143d] bg-[#fff7f9] rounded">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-black">Hotel Cost</p>
          <p className="text-sm text-black mt-0.5">For {travelerCount} traveler{travelerCount > 1 ? "s" : ""}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 uppercase tracking-wider block">Total</span>
          <p className="text-xl font-semibold text-[#c8143d]">${hotelCost}</p>
        </div>
      </section>

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
