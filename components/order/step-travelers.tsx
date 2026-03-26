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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Traveler Details
        </Label>
        <p className="text-sm text-slate-500">
          Please enter the details for {numberOfTravelers === 1 ? "the traveler" : `all ${numberOfTravelers} travelers`}.
          Names should match passport/ID exactly.
        </p>
      </div>

      <div className="space-y-4">
        {travelers.map((traveler, index) => (
          <div
            key={index}
            className="group relative w-full overflow-hidden rounded-[26px] p-[1px] bg-[#e9edf5] hover:bg-transparent transition-all"
          >
            <div className="rounded-[25px] bg-[#e9edf5] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)] p-5 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#64748b] shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Traveler {index + 1}</span>
                  {index === 0 && <span className="ml-2 text-xs text-[#c8143d] font-medium">(Primary)</span>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`} className="text-xs font-medium text-slate-600">First Name *</Label>
                  <Input
                    id={`firstName-${index}`}
                    placeholder="As shown on passport"
                    value={traveler.firstName}
                    onChange={(e) => updateTraveler(index, "firstName", e.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`} className="text-xs font-medium text-slate-600">Last Name *</Label>
                  <Input
                    id={`lastName-${index}`}
                    placeholder="As shown on passport"
                    value={traveler.lastName}
                    onChange={(e) => updateTraveler(index, "lastName", e.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`email-${index}`} className="text-xs font-medium text-slate-600">Email Address *</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="traveler@example.com"
                    value={traveler.email}
                    onChange={(e) => updateTraveler(index, "email", e.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dob-${index}`} className="text-xs font-medium text-slate-600">Date of Birth (Optional)</Label>
                  <Input
                    id={`dob-${index}`}
                    type="date"
                    value={traveler.dateOfBirth || ""}
                    onChange={(e) => updateTraveler(index, "dateOfBirth", e.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`nationality-${index}`} className="text-xs font-medium text-slate-600">Nationality (Optional)</Label>
                  <Input
                    id={`nationality-${index}`}
                    placeholder="e.g., Nigerian, British"
                    value={traveler.nationality || ""}
                    onChange={(e) => updateTraveler(index, "nationality", e.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`passport-${index}`} className="text-xs font-medium text-slate-600">Passport Number (Optional)</Label>
                  <Input
                    id={`passport-${index}`}
                    placeholder="Passport number"
                    value={traveler.passportNumber || ""}
                    onChange={(e) => updateTraveler(index, "passportNumber", e.target.value)}
                    className="rounded-xl border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-[18px] bg-[#f7f5f4] p-3">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
        <p className="text-sm text-slate-500">Make sure names match your passport/ID exactly for visa applications.</p>
      </div>

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