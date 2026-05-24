"use client"

import { useState } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsuranceArea, InsuranceDuration } from "@/lib/types"

const INSURANCE_AREAS: { value: InsuranceArea; title: string; description: string }[] = [
  { value: "schengen",         title: "Schengen Area",              description: "Covers all 26 Schengen member states" },
  { value: "worldwide_area_1", title: "Worldwide (Excl. US/CA/JP)", description: "Worldwide excluding USA, Canada & Japan" },
  { value: "worldwide_area_2", title: "Worldwide (Incl. US/CA/JP)", description: "Worldwide including USA, Canada & Japan" },
]

const DURATION_OPTIONS: { value: InsuranceDuration; label: string }[] = [
  { value: "21d", label: "21 Days" },
  { value: "3m",  label: "3 Months" },
  { value: "6m",  label: "6 Months" },
  { value: "1y",  label: "1 Year" },
]

const PRICING_TABLE: Record<InsuranceArea, Record<InsuranceDuration, number>> = {
  schengen:         { "21d": 20, "3m": 30, "6m": 40, "1y": 50 },
  worldwide_area_1: { "21d": 25, "3m": 35, "6m": 45, "1y": 55 },
  worldwide_area_2: { "21d": 28, "3m": 48, "6m": 65, "1y": 80 },
}

function Req() {
  return <span aria-hidden="true" className="text-[#c8143d] ml-0.5">*</span>
}

export function StepInsurance() {
  const { formData, setInsuranceDetails, nextStep, prevStep } = useOrderStore()
  const { insuranceDetails, travelerCount } = formData

  const selectedArea     = insuranceDetails?.area     || null
  const selectedDuration = insuranceDetails?.duration || null
  const [tried, setTried] = useState(false)

  const insuranceCost = selectedArea && selectedDuration
    ? PRICING_TABLE[selectedArea][selectedDuration] * travelerCount : 0
  const unitPrice = selectedArea && selectedDuration
    ? PRICING_TABLE[selectedArea][selectedDuration] : 0

  const getErrors = () => {
    const e: Record<string, string> = {}
    if (!selectedArea)    e.area     = "Please select a coverage area"
    if (!selectedDuration) e.duration = "Please select a coverage duration"
    return e
  }

  const allErrors = getErrors()
  const showAreaError     = tried && !!allErrors.area
  const showDurationError = tried && !!allErrors.duration

  const handleContinue = () => {
    setTried(true)
    if (Object.keys(allErrors).length > 0) return
    nextStep()
  }

  return (
    <div className="space-y-4 font-outfit">
      <p className="text-xs text-slate-400">
        Fields marked <span className="text-[#c8143d] font-semibold">*</span> are required
      </p>

      {/* Coverage Area */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium uppercase tracking-wider text-black">
            Coverage Area <Req />
          </Label>
          {showAreaError && (
            <span className="flex items-center gap-1 text-xs text-[#c8143d]">
              <AlertCircle className="h-3 w-3" />
              Required
            </span>
          )}
        </div>

        <div
          className={cn(
            "space-y-1 rounded-lg p-1 transition-all",
            showAreaError && "ring-1 ring-[#c8143d]/40 bg-[#fff5f6]"
          )}
        >
          {INSURANCE_AREAS.map((area) => {
            const isSelected = selectedArea === area.value
            return (
              <label
                key={area.value}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded cursor-pointer border transition-all",
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
                  name="insuranceArea"
                  checked={isSelected}
                  onChange={() =>
                    setInsuranceDetails({
                      area: area.value,
                      duration: formData.insuranceDetails?.duration || "21d",
                    } as any)
                  }
                  className="sr-only"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-900">{area.title}</span>
                  <span className="text-xs text-slate-500 ml-2">{area.description}</span>
                </div>
              </label>
            )
          })}
        </div>

        {showAreaError && (
          <p role="alert" className="flex items-center gap-1 text-xs text-[#c8143d] animate-in fade-in slide-in-from-top-1 duration-150">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {allErrors.area}
          </p>
        )}
      </section>

      {/* Coverage Duration — only shown after area is selected */}
      {selectedArea ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium uppercase tracking-wider text-black">
                Coverage Duration <Req />
              </Label>
              <p className="text-xs text-slate-500 mt-0.5">How long the policy should remain valid</p>
            </div>
            {showDurationError && (
              <span className="flex items-center gap-1 text-xs text-[#c8143d]">
                <AlertCircle className="h-3 w-3" />
                Required
              </span>
            )}
          </div>

          <div
            className={cn(
              "grid grid-cols-4 gap-2 rounded-lg p-1 transition-all",
              showDurationError && "ring-1 ring-[#c8143d]/40 bg-[#fff5f6]"
            )}
          >
            {DURATION_OPTIONS.map((duration) => {
              const price      = PRICING_TABLE[selectedArea][duration.value]
              const isSelected = selectedDuration === duration.value
              return (
                <label
                  key={duration.value}
                  className={cn(
                    "block p-2 rounded cursor-pointer text-center border transition-all",
                    isSelected
                      ? "border-[#c8143d] bg-[#fff7f9]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <input
                    type="radio"
                    name="insuranceDuration"
                    checked={isSelected}
                    onChange={() =>
                      setInsuranceDetails({
                        area: formData.insuranceDetails?.area || "schengen",
                        duration: duration.value,
                      } as any)
                    }
                    className="sr-only"
                  />
                  <div className={cn("text-xs font-semibold", isSelected ? "text-[#c8143d]" : "text-slate-800")}>
                    {duration.label}
                  </div>
                  <div className={cn("text-sm mt-0.5", isSelected ? "text-[#c8143d]" : "text-slate-500")}>
                    ${price}/person
                  </div>
                </label>
              )
            })}
          </div>

          {showDurationError && (
            <p role="alert" className="flex items-center gap-1 text-xs text-[#c8143d] animate-in fade-in slide-in-from-top-1 duration-150">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {allErrors.duration}
            </p>
          )}
        </section>
      ) : tried ? (
        /* Nudge: tell user they need to pick area first before duration appears */
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Select a coverage area above to choose your coverage duration.
        </div>
      ) : null}

      {/* Cost summary */}
      {selectedArea && selectedDuration && (
        <section className="flex items-center justify-between p-3 border border-[#c8143d] bg-[#fff7f9] rounded">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-black">Insurance Cost</p>
            <p className="text-sm text-black mt-0.5">
              ${unitPrice} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold uppercase tracking-wider text-black">Total</span>
            <p className="text-xl font-semibold text-[#c8143d]">${insuranceCost}</p>
          </div>
        </section>
      )}

      {/* Error banner */}
      {tried && Object.keys(allErrors).length > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-[#c8143d]/30 bg-[#fff5f6] px-3 py-2 text-xs text-[#c8143d]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Please complete all required selections before continuing.</span>
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
