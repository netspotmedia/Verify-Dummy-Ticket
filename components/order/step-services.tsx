"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { SERVICE_PRICES, type ServiceType, type Currency } from "@/lib/types"
import { Plane, Building2, Shield, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    id: "flight" as ServiceType,
    icon: Plane,
    title: "Flight Itinerary",
    description: "Verifiable flight reservation with valid PNR",
    priceUSD: SERVICE_PRICES.flight.USD,
    priceNGN: SERVICE_PRICES.flight.NGN,
  },
  {
    id: "hotel" as ServiceType,
    icon: Building2,
    title: "Hotel Booking",
    description: "Confirmed hotel reservation for any city",
    priceUSD: SERVICE_PRICES.hotel.USD,
    priceNGN: SERVICE_PRICES.hotel.NGN,
  },
  {
    id: "insurance" as ServiceType,
    icon: Shield,
    title: "Travel Insurance",
    description: "$35,000 coverage with 90 days validity",
    priceUSD: SERVICE_PRICES.insurance.USD,
    priceNGN: SERVICE_PRICES.insurance.NGN,
  },
]

export function StepServices() {
  const { formData, setServices, setCurrency, nextStep } = useOrderStore()
  const { services: selectedServices, currency } = formData

  const toggleService = (serviceId: ServiceType) => {
    if (selectedServices.includes(serviceId)) {
      setServices(selectedServices.filter((s) => s !== serviceId))
    } else {
      setServices([...selectedServices, serviceId])
    }
  }

  const formatPrice = (priceUSD: number, priceNGN: number) => {
    if (currency === "USD") return `$${priceUSD}`
    return `₦${priceNGN.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Currency Selection */}
      <div className="space-y-3">
        <Label>Select Currency</Label>
        <RadioGroup
          value={currency}
          onValueChange={(value) => setCurrency(value as Currency)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="USD" id="usd" />
            <Label htmlFor="usd" className="cursor-pointer">USD (PayPal)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NGN" id="ngn" />
            <Label htmlFor="ngn" className="cursor-pointer">NGN (Paystack)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Service Selection */}
      <div className="space-y-3">
        <Label>Select Services (choose one or more)</Label>
        <div className="grid gap-4">
          {services.map((service) => {
            const isSelected = selectedServices.includes(service.id)
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleService(service.id)}
                  className="mt-1"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{service.title}</h3>
                    <span className="font-semibold text-primary">
                      {formatPrice(service.priceUSD, service.priceNGN)}/person
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={nextStep}
          disabled={selectedServices.length === 0}
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
