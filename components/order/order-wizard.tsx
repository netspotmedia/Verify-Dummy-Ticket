"use client"

import { useOrderStore } from "@/lib/order-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

import { StepServices } from "./step-services"
import { StepCommon } from "./step-common"
import { StepFlight } from "./step-flight"
import { StepHotel } from "./step-hotel"
import { StepInsurance } from "./step-insurance"
import { StepReview } from "./step-review"
import { StepPayment } from "./step-payment"

const STEP_TITLES: Record<string, { title: string; description: string }> = {
  services: { title: "Select Services", description: "Choose the services you need" },
  common: { title: "Traveler Information", description: "Enter traveler and contact details" },
  flight: { title: "Flight Details", description: "Provide your flight itinerary" },
  hotel: { title: "Hotel Details", description: "Provide your hotel booking details" },
  insurance: { title: "Insurance Details", description: "Select your insurance coverage" },
  review: { title: "Review & Delivery", description: "Confirm your order details" },
  payment: { title: "Payment", description: "Complete your payment" },
}

export function OrderWizard() {
  const { currentStepIndex, activeSteps, formData, goToStep } = useOrderStore()
  const progress = ((currentStepIndex + 1) / activeSteps.length) * 100

  const currentStep = activeSteps[currentStepIndex]
  const stepInfo = STEP_TITLES[currentStep] || { title: currentStep, description: "" }

  const isStepComplete = (stepId: string) => {
    switch (stepId) {
      case "services":
        return formData.services.length > 0
      case "common":
        return (
          formData.travelerCount > 0 &&
          formData.email.length > 0 &&
          formData.customerCountryCode.length > 0 &&
          formData.travelers.every((t) => t.firstName && t.lastName)
        )
      case "flight":
        if (!formData.services.includes("flight")) return true
        return !!(formData.flightDetails?.tripType && formData.flightDetails?.flightDetails && formData.flightDetails?.validity)
      case "hotel":
        if (!formData.services.includes("hotel")) return true
        return !!formData.hotelDetails?.type
      case "insurance":
        if (!formData.services.includes("insurance")) return true
        return !!(formData.insuranceDetails?.area && formData.insuranceDetails?.duration)
      case "review":
        return true
      case "payment":
        return !!formData.captchaToken
      default:
        return false
    }
  }

  const canNavigateToStep = (stepIndex: number) => {
    if (stepIndex === 0) return true
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepComplete(activeSteps[i])) return false
    }
    return true
  }

  const renderStep = () => {
    switch (currentStep) {
      case "services":
        return <StepServices />
      case "common":
        return <StepCommon />
      case "flight":
        return <StepFlight />
      case "hotel":
        return <StepHotel />
      case "insurance":
        return <StepInsurance />
      case "review":
        return <StepReview />
      case "payment":
        return <StepPayment />
      default:
        return <StepServices />
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">
            Step {currentStepIndex + 1} of {activeSteps.length}
          </span>
          <span className="text-muted-foreground">{stepInfo.title}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex justify-between">
        {activeSteps.map((step, index) => (
          <button
            key={step}
            onClick={() => canNavigateToStep(index) && goToStep(index)}
            disabled={!canNavigateToStep(index)}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              canNavigateToStep(index) ? "cursor-pointer" : "cursor-not-allowed opacity-50",
              currentStepIndex === step && "font-medium text-primary",
              currentStepIndex > step && "text-accent",
              currentStepIndex < step && "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                currentStepIndex === step && "border-primary bg-primary text-primary-foreground",
                currentStepIndex > step && "border-accent bg-accent text-accent-foreground",
                currentStepIndex < step && "border-muted-foreground/30"
              )}
            >
              {isStepComplete(step) && currentStepIndex > step ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
            <span className="hidden lg:inline">{STEP_TITLES[step]?.title || step}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{stepInfo.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{stepInfo.description}</p>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  )
}
