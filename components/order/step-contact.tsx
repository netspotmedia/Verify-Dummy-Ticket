"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Mail, Phone, MessageCircle, Info } from "lucide-react"

export function StepContact() {
  const { formData, setContactInfo, nextStep, prevStep } = useOrderStore()
  const { contactEmail, contactPhone, whatsappNumber, deliveryMethod } = formData

  const handleChange = (
    field: "contactEmail" | "contactPhone" | "whatsappNumber" | "deliveryMethod",
    value: string
  ) => {
    setContactInfo({
      contactEmail: field === "contactEmail" ? value : contactEmail,
      contactPhone: field === "contactPhone" ? value : contactPhone,
      whatsappNumber: field === "whatsappNumber" ? value : whatsappNumber,
      deliveryMethod: field === "deliveryMethod" ? (value as "email" | "whatsapp" | "both") : deliveryMethod,
    })
  }

  const isValid = () => {
    if (!contactEmail?.trim() || !contactPhone?.trim()) return false
    if ((deliveryMethod === "whatsapp" || deliveryMethod === "both") && !whatsappNumber?.trim()) return false
    return true
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Contact Information
        </Label>
        <p className="text-sm text-slate-500">
          Please provide your contact details. We'll use these to deliver your documents and for any order updates.
        </p>
      </div>

      {/* Contact Email */}
      <div className="rounded-[24px] bg-[#e9edf5] p-5">
        <div className="space-y-3">
          <Label htmlFor="contactEmail" className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Mail className="h-4 w-4 text-[#c8143d]" />
            Email Address *
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="your@email.com"
            value={contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
            className="rounded-xl border-slate-200 bg-white"
          />
          <p className="text-xs text-slate-500">
            Documents will be sent to this email address
          </p>
        </div>
      </div>

      {/* Contact Phone */}
      <div className="rounded-[24px] bg-[#e9edf5] p-5">
        <div className="space-y-3">
          <Label htmlFor="contactPhone" className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Phone className="h-4 w-4 text-[#c8143d]" />
            Phone Number *
          </Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
            className="rounded-xl border-slate-200 bg-white"
          />
        </div>
      </div>

      {/* Delivery Method */}
      <div className="space-y-3">
        <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
          Preferred Delivery Method *
        </Label>
        <div className="grid gap-3">
          {[
            { value: "email", label: "Email Only", icon: Mail },
            { value: "whatsapp", label: "WhatsApp Only", icon: MessageCircle },
            { value: "both", label: "Both Email & WhatsApp", icon: Mail },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange("deliveryMethod", option.value)}
              className={`flex items-center gap-4 p-4 rounded-[20px] border-2 transition-all ${
                deliveryMethod === option.value
                  ? "border-[#c8143d] bg-white shadow-[0_8px_16px_rgba(200,20,61,0.1)]"
                  : "border-transparent bg-[#e9edf5] hover:bg-[#e9edf5]/80"
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                deliveryMethod === option.value
                  ? "border-[#c8143d] bg-[#c8143d]"
                  : "border-slate-300"
              }`}>
                {deliveryMethod === option.value && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <span className={`font-medium ${deliveryMethod === option.value ? "text-slate-900" : "text-slate-600"}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp Number */}
      {(deliveryMethod === "whatsapp" || deliveryMethod === "both") && (
        <div className="rounded-[24px] bg-[#e9edf5] p-5">
          <div className="space-y-3">
            <Label htmlFor="whatsappNumber" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <MessageCircle className="h-4 w-4 text-[#c8143d]" />
              WhatsApp Number *
            </Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="+234 800 000 0000"
              value={whatsappNumber || ""}
              onChange={(e) => handleChange("whatsappNumber", e.target.value)}
              className="rounded-xl border-slate-200 bg-white"
            />
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
              <p className="text-xs text-slate-500">Include country code (e.g., +234, +1, +44)</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2 rounded-full px-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2 rounded-full bg-gradient-to-r from-[#c8143d] to-[#d94a6d] hover:from-[#d94a6d] hover:to-[#c8143d] text-white shadow-lg shadow-red-200/50 px-6">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}