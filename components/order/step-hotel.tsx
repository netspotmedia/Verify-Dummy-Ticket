"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HotelType } from "@/lib/types"

const HOTEL_OPTIONS: { value: HotelType; title: string; description: string; pricing: string }[] = [
  {
    value: "separate_per_traveler",
    title: "Separate for each traveler",
    description: "Each traveler gets an individual hotel confirmation",
    pricing: "$5 per traveler",
  },
  {
    value: "one_for_all",
    title: "One for all travelers",
    description: "One shared hotel confirmation for the group",
    pricing: "$5 + $1 per additional traveler",
  },
]

export function StepHotel() {
  const { formData, setHotelDetails, nextStep, prevStep } = useOrderStore()
  const { hotelDetails, travelerCount } = formData

  const selectedType = hotelDetails?.type || null

  // Calculate hotel cost per spec (Section 11)
  const calculateHotelCost = (type: HotelType | null) => {
    if (!type) return 0
    if (type === "separate_per_traveler") {
      return travelerCount * 5
    }
    // one_for_all: $5 + $1 per additional traveler
    return 5 + Math.max(travelerCount - 1, 0) * 1
  }

  const hotelCost = calculateHotelCost(selectedType)

  const isValid = () => {
    return selectedType !== null
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Hotel Confirmation Type</Label>
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
                  "p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{option.title}</h3>
                      <span className="font-semibold text-primary">{option.pricing}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pricing Examples */}
      <div className="p-4 rounded-lg bg-muted space-y-2">
        <Label>Price Examples</Label>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span>Separate - 1 traveler</span>
            <span className="font-medium">$5</span>
          </div>
          <div className="flex justify-between">
            <span>Separate - 2 travelers</span>
            <span className="font-medium">$10</span>
          </div>
          <div className="flex justify-between">
            <span>Separate - 3 travelers</span>
            <span className="font-medium">$15</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between">
            <span>One for all - 1 traveler</span>
            <span className="font-medium">$5</span>
          </div>
          <div className="flex justify-between">
            <span>One for all - 2 travelers</span>
            <span className="font-medium">$6</span>
          </div>
          <div className="flex justify-between">
            <span>One for all - 3 travelers</span>
            <span className="font-medium">$7</span>
          </div>
          <div className="flex justify-between">
            <span>One for all - 4 travelers</span>
            <span className="font-medium">$8</span>
          </div>
        </div>
      </div>

      {/* Estimated Cost */}
      {selectedType && (
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Estimated Hotel Cost</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">${hotelCost}</span>
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
