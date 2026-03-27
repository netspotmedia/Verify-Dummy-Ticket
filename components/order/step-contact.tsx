"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="space-y-5">
      <div className="space-y-1">
        <Label className="text-sm font-medium uppercase tracking-wider text-black">
          Contact Information
        </Label>
        <p className="text-sm text-slate-600">
          Provide your contact details for document delivery and order updates.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail" className="text-sm text-black">Email Address *</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="your@email.com"
            value={contactEmail}
            onChange={(e) => handleChange("contactEmail", e.target.value)}
            className="h-10 rounded-lg border-slate-200 bg-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactPhone" className="text-sm text-black">Phone Number *</Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+234 800 000 0000"
            value={contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
            className="h-10 rounded-lg border-slate-200 bg-white text-sm"
          />
        </div>

        <div className="space-y-2 pt-1">
          <Label className="text-sm text-black">Delivery Method *</Label>
          <div className="flex gap-2">
            {[
              { value: "email", label: "Email" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "both", label: "Both" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange("deliveryMethod", option.value)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  deliveryMethod === option.value
                    ? "bg-[#c8143d]/10 text-[#c8143d] ring-1 ring-[#c8143d]/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {(deliveryMethod === "whatsapp" || deliveryMethod === "both") && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="whatsappNumber" className="text-sm text-black">WhatsApp Number *</Label>
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="+234 800 000 0000"
              value={whatsappNumber || ""}
              onChange={(e) => handleChange("whatsappNumber", e.target.value)}
              className="h-10 rounded-lg border-slate-200 bg-white text-sm"
            />
            <p className="text-sm text-slate-400">Include country code (e.g., +234, +1)</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-10 px-4 rounded-lg">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="flex-1 h-10 rounded-lg bg-[#c8143d] hover:bg-[#b01030] font-medium">
          Continue
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}