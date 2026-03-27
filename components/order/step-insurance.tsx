"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsuranceArea, InsuranceDuration } from "@/lib/types"

const INSURANCE_AREAS: { value: InsuranceArea; title: string; description: string }[] = [
  {
    value: "schengen",
    title: "Schengen Area",
    description: "Covers all 26 Schengen member states",
  },
  {
    value: "worldwide_area_1",
    title: "Worldwide (Excl. US/CA/JP)",
    description: "Worldwide excluding USA, Canada & Japan",
  },
  {
    value: "worldwide_area_2",
    title: "Worldwide (Incl. US/CA/JP)",
    description: "Worldwide including USA, Canada & Japan",
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
    <div className="space-y-4 font-outfit">
      <section className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Coverage Area
        </Label>

        <div className="space-y-1">
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
      </section>

      {selectedArea && (
        <section className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Coverage Duration
          </Label>
          <p className="text-xs text-slate-500">
            Pick how long the policy should remain valid
          </p>

          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((duration) => {
              const price = PRICING_TABLE[selectedArea][duration.value]
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
                  <div className={cn("text-[10px] mt-0.5", isSelected ? "text-[#c8143d]" : "text-slate-500")}>
                    ${price}/person
                  </div>
                </label>
              )
            })}
          </div>
        </section>
      )}

      {selectedArea && (
        <section className="p-3 border border-slate-200 rounded">
          <p className="text-xs font-medium text-slate-500 mb-2">Pricing by Travelers</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-1.5 font-semibold text-slate-500">Duration</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-500">1 person</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-500">2 persons</th>
                  <th className="text-right py-1.5 px-2 font-semibold text-slate-500">3 persons</th>
                  <th className="text-right py-1.5 font-semibold text-slate-500">4 persons</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {DURATION_OPTIONS.map((duration) => {
                  const price = PRICING_TABLE[selectedArea][duration.value]
                  return (
                    <tr key={duration.value} className="border-b border-slate-100 last:border-0">
                      <td className="py-1.5 font-medium">{duration.label}</td>
                      <td className="text-right py-1.5 px-2">${price}</td>
                      <td className="text-right py-1.5 px-2">${price * 2}</td>
                      <td className="text-right py-1.5 px-2">${price * 3}</td>
                      <td className="text-right py-1.5">${price * 4}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedArea && selectedDuration && (
        <section className="flex items-center justify-between p-3 border border-[#c8143d] bg-[#fff7f9] rounded">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Insurance Cost</p>
            <p className="text-xs text-slate-500 mt-0.5">
              ${unitPrice} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total</span>
            <p className="text-xl font-semibold text-[#c8143d]">${insuranceCost}</p>
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
