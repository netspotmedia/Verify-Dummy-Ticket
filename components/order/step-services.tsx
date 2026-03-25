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
  },
  {
    id: "hotel" as ServiceType,
    icon: Building2,
    title: "Hotel Confirmation",
    description: "Proof of accommodation for visa submission. Verifiable booking.",
    startingFrom: 5,
  },
  {
    id: "insurance" as ServiceType,
    icon: Shield,
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
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Select Services (choose one or more)</Label>
        <p className="text-sm text-muted-foreground">
          You can select any combination of services. Prices are per traveler.
        </p>
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{service.title}</h3>
                    <span className="font-semibold text-primary">
                      From ${service.startingFrom}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
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
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
