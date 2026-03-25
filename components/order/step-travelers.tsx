"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User } from "lucide-react"
import type { Traveler } from "@/lib/types"

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
      <p className="text-sm text-muted-foreground">
        Please enter the details for {numberOfTravelers === 1 ? "the traveler" : `all ${numberOfTravelers} travelers`}.
        Names should match passport/ID exactly.
      </p>

      {travelers.map((traveler, index) => (
        <Card key={index}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Traveler {index + 1}
              {index === 0 && " (Primary)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                <Input
                  id={`firstName-${index}`}
                  placeholder="As shown on passport"
                  value={traveler.firstName}
                  onChange={(e) => updateTraveler(index, "firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                <Input
                  id={`lastName-${index}`}
                  placeholder="As shown on passport"
                  value={traveler.lastName}
                  onChange={(e) => updateTraveler(index, "lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`email-${index}`}>Email Address *</Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="traveler@example.com"
                  value={traveler.email}
                  onChange={(e) => updateTraveler(index, "email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`dob-${index}`}>Date of Birth (Optional)</Label>
                <Input
                  id={`dob-${index}`}
                  type="date"
                  value={traveler.dateOfBirth || ""}
                  onChange={(e) => updateTraveler(index, "dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`nationality-${index}`}>Nationality (Optional)</Label>
                <Input
                  id={`nationality-${index}`}
                  placeholder="e.g., Nigerian, British"
                  value={traveler.nationality || ""}
                  onChange={(e) => updateTraveler(index, "nationality", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`passport-${index}`}>Passport Number (Optional)</Label>
                <Input
                  id={`passport-${index}`}
                  placeholder="Passport number"
                  value={traveler.passportNumber || ""}
                  onChange={(e) => updateTraveler(index, "passportNumber", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Navigation Buttons */}
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
