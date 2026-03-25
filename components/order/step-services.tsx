"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { ServiceType } from "@/lib/types"
import { Plane, Building2, Shield, ArrowRight } from "lucide-react"
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Select Services</Label>
          <p className="text-sm text-muted-foreground">
            Choose one or more services for your visa application
          </p>
        </div>
        
        <div className="grid gap-4">
          {services.map((service) => {
            const isSelected = selectedServices.includes(service.id)
            return (
              <div
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border/50 hover:border-primary/30 hover:shadow-md"
                )}
              >
                {/* Selection indicator */}
                <div className={cn(
                  "absolute top-4 right-4 flex items-center justify-center rounded-full border-2 transition-all duration-200",
                  isSelected
                    ? "h-6 w-6 bg-primary border-primary"
                    : "h-6 w-6 border-muted-foreground/30"
                )}>
                  {isSelected && (
                    <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Badge */}
                {service.badge && (
                  <div className={cn(
                    "absolute top-4 left-4 px-2 py-0.5 rounded-full text-xs font-medium",
                    service.id === "flight" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {service.badge}
                  </div>
                )}

                <div className="flex items-start gap-5">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-primary/10"
                  )}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-2">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      <span className="text-lg font-bold text-primary shrink-0">
                        From ${service.startingFrom}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={nextStep}
          disabled={selectedServices.length === 0}
          size="lg"
          className="gap-2 rounded-xl px-8"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
