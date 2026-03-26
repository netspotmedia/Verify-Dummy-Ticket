"use client"

import { useOrderStore } from "@/lib/order-store"
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
        return !!(
          formData.flightDetails?.tripType &&
          formData.flightDetails?.flightDetails &&
          formData.flightDetails?.validity
        )
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
      <div className="space-y-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ead8dd]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#b4002f] via-[#d0003a] to-[#e85d7d] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a27f88]">
              Step {currentStepIndex + 1} of {activeSteps.length}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {stepInfo.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{stepInfo.description}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {activeSteps.map((step, index) => {
          const isComplete = isStepComplete(step)
          const isCurrent = currentStepIndex === index
          const canNav = canNavigateToStep(index)

          return (
            <button
              key={step}
              onClick={() => canNav && goToStep(index)}
              disabled={!canNav}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all",
                isCurrent && "bg-[#c8143d] text-white shadow-[0_10px_24px_rgba(200,20,61,0.18)]",
                !isCurrent &&
                  isComplete &&
                  "bg-white text-[#c8143d] ring-1 ring-[#f0ccd5] hover:bg-[#fff7f9]",
                !isCurrent &&
                  !isComplete &&
                  "bg-[#eef2fa] text-slate-500 hover:bg-[#e8edf7]",
                !canNav && "cursor-not-allowed opacity-50"
              )}
            >
              {isComplete && !isCurrent ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c8143d] text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : (
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    isCurrent ? "bg-white/20 text-white" : "bg-white/70 text-slate-600"
                  )}
                >
                  {index + 1}
                </span>
              )}
              <span>{STEP_TITLES[step]?.title || step}</span>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-[30px] bg-[#f7f5f4] p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)] ring-1 ring-black/5 sm:p-6">
        <div className="mb-5 h-1 w-full rounded-full bg-gradient-to-r from-[#b4002f] via-[#d0003a] to-[#f2c7d1]" />

        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#c8143d] shadow-sm">
            {currentStepIndex + 1}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">{stepInfo.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{stepInfo.description}</p>
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  )
}