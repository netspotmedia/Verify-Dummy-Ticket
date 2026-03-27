"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { ServiceType } from "@/lib/types"
import { ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    id: "flight" as ServiceType,
    title: "Flight Reservation",
    description: "Temporary flight booking for visa applications. Valid PNR confirmed.",
    startingFrom: 5,
  },
  {
    id: "hotel" as ServiceType,
    title: "Hotel Confirmation",
    description: "Proof of accommodation for visa submission. Verifiable booking.",
    startingFrom: 5,
  },
  {
    id: "insurance" as ServiceType,
    title: "Travel Insurance",
    description: "Visa-compliant travel medical insurance. $35,000 coverage.",
    startingFrom: 20,
  },
]

export function StepServices() {
  const { formData, setServices, nextStep } = useOrderStore()
  const { services: selectedServices } = formData

  const toggleService = (serviceId: ServiceType) => {
    if (selectedServices.includes(serviceId)) {
      setServices(selectedServices.filter((s) => s !== serviceId))
    } else {
      setServices([...selectedServices, serviceId])
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Select Services
        </Label>
        <p className="text-xs text-slate-500">
          Choose one or more services for your visa application
        </p>
      </div>

      <div className="space-y-2">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id)

          return (
            <label
              key={service.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded cursor-pointer transition-all border",
                isSelected
                  ? "border-[#c8143d] bg-[#fff7f9]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                  isSelected
                    ? "bg-[#c8143d] border-[#c8143d]"
                    : "border-slate-300"
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleService(service.id)}
                className="sr-only"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900">
                    {service.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {service.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">From</p>
                <p className={cn("font-semibold", isSelected ? "text-[#c8143d]" : "text-slate-700")}>
                  ${service.startingFrom}
                </p>
              </div>
            </label>
          )
        })}
      </div>

      <div className="pt-2">
        <Button 
          onClick={nextStep} 
          disabled={selectedServices.length === 0}
          className="w-full h-10 rounded bg-[#c8143d] hover:bg-[#b01030] font-medium text-white"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
