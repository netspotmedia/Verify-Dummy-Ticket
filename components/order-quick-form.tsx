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
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-red-600 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            Complete the form below to get your visa documents
          </h2>
        </div>

        <CardContent className="space-y-6 p-5 sm:p-6">
          <section className="space-y-3">
            <div>
              <Label className="text-sm font-semibold text-slate-800">Select Services</Label>
              <p className="mt-1 text-sm text-slate-500">
                Choose the visa support services you need
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {SERVICES.map((service) => (
                <button
                  key={service.value}
                  type="button"
                  onClick={() => toggleService(service.value)}
                  className={cn(
                    "relative flex min-h-[84px] items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all",
                    selectedServices.includes(service.value)
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  )}
                >
                  {selectedServices.includes(service.value) && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                      selectedServices.includes(service.value)
                        ? "bg-red-100 text-red-600"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <service.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 leading-tight">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        selectedServices.includes(service.value)
                          ? "text-red-700"
                          : "text-slate-800"
                      )}
                    >
                      {service.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{service.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <Label className="text-sm font-semibold text-slate-800">
                  Number of Travelers
                </Label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleTravelerCountChange(-1)}
                  disabled={travelerCount <= 1}
                  className="h-10 w-10 rounded-md border-slate-300 bg-white"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div className="min-w-[70px] text-center">
                  <div className="text-2xl font-semibold text-slate-900">{travelerCount}</div>
                  <p className="text-sm text-slate-500">
                    {travelerCount === 1 ? "Traveler" : "Travelers"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleTravelerCountChange(1)}
                  disabled={travelerCount >= 10}
                  className="h-10 w-10 rounded-md border-slate-300 bg-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <Mail className="h-4 w-4 text-slate-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Documents will be sent here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-md border-slate-300 px-3"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <Globe className="h-4 w-4 text-slate-400" />
                  Country
                </Label>
                <Select value={customerCountryCode} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-11 rounded-md border-slate-300">
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
          </section>

          <section className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <User className="h-4 w-4 text-slate-400" />
              Traveler Names
            </Label>

            <div className="space-y-2.5">
              {travelers.map((traveler, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-[44px_88px_1fr_1fr]"
                >
                  <div className="flex h-10 w-11 items-center justify-center rounded-md bg-slate-100 text-sm font-medium text-slate-700">
                    {index + 1}
                  </div>

                  <Select
                    value={traveler.title}
                    onValueChange={(value) => handleTravelerChange(index, "title", value)}
                  >
                    <SelectTrigger className="h-10 rounded-md border-slate-300">
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
                    placeholder="First name"
                    value={traveler.firstName}
                    onChange={(e) => handleTravelerChange(index, "firstName", e.target.value)}
                    className="h-10 rounded-md border-slate-300"
                  />

                  <Input
                    placeholder="Last name"
                    value={traveler.lastName}
                    onChange={(e) => handleTravelerChange(index, "lastName", e.target.value)}
                    className="h-10 rounded-md border-slate-300"
                  />
                </div>
              ))}
            </div>
          </section>

          <Button
            onClick={handleSubmit}
            disabled={!isValid()}
            className="h-11 w-full rounded-md bg-red-500 text-base font-semibold text-white hover:bg-red-600"
          >
            Continue to Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}