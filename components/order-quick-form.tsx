"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title, ServiceType } from "@/lib/types"

const SERVICES: { value: ServiceType; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "hotel", label: "Hotel" },
  { value: "insurance", label: "Insurance" },
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
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">Select Services</Label>
        <div className="flex gap-1">
          {SERVICES.map((service) => {
            const active = selectedServices.includes(service.value)
            return (
              <button
                key={service.value}
                type="button"
                onClick={() => toggleService(service.value)}
                className={cn(
                  "flex-1 py-2 px-2 rounded text-xs font-medium transition-all border",
                  active
                    ? "bg-[#fff7f9] text-[#c8143d] border-[#c8143d]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                )}
              >
                {service.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Email *</Label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 rounded-md border-slate-200 bg-white text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Country *</Label>
          <Select value={customerCountryCode} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
        <div>
          <p className="text-sm font-medium text-slate-700">Travelers</p>
          <p className="text-xs text-slate-500">1-5 passengers</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleTravelerCountChange(-1)}
            disabled={travelerCount <= 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <span className="text-sm">−</span>
          </button>
          <span className="w-6 text-center text-sm font-semibold text-slate-900">{travelerCount}</span>
          <button
            type="button"
            onClick={() => handleTravelerCountChange(1)}
            disabled={travelerCount >= 5}
            className="flex h-7 w-7 items-center justify-center rounded bg-[#c8143d] text-white hover:bg-[#b01030] disabled:opacity-40"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Traveler Details</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        {travelers.map((traveler, index) => (
          <div key={index} className="p-2 border border-slate-100 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-[10px] font-medium uppercase tracking-wider", index === 0 ? "text-[#c8143d]" : "text-slate-500")}>
                {index === 0 ? "Primary" : `Traveler ${index + 1}`}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-[60px_1fr_1fr]">
              <Select value={traveler.title} onValueChange={(v) => handleTravelerChange(index, "title", v)}>
                <SelectTrigger className="h-8 rounded-md bg-white text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{TITLES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="First name" value={traveler.firstName} onChange={(e) => handleTravelerChange(index, "firstName", e.target.value)} className="h-8 rounded-md bg-white text-xs" />
              <Input placeholder="Last name" value={traveler.lastName} onChange={(e) => handleTravelerChange(index, "lastName", e.target.value)} className="h-8 rounded-md bg-white text-xs" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400">By continuing, you agree to our Terms & Privacy Policy</p>

      <Button onClick={handleSubmit} disabled={!isValid()} className="w-full h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] font-medium text-xs">
        Continue
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
