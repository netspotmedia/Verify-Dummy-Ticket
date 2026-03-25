"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Shield, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsuranceArea, InsuranceDuration } from "@/lib/types"

const INSURANCE_AREAS: { value: InsuranceArea; title: string; description: string }[] = [
  {
    value: "schengen",
    title: "Schengen",
    description: "Covers all 26 Schengen member states",
  },
  {
    value: "worldwide_area_1",
    title: "Worldwide Area 1",
    description: "Worldwide excluding USA, Canada & Japan",
  },
  {
    value: "worldwide_area_2",
    title: "Worldwide Area 2",
    description: "Worldwide including USA, Canada & Japan",
  },
]

const DURATION_OPTIONS: { value: InsuranceDuration; label: string }[] = [
  { value: "21d", label: "Up to 21 Days" },
  { value: "3m", label: "Up to 3 Months" },
  { value: "6m", label: "Up to 6 Months" },
  { value: "1y", label: "Up to 1 Year" },
]

// Pricing table from spec (Section 13)
const PRICING_TABLE: Record<InsuranceArea, Record<InsuranceDuration, number>> = {
  schengen: {
    "21d": 20,
    "3m": 30,
    "6m": 40,
    "1y": 50,
  },
  worldwide_area_1: {
    "21d": 25,
    "3m": 35,
    "6m": 45,
    "1y": 55,
  },
  worldwide_area_2: {
    "21d": 28,
    "3m": 48,
    "6m": 65,
    "1y": 80,
  },
}

const AREA_INFO = {
  schengen: "Travel insurance purchased for any Schengen country covers all 26 member states: Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovenia, Slovakia, Spain, Sweden, Switzerland, Liechtenstein.",
  worldwide_area_1: "Covers countries worldwide excluding USA, Canada, and Japan.",
  worldwide_area_2: "Covers all countries including USA, Canada, and Japan.",
}

export function StepInsurance() {
  const { formData, setInsuranceDetails, nextStep, prevStep } = useOrderStore()
  const { insuranceDetails, travelerCount } = formData

  const selectedArea = insuranceDetails?.area || null
  const selectedDuration = insuranceDetails?.duration || null

  const insuranceCost = selectedArea && selectedDuration
    ? PRICING_TABLE[selectedArea][selectedDuration] * travelerCount
    : 0

  const unitPrice = selectedArea && selectedDuration
    ? PRICING_TABLE[selectedArea][selectedDuration]
    : 0

  const isValid = () => {
    return selectedArea && selectedDuration
  }

  return (
    <div className="space-y-6">
      {/* Coverage Area */}
      <div className="space-y-3">
        <Label>Coverage Area</Label>
        <div className="grid gap-4">
          {INSURANCE_AREAS.map((area) => (
            <div
              key={area.value}
              onClick={() => setInsuranceDetails({
                area: area.value,
                duration: formData.insuranceDetails?.duration || "21d",
              } as any)}
              className={cn(
                "p-4 rounded-lg border-2 cursor-pointer transition-all",
                selectedArea === area.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{area.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{area.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Area Explanation */}
      {selectedArea && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>{selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1).replace("_", " ")}:</strong>{" "}
            {AREA_INFO[selectedArea]}
          </div>
        </div>
      )}

      {/* Duration */}
      {selectedArea && (
        <div className="space-y-3">
          <Label>Coverage Duration</Label>
          <div className="grid gap-3 md:grid-cols-4">
            {DURATION_OPTIONS.map((duration) => {
              const price = PRICING_TABLE[selectedArea][duration.value]
              const isSelected = selectedDuration === duration.value
              
              return (
                <div
                  key={duration.value}
                  onClick={() => setInsuranceDetails({
                    area: formData.insuranceDetails?.area || "schengen",
                    duration: duration.value,
                  } as any)}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all text-center",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-medium text-sm">{duration.label}</div>
                  <div className="font-semibold text-primary mt-1">${price}/person</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pricing Table */}
      {selectedArea && (
        <div className="p-4 rounded-lg bg-muted space-y-2">
          <Label>Full Pricing Table ({selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1).replace("_", " ")})</Label>
          <div className="grid gap-2 text-sm">
            <div className="grid grid-cols-5 font-medium border-b pb-2">
              <span>Duration</span>
              <span>1 traveler</span>
              <span>2 travelers</span>
              <span>3 travelers</span>
              <span>4 travelers</span>
            </div>
            {DURATION_OPTIONS.map((duration) => {
              const price = PRICING_TABLE[selectedArea][duration.value]
              return (
                <div key={duration.value} className="grid grid-cols-5">
                  <span>{duration.label}</span>
                  <span>${price}</span>
                  <span>${price * 2}</span>
                  <span>${price * 3}</span>
                  <span>${price * 4}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estimated Cost */}
      {selectedArea && selectedDuration && (
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Estimated Insurance Cost</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">${insuranceCost}</span>
              <p className="text-sm text-muted-foreground">
                ${unitPrice} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

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
