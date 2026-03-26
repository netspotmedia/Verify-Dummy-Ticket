"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, Package, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliverySpeed } from "@/lib/types"

const DELIVERY_OPTIONS: { value: DeliverySpeed; title: string; description: string; price: number; icon: typeof Clock }[] = [
  {
    value: "normal",
    title: "24 Hours",
    description: "Standard delivery within 24 hours",
    price: 10,
    icon: Clock,
  },
  {
    value: "fast",
    title: "12 Hours",
    description: "Faster processing and delivery",
    price: 20,
    icon: Zap,
  },
  {
    value: "express",
    title: "8 Hours",
    description: "Priority express delivery",
    price: 30,
    icon: Zap,
  },
]

export function StepReview() {
  const { formData, setDeliverySpeed, nextStep, prevStep } = useOrderStore()
  const {
    services,
    travelerCount,
    email,
    customerCountry,
    customerCountryCode,
    travelers,
    flightDetails,
    hotelDetails,
    insuranceDetails,
    deliverySpeed,
  } = formData

  const getServiceBaseCost = (service: string) => {
    switch (service) {
      case "flight": {
        const tripTypePrice =
          flightDetails?.tripType === "one_way"
            ? 5
            : flightDetails?.tripType === "return_trip"
            ? 8
            : 15
        const validityPrice =
          flightDetails?.validity === "3d"
            ? 0
            : flightDetails?.validity === "7d"
            ? 5
            : flightDetails?.validity === "14d"
            ? 10
            : flightDetails?.validity === "21d"
            ? 15
            : 20
        return (tripTypePrice + validityPrice) * travelerCount
      }

      case "hotel":
        if (!hotelDetails?.type) return 0
        return hotelDetails.type === "separate_per_traveler"
          ? travelerCount * 5
          : 5 + Math.max(travelerCount - 1, 0) * 1

      case "insurance":
        if (!insuranceDetails?.area || !insuranceDetails?.duration) return 0
        const pricingTable = {
          schengen: { "21d": 20, "3m": 30, "6m": 40, "1y": 50 },
          worldwide_area_1: { "21d": 25, "3m": 35, "6m": 45, "1y": 55 },
          worldwide_area_2: { "21d": 28, "3m": 48, "6m": 65, "1y": 80 },
        } as const
        return (
          pricingTable[insuranceDetails.area][insuranceDetails.duration] * travelerCount
        )

      default:
        return 0
    }
  }

  const baseServiceCost = services.reduce(
    (sum, service) => sum + getServiceBaseCost(service),
    0
  )

  const deliveryCost =
    DELIVERY_OPTIONS.find((d) => d.value === deliverySpeed)?.price || 0

  const totalCost = baseServiceCost + deliveryCost

  const getServiceName = (service: string) => {
    switch (service) {
      case "flight":
        return "Flight Reservation"
      case "hotel":
        return "Hotel Confirmation"
      case "insurance":
        return "Travel Insurance"
      default:
        return service
    }
  }

  const getTravelerLabel = (index: number) => {
    if (index === 0) return "Primary Traveler"
    if (index === 1) return "Second Traveler"
    return `Traveler ${index + 1}`
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Selected Services
        </Label>

        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <div
              key={service}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#c8143d] ring-1 ring-[#f0ccd5]"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{getServiceName(service)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] bg-[#eef2fa] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
                Customer Details
              </Label>
              <p className="mt-1 text-sm text-slate-500">
                Review your contact and residency info
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-[24px] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Email</span>
              <span className="text-right text-sm font-medium text-slate-900">
                {email}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Country</span>
              <span className="text-right text-sm font-medium text-slate-900">
                {customerCountry}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Travelers</span>
              <span className="text-right text-sm font-medium text-slate-900">
                {travelerCount}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#eef2fa] p-5">
          <div className="mb-4">
            <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
              Travelers
            </Label>
            <p className="mt-1 text-sm text-slate-500">
              Confirm all passenger names
            </p>
          </div>

          <div className="space-y-3 rounded-[24px] bg-white p-4 shadow-sm">
            {travelers.map((traveler, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      index === 0
                        ? "bg-[#d61a47] text-white"
                        : "bg-[#dde5ef] text-slate-600"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-500">
                    {getTravelerLabel(index)}
                  </span>
                </div>

                <span className="text-right text-sm font-medium text-slate-900">
                  {traveler.title} {traveler.firstName} {traveler.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
            Delivery Speed
          </Label>
          <p className="mt-1 text-sm text-slate-500">
            Choose how quickly you want your documents delivered
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {DELIVERY_OPTIONS.map((option) => {
            const active = deliverySpeed === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setDeliverySpeed(option.value)}
                className={cn(
                  "group relative overflow-hidden rounded-[26px] p-[1px] text-left transition-all",
                  active
                    ? "bg-gradient-to-r from-[#c8143d] via-[#d94a6d] to-[#efc5d0] shadow-[0_16px_30px_rgba(200,20,61,0.12)]"
                    : "bg-transparent"
                )}
              >
                <div
                  className={cn(
                    "h-full rounded-[25px] px-5 py-5 transition-all",
                    active
                      ? "bg-white"
                      : "bg-[#e9edf5] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                  )}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl transition-all",
                        active
                          ? "bg-[#c8143d] text-white"
                          : "bg-white text-slate-500 shadow-sm"
                      )}
                    >
                      <option.icon className="h-5 w-5" />
                    </div>

                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        active
                          ? "bg-[#fff1f4] text-[#c8143d]"
                          : "bg-white text-slate-600"
                      )}
                    >
                      +${option.price}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">
                    {option.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {customerCountryCode === "NG" && (
        <section className="rounded-[24px] border border-[#bfd7ff] bg-[#eef5ff] p-4 text-[#19407a]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white">
              <Clock className="h-4 w-4 text-[#2563eb]" />
            </div>
            <div>
              <p className="font-semibold">Nigeria Delivery Notice</p>
              <p className="mt-1 text-sm">
                Delivery timelines apply to document processing and email dispatch.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[30px] bg-[#eef2fa] p-5">
        <div className="mb-4">
          <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
            Order Summary
          </Label>
        </div>

        <div className="rounded-[24px] bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Base Services</span>
              <span className="text-sm font-medium text-slate-900">
                ${baseServiceCost}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Delivery</span>
              <span className="text-sm font-medium text-slate-900">
                ${deliveryCost}
              </span>
            </div>

            <div className="h-px bg-slate-200" />

            <div className="flex items-start justify-between gap-4">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-semibold text-[#c8143d]">
                ${totalCost}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-10 px-4 rounded-lg">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!deliverySpeed} className="flex-1 h-10 rounded-lg bg-[#c8143d] hover:bg-[#b01030] font-medium">
          Continue to Payment
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}