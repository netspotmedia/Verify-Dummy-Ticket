"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plane, Hotel, Shield, Minus, Plus, Mail, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title, ServiceType } from "@/lib/types"

const SERVICES: { value: ServiceType; label: string; icon: typeof Plane }[] = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "insurance", label: "Insurance", icon: Shield },
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
  { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "CH", name: "Switzerland" },
  { code: "IE", name: "Ireland" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "EG", name: "Egypt" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "TR", name: "Turkey" },
  { code: "RU", name: "Russia" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
]

export function OrderQuickForm() {
  const router = useRouter()
  const { setServices, setCustomerInfo, syncTravelers, updateTraveler } = useOrderStore()

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
      newTravelers.push({ title: "Mr" as Title, firstName: "", lastName: "" })
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
    if (travelerCount < 1) return false
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
    travelers.forEach((traveler, index) => {
      updateTraveler(index, traveler)
    })

    router.push("/order")
  }

  return (
    <div className="rounded-[32px] bg-[#f7f5f4] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-6">
      <div className="mb-6 h-1 w-full rounded-full bg-gradient-to-r from-[#b4002f] via-[#d0003a] to-[#f2c7d1]" />

      <div className="space-y-6">
        <section className="space-y-3">
          <Label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#5d4d4f]">
            Select Services
          </Label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SERVICES.map((service) => {
              const active = selectedServices.includes(service.value)

              return (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => toggleService(service.value)}
                  className={cn(
                    "flex h-[52px] items-center justify-center gap-2 rounded-full border bg-[#e9edf5] px-4 text-sm font-semibold transition-all",
                    active
                      ? "border-[#c8143d] bg-white text-[#c8143d] shadow-[inset_0_0_0_1px_#c8143d]"
                      : "border-transparent text-[#4f5b70] hover:bg-white"
                  )}
                >
                  <service.icon className="h-4 w-4" />
                  <span>{service.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5d4d4f]">
              Contact Email
            </Label>
            <div className="relative">
              <Input
                type="email"
                placeholder="traveller@voyager.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[52px] rounded-full border-0 bg-[#e9edf5] pl-5 pr-12 text-[15px] text-slate-700 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c8143d]"
              />
              <Mail className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5d4d4f]">
              Country of Residence
            </Label>
            <Select value={customerCountryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-[52px] rounded-full border-0 bg-[#e9edf5] px-5 text-[15px] text-slate-700 focus:ring-2 focus:ring-[#c8143d]">
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
        </section>

        <section className="rounded-[30px] bg-[#e9edf5] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-[26px] font-semibold leading-none text-slate-900 sm:text-[20px]">
                Number of Travelers
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Add up to 5 passengers per quick order
              </p>
            </div>

            <div className="inline-flex items-center self-start rounded-full bg-white p-1 shadow-sm sm:self-auto">
              <button
                type="button"
                onClick={() => handleTravelerCountChange(-1)}
                disabled={travelerCount <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#c8143d] disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>

              <div className="min-w-[64px] text-center text-[28px] font-semibold tracking-[0.08em] text-slate-900 sm:text-[24px]">
                {String(travelerCount).padStart(2, "0")}
              </div>

              <button
                type="button"
                onClick={() => handleTravelerCountChange(1)}
                disabled={travelerCount >= 5}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8143d] text-white shadow-md disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#ead8dd]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
              Traveler Information
            </span>
            <div className="h-px flex-1 bg-[#ead8dd]" />
          </div>

          <div className="space-y-5">
            {travelers.map((traveler, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      index === 0
                        ? "bg-[#d61a47] text-white"
                        : "bg-[#dde5ef] text-slate-600"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {index === 0
                      ? "Primary Traveler"
                      : index === 1
                        ? "Second Traveler"
                        : `Traveler ${index + 1}`}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-[88px_1fr_1fr]">
                  <Select
                    value={traveler.title}
                    onValueChange={(value) =>
                      handleTravelerChange(index, "title", value)
                    }
                  >
                    <SelectTrigger className="h-[44px] rounded-full border-0 bg-[#e9edf5] px-4 text-sm focus:ring-2 focus:ring-[#c8143d]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TITLES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="First Name"
                    value={traveler.firstName}
                    onChange={(e) =>
                      handleTravelerChange(index, "firstName", e.target.value)
                    }
                    className="h-[44px] rounded-full border-0 bg-[#e9edf5] px-5 text-sm placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#c8143d]"
                  />

                  <Input
                    placeholder="Last Name"
                    value={traveler.lastName}
                    onChange={(e) =>
                      handleTravelerChange(index, "lastName", e.target.value)
                    }
                    className="h-[44px] rounded-full border-0 bg-[#e9edf5] px-5 text-sm placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#c8143d]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!isValid()}
            className="h-[56px] w-full rounded-full bg-[#c90039] text-base font-semibold text-white shadow-[0_16px_30px_rgba(201,0,57,0.22)] hover:bg-[#b50033]"
          >
            <span>Continue to Order</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-center text-[12px] text-slate-500">
            By continuing, you agree to our Travel Terms & Conditions and Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  )
}
