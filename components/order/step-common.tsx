"use client"

import { useEffect, useState } from "react"
import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Minus, Globe, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Title } from "@/lib/types"
import { COUNTRIES } from "@/lib/countries"

const TITLES: { value: Title; label: string }[] = [
  { value: "Mr", label: "Mr." },
  { value: "Mrs", label: "Mrs." },
  { value: "Master", label: "Master" },
  { value: "Miss", label: "Miss" },
]

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="flex items-center gap-1 text-xs text-[#c8143d] mt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

function Req() {
  return <span aria-hidden="true" className="text-[#c8143d] ml-0.5">*</span>
}

export function StepCommon() {
  const { formData, setCustomerInfo, updateTraveler, syncTravelers, nextStep, prevStep } = useOrderStore()
  const { travelerCount, travelers, email, customerCountryCode, separatePnrPerTraveler, services } = formData

  useEffect(() => { syncTravelers(travelerCount) }, [travelerCount, syncTravelers])

  const showSeparatePnr = services.includes("flight") && travelerCount > 1

  const [tried, setTried] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirmEmail, setConfirmEmail] = useState("")
  const [expandedTravelers, setExpandedTravelers] = useState<Record<number, boolean>>({})

  const toggleTravelerExpanded = (index: number) =>
    setExpandedTravelers(prev => ({ ...prev, [index]: !prev[index] }))

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }))

  const getErrors = () => {
    const e: Record<string, string> = {}
    if (!email?.trim()) {
      e.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email address"
    }
    if (!confirmEmail?.trim()) {
      e.confirmEmail = "Please confirm your email address"
    } else if (confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      e.confirmEmail = "Email addresses do not match"
    }
    if (!customerCountryCode) e.country = "Please select your country"
    travelers.forEach((t, i) => {
      if (!t.firstName?.trim()) e[`firstName_${i}`] = "First name is required"
      if (!t.lastName?.trim()) e[`lastName_${i}`] = "Last name is required"
    })
    return e
  }

  const allErrors = getErrors()
  const show = (key: string) => (tried || touched[key]) ? allErrors[key] : undefined

  const handleContinue = () => {
    setTried(true)
    if (Object.keys(allErrors).length > 0) {
      setTimeout(() => {
        const el = document.querySelector('[aria-invalid="true"]')
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
      return
    }
    nextStep()
  }

  return (
    <div className="space-y-3 font-outfit">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium uppercase tracking-wider text-black">Contact Details</Label>
        <p className="text-xs text-slate-400">
          Fields marked <span className="text-[#c8143d] font-semibold">*</span> are required
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="contact-email" className="text-sm text-black">
            Email Address <Req />
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setCustomerInfo({ email: e.target.value })}
            onBlur={() => touch("email")}
            aria-invalid={!!show("email")}
            aria-describedby={show("email") ? "email-error" : undefined}
            className="h-9 rounded-md border-slate-200 bg-white text-sm"
          />
          <FieldError id="email-error" message={show("email")} />
        </div>

        {/* Confirm email */}
        <div className="space-y-1">
          <Label htmlFor="confirm-email" className="text-sm text-black">
            Confirm Email <Req />
          </Label>
          <Input
            id="confirm-email"
            type="email"
            placeholder="Retype your email"
            autoComplete="off"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            onBlur={() => touch("confirmEmail")}
            aria-invalid={!!show("confirmEmail")}
            aria-describedby={show("confirmEmail") ? "confirm-email-error" : undefined}
            className="h-9 rounded-md border-slate-200 bg-white text-sm"
          />
          <FieldError id="confirm-email-error" message={show("confirmEmail")} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Country */}
        <div className="space-y-1">
          <Label className="text-sm text-black">
            Country <Req />
          </Label>
          <Select
            value={customerCountryCode}
            onValueChange={(code) => {
              const c = COUNTRIES.find(c => c.code === code)
              setCustomerInfo({ customerCountryCode: code, customerCountry: c?.name || "" })
              touch("country")
            }}
          >
            <SelectTrigger
              className={cn(
                "h-9 rounded-md border-slate-200 bg-white text-sm",
                show("country") && "border-[#c8143d] ring-1 ring-[#c8143d]/20"
              )}
            >
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError message={show("country")} />
        </div>
      </div>

      {/* Traveler count */}
      <div className="flex items-center justify-between p-2 border border-slate-200 rounded">
        <div>
          <p className="text-sm font-medium text-slate-700">Number of Travelers</p>
          <p className="text-xs text-slate-500">1–10 passengers</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCustomerInfo({ travelerCount: Math.max(1, travelerCount - 1) })}
            disabled={travelerCount <= 1}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Remove traveler"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-slate-900">{travelerCount}</span>
          <button
            type="button"
            onClick={() => setCustomerInfo({ travelerCount: Math.min(10, travelerCount + 1) })}
            disabled={travelerCount >= 10}
            className="flex h-7 w-7 items-center justify-center rounded bg-[#c8143d] text-white hover:bg-[#b01030] disabled:opacity-40"
            aria-label="Add traveler"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {customerCountryCode === "NG" && (
        <div className="flex items-center gap-2 rounded bg-blue-50 px-2 py-1.5 text-xs text-blue-700">
          <Globe className="h-3 w-3 shrink-0" />
          <span>Nigerian location detected — prices shown in NGN. Paystack available.</span>
        </div>
      )}

      {showSeparatePnr && (
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={separatePnrPerTraveler}
            onCheckedChange={(c) => setCustomerInfo({ separatePnrPerTraveler: c as boolean })}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-xs text-slate-600">Issue a separate PNR for each traveler</span>
        </label>
      )}

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-medium uppercase tracking-wider text-black">Traveler Names</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-xs text-slate-500 -mt-1">
        Enter names exactly as they appear on the passport or travel document.
      </p>

      {/* Traveler list */}
      <div className="space-y-2">
        {travelers.map((traveler, index) => (
          <div
            key={index}
            className={cn(
              "rounded border p-2 transition-colors",
              (show(`firstName_${index}`) || show(`lastName_${index}`))
                ? "border-[#c8143d]/40 bg-[#fff5f6]"
                : "border-slate-100 bg-white"
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                index === 0 ? "text-[#c8143d]" : "text-slate-400"
              )}>
                {index === 0 ? "Primary Traveler" : `Traveler ${index + 1}`}
              </span>
              {(show(`firstName_${index}`) || show(`lastName_${index}`)) && (
                <span className="ml-auto flex items-center gap-0.5 text-xs text-[#c8143d]">
                  <AlertCircle className="h-3 w-3" />
                  Incomplete
                </span>
              )}
            </div>
            <div className="grid gap-2 md:grid-cols-[60px_1fr_1fr]">
              {/* Title */}
              <Select value={traveler.title} onValueChange={(v) => updateTraveler(index, { title: v as Title })}>
                <SelectTrigger className="h-9 rounded-md bg-white text-sm">
                  <SelectValue placeholder="Title" />
                </SelectTrigger>
                <SelectContent>
                  {TITLES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* First name */}
              <div>
                <Input
                  placeholder={index === 0 ? "First name *" : "First name *"}
                  autoComplete={index === 0 ? "given-name" : "off"}
                  value={traveler.firstName}
                  onChange={(e) => updateTraveler(index, { firstName: e.target.value })}
                  onBlur={() => touch(`firstName_${index}`)}
                  aria-invalid={!!show(`firstName_${index}`)}
                  aria-label={`Traveler ${index + 1} first name`}
                  className="h-9 rounded-md bg-white text-sm"
                />
                <FieldError message={show(`firstName_${index}`)} />
              </div>

              {/* Last name */}
              <div>
                <Input
                  placeholder={index === 0 ? "Last name *" : "Last name *"}
                  autoComplete={index === 0 ? "family-name" : "off"}
                  value={traveler.lastName}
                  onChange={(e) => updateTraveler(index, { lastName: e.target.value })}
                  onBlur={() => touch(`lastName_${index}`)}
                  aria-invalid={!!show(`lastName_${index}`)}
                  aria-label={`Traveler ${index + 1} last name`}
                  className="h-9 rounded-md bg-white text-sm"
                />
                <FieldError message={show(`lastName_${index}`)} />
              </div>
            </div>

            {/* Optional passport details toggle */}
            <button
              type="button"
              onClick={() => toggleTravelerExpanded(index)}
              className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              {expandedTravelers[index] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expandedTravelers[index] ? "Hide passport details" : "Add passport details (optional)"}
            </button>

            {expandedTravelers[index] && (
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <div>
                  <Input
                    placeholder="Nationality"
                    autoComplete="off"
                    value={traveler.nationality || ""}
                    onChange={(e) => updateTraveler(index, { nationality: e.target.value })}
                    aria-label={`Traveler ${index + 1} nationality`}
                    className="h-9 rounded-md bg-white text-sm"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Passport number"
                    autoComplete="off"
                    value={traveler.passportNumber || ""}
                    onChange={(e) => updateTraveler(index, { passportNumber: e.target.value })}
                    aria-label={`Traveler ${index + 1} passport number`}
                    className="h-9 rounded-md bg-white text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    placeholder="Date of birth"
                    autoComplete="off"
                    value={traveler.dateOfBirth || ""}
                    onChange={(e) => updateTraveler(index, { dateOfBirth: e.target.value })}
                    aria-label={`Traveler ${index + 1} date of birth`}
                    className="h-9 rounded-md bg-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error summary banner — only shown after first attempt */}
      {tried && Object.keys(allErrors).length > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-[#c8143d]/30 bg-[#fff5f6] px-3 py-2 text-xs text-[#c8143d]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Please fill in all required fields before continuing.
          </span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] text-xs font-medium"
        >
          Continue
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
