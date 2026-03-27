"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title, ServiceType } from "@/lib/types"

const SERVICES: { value: ServiceType; label: string; price: string }[] = [
  { value: "flight", label: "Flight", price: "$5+" },
  { value: "hotel", label: "Hotel", price: "$5+" },
  { value: "insurance", label: "Insurance", price: "$20+" },
]

const TITLES: { value: Title; label: string }[] = [
  { value: "Mr", label: "Mr." },
  { value: "Mrs", label: "Mrs." },
  { value: "Master", label: "Master" },
  { value: "Miss", label: "Miss" },
]

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "UAE" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
]

export function OrderQuickForm() {
  const router = useRouter()
  const { setServices, setCustomerInfo, syncTravelers, updateTraveler } =
    useOrderStore()

  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(["flight"])
  const [travelerCount, setTravelerCount] = useState(1)
  const [travelers, setTravelers] = useState([
    { title: "Mr" as Title, firstName: "", lastName: "" },
  ])
  const [email, setEmail] = useState("")
  const [customerCountryCode, setCustomerCountryCode] = useState("")
  const [customerCountry, setCustomerCountry] = useState("")

  const toggleService = (service: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.length > 1
          ? prev.filter((s) => s !== service)
          : prev
        : [...prev, service]
    )
  }

  const handleTravelerCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(5, travelerCount + delta))
    setTravelerCount(newCount)

    const newTravelers = [...travelers]
    while (newTravelers.length < newCount) {
      newTravelers.push({
        title: "Mr" as Title,
        firstName: "",
        lastName: "",
      })
    }
    setTravelers(newTravelers.slice(0, newCount))
  }

  const handleTravelerChange = (
    index: number,
    field: keyof (typeof travelers)[0],
    value: string
  ) => {
    const newTravelers = [...travelers]
    newTravelers[index] = { ...newTravelers[index], [field]: value }
    setTravelers(newTravelers)
  }

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code)
    setCustomerCountryCode(code)
    setCustomerCountry(country?.name || "")
  }

  const isValid = () => {
    if (selectedServices.length === 0) return false
    if (!email || !email.includes("@")) return false
    if (!customerCountryCode) return false
    if (travelers.some((t) => !t.firstName || !t.lastName)) return false
    return true
  }

  const handleSubmit = () => {
    setServices(selectedServices)
    setCustomerInfo({
      travelerCount,
      email,
      customerCountry,
      customerCountryCode,
    })
    syncTravelers(travelerCount)
    travelers.forEach((traveler, index) => updateTraveler(index, traveler))
    router.push("/order")
  }

  return (
    <div className="w-full rounded-md border border-slate-200 bg-white shadow-sm font-outfit">
      <div className="border-b-4 border-[#c8143d] px-4 py-4">
        <h3 className="text-base font-semibold text-slate-900">Quick Order</h3>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
            Select Services
          </Label>

          <div className="grid grid-cols-3 gap-2">
            {SERVICES.map((service) => {
              const active = selectedServices.includes(service.value)

              return (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => toggleService(service.value)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-center transition-colors",
                    active
                      ? "border-[#c8143d] bg-[#fff7f8] text-[#c8143d]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  )}
                >
                  <div className="text-xs font-medium">{service.label}</div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {service.price}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              Email
            </Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border-slate-300 bg-white text-sm font-normal"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
              Country
            </Label>
            <Select value={customerCountryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-10 rounded-md border-slate-300 bg-white text-sm font-normal">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-slate-800">Number of Travelers</p>
            <p className="text-xs text-slate-500">Add up to 5 passengers</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTravelerCountChange(-1)}
              disabled={travelerCount <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <span className="text-base leading-none">−</span>
            </button>

            <span className="min-w-[28px] text-center text-base font-semibold text-slate-900">
              {travelerCount}
            </span>

            <button
              type="button"
              onClick={() => handleTravelerCountChange(1)}
              disabled={travelerCount >= 5}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[#c8143d] text-white hover:bg-[#b01030] disabled:opacity-40"
            >
              <span className="text-base leading-none">+</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
            Passenger Details
          </Label>

          {travelers.map((traveler, index) => (
            <div key={index} className="space-y-1.5 border-t border-slate-100 pt-2 first:border-t-0 first:pt-0">
              <div className="text-[11px] font-medium text-slate-500">
                {index === 0 ? "Primary Passenger" : `Passenger ${index + 1}`}
              </div>

              <div className="grid gap-2 sm:grid-cols-[72px_1fr_1fr]">
                <Select
                  value={traveler.title}
                  onValueChange={(value) =>
                    handleTravelerChange(index, "title", value)
                  }
                >
                  <SelectTrigger className="h-9 rounded-md border-slate-300 bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TITLES.map((title) => (
                      <SelectItem key={title.value} value={title.value}>
                        {title.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="First name"
                  value={traveler.firstName}
                  onChange={(e) =>
                    handleTravelerChange(index, "firstName", e.target.value)
                  }
                  className="h-9 rounded-md border-slate-300 bg-white text-sm"
                />

                <Input
                  placeholder="Last name"
                  value={traveler.lastName}
                  onChange={(e) =>
                    handleTravelerChange(index, "lastName", e.target.value)
                  }
                  className="h-9 rounded-md border-slate-300 bg-white text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-400">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

        <Button
          onClick={handleSubmit}
          disabled={!isValid()}
          className="h-10 w-full rounded-md bg-[#c8143d] text-sm font-semibold text-white hover:bg-[#b01030]"
        >
          Continue to Order
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
