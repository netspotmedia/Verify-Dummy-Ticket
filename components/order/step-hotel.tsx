"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Building2, Info } from "lucide-react"
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Hotel Confirmation Type</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose how you want the hotel confirmation to be issued
        </p>
        
        <div className="grid gap-4">
          {HOTEL_OPTIONS.map((option) => {
            const cost = calculateHotelCost(option.value)
            const isSelected = selectedType === option.value
            
            return (
              <div
                key={option.value}
                onClick={() => setHotelDetails({ type: option.value } as any)}
                className={cn(
                  "group relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/50 hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-colors",
                    isSelected ? "bg-primary" : "bg-muted group-hover:bg-primary/10"
                  )}>
                    {option.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      <span className="text-lg font-bold text-primary">${cost}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
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

      {/* Pricing Guide */}
      <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-muted-foreground" />
          <Label className="font-semibold">Pricing Guide</Label>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Separate Pricing */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Separate Confirmation</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>1 traveler</span>
                <span className="font-medium">$5</span>
              </div>
              <div className="flex justify-between">
                <span>2 travelers</span>
                <span className="font-medium">$10</span>
              </div>
              <div className="flex justify-between">
                <span>3 travelers</span>
                <span className="font-medium">$15</span>
              </div>
              <div className="flex justify-between">
                <span>4 travelers</span>
                <span className="font-medium">$20</span>
              </div>
            </div>
          </div>

          {/* Shared Pricing */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Shared Confirmation</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>1 traveler</span>
                <span className="font-medium">$5</span>
              </div>
              <div className="flex justify-between">
                <span>2 travelers</span>
                <span className="font-medium">$6</span>
              </div>
              <div className="flex justify-between">
                <span>3 travelers</span>
                <span className="font-medium">$7</span>
              </div>
              <div className="flex justify-between">
                <span>4 travelers</span>
                <span className="font-medium">$8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Cost */}
      {selectedType && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Hotel Cost</p>
                <p className="text-sm text-muted-foreground">For {travelerCount} traveler{travelerCount > 1 ? "s" : ""}</p>
              </div>
            </div>
            <span className="text-3xl font-bold text-primary">${hotelCost}</span>
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
