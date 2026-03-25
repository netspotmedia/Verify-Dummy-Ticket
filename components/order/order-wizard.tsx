"use client"

import { useOrderStore } from "@/lib/order-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

import { StepServices } from "./step-services"
import { StepTripDetails } from "./step-trip-details"
import { StepTravelers } from "./step-travelers"
import { StepContact } from "./step-contact"
import { StepPayment } from "./step-payment"

const steps = [
  { id: 0, title: "Services", description: "Select your services" },
  { id: 1, title: "Trip Details", description: "Enter flight/hotel info" },
  { id: 2, title: "Travelers", description: "Traveler information" },
  { id: 3, title: "Contact", description: "Delivery details" },
  { id: 4, title: "Payment", description: "Complete order" },
]

export function OrderWizard() {
  const { currentStep, goToStep, formData } = useOrderStore()
  const progress = ((currentStep + 1) / steps.length) * 100

  // Determine which steps are complete
  const isStepComplete = (stepId: number) => {
    if (stepId === 0) return formData.services.length > 0
    if (stepId === 1) {
      if (formData.services.includes("flight") && !formData.flightDetails?.departureCity) return false
      if (formData.services.includes("hotel") && !formData.hotelDetails?.city) return false
      if (formData.services.includes("insurance") && !formData.insuranceDetails?.destination) return false
      return formData.services.length > 0
    }
    if (stepId === 2) {
      return formData.travelers.every(t => t.firstName && t.lastName && t.email)
    }
    if (stepId === 3) return !!formData.contactEmail && !!formData.contactPhone
    return false
  }

  const canNavigateToStep = (stepId: number) => {
    if (stepId === 0) return true
    for (let i = 0; i < stepId; i++) {
      if (!isStepComplete(i)) return false
    }
    return true
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">{steps[currentStep].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex justify-between">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => canNavigateToStep(step.id) && goToStep(step.id)}
            disabled={!canNavigateToStep(step.id)}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              canNavigateToStep(step.id) ? "cursor-pointer" : "cursor-not-allowed opacity-50",
              currentStep === step.id && "font-medium text-primary",
              currentStep > step.id && "text-accent",
              currentStep < step.id && "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                currentStep === step.id && "border-primary bg-primary text-primary-foreground",
                currentStep > step.id && "border-accent bg-accent text-accent-foreground",
                currentStep < step.id && "border-muted-foreground/30"
              )}
            >
              {isStepComplete(step.id) && currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id + 1
              )}
            </div>
            <span className="hidden lg:inline">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && <StepServices />}
          {currentStep === 1 && <StepTripDetails />}
          {currentStep === 2 && <StepTravelers />}
          {currentStep === 3 && <StepContact />}
          {currentStep === 4 && <StepPayment />}
        </CardContent>
      </Card>
    </div>
  )
}
