"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliverySpeed } from "@/lib/types"

const DELIVERY_OPTIONS: { value: DeliverySpeed; title: string; description: string; price: number; icon: typeof Clock }[] = [
  { value: "normal", title: "24 Hours", description: "Standard delivery", price: 10, icon: Clock },
  { value: "fast", title: "12 Hours", description: "Faster processing", price: 20, icon: Zap },
  { value: "express", title: "8 Hours", description: "Priority express", price: 30, icon: Zap },
]

export function StepReview() {
  const { formData, setDeliverySpeed, nextStep, prevStep } = useOrderStore()
  const { services, travelerCount, email, customerCountry, customerCountryCode, travelers, flightDetails, hotelDetails, insuranceDetails, deliverySpeed } = formData

  const getServiceBaseCost = (service: string) => {
    switch (service) {
      case "flight": {
        const tripTypePrice = flightDetails?.tripType === "one_way" ? 5 : flightDetails?.tripType === "return_trip" ? 8 : 15
        const validityPrice = flightDetails?.validity === "3d" ? 0 : flightDetails?.validity === "7d" ? 5 : flightDetails?.validity === "14d" ? 10 : flightDetails?.validity === "21d" ? 15 : 20
        return (tripTypePrice + validityPrice) * travelerCount
      }
      case "hotel": return hotelDetails?.type === "separate_per_traveler" ? travelerCount * 5 : 5 + Math.max(travelerCount - 1, 0) * 1
      case "insurance": {
        const pricingTable = { schengen: { "21d": 20, "3m": 30, "6m": 40, "1y": 50 }, worldwide_area_1: { "21d": 25, "3m": 35, "6m": 45, "1y": 55 }, worldwide_area_2: { "21d": 28, "3m": 48, "6m": 65, "1y": 80 } } as const
        return insuranceDetails?.area && insuranceDetails?.duration ? pricingTable[insuranceDetails.area][insuranceDetails.duration] * travelerCount : 0
      }
      default: return 0
    }
  }

  const baseServiceCost = services.reduce((sum, service) => sum + getServiceBaseCost(service), 0)
  const deliveryCost = DELIVERY_OPTIONS.find((d) => d.value === deliverySpeed)?.price || 0
  const totalCost = baseServiceCost + deliveryCost

  const getServiceName = (service: string) => ({ flight: "Flight", hotel: "Hotel", insurance: "Insurance" }[service] || service)
  const getTravelerLabel = (index: number) => index === 0 ? "Primary" : index === 1 ? "Traveler 2" : `Traveler ${index + 1}`

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">Services</Label>
        <div className="flex flex-wrap gap-1.5">
          {services.map((service) => (
            <span key={service} className="inline-flex items-center gap-1 rounded-md bg-[#c8143d]/10 px-2 py-1 text-xs font-medium text-[#c8143d]">
              <CheckCircle2 className="h-3 w-3" />{getServiceName(service)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Contact</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Email</span><span className="font-medium text-slate-700">{email}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Country</span><span className="font-medium text-slate-700">{customerCountry}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Travelers</span><span className="font-medium text-slate-700">{travelerCount}</span></div>
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500 mb-2">Passengers</p>
          <div className="space-y-1">
            {travelers.slice(0, 3).map((traveler, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-slate-500">{getTravelerLabel(index)}</span>
                <span className="font-medium text-slate-700">{traveler.firstName} {traveler.lastName}</span>
              </div>
            ))}
            {travelers.length > 3 && <p className="text-xs text-slate-400">+{travelers.length - 3} more</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-500">Delivery Speed</Label>
        <div className="flex gap-2">
          {DELIVERY_OPTIONS.map((option) => {
            const active = deliverySpeed === option.value
            return (
              <button key={option.value} type="button" onClick={() => setDeliverySpeed(option.value)}
                className={cn("flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all", active ? "bg-[#c8143d]/10 text-[#c8143d] ring-1 ring-[#c8143d]/30" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                {option.title} <span className="text-xs opacity-70">+${option.price}</span>
              </button>
            )
          })}
        </div>
      </div>

      {customerCountryCode === "NG" && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <Clock className="h-3.5 w-3.5" />Delivery timelines apply to document processing.
        </div>
      )}

      <div className="rounded-lg bg-slate-50 p-3">
        <div className="flex justify-between text-sm"><span className="text-slate-500">Services</span><span className="font-medium text-slate-700">${baseServiceCost}</span></div>
        <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery</span><span className="font-medium text-slate-700">${deliveryCost}</span></div>
        <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between"><span className="font-medium text-slate-900">Total</span><span className="text-lg font-semibold text-[#c8143d]">${totalCost}</span></div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3.5 rounded-lg text-sm"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back</Button>
        <Button onClick={nextStep} disabled={!deliverySpeed} className="flex-1 h-9 rounded-lg bg-[#c8143d] hover:bg-[#b01030] text-sm font-medium">Continue<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
      </div>
    </div>
  )
}