"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliverySpeed } from "@/lib/types"

const DELIVERY_OPTIONS: { value: DeliverySpeed; title: string; description: string; price: number }[] = [
  { value: "normal", title: "24 Hours", description: "Standard delivery", price: 10 },
  { value: "fast", title: "12 Hours", description: "Faster processing", price: 20 },
  { value: "express", title: "8 Hours", description: "Priority express", price: 30 },
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
    <div className="space-y-3 font-outfit">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">Services</Label>
        <div className="flex flex-wrap gap-1.5">
          {services.map((service) => (
            <span key={service} className="inline-flex items-center gap-1 rounded bg-[#c8143d]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#c8143d]">
              {getServiceName(service)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="p-2 border border-slate-200 rounded">
          <p className="text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">Contact</p>
          <div className="space-y-0.5">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Email</span><span className="font-medium text-slate-700 truncate ml-2">{email}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Country</span><span className="font-medium text-slate-700">{customerCountry}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Travelers</span><span className="font-medium text-slate-700">{travelerCount}</span></div>
          </div>
        </div>
        <div className="p-2 border border-slate-200 rounded">
          <p className="text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">Passengers</p>
          <div className="space-y-0.5">
            {travelers.slice(0, 3).map((traveler, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-slate-500">{getTravelerLabel(index)}</span>
                <span className="font-medium text-slate-700">{traveler.firstName} {traveler.lastName}</span>
              </div>
            ))}
            {travelers.length > 3 && <p className="text-[10px] text-slate-400">+{travelers.length - 3} more</p>}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-slate-500">Delivery Speed</Label>
        <div className="flex gap-1">
          {DELIVERY_OPTIONS.map((option) => {
            const active = deliverySpeed === option.value
            return (
              <label
                key={option.value}
                className={cn(
                  "flex-1 py-2 px-2 rounded text-center text-xs font-medium transition-all cursor-pointer border",
                  active ? "border-[#c8143d] bg-[#fff7f9] text-[#c8143d]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <input
                  type="radio"
                  name="deliverySpeed"
                  checked={active}
                  onChange={() => setDeliverySpeed(option.value)}
                  className="sr-only"
                />
                <div className="font-medium">{option.title}</div>
                <div className="text-[10px] opacity-70">+${option.price}</div>
              </label>
            )
          })}
        </div>
      </div>

      {customerCountryCode === "NG" && (
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Clock className="h-3 w-3" />Delivery timelines apply to document processing.
        </div>
      )}

      <div className="p-2 border border-slate-200 rounded">
        <div className="flex justify-between text-xs"><span className="text-slate-500">Services</span><span className="font-medium text-slate-700">${baseServiceCost}</span></div>
        <div className="flex justify-between text-xs"><span className="text-slate-500">Delivery</span><span className="font-medium text-slate-700">${deliveryCost}</span></div>
        <div className="border-t border-slate-200 mt-1 pt-1 flex justify-between">
          <span className="text-sm font-medium text-slate-900">Total</span>
          <span className="text-base font-semibold text-[#c8143d]">${totalCost}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs"><ArrowLeft className="mr-1 h-3 w-3" />Back</Button>
        <Button onClick={nextStep} disabled={!deliverySpeed} className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] text-xs font-medium">Continue<ArrowRight className="ml-1 h-3 w-3" /></Button>
      </div>
    </div>
  )
}
