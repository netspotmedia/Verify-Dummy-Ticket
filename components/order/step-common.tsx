"use client"

import { useEffect } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Minus, Globe } from "lucide-react"
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
    <div className="space-y-3 font-outfit">
      <div className="space-y-1">
        <Label className="text-sm font-medium uppercase tracking-wider text-black">Contact Details</Label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-sm text-black">Email Address</Label>
          <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setCustomerInfo({ email: e.target.value })} className="h-9 rounded-md border-slate-200 bg-white text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-sm text-black">Country</Label>
          <Select value={customerCountryCode} onValueChange={(code) => { const c = COUNTRIES.find(c => c.code === code); setCustomerInfo({ customerCountryCode: code, customerCountry: c?.name || "" }) }}>
            <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
        <div>
          <p className="text-sm font-medium text-slate-700">Travelers</p>
          <p className="text-xs text-slate-500">1-10 passengers</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setCustomerInfo({ travelerCount: Math.max(1, travelerCount - 1) })} disabled={travelerCount <= 1} className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40">
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-slate-900">{travelerCount}</span>
          <button type="button" onClick={() => setCustomerInfo({ travelerCount: Math.min(10, travelerCount + 1) })} disabled={travelerCount >= 10} className="flex h-7 w-7 items-center justify-center rounded bg-[#c8143d] text-white hover:bg-[#b01030] disabled:opacity-40">
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {customerCountryCode === "NG" && (
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <Globe className="h-3 w-3" />
          <span>Prices in NGN. Paystack available.</span>
        </div>
      )}

      {showSeparatePnr && (
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={separatePnrPerTraveler} onCheckedChange={(c) => setCustomerInfo({ separatePnrPerTraveler: c as boolean })} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-xs text-slate-600">Separate PNR per traveler</span>
        </label>
      )}

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-medium text-black uppercase tracking-wider">Travelers</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-2">
        {travelers.map((traveler, index) => (
          <div key={index} className="p-2 border border-slate-100 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-sm font-medium uppercase tracking-wider", index === 0 ? "text-[#c8143d]" : "text-slate-500")}>
                {index === 0 ? "Primary" : `Traveler ${index + 1}`}
              </span>
            </div>
            <div className="grid gap-2 md:grid-cols-[60px_1fr_1fr]">
              <Select value={traveler.title} onValueChange={(v) => updateTraveler(index, { title: v as Title })}>
                <SelectTrigger className="h-9 rounded-md bg-white text-sm"><SelectValue placeholder="Title" /></SelectTrigger>
                <SelectContent>{TITLES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="First name" value={traveler.firstName} onChange={(e) => updateTraveler(index, { firstName: e.target.value })} className="h-9 rounded-md bg-white text-sm" />
              <Input placeholder="Last name" value={traveler.lastName} onChange={(e) => updateTraveler(index, { lastName: e.target.value })} className="h-9 rounded-md bg-white text-sm" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] text-xs font-medium">
          Continue<ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
