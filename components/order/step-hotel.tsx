"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
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

export function StepHotel() {
  const { formData, setHotelDetails, nextStep, prevStep } = useOrderStore()
  const { hotelDetails, travelerCount } = formData

  const selectedType = hotelDetails?.type || null

  const calculateHotelCost = (type: HotelType | null) => {
    if (!type) return 0
    if (type === "separate_per_traveler") {
      return travelerCount * 5
    }
    return 5 + Math.max(travelerCount - 1, 0) * 1
  }

  const hotelCost = calculateHotelCost(selectedType)

  const isValid = () => {
    return selectedType !== null
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Hotel Confirmation Type
        </Label>

        <div className="space-y-1">
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
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    isSelected
                      ? "border-[#c8143d]"
                      : "border-slate-300"
                  )}
                >
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
                  <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                  <p className={cn("text-sm font-semibold", isSelected ? "text-[#c8143d]" : "text-slate-700")}>
                    ${cost}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      <section className="p-3 border border-slate-200 rounded">
        <p className="text-xs font-medium text-slate-500 mb-2">Pricing Guide</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-700">Separate Confirmation</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">$5 per traveler</p>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span>1 traveler</span><span className="font-semibold">$5</span></div>
              <div className="flex justify-between"><span>2 travelers</span><span className="font-semibold">$10</span></div>
              <div className="flex justify-between"><span>3 travelers</span><span className="font-semibold">$15</span></div>
              <div className="flex justify-between"><span>4 travelers</span><span className="font-semibold">$20</span></div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">Shared Confirmation</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">$5 base + $1/traveler</p>
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between"><span>1 traveler</span><span className="font-semibold">$5</span></div>
              <div className="flex justify-between"><span>2 travelers</span><span className="font-semibold">$6</span></div>
              <div className="flex justify-between"><span>3 travelers</span><span className="font-semibold">$7</span></div>
              <div className="flex justify-between"><span>4 travelers</span><span className="font-semibold">$8</span></div>
            </div>
          </div>
        </div>
      </section>

      {selectedType && (
        <section className="flex items-center justify-between p-3 border border-[#c8143d] bg-[#fff7f9] rounded">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hotel Cost</p>
            <p className="text-xs text-slate-500 mt-0.5">
              For {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total</span>
            <p className="text-xl font-semibold text-[#c8143d]">${hotelCost}</p>
          </div>
        </section>
      )}

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
