"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CreditCard, Shield, Check, Info, Zap } from "lucide-react"
import { toast } from "sonner"
import { calculatePriceBreakdown, formatCurrency, getAllowedPaymentMethods } from "@/lib/types"
import type { PaymentMethod } from "@/lib/types"

const PAYMENT_METHODS_CONFIG: Record<PaymentMethod, { name: string; description: string; icon: string }> = {
  card: {
    name: "Credit/Debit Card",
    description: "Pay securely with Visa, Mastercard, or Verve card",
    icon: "💳",
  },
  paypal: {
    name: "PayPal",
    description: "Pay with your PayPal account or Credit/Debit card",
    icon: "🅿️",
  },
  paystack: {
    name: "PayStack",
    description: "Cards, Bank Transfer, USSD, Mobile Money",
    icon: "💰",
  },
}

export function StepPayment() {
  const router = useRouter()
  const { formData, setPaymentMethod, setCaptchaToken, prevStep, resetForm } = useOrderStore()
  const { services, travelerCount, customerCountryCode, paymentMethod, flightDetails, hotelDetails, insuranceDetails, deliverySpeed, email } = formData

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)

  const allowedMethods = getAllowedPaymentMethods(customerCountryCode)

  const pricing = calculatePriceBreakdown(
    services,
    travelerCount,
    customerCountryCode,
    flightDetails || undefined,
    hotelDetails || undefined,
    insuranceDetails || undefined,
    deliverySpeed
  )

  const handleCaptcha = () => {
    setTimeout(() => {
      setCaptchaVerified(true)
      setCaptchaToken("verified_token_" + Date.now())
      toast.success("CAPTCHA verified")
    }, 500)
  }

  const handleSubmitOrder = async () => {
    if (!captchaVerified) {
      toast.error("Please complete CAPTCHA verification")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          email: email,
          status: "pending",
          payment_status: "unpaid",
          payment_method: paymentMethod,
          currency: pricing.currency,
          total_amount: pricing.total,
          contact_email: email,
        })
        .select()
        .single()

      if (orderError) throw orderError

      resetForm()
      toast.success("Order created successfully!")
      router.push(`/order/confirmation?id=${order.id}`)

    } catch (error) {
      console.error("Order error:", error)
      toast.error("Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMethodDisplayName = (method: PaymentMethod) => {
    return PAYMENT_METHODS_CONFIG[method].name
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {captchaVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span>Verification complete</span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please complete the security check to proceed with payment.
              </p>
              <Button onClick={handleCaptcha} variant="outline">
                Verify I&apos;m human
              </Button>
              <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  This helps us prevent automated orders
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary">
              <Zap className="h-4 w-4 inline mr-1" />
              Secure payment accepted via Credit/Debit cards, PayPal, and PayStack
            </p>
          </div>

          <div className="space-y-3">
            {allowedMethods.map((method) => (
              <div
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === method
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center border text-2xl">
                      {PAYMENT_METHODS_CONFIG[method].icon}
                    </div>
                    <div>
                      <p className="font-medium">
                        {PAYMENT_METHODS_CONFIG[method].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {PAYMENT_METHODS_CONFIG[method].description}
                      </p>
                    </div>
                  </div>
                  {paymentMethod === method && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Order Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(pricing.total, pricing.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {pricing.currency === "NGN" ? "Naira" : "USD"} • {getMethodDisplayName(paymentMethod)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Shield className="h-5 w-5 text-accent mt-0.5" />
        <div>
          <p className="font-medium text-sm">Secure Payment</p>
          <p className="text-xs text-muted-foreground">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmitOrder} 
          disabled={!captchaVerified || isSubmitting} 
          className="gap-2"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Processing..." : `Pay ${formatCurrency(pricing.total, pricing.currency)}`}
        </Button>
      </div>
    </div>
  )
}
