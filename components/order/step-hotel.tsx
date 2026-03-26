"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Building2, Info, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HotelType } from "@/lib/types"

const HOTEL_OPTIONS: { value: HotelType; title: string; description: string; icon: string }[] = [
  {
    value: "separate_per_traveler",
    title: "Separate Confirmation",
    description: "Each traveler receives their own individual hotel booking confirmation",
    icon: "👥",
  },
  {
    value: "one_for_all",
    title: "Shared Confirmation",
    description: "One confirmation covering all travelers on the booking",
    icon: "📄",
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
    <div className="space-y-8">
      <section className="space-y-3">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Hotel Confirmation Type
        </Label>

        <p className="text-sm text-slate-500">
          Choose how you want the hotel confirmation to be issued
        </p>

        <div className="grid gap-3">
          {HOTEL_OPTIONS.map((option) => {
            const cost = calculateHotelCost(option.value)
            const isSelected = selectedType === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setHotelDetails({ type: option.value } as any)}
                className={cn(
                  "group relative w-full overflow-hidden rounded-[26px] p-[1px] text-left transition-all",
                  isSelected
                    ? "bg-gradient-to-r from-[#c8143d] via-[#d94a6d] to-[#efc5d0] shadow-[0_16px_30px_rgba(200,20,61,0.12)]"
                    : "bg-transparent"
                )}
              >
                <div
                  className={cn(
                    "relative flex min-h-[118px] items-center gap-4 rounded-[25px] px-5 py-5 transition-all",
                    isSelected
                      ? "bg-white"
                      : "bg-[#e9edf5] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all",
                      isSelected
                        ? "bg-[#c8143d] text-white"
                        : "bg-white text-slate-600 shadow-sm"
                    )}
                  >
                    <span>{option.icon}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {option.title}
                        </h3>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                          {option.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                          Total
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-[#c8143d]">
                          ${cost}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                      isSelected
                        ? "bg-[#c8143d] text-white"
                        : "border border-slate-300 bg-white text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-[30px] bg-[#eef2fa] p-5">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Info className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
              Pricing Guide
            </Label>
            <p className="mt-1 text-sm text-slate-500">
              Compare how pricing changes with traveler count
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Separate Confirmation
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#a27f88]">
              $5 per traveler
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>1 traveler</span>
                <span className="font-semibold text-slate-900">$5</span>
              </div>
              <div className="flex justify-between">
                <span>2 travelers</span>
                <span className="font-semibold text-slate-900">$10</span>
              </div>
              <div className="flex justify-between">
                <span>3 travelers</span>
                <span className="font-semibold text-slate-900">$15</span>
              </div>
              <div className="flex justify-between">
                <span>4 travelers</span>
                <span className="font-semibold text-slate-900">$20</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Shared Confirmation
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#a27f88]">
              $5 base + $1 extra traveler
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>1 traveler</span>
                <span className="font-semibold text-slate-900">$5</span>
              </div>
              <div className="flex justify-between">
                <span>2 travelers</span>
                <span className="font-semibold text-slate-900">$6</span>
              </div>
              <div className="flex justify-between">
                <span>3 travelers</span>
                <span className="font-semibold text-slate-900">$7</span>
              </div>
              <div className="flex justify-between">
                <span>4 travelers</span>
                <span className="font-semibold text-slate-900">$8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedType && (
        <section className="rounded-[30px] bg-[#eef2fa] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#c8143d] shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                  Hotel Cost
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  For {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                Total
              </p>
              <p className="mt-1 text-3xl font-semibold text-[#c8143d]">
                ${hotelCost}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-10 px-4 rounded-lg">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="flex-1 h-10 rounded-lg bg-[#c8143d] hover:bg-[#b01030] font-medium">
          Continue
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}