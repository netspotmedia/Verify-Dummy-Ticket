"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CreditCard, Shield, Check, Info } from "lucide-react"
import { toast } from "sonner"
import { calculatePriceBreakdown, formatCurrency, getAllowedPaymentMethods } from "@/lib/types"
import type { PaymentMethod } from "@/lib/types"

export function StepPayment() {
  const router = useRouter()
  const { formData, setPaymentMethod, setCaptchaToken, prevStep, resetForm } = useOrderStore()
  const { services, travelerCount, customerCountryCode, paymentMethod, flightDetails, hotelDetails, insuranceDetails, deliverySpeed, email } = formData

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)

  const isNigeria = customerCountryCode === "NG"
  const allowedMethods = getAllowedPaymentMethods(customerCountryCode)

  // Calculate pricing
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
    // Simulate CAPTCHA verification
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
      
      // Get current user (optional - orders can be placed by guests)
      const { data: { user } } = await supabase.auth.getUser()

      // Create order
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

      // TODO: Initialize payment gateway (Paystack/PayPal)
      // For now, just show success
      
      // Reset form and redirect
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
    <div className="space-y-6">
      {/* CAPTCHA */}
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
                Verify I'm human
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

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isNigeria && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Notice:</strong> Prices are shown in Naira (NGN). Payment is available via Paystack only.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {allowedMethods.map((method) => (
              <div
                key={method}
                onClick={() => !isNigeria && setPaymentMethod(method)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === method
                    ? "border-primary bg-primary/5"
                    : isNigeria
                    ? "border-muted-foreground/30 cursor-not-allowed opacity-50"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-16 bg-background rounded flex items-center justify-center border">
                      <span className="font-bold text-sm">
                        {method === "paypal" ? "PayPal" : "Paystack"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {method === "paypal" ? "Pay with PayPal" : "Pay with Paystack"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method === "paypal"
                          ? "Secure payment via PayPal (USD)"
                          : `Secure payment via Paystack (${pricing.currency})`}
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

      {/* Order Total */}
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
                {pricing.currency === "NGN" ? "Naira" : "USD"} • {paymentMethod === "paypal" ? "PayPal" : "Paystack"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
        <Shield className="h-5 w-5 text-accent mt-0.5" />
        <div>
          <p className="font-medium text-sm">Secure Payment</p>
          <p className="text-xs text-muted-foreground">
            Your payment information is encrypted and secure. We never store your card details.
          </p>
        </div>
      </div>

      {/* Navigation */}
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
