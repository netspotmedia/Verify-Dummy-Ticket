"use client"

import { useEffect } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Minus, User, Globe, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title } from "@/lib/types"

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

export function StepCommon() {
  const { formData, setCustomerInfo, updateTraveler, syncTravelers, nextStep, prevStep } = useOrderStore()
  const {
    travelerCount,
    travelers,
    email,
    customerCountryCode,
    separatePnrPerTraveler,
    services,
  } = formData

  useEffect(() => {
    syncTravelers(travelerCount)
  }, [travelerCount, syncTravelers])

  const showSeparatePnr = services.includes("flight") && travelerCount > 1

  const isValid = () => {
    if (travelerCount < 1) return false
    if (!email || !email.includes("@")) return false
    if (!customerCountryCode) return false
    if (travelers.some((t) => !t.firstName || !t.lastName)) return false
    return true
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Contact Details
        </Label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7d6670]"
            >
              Contact Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="traveller@voyager.com"
                value={email}
                onChange={(e) => setCustomerInfo({ email: e.target.value })}
                className="h-[52px] rounded-full border-0 bg-[#e9edf5] pl-5 pr-12 text-[15px] text-slate-700 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c8143d]"
              />
              <Mail className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7d6670]"
            >
              Country of Residence
            </Label>
            <Select
              value={customerCountryCode}
              onValueChange={(code) => {
                const country = COUNTRIES.find((c) => c.code === code)
                setCustomerInfo({
                  customerCountryCode: code,
                  customerCountry: country?.name || "",
                })
              }}
            >
              <SelectTrigger
                id="country"
                className="h-[52px] rounded-full border-0 bg-[#e9edf5] px-5 text-[15px] text-slate-700 focus:ring-2 focus:ring-[#c8143d]"
              >
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

      <section className="rounded-[30px] bg-[#e9edf5] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 sm:text-[24px]">
              Number of Travelers
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Maximum 10 travelers per order
            </p>
          </div>

          <div className="inline-flex items-center self-start rounded-full bg-white p-1 shadow-sm sm:self-auto">
            <button
              type="button"
              onClick={() =>
                setCustomerInfo({ travelerCount: Math.max(1, travelerCount - 1) })
              }
              disabled={travelerCount <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#c8143d] disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>

            <div className="min-w-[64px] text-center text-[26px] font-semibold tracking-[0.08em] text-slate-900">
              {String(travelerCount).padStart(2, "0")}
            </div>

            <button
              type="button"
              onClick={() =>
                setCustomerInfo({ travelerCount: Math.min(10, travelerCount + 1) })
              }
              disabled={travelerCount >= 10}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c8143d] text-white shadow-md disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {customerCountryCode === "NG" && (
        <div className="rounded-[24px] border border-[#bfd7ff] bg-[#eef5ff] p-4 text-[#19407a]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white">
              <Globe className="h-4 w-4 text-[#2563eb]" />
            </div>
            <div>
              <p className="font-semibold">Nigeria Detected</p>
              <p className="mt-1 text-sm">
                Prices will be shown in Naira (NGN). Payment available via Paystack only.
              </p>
            </div>
          </div>
        </div>
      )}

      {showSeparatePnr && (
        <div className="rounded-[24px] bg-[#eef2fa] p-4">
          <label
            htmlFor="separatePnr"
            className="flex cursor-pointer items-start gap-3"
          >
            <Checkbox
              id="separatePnr"
              checked={separatePnrPerTraveler}
              onCheckedChange={(checked) =>
                setCustomerInfo({ separatePnrPerTraveler: checked as boolean })
              }
              className="mt-0.5 h-5 w-5 rounded-md border-slate-300"
            />
            <div>
              <p className="font-semibold text-slate-900">
                Separate PNR for each traveler
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Each traveler gets their own reservation code
              </p>
            </div>
          </label>
        </div>
      )}

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

              <div className="grid gap-3 md:grid-cols-[92px_1fr_1fr]">
                <Select
                  value={traveler.title}
                  onValueChange={(value) =>
                    updateTraveler(index, { title: value as Title })
                  }
                >
                  <SelectTrigger className="h-[46px] rounded-full border-0 bg-[#e9edf5] px-4 text-sm focus:ring-2 focus:ring-[#c8143d]">
                    <SelectValue placeholder="Title" />
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
                    updateTraveler(index, { firstName: e.target.value })
                  }
                  className="h-[46px] rounded-full border-0 bg-[#e9edf5] px-5 text-sm placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#c8143d]"
                />

                <Input
                  placeholder="Last Name"
                  value={traveler.lastName}
                  onChange={(e) =>
                    updateTraveler(index, { lastName: e.target.value })
                  }
                  className="h-[46px] rounded-full border-0 bg-[#e9edf5] px-5 text-sm placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-[#c8143d]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          className="h-12 rounded-full border-[#ead8dd] bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-[#fff7f9]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={nextStep}
          disabled={!isValid()}
          className="h-12 rounded-full bg-[#c90039] px-7 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(201,0,57,0.2)] hover:bg-[#b50033]"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}