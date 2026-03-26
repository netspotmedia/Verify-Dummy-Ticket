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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Select Services
        </Label>
        <p className="text-sm text-slate-500">
          Choose one or more services for your visa application
        </p>
      </div>

      <div className="grid gap-3">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id)

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={cn(
                "group relative w-full overflow-hidden rounded-[26px] p-[1px] text-left transition-all",
                isSelected
                  ? "bg-gradient-to-r from-[#c8143d] via-[#d94a6d] to-[#efc5d0] shadow-[0_16px_30px_rgba(200,20,61,0.12)]"
                  : "bg-transparent"
              )}
            >
              <div
                className={cn(
                  "relative flex min-h-[118px] items-center gap-4 rounded-[25px] px-5 py-5 transition-all",
                  isSelected
                    ? "bg-white"
                    : "bg-[#e9edf5] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                )}
              >
                {service.badge && (
                  <span
                    className={cn(
                      "absolute left-5 top-4 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                      service.id === "flight"
                        ? "bg-[#fff2cc] text-[#a16207]"
                        : "bg-[#dcfce7] text-[#15803d]"
                    )}
                  >
                    {service.badge}
                  </span>
                )}

                <div
                  className={cn(
                    "mt-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all",
                    isSelected
                      ? "bg-[#c8143d] text-white"
                      : "bg-white text-[#64748b] shadow-sm"
                  )}
                >
                  <service.icon className="h-6 w-6" />
                </div>

                <div className="mt-4 min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {service.title}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                        {service.description}
                      </p>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                        Starting From
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-[#c8143d]">
                        ${service.startingFrom}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                    isSelected
                      ? "bg-[#c8143d] text-white"
                      : "border border-slate-300 bg-white text-transparent"
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={nextStep}
          disabled={selectedServices.length === 0}
          className="h-12 rounded-full bg-[#c90039] px-7 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(201,0,57,0.2)] hover:bg-[#b50033]"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}