"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { ServiceType } from "@/lib/types"
import { Plane, Building2, Shield, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const services = [
  {
    id: "flight" as ServiceType,
    icon: Plane,
    title: "Flight Reservation",
    description: "Temporary flight booking for visa applications. Valid PNR confirmed.",
    startingFrom: 5,
    badge: "Most Popular",
  },
  {
    id: "hotel" as ServiceType,
    icon: Building2,
    title: "Hotel Confirmation",
    description: "Proof of accommodation for visa submission. Verifiable booking.",
    startingFrom: 5,
    badge: null,
  },
  {
    id: "insurance" as ServiceType,
    icon: Shield,
    title: "Travel Insurance",
    description: "Visa-compliant travel medical insurance. $35,000 coverage.",
    startingFrom: 20,
    badge: "Required",
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
    <div className="space-y-5">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Select Services
        </Label>
        <p className="text-sm text-slate-600">
          Choose one or more services for your visa application
        </p>
      </div>

      <div className="space-y-2">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id)

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={cn(
                "w-full flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all",
                isSelected
                  ? "ring-2 ring-[#c8143d]/20 bg-[#c8143d]/5"
                  : "bg-slate-50 hover:bg-slate-100"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  isSelected
                    ? "bg-[#c8143d] text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                <service.icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {service.title}
                  </h3>
                  {service.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        service.id === "flight"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {service.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">From</p>
                <p className="text-lg font-semibold text-[#c8143d]">
                  ${service.startingFrom}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="pt-2">
        <Button onClick={nextStep} className="w-full h-11 rounded-xl bg-[#c8143d] hover:bg-[#b01030] font-medium text-white">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}