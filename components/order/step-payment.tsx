"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, RefreshCw, Shield, LogIn, Tag, X, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { calculatePriceBreakdown, getAllowedPaymentMethods } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { PaymentMethod, Currency } from "@/lib/types"
import { Input } from "@/components/ui/input"

function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString()}`
  }
  return `$${amount.toFixed(2)}`
}

const PAYMENT_METHODS_CONFIG: Record<PaymentMethod, { name: string; description: string }> = {
  paypal: { name: "PayPal", description: "PayPal account or card" },
  paystack: { name: "PayStack", description: "Cards, Bank, USSD, Mobile" },
}

export function StepPayment() {
  const router = useRouter()
  const { formData, setPaymentMethod, setIpCountry, prevStep, resetForm, isNigeria, ipCountry, setCoupon, clearCoupon } = useOrderStore()

  const {
    services,
    travelerCount,
    currency,
    paymentMethod,
    flightDetails,
    hotelDetails,
    insuranceDetails,
    deliverySpeed,
    email,
    couponCode,
    couponDiscount,
  } = formData

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [ipDetected, setIpDetected] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [couponInput, setCouponInput] = useState(couponCode || "")
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const detectCountry = async () => {
      if (ipDetected) return
      try {
        const res = await fetch("/api/geo")
        const data = await res.json()
        setIpCountry(data.country, data.countryCode, data.isNigeria)
        setIpDetected(true)
      } catch (err) {
        setIpCountry("Unknown", "US", false)
        setIpDetected(true)
      }
    }
    detectCountry()
  }, [ipDetected, setIpCountry])

  const allowedMethods = getAllowedPaymentMethods(isNigeria)

  const pricing = calculatePriceBreakdown(
    services,
    travelerCount,
    isNigeria,
    flightDetails || undefined,
    hotelDetails || undefined,
    insuranceDetails || undefined,
    deliverySpeed
  )

  const [captchaToken, setCaptchaTokenState] = useState<string | null>(null)
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const fetchCaptcha = useCallback(async () => {
    try {
      const res = await fetch("/api/captcha")
      const data = await res.json()
      setCaptchaTokenState(data.token)
      setCaptchaQuestion(data.question)
      setCaptchaInput("")
      setCaptchaVerified(false)
    } catch (err) {
      console.error("Failed to fetch captcha:", err)
    }
  }, [])

  useEffect(() => {
    fetchCaptcha()
  }, [fetchCaptcha])

  const handleCaptcha = async () => {
    if (!captchaToken) { fetchCaptcha(); return }
    setIsVerifying(true)
    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken, answer: parseInt(captchaInput) })
      })
      const result = await res.json()
      if (result.valid) {
        setCaptchaVerified(true)
        toast.success("Verification complete")
      } else {
        toast.error(result.error || "Incorrect answer. Please try again.")
        fetchCaptcha()
      }
    } catch (err) {
      toast.error("Verification failed. Please try again.")
      fetchCaptcha()
    }
    setIsVerifying(false)
  }

  const discountedTotal = couponDiscount
    ? Math.max(0, pricing.total - (pricing.total * couponDiscount) / 100)
    : pricing.total

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setIsValidatingCoupon(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (data.valid) {
        setCoupon(code, data.discountPercent)
        toast.success(`Coupon applied — ${data.discountPercent}% off!`)
      } else {
        toast.error(data.error || "Invalid coupon code")
        clearCoupon()
      }
    } catch {
      toast.error("Could not validate coupon. Please try again.")
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (!captchaVerified || !captchaToken) {
      toast.error("Please complete verification")
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create the order record
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaToken,
          email: email.toLowerCase(),
          services,
          travelers: formData.travelers,
          flightDetails,
          hotelDetails,
          insuranceDetails,
          currency: pricing.currency,
          totalAmount: pricing.total,
          paymentMethod,
          customerCountry: formData.customerCountry,
          customerCountryCode: formData.customerCountryCode,
          deliveryMethod: deliverySpeed,
          couponCode: couponCode || undefined,
        }),
      })

      const orderResult = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || "Failed to create order")
      }

      const { orderId, orderNumber } = orderResult
      const customerName = email.split("@")[0]

      // Step 2: Send order confirmation email
      try {
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            subject: `Order Received - ${orderNumber || orderId?.slice(0, 8).toUpperCase()}`,
            type: "order_placed",
            data: { name: customerName, orderId, orderNumber, services: formData.services },
          }),
        })
      } catch (emailErr) {
        console.error("Order confirmation email error:", emailErr)
      }

      // Step 3: Initialize payment gateway
      if (paymentMethod === "paystack") {
        const payRes = await fetch("/api/payments/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: pricing.total,
            email: email.toLowerCase(),
            currency: pricing.currency,
          }),
        })

        const payData = await payRes.json()

        if (!payRes.ok || !payData.authorizationUrl) {
          throw new Error(payData.error || "Failed to initialize PayStack payment")
        }

        // Reset form before redirect so it doesn't persist stale state
        resetForm()
        // Redirect to PayStack checkout
        window.location.href = payData.authorizationUrl

      } else if (paymentMethod === "paypal") {
        const payRes = await fetch("/api/payments/paypal/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            amount: pricing.total,
            currency: pricing.currency,
            email: email.toLowerCase(),
          }),
        })

        const payData = await payRes.json()

        if (!payRes.ok || !payData.approvalUrl) {
          throw new Error(payData.error || "Failed to initialize PayPal payment")
        }

        resetForm()
        // Redirect to PayPal approval page
        window.location.href = payData.approvalUrl

      } else {
        // Fallback: no payment gateway configured — go straight to confirmation
        resetForm()
        toast.success("Order created successfully!")
        router.push(`/order/confirmation?id=${orderId}`)
      }

    } catch (error) {
      console.error("Order/payment error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoggedIn === false) {
    return (
      <div className="space-y-4 font-outfit">
        <div className="rounded-xl border border-[#c8143d]/20 bg-[#fff5f6] p-5 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#c8143d]/10">
            <LogIn className="h-5 w-5 text-[#c8143d]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Sign in to complete your order</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a free account or sign in so your order appears in your dashboard and you can track it anytime.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] text-xs font-medium"
              onClick={() => router.push(`/auth/login?next=${encodeURIComponent("/order")}`)}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-9 rounded-md text-xs"
              onClick={() => router.push(`/auth/register?next=${encodeURIComponent("/order")}`)}
            >
              Create Account
            </Button>
          </div>
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-600 underline"
            onClick={() => setIsLoggedIn(true)}
          >
            Continue as guest (order won&apos;t appear in dashboard)
          </button>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={prevStep} className="h-9 px-3 rounded-md text-xs">
            <ArrowLeft className="mr-1 h-3 w-3" />Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-outfit">
      {/* Security verification */}
      <section className="p-3 border rounded">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded text-white", captchaVerified ? "bg-green-600" : "bg-[#c8143d]")}>
            {captchaVerified ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <span className="text-xs font-bold">!</span>
            )}
          </div>
          <Label className="text-sm font-medium uppercase tracking-wider text-black">Security Verification</Label>
        </div>

        {captchaVerified ? (
          <div className="p-2 bg-green-50 rounded text-xs text-green-700 font-medium">
            Verification complete
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-slate-100 rounded font-mono text-sm font-bold text-slate-700">
                {captchaQuestion}
              </div>
              <span className="text-slate-400">=</span>
              <input
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && captchaInput && handleCaptcha()}
                placeholder="?"
                className="h-8 w-14 rounded-md border border-slate-200 px-2 text-center text-sm font-bold focus:border-[#c8143d] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCaptcha} disabled={!captchaInput || isVerifying} variant="outline" className="h-8 px-3 rounded-md text-xs">
                {isVerifying ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Verify"}
              </Button>
              <button type="button" onClick={fetchCaptcha} className="text-sm text-slate-500 hover:text-[#c8143d]">
                Refresh
              </button>
            </div>
            <p className="text-sm text-slate-500">Solve the math problem to verify you&apos;re human.</p>
          </div>
        )}
      </section>

      {/* Payment method selection */}
      <section className="space-y-2">
        <div>
          <Label className="text-sm font-medium uppercase tracking-wider text-black">Payment Method</Label>
          <p className="text-sm text-black mt-0.5">Choose a secure payment option</p>
        </div>

        <div className="space-y-1">
          {allowedMethods.map((method) => {
            const config = PAYMENT_METHODS_CONFIG[method]
            const isSelected = paymentMethod === method
            return (
              <label
                key={method}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded cursor-pointer border transition-all",
                  isSelected ? "border-[#c8143d] bg-[#fff7f9]" : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center shrink-0", isSelected ? "border-[#c8143d]" : "border-slate-300")}>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-[#c8143d]" />}
                </div>
                <input type="radio" name="paymentMethod" checked={isSelected} onChange={() => setPaymentMethod(method)} className="sr-only" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{config.name}</p>
                  <p className="text-sm text-slate-500">{config.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      {/* Coupon code */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Have a promo code?</span>
        </div>
        {couponDiscount ? (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span className="flex-1 text-sm text-green-800 font-medium">{couponCode} — {couponDiscount}% off</span>
            <button
              type="button"
              onClick={() => { clearCoupon(); setCouponInput("") }}
              className="text-green-600 hover:text-green-800"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              className="h-9 rounded-md border-slate-200 bg-white text-sm font-mono flex-1"
              maxLength={30}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={!couponInput.trim() || isValidatingCoupon}
              className="h-9 px-3 rounded-md text-xs shrink-0"
            >
              {isValidatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Apply"}
            </Button>
          </div>
        )}
      </section>

      {/* Order total */}
      <section className="p-3 border border-[#c8143d] bg-[#fff7f9] rounded space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Subtotal</p>
          <p className="text-sm text-slate-700">{formatCurrency(pricing.total, pricing.currency)}</p>
        </div>
        {couponDiscount && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-green-600">Promo ({couponDiscount}% off)</p>
            <p className="text-sm text-green-600">-{formatCurrency(pricing.total - discountedTotal, pricing.currency)}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-[#c8143d]/20">
          <p className="text-sm font-medium uppercase tracking-wider text-black">Total</p>
          <p className="text-xl font-semibold text-[#c8143d]">{formatCurrency(discountedTotal, pricing.currency)}</p>
        </div>
        <p className="text-xs text-slate-400">{pricing.currency === "NGN" ? "Naira" : "USD"} &bull; {PAYMENT_METHODS_CONFIG[paymentMethod].name}</p>
      </section>

      <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
        <Shield className="h-3 w-3" />
        <span>Your payment is secure and encrypted</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="h-9 px-3 rounded-md text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />Back
        </Button>
        <Button
          onClick={handleSubmitOrder}
          disabled={!captchaVerified || isSubmitting}
          className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] font-medium text-xs"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Processing...</>
          ) : (
            <>Pay {formatCurrency(discountedTotal, pricing.currency)} via {PAYMENT_METHODS_CONFIG[paymentMethod].name}</>
          )}
        </Button>
      </div>
    </div>
  )
}
