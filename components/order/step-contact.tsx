"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, ArrowRight, Mail, Phone, MessageCircle } from "lucide-react"

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
      <p className="text-sm text-muted-foreground">
        {"Please provide your contact details. We'll use these to deliver your documents and for any order updates."}
      </p>

      {/* Contact Email */}
      <div className="space-y-2">
        <Label htmlFor="contactEmail" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Address *
        </Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="your@email.com"
          value={contactEmail}
          onChange={(e) => handleChange("contactEmail", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Documents will be sent to this email address
        </p>
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="contactPhone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number *
        </Label>
        <Input
          id="contactPhone"
          type="tel"
          placeholder="+234 800 000 0000"
          value={contactPhone}
          onChange={(e) => handleChange("contactPhone", e.target.value)}
        />
      </div>

      {/* Delivery Method */}
      <div className="space-y-3">
        <Label>Preferred Delivery Method *</Label>
        <RadioGroup
          value={deliveryMethod}
          onValueChange={(value) => handleChange("deliveryMethod", value)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="email" id="delivery-email" />
            <Label htmlFor="delivery-email" className="cursor-pointer flex items-center gap-2 flex-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Only
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="whatsapp" id="delivery-whatsapp" />
            <Label htmlFor="delivery-whatsapp" className="cursor-pointer flex items-center gap-2 flex-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              WhatsApp Only
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="both" id="delivery-both" />
            <Label htmlFor="delivery-both" className="cursor-pointer flex items-center gap-2 flex-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Both Email & WhatsApp
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* WhatsApp Number */}
      {(deliveryMethod === "whatsapp" || deliveryMethod === "both") && (
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Number *
          </Label>
          <Input
            id="whatsappNumber"
            type="tel"
            placeholder="+234 800 000 0000"
            value={whatsappNumber || ""}
            onChange={(e) => handleChange("whatsappNumber", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Include country code (e.g., +234, +1, +44)
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2">
          Continue to Payment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
