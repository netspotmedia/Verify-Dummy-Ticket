"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plane, Hotel, Shield, Check, Plus, Minus, User, Globe, Mail, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title, ServiceType } from "@/lib/types"

const SERVICES: { value: ServiceType; label: string; icon: typeof Plane; price: string }[] = [
  { value: "flight", label: "Flight", icon: Plane, price: "From $5" },
  { value: "hotel", label: "Hotel", icon: Hotel, price: "From $3" },
  { value: "insurance", label: "Insurance", icon: Shield, price: "From $2" },
]

const TITLES: { value: Title; label: string }[] = [
  { value: "Mr", label: "Mr." },
  { value: "Mrs", label: "Mrs." },
  { value: "Master", label: "Ms." },
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
  const [travelers, setTravelers] = useState([{ title: "Mr" as Title, firstName: "", lastName: "" }])
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
    const newCount = Math.max(1, Math.min(10, travelerCount + delta))
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
    <Card className="relative group overflow-hidden rounded-3xl bg-white shadow-[0_25px_50px_-12px_rgba(11,28,48,0.08)]">
      <div className="absolute -top-1 inset-x-0 h-2 bg-gradient-to-r from-[#b80035] via-[#e11d48] to-[#ffb3b6] rounded-t-3xl z-10" />

      <div className="flex items-center gap-3 px-6 pt-8 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e11d48] text-white">
          <Users className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-[#0b1c30]" style={{ fontFamily: 'var(--font-outfit)' }}>Quick Order</h3>
          <p className="text-xs text-[#5c3f40]">Expedited Booking</p>
        </div>
      </div>

      <CardContent className="space-y-6 p-6 pt-2">
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-[#5c3f40] uppercase tracking-wider block" style={{ fontFamily: 'var(--font-outfit)' }}>
            Select Services
          </Label>

          <div className="grid grid-cols-3 gap-3">
            {SERVICES.map((service) => (
              <button
                key={service.value}
                type="button"
                onClick={() => toggleService(service.value)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95",
                  selectedServices.includes(service.value)
                    ? "border-[#b80035] bg-rose-50/30 text-[#b80035]"
                    : "border-transparent bg-[#eff4ff] text-[#515f74] hover:bg-[#dce9ff]"
                )}
              >
                <service.icon
                  className="h-6 w-6"
                  style={{ fill: selectedServices.includes(service.value) ? "#b80035" : "none" }}
                />
                <span className="font-bold text-sm">{service.label}</span>
                <span className="text-[10px] opacity-60">{service.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#5c3f40] uppercase tracking-wider block" style={{ fontFamily: 'var(--font-outfit)' }}>
              Contact Email
            </Label>
            <div className="relative">
              <Input
                type="email"
                placeholder="traveller@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-[#eff4ff] rounded-2xl border-none focus:ring-2 focus:ring-[#be0037] text-[#0b1c30] placeholder:text-slate-400 transition-all h-12"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[#5c3f40] uppercase tracking-wider block" style={{ fontFamily: 'var(--font-outfit)' }}>
              Country of Residence
            </Label>
            <Select value={customerCountryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className="w-full h-12 px-5 py-4 bg-[#eff4ff] rounded-2xl border-none focus:ring-2 focus:ring-[#be0037] text-[#0b1c30]">
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

        <div className="p-5 bg-[#eff4ff] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-[#0b1c30]" style={{ fontFamily: 'var(--font-outfit)' }}>Number of Travelers</h3>
            <p className="text-sm text-[#5c3f40]">Add up to 10 passengers</p>
          </div>
          <div className="flex items-center bg-white rounded-full p-1.5 shadow-sm border border-[#e5bdbe]/20">
            <button
              type="button"
              onClick={() => handleTravelerCountChange(-1)}
              disabled={travelerCount <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#b80035] hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="px-6 font-bold text-xl text-[#0b1c30]" style={{ fontFamily: 'var(--font-outfit)' }}>
              {String(travelerCount).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => handleTravelerCountChange(1)}
              disabled={travelerCount >= 10}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#b80035] text-white shadow-lg shadow-rose-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-[#e5bdbe]/30" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-outfit)' }}>Traveler Information</span>
            <div className="h-[1px] flex-grow bg-[#e5bdbe]/30" />
          </div>

          <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
            {travelers.map((traveler, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-bold flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-outfit)' }}>
                  <span className={cn(
                    "w-6 h-6 rounded-full text-[10px] flex items-center justify-center",
                    index === 0 ? "bg-[#e11d48] text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {index + 1}
                  </span>
                  {index === 0 ? "Primary Traveler" : `Traveler ${index + 1}`}
                </h4>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-2">
                    <Select
                      value={traveler.title}
                      onValueChange={(value) => handleTravelerChange(index, "title", value)}
                    >
                      <SelectTrigger className="w-full h-11 px-4 bg-[#eff4ff] rounded-xl border-none focus:ring-2 focus:ring-[#be0037]">
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
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <Input
                      placeholder="First Name"
                      value={traveler.firstName}
                      onChange={(e) => handleTravelerChange(index, "firstName", e.target.value)}
                      className="h-11 px-5 bg-[#eff4ff] rounded-xl border-none focus:ring-2 focus:ring-[#be0037] text-[#0b1c30]"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-5">
                    <Input
                      placeholder="Last Name"
                      value={traveler.lastName}
                      onChange={(e) => handleTravelerChange(index, "lastName", e.target.value)}
                      className="h-11 px-5 bg-[#eff4ff] rounded-xl border-none focus:ring-2 focus:ring-[#be0037] text-[#0b1c30]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid()}
          className="w-full bg-[#b80035] hover:bg-gradient-to-r hover:from-[#b80035] hover:to-[#e11d48] text-white py-5 px-8 rounded-2xl font-bold text-base shadow-xl shadow-rose-200/50 transition-all active:scale-95 flex items-center justify-center gap-3"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          Continue to Order
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Button>

        <p className="text-center text-xs text-[#5c3f40]/70 italic" style={{ fontFamily: 'var(--font-outfit)' }}>
          By continuing, you agree to our Travel Terms & Conditions and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  )
}
