"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CreditCard, Shield, Check, Info, Zap, Lock } from "lucide-react"
import { toast } from "sonner"
import { calculatePriceBreakdown, formatCurrency, getAllowedPaymentMethods } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/types"

const PAYMENT_METHODS_CONFIG: Record<PaymentMethod, { name: string; description: string; icon: string }> = {
  card: {
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Verve",
    icon: "💳",
  },
  paypal: {
    name: "PayPal",
    description: "PayPal account or card",
    icon: "🅿️",
  },
  paystack: {
    name: "PayStack",
    description: "Cards, Bank, USSD, Mobile",
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
      toast.success("Verification complete")
    }, 500)
  }

  const handleSubmitOrder = async () => {
    if (!captchaVerified) {
      toast.error("Please complete verification")
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

  return (
    <div className="space-y-8">
      {/* Security Verification */}
      <Card className={cn(
        "border-2 transition-colors",
        captchaVerified ? "border-green-200 bg-green-50/50" : "border-border"
      )}>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              captchaVerified ? "bg-green-500 text-white" : "bg-primary/10 text-primary"
            )}>
              {captchaVerified ? (
                <Check className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </div>
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {captchaVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">Verification complete</span>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click to verify you&apos;re human
              </p>
              <Button onClick={handleCaptcha} variant="outline" className="rounded-xl">
                Verify Now
              </Button>
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  This helps prevent automated orders
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <p className="text-sm">Secure payment with 256-bit SSL encryption</p>
          </div>

          <div className="space-y-3">
            {allowedMethods.map((method) => {
              const config = PAYMENT_METHODS_CONFIG[method]
              const isSelected = paymentMethod === method
              
              return (
                <div
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "group relative rounded-xl border-2 p-4 cursor-pointer transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-colors",
                      isSelected ? "bg-primary" : "bg-muted group-hover:bg-primary/10"
                    )}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{config.name}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(pricing.total, pricing.currency)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {pricing.currency === "NGN" ? "Naira" : "USD"} • {PAYMENT_METHODS_CONFIG[paymentMethod].name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2 rounded-xl px-6" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleSubmitOrder} 
          disabled={!captchaVerified || isSubmitting} 
          size="lg"
          className="gap-2 rounded-xl px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay {formatCurrency(pricing.total, pricing.currency)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
