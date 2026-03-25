"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Shield, Info, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InsuranceArea, InsuranceDuration } from "@/lib/types"

const INSURANCE_AREAS: { value: InsuranceArea; title: string; description: string; countries: string }[] = [
  {
    value: "schengen",
    title: "Schengen Area",
    description: "Covers all 26 Schengen member states",
    countries: "Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovenia, Slovakia, Spain, Sweden, Switzerland, Liechtenstein",
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
    <div className="space-y-8">
      {/* Coverage Area Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Coverage Area</Label>
        </div>
        
        <div className="grid gap-4">
          {INSURANCE_AREAS.map((area) => {
            const isSelected = selectedArea === area.value
            
            return (
              <div
                key={area.value}
                onClick={() => setInsuranceDetails({
                  area: area.value,
                  duration: formData.insuranceDetails?.duration || "21d",
                } as any)}
                className={cn(
                  "group relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Shield className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{area.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{area.description}</p>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className={cn(
                  "absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                  isSelected ? "bg-primary" : "border-2 border-muted-foreground/30"
                )}>
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Area Info */}
      {selectedArea && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              {INSURANCE_AREAS.find(a => a.value === selectedArea)?.title}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              {INSURANCE_AREAS.find(a => a.value === selectedArea)?.countries}
            </p>
          </div>
        </div>
      )}

      {/* Duration Selection */}
      {selectedArea && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold">Coverage Duration</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    "rounded-xl border-2 p-4 cursor-pointer transition-all text-center",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <div className="font-semibold">{duration.label}</div>
                  <div className="text-primary font-bold mt-1">${price}/person</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pricing Table */}
      {selectedArea && (
        <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
          <Label className="font-semibold">Pricing by Number of Travelers</Label>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-5 gap-2 font-medium border-b pb-2 text-muted-foreground">
              <span>Duration</span>
              <span>1 person</span>
              <span>2 persons</span>
              <span>3 persons</span>
              <span>4 persons</span>
            </div>
            {DURATION_OPTIONS.map((duration) => {
              const price = PRICING_TABLE[selectedArea][duration.value]
              return (
                <div key={duration.value} className="grid grid-cols-5 gap-2">
                  <span className="font-medium">{duration.label}</span>
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

      {/* Cost Summary */}
      {selectedArea && selectedDuration && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Insurance Cost</p>
                <p className="text-sm text-muted-foreground">
                  ${unitPrice} × {travelerCount} traveler{travelerCount > 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <span className="text-3xl font-bold text-primary">${insuranceCost}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2 rounded-xl px-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2 rounded-xl px-8">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
