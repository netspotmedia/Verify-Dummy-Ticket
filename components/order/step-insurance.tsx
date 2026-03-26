"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Shield, Info, Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsuranceArea, InsuranceDuration } from "@/lib/types"

const INSURANCE_AREAS: { value: InsuranceArea; title: string; description: string; countries: string }[] = [
  {
    value: "schengen",
    title: "Schengen Area",
    description: "Covers all 26 Schengen member states",
    countries:
      "Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovenia, Slovakia, Spain, Sweden, Switzerland, Liechtenstein",
  },
  {
    value: "worldwide_area_1",
    title: "Worldwide (Excl. US/CA/JP)",
    description: "Worldwide excluding USA, Canada & Japan",
    countries: "All countries except United States, Canada, and Japan",
  },
  {
    value: "worldwide_area_2",
    title: "Worldwide (Incl. US/CA/JP)",
    description: "Worldwide including USA, Canada & Japan",
    countries: "All countries worldwide",
  },
]

const DURATION_OPTIONS: { value: InsuranceDuration; label: string }[] = [
  { value: "21d", label: "21 Days" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
]

const PRICING_TABLE: Record<InsuranceArea, Record<InsuranceDuration, number>> = {
  schengen: { "21d": 20, "3m": 30, "6m": 40, "1y": 50 },
  worldwide_area_1: { "21d": 25, "3m": 35, "6m": 45, "1y": 55 },
  worldwide_area_2: { "21d": 28, "3m": 48, "6m": 65, "1y": 80 },
}

export function StepInsurance() {
  const { formData, setInsuranceDetails, nextStep, prevStep } = useOrderStore()
  const { insuranceDetails, travelerCount } = formData

  const selectedArea = insuranceDetails?.area || null
  const selectedDuration = insuranceDetails?.duration || null

  const insuranceCost =
    selectedArea && selectedDuration
      ? PRICING_TABLE[selectedArea][selectedDuration] * travelerCount
      : 0

  const unitPrice =
    selectedArea && selectedDuration
      ? PRICING_TABLE[selectedArea][selectedDuration]
      : 0

  const isValid = () => {
    return selectedArea && selectedDuration
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-500" />
          <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
            Coverage Area
          </Label>
        </div>

        <p className="text-sm text-slate-500">
          Select where the insurance should be valid
        </p>

        <div className="grid gap-3">
          {INSURANCE_AREAS.map((area) => {
            const isSelected = selectedArea === area.value

            return (
              <button
                key={area.value}
                type="button"
                onClick={() =>
                  setInsuranceDetails({
                    area: area.value,
                    duration: formData.insuranceDetails?.duration || "21d",
                  } as any)
                }
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
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all",
                      isSelected
                        ? "bg-[#c8143d] text-white"
                        : "bg-white text-slate-500 shadow-sm"
                    )}
                  >
                    <Shield className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {area.title}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                      {area.description}
                    </p>
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

      {selectedArea && (
        <section className="rounded-[28px] bg-[#eef5ff] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Info className="h-5 w-5 text-[#2563eb]" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4a6aa3]">
                Selected Coverage
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {INSURANCE_AREAS.find((a) => a.value === selectedArea)?.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {INSURANCE_AREAS.find((a) => a.value === selectedArea)?.countries}
              </p>
            </div>
          </div>
        </section>
      )}

      {selectedArea && (
        <section className="space-y-3">
          <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
            Coverage Duration
          </Label>

          <p className="text-sm text-slate-500">
            Pick how long the policy should remain valid
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {DURATION_OPTIONS.map((duration) => {
              const price = PRICING_TABLE[selectedArea][duration.value]
              const isSelected = selectedDuration === duration.value

              return (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() =>
                    setInsuranceDetails({
                      area: formData.insuranceDetails?.area || "schengen",
                      duration: duration.value,
                    } as any)
                  }
                  className={cn(
                    "rounded-[22px] px-4 py-4 text-center transition-all",
                    isSelected
                      ? "bg-white shadow-[0_12px_24px_rgba(15,23,42,0.07)] ring-1 ring-[#f0ccd5]"
                      : "bg-[#e9edf5] hover:bg-white"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? "text-[#c8143d]" : "text-slate-800"
                    )}
                  >
                    {duration.label}
                  </div>
                  <div
                    className={cn(
                      "mt-1 text-xs font-medium",
                      isSelected ? "text-[#c8143d]" : "text-slate-500"
                    )}
                  >
                    ${price}/person
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {selectedArea && (
        <section className="rounded-[30px] bg-[#eef2fa] p-5">
          <div className="mb-4">
            <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
              Pricing by Number of Travelers
            </Label>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[560px] rounded-[24px] bg-white p-4 shadow-sm">
              <div className="grid grid-cols-5 gap-3 border-b border-slate-200 pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                <span>Duration</span>
                <span>1 person</span>
                <span>2 persons</span>
                <span>3 persons</span>
                <span>4 persons</span>
              </div>

              <div className="mt-3 space-y-3 text-sm text-slate-700">
                {DURATION_OPTIONS.map((duration) => {
                  const price = PRICING_TABLE[selectedArea][duration.value]

                  return (
                    <div key={duration.value} className="grid grid-cols-5 gap-3">
                      <span className="font-semibold text-slate-900">
                        {duration.label}
                      </span>
                      <span>${price}</span>
                      <span>${price * 2}</span>
                      <span>${price * 3}</span>
                      <span>${price * 4}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {selectedArea && selectedDuration && (
        <section className="rounded-[30px] bg-[#eef2fa] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#c8143d] shadow-sm">
                <Shield className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                  Insurance Cost
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  ${unitPrice} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                Total
              </p>
              <p className="mt-1 text-3xl font-semibold text-[#c8143d]">
                ${insuranceCost}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2 rounded-full px-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2 rounded-full bg-gradient-to-r from-[#c8143d] to-[#d94a6d] hover:from-[#d94a6d] hover:to-[#c8143d] text-white shadow-lg shadow-red-200/50 px-6">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}