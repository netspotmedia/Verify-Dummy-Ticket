"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, User, Info } from "lucide-react"
import type { Traveler } from "@/lib/types"
import { cn } from "@/lib/utils"

export function StepTravelers() {
  const { formData, setTravelers, nextStep, prevStep } = useOrderStore()
  const { travelers, numberOfTravelers } = formData

  const updateTraveler = (index: number, field: keyof Traveler, value: string) => {
    const updated = [...travelers]
    updated[index] = { ...updated[index], [field]: value }
    setTravelers(updated)
  }

  const isValid = () => {
    return travelers.every(
      (t) => t.firstName?.trim() && t.lastName?.trim() && t.email?.trim()
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Traveler Details
        </Label>
        <p className="text-sm text-slate-600">
          Enter details for {numberOfTravelers === 1 ? "the traveler" : `all ${numberOfTravelers} travelers`}. Names must match passport exactly.
        </p>
      </div>

      <div className="space-y-3">
        {travelers.map((traveler, index) => (
          <div
            key={index}
            className={cn(
              "rounded-xl p-4 transition-all",
              index === 0 ? "bg-slate-50" : "bg-slate-50/50"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                  index === 0
                    ? "bg-[#c8143d] text-white"
                    : "bg-slate-300 text-slate-600"
                )}
              >
                {index + 1}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {index === 0 ? "Primary" : `Traveler ${index + 1}`}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">First Name *</Label>
                <Input
                  placeholder="As on passport"
                  value={traveler.firstName}
                  onChange={(e) => updateTraveler(index, "firstName", e.target.value)}
                  className="h-9 rounded-lg border-slate-200 bg-white text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Last Name *</Label>
                <Input
                  placeholder="As on passport"
                  value={traveler.lastName}
                  onChange={(e) => updateTraveler(index, "lastName", e.target.value)}
                  className="h-9 rounded-lg border-slate-200 bg-white text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs text-slate-500">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="traveler@example.com"
                  value={traveler.email}
                  onChange={(e) => updateTraveler(index, "email", e.target.value)}
                  className="h-9 rounded-lg border-slate-200 bg-white text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
        <Info className="h-3.5 w-3.5" />
        <span>Names must match passport/ID exactly for visa applications.</span>
      </div>

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