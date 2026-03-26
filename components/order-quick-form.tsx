"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plane, Hotel, Shield, Minus, Plus, ChevronRight, Info } from "lucide-react"
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
  { code: "NG", name: "Nigeria" }, { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" }, { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" }, { code: "NL", name: "Netherlands" }, { code: "BE", name: "Belgium" },
  { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" }, { code: "AE", name: "UAE" },
  { code: "ZA", name: "South Africa" }, { code: "KE", name: "Kenya" }, { code: "GH", name: "Ghana" },
  { code: "IN", name: "India" }, { code: "CN", name: "China" }, { code: "JP", name: "Japan" },
]

export function OrderQuickForm() {
  const router = useRouter()
  const { setServices, setCustomerInfo, syncTravelers, updateTraveler } = useOrderStore()

  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(["flight"])
  const [travelerCount, setTravelerCount] = useState(1)
  const [travelers, setTravelers] = useState([{ title: "Mr" as Title, firstName: "", lastName: "" }])
  const [email, setEmail] = useState("")
  const [customerCountryCode, setCustomerCountryCode] = useState("")
  const [customerCountry, setCustomerCountry] = useState("")

  const toggleService = (service: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.length > 1 ? prev.filter((s) => s !== service) : prev
        : [...prev, service]
    )
  }

  const handleTravelerCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(5, travelerCount + delta))
    setTravelerCount(newCount)
    const newTravelers = [...travelers]
    while (newTravelers.length < newCount) newTravelers.push({ title: "Mr" as Title, firstName: "", lastName: "" })
    setTravelers(newTravelers.slice(0, newCount))
  }

  const handleTravelerChange = (index: number, field: keyof typeof travelers[0], value: string) => {
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
    setCustomerInfo({ travelerCount, email, customerCountry, customerCountryCode })
    syncTravelers(travelerCount)
    travelers.forEach((traveler, index) => updateTraveler(index, traveler))
    router.push("/order")
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
      <div className="space-y-5">
        <div className="space-y-1">
          <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">Select Services</Label>
          <div className="flex gap-2">
            {SERVICES.map((service) => {
              const active = selectedServices.includes(service.value)
              return (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => toggleService(service.value)}
                  className={cn(
                    "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-[#c8143d]/10 text-[#c8143d] ring-1 ring-[#c8143d]/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {service.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Contact Email *</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-lg border-slate-200 bg-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Country *</Label>
            <Select value={customerCountryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Travelers</p>
            <p className="text-xs text-slate-500">1-5 passengers</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleTravelerCountChange(-1)}
              disabled={travelerCount <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#c8143d] disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-lg font-semibold text-slate-900">{travelerCount}</span>
            <button
              type="button"
              onClick={() => handleTravelerCountChange(1)}
              disabled={travelerCount >= 5}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8143d] text-white disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">Traveler Details</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-2">
            {travelers.map((traveler, index) => (
              <div key={index} className="rounded-xl bg-slate-100/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-xs font-medium", index === 0 ? "text-[#c8143d]" : "text-slate-500")}>
                    {index === 0 ? "Primary" : `Traveler ${index + 1}`}
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-[70px_1fr_1fr]">
                  <Select value={traveler.title} onValueChange={(v) => handleTravelerChange(index, "title", v)}>
                    <SelectTrigger className="h-9 rounded-lg bg-white text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{TITLES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="First name" value={traveler.firstName} onChange={(e) => handleTravelerChange(index, "firstName", e.target.value)} className="h-9 rounded-lg bg-white text-sm" />
                  <Input placeholder="Last name" value={traveler.lastName} onChange={(e) => handleTravelerChange(index, "lastName", e.target.value)} className="h-9 rounded-lg bg-white text-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2.5 rounded-lg">
          <Info className="h-3.5 w-3.5" />
          <span>By continuing, you agree to our Terms & Privacy Policy</span>
        </div>

        <Button onClick={handleSubmit} disabled={!isValid()} className="w-full h-10 rounded-lg bg-[#c8143d] hover:bg-[#b01030] font-medium text-sm">
          Continue
          <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}