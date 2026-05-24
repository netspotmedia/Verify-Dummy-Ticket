"use client"

import { useOrderStore } from "@/lib/order-store"
import { useSiteSettings } from "@/lib/site-settings"
import { cn } from "@/lib/utils"
import { Check, ShieldCheck, Clock, Star, MessageCircle } from "lucide-react"
import Link from "next/link"

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
  const { settings } = useSiteSettings()
  const whatsappNumber = (settings?.site_phone || "+2348001234567").replace(/\D/g, "")
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
      case "services": return <StepServices />
      case "common": return <StepCommon />
      case "flight": return <StepFlight />
      case "hotel": return <StepHotel />
      case "insurance": return <StepInsurance />
      case "review": return <StepReview />
      case "payment": return <StepPayment />
      default: return <StepServices />
    }
  }

  return (
    <div className="max-w-[560px] mx-auto space-y-4 font-outfit">
      {/* Social proof trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <strong>12,000+</strong> orders delivered
        </span>
        <span className="hidden h-3 w-px bg-slate-300 sm:block" />
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <Clock className="h-3 w-3 text-green-500" />
          Delivery within <strong>24 hrs</strong>
        </span>
        <span className="hidden h-3 w-px bg-slate-300 sm:block" />
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <ShieldCheck className="h-3 w-3 text-blue-500" />
          Visa-<strong>compliant</strong> documents
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Step {currentStepIndex + 1} of {activeSteps.length}</p>
          <h2 className="text-lg font-semibold text-slate-900 mt-0.5">{stepInfo.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{stepInfo.description}</p>
        </div>
      </div>

      <div className="h-1 w-full overflow-hidden rounded bg-slate-200">
        <div className="h-full rounded bg-[#c8143d] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
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
                "inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-1 text-xs font-medium transition-all",
                isCurrent && "bg-[#c8143d] text-white",
                !isCurrent && isComplete && "bg-[#c8143d]/10 text-[#c8143d]",
                !isCurrent && !isComplete && "bg-slate-100 text-slate-500 hover:bg-slate-200",
                !canNav && "cursor-not-allowed opacity-50"
              )}
            >
              {isComplete && !isCurrent ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className={cn("h-4 w-4 flex items-center justify-center rounded text-[10px]", isCurrent ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
                  {index + 1}
                </span>
              )}
              <span className="hidden sm:inline text-[11px]">{STEP_TITLES[step]?.title}</span>
            </button>
          )
        })}
      </div>

      {renderStep()}

      {/* WhatsApp help button */}
      <div className="flex items-center justify-center pt-1">
        <Link
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I need help with my order.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-medium text-green-800 hover:bg-green-100 transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Need help? Chat with us on WhatsApp
        </Link>
      </div>
    </div>
  )
}
