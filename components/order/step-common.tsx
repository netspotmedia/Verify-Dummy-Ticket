"use client"

import { useEffect } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Minus, Globe, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title } from "@/lib/types"

const TITLES: { value: Title; label: string }[] = [
  { value: "Mr", label: "Mr." },
  { value: "Mrs", label: "Mrs." },
  { value: "Master", label: "Master" },
  { value: "Miss", label: "Miss" },
]

const COUNTRIES = [
  { code: "NG", name: "Nigeria" }, { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" }, { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" }, { code: "NL", name: "Netherlands" }, { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" }, { code: "AE", name: "UAE" }, { code: "ZA", name: "South Africa" },
  { code: "IN", name: "India" }, { code: "CN", name: "China" }, { code: "JP", name: "Japan" },
]

export function StepCommon() {
  const { formData, setCustomerInfo, updateTraveler, syncTravelers, nextStep, prevStep } = useOrderStore()
  const { travelerCount, travelers, email, customerCountryCode, separatePnrPerTraveler, services } = formData

  useEffect(() => { syncTravelers(travelerCount) }, [travelerCount, syncTravelers])

  const showSeparatePnr = services.includes("flight") && travelerCount > 1

  const isValid = () => {
    if (travelerCount < 1) return false
    if (!email || !email.includes("@")) return false
    if (!customerCountryCode) return false
    if (travelers.some((t) => !t.firstName || !t.lastName)) return false
    return true
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-medium uppercase tracking-wider text-slate-400">Contact Details</Label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Email Address</Label>
          <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setCustomerInfo({ email: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm font-medium" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Country</Label>
          <Select value={customerCountryCode} onValueChange={(code) => { const c = COUNTRIES.find(c => c.code === code); setCustomerInfo({ customerCountryCode: code, customerCountry: c?.name || "" }) }}>
            <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2.5">
        <div>
          <p className="text-sm font-medium text-slate-700">Travelers</p>
          <p className="text-xs text-slate-500">1-10 passengers</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setCustomerInfo({ travelerCount: Math.max(1, travelerCount - 1) })} disabled={travelerCount <= 1} className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#c8143d] disabled:opacity-40">
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-base font-semibold text-slate-900">{travelerCount}</span>
          <button type="button" onClick={() => setCustomerInfo({ travelerCount: Math.min(10, travelerCount + 1) })} disabled={travelerCount >= 10} className="flex h-7 w-7 items-center justify-center rounded-md bg-[#c8143d] text-white disabled:opacity-40">
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {customerCountryCode === "NG" && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <Globe className="h-3.5 w-3.5" />
          <span>Prices in NGN. Paystack available.</span>
        </div>
      )}

      {showSeparatePnr && (
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={separatePnrPerTraveler} onCheckedChange={(c) => setCustomerInfo({ separatePnrPerTraveler: c as boolean })} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm text-slate-600">Separate PNR per traveler</span>
        </label>
      )}

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">Travelers</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2">
        {travelers.map((traveler, index) => (
          <div key={index} className="rounded-lg bg-slate-50/50 p-2.5">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs font-medium", index === 0 ? "text-[#c8143d]" : "text-slate-500")}>
                {index === 0 ? "Primary" : `Traveler ${index + 1}`}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-[70px_1fr_1fr]">
              <Select value={traveler.title} onValueChange={(v) => updateTraveler(index, { title: v as Title })}>
                <SelectTrigger className="h-9 rounded-md bg-white text-xs"><SelectValue placeholder="Title" /></SelectTrigger>
                <SelectContent>{TITLES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="First name" value={traveler.firstName} onChange={(e) => updateTraveler(index, { firstName: e.target.value })} className="h-9 rounded-md bg-white text-sm" />
              <Input placeholder="Last name" value={traveler.lastName} onChange={(e) => updateTraveler(index, { lastName: e.target.value })} className="h-9 rounded-md bg-white text-sm" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3.5 rounded-lg text-sm">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="flex-1 h-9 rounded-lg bg-[#c8143d] hover:bg-[#b01030] text-sm font-medium">
          Continue<ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}