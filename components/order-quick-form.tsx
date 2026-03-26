"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Hotel, Shield, Check, Plus, Minus, User, Globe, Mail, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title, ServiceType } from "@/lib/types"

const SERVICES: { value: ServiceType; label: string; icon: typeof Plane; price: string }[] = [
  { value: "flight", label: "Flight Ticket", icon: Plane, price: "From $5" },
  { value: "hotel", label: "Hotel Booking", icon: Hotel, price: "From $3" },
  { value: "insurance", label: "Travel Insurance", icon: Shield, price: "From $2" },
]

const TITLES: { value: Title; label: string }[] = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
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
  const { setServices, setCustomerInfo, syncTravelers, updateTraveler, formData } = useOrderStore()
  
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
    <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-red-600 to-red-700" />
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700 text-sm font-bold">
            <Users className="h-4 w-4" />
          </span>
          Quick Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-slate-700">Select Services</Label>
          <div className="grid grid-cols-3 gap-3">
            {SERVICES.map((service) => (
              <button
                key={service.value}
                onClick={() => toggleService(service.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  selectedServices.includes(service.value)
                    ? "border-red-600 bg-red-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                {selectedServices.includes(service.value) && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <service.icon className={cn("h-5 w-5", selectedServices.includes(service.value) ? "text-red-600" : "text-slate-400")} />
                <span className={cn("text-xs font-medium", selectedServices.includes(service.value) ? "text-red-700" : "text-slate-600")}>
                  {service.label}
                </span>
                <span className="text-[10px] text-slate-400">{service.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-slate-500" />
            <Label className="text-sm font-semibold">Travelers</Label>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTravelerCountChange(-1)}
              disabled={travelerCount <= 1}
              className="h-10 w-10 rounded-lg border-slate-300"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-slate-900">{travelerCount}</span>
              <p className="text-xs text-slate-500">{travelerCount === 1 ? "Traveler" : "Travelers"}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTravelerCountChange(1)}
              disabled={travelerCount >= 10}
              className="h-10 w-10 rounded-lg border-slate-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Mail className="h-4 w-4 text-slate-400" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Globe className="h-4 w-4 text-slate-400" />
              Country
            </Label>
            <Select value={customerCountryCode} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-300">
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

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <User className="h-4 w-4 text-slate-400" />
            Traveler Names
          </Label>
          <div className="space-y-3 max-h-[200px] overflow-y-auto">
            {travelers.map((traveler, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <Select
                  value={traveler.title}
                  onValueChange={(value) => handleTravelerChange(index, "title", value)}
                >
                  <SelectTrigger className="w-20 h-9 rounded-lg">
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
                  placeholder="First"
                  value={traveler.firstName}
                  onChange={(e) => handleTravelerChange(index, "firstName", e.target.value)}
                  className="flex-1 h-9 rounded-lg"
                />
                <Input
                  placeholder="Last"
                  value={traveler.lastName}
                  onChange={(e) => handleTravelerChange(index, "lastName", e.target.value)}
                  className="flex-1 h-9 rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValid()}
          className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg shadow-red-200/50"
        >
          Continue to Order
        </Button>
      </CardContent>
    </Card>
  )
}
