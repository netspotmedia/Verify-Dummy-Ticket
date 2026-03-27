"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Clock, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliverySpeed, Currency } from "@/lib/types"
import { USD_TO_NGN_RATE } from "@/lib/types"

const DELIVERY_OPTIONS: { value: DeliverySpeed; title: string; description: string; price: number }[] = [
  { value: "normal", title: "24 Hours", description: "Standard delivery", price: 10 },
  { value: "fast", title: "12 Hours", description: "Faster processing", price: 20 },
  { value: "express", title: "8 Hours", description: "Priority express", price: 30 },
]

const formatPrice = (amount: number, currency: Currency) => {
  if (currency === "NGN") {
    return `₦${Math.round(amount * USD_TO_NGN_RATE).toLocaleString()}`
  }
  return `$${amount.toFixed(2)}`
}

export function StepReview() {
  const { formData, setDeliverySpeed, nextStep, prevStep, isNigeria, ipCountry } = useOrderStore()
  const { services, travelerCount, email, customerCountry, customerCountryCode, travelers, flightDetails, hotelDetails, insuranceDetails, deliverySpeed, currency } = formData

  const getFlightCostPerPerson = () => {
    const tripTypePrice = flightDetails?.tripType === "one_way" ? 5 : flightDetails?.tripType === "return_trip" ? 8 : 15
    const validityPrice = flightDetails?.validity === "3d" ? 0 : flightDetails?.validity === "7d" ? 5 : flightDetails?.validity === "14d" ? 10 : flightDetails?.validity === "21d" ? 15 : 20
    return tripTypePrice + validityPrice
  }

  const getHotelCostPerPerson = () => {
    if (hotelDetails?.type === "separate_per_traveler") return 5
    return 5 + Math.max(travelerCount - 1, 0) * 1
  }

  const getInsuranceCostPerPerson = () => {
    const pricingTable = { schengen: { "21d": 20, "3m": 30, "6m": 40, "1y": 50 }, worldwide_area_1: { "21d": 25, "3m": 35, "6m": 45, "1y": 55 }, worldwide_area_2: { "21d": 28, "3m": 48, "6m": 65, "1y": 80 } } as const
    return insuranceDetails?.area && insuranceDetails?.duration ? pricingTable[insuranceDetails.area][insuranceDetails.duration] : 0
  }

  const deliveryCost = DELIVERY_OPTIONS.find((d) => d.value === deliverySpeed)?.price || 0
  const totalCost = (
    (services.includes("flight") ? getFlightCostPerPerson() * travelerCount : 0) +
    (services.includes("hotel") ? getHotelCostPerPerson() : 0) +
    (services.includes("insurance") ? getInsuranceCostPerPerson() * travelerCount : 0) +
    deliveryCost
  )

  const getServiceName = (service: string) => ({ flight: "Flight", hotel: "Hotel", insurance: "Insurance" }[service] || service)
  const getTravelerLabel = (index: number) => index === 0 ? "Primary" : index === 1 ? "Traveler 2" : `Traveler ${index + 1}`

  const orderItems = [
    ...(services.includes("flight") ? [{
      item: `Flight`,
      pricePerPerson: getFlightCostPerPerson(),
      qty: travelerCount,
      total: getFlightCostPerPerson() * travelerCount
    }] : []),
    ...(services.includes("hotel") ? [{
      item: "Hotel",
      pricePerPerson: getHotelCostPerPerson(),
      qty: 1,
      total: getHotelCostPerPerson()
    }] : []),
    ...(services.includes("insurance") ? [{
      item: "Insurance",
      pricePerPerson: getInsuranceCostPerPerson(),
      qty: travelerCount,
      total: getInsuranceCostPerPerson() * travelerCount
    }] : []),
  ]

  return (
    <div className="space-y-3 font-outfit">
      <div className="space-y-1">
        <Label className="text-sm font-medium uppercase tracking-wider text-black">Services</Label>
        <div className="flex flex-wrap gap-1.5">
          {services.map((service) => (
            <span key={service} className="inline-flex items-center gap-1 rounded bg-[#c8143d]/10 px-1.5 py-0.5 text-sm font-medium text-[#c8143d]">
              {getServiceName(service)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="p-2 border border-slate-200 rounded">
          <p className="text-sm font-medium text-black mb-1 uppercase tracking-wider">Contact</p>
          <div className="space-y-0.5">
            <div className="flex justify-between text-sm"><span className="text-black">Email</span><span className="font-medium text-black truncate ml-2">{email}</span></div>
            <div className="flex justify-between text-sm"><span className="text-black">Country</span><span className="font-medium text-black">{customerCountry}</span></div>
            <div className="flex justify-between text-sm"><span className="text-black">Travelers</span><span className="font-medium text-black">{travelerCount}</span></div>
          </div>
        </div>
        <div className="p-2 border border-slate-200 rounded">
          <p className="text-sm font-medium text-black mb-1 uppercase tracking-wider">Passengers</p>
          <div className="space-y-0.5">
            {travelers.slice(0, 3).map((traveler, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-black">{getTravelerLabel(index)}</span>
                <span className="font-medium text-black">{traveler.firstName} {traveler.lastName}</span>
              </div>
            ))}
            {travelers.length > 3 && <p className="text-sm text-slate-400">+{travelers.length - 3} more</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
        <Globe className="h-4 w-4" />
        <span>Detected location: {ipCountry || "Detecting..."} - Prices shown in {currency === "NGN" ? "Naira (₦)" : "USD ($)"}</span>
      </div>

      <div className="space-y-1">
        <Label className="text-sm font-medium text-black">Delivery Speed</Label>
        <div className="flex gap-1">
          {DELIVERY_OPTIONS.map((option) => {
            const active = deliverySpeed === option.value
            return (
              <label
                key={option.value}
                className={cn(
                  "flex-1 py-2 px-2 rounded text-center text-sm font-medium transition-all cursor-pointer border",
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
                <div className="text-sm opacity-70">+{formatPrice(option.price, currency)}</div>
              </label>
            )
          })}
        </div>
      </div>

      {customerCountryCode === "NG" && (
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Clock className="h-3 w-3" />Delivery timelines apply to document processing.
        </div>
      )}

      <div className="border border-slate-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2 px-3 font-semibold text-black">Item</th>
              <th className="text-right py-2 px-3 font-semibold text-black">Price</th>
              <th className="text-right py-2 px-3 font-semibold text-black">Qty</th>
              <th className="text-right py-2 px-3 font-semibold text-black">Total</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {orderItems.map((row, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-0">
                <td className="py-2 px-3">
                  {row.item}
                  {row.qty > 1 && <span className="text-slate-500 text-xs ml-1">({formatPrice(row.pricePerPerson, currency)}/person)</span>}
                </td>
                <td className="text-right py-2 px-3">{formatPrice(row.pricePerPerson, currency)}</td>
                <td className="text-right py-2 px-3">{row.qty}</td>
                <td className="text-right py-2 px-3 font-medium">{formatPrice(row.total, currency)}</td>
              </tr>
            ))}
            <tr className="border-t border-slate-200">
              <td className="py-2 px-3 font-medium">Delivery ({DELIVERY_OPTIONS.find(d => d.value === deliverySpeed)?.title})</td>
              <td className="text-right py-2 px-3">{formatPrice(deliveryCost, currency)}</td>
              <td className="text-right py-2 px-3">1</td>
              <td className="text-right py-2 px-3 font-medium">{formatPrice(deliveryCost, currency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-[#c8143d]/5 border-t border-[#c8143d]/20">
              <td colSpan={3} className="py-2 px-3 font-semibold text-black">Total</td>
              <td className="text-right py-2 px-3 font-bold text-[#c8143d]">{formatPrice(totalCost, currency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs"><ArrowLeft className="mr-1 h-3 w-3" />Back</Button>
        <Button onClick={nextStep} disabled={!deliverySpeed} className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] text-xs font-medium">Continue<ArrowRight className="ml-1 h-3 w-3" /></Button>
      </div>
    </div>
  )
}
