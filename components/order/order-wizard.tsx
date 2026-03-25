"use client"

import { useOrderStore } from "@/lib/order-store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"

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
    <div className="space-y-8">
      {/* Modern Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Step {currentStepIndex + 1}
              <span className="text-muted-foreground font-normal"> of {activeSteps.length}</span>
            </h2>
            <p className="text-muted-foreground">{stepInfo.title}</p>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 rounded-full" />
      </div>

      {/* Step Indicators - Modern Breadcrumb Style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {activeSteps.map((step, index) => {
          const isComplete = isStepComplete(step)
          const isCurrent = currentStepIndex === index
          const canNav = canNavigateToStep(index)

          return (
            <div key={step} className="flex items-center gap-2">
              <button
                onClick={() => canNav && goToStep(index)}
                disabled={!canNav}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  !isCurrent && isComplete && "bg-green-100 text-green-700 hover:bg-green-200",
                  !isCurrent && !isComplete && "bg-muted text-muted-foreground hover:bg-muted/80",
                  !canNav && "opacity-50 cursor-not-allowed"
                )}
              >
                {isComplete && !isCurrent ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    isCurrent ? "bg-primary-foreground/20" : "bg-current/10"
                  )}>
                    {index + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{STEP_TITLES[step]?.title || step}</span>
              </button>
              {index < activeSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content - Modern Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold">
              {currentStepIndex + 1}
            </span>
            {stepInfo.title}
          </CardTitle>
          <CardDescription className="text-base">{stepInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  )
}
