"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Check, Info, RefreshCw, Lock } from "lucide-react"
import { toast } from "sonner"
import { calculatePriceBreakdown, formatCurrency, getAllowedPaymentMethods } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/types"

function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const allChars = lowercase + uppercase + numbers + special
  
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  let password = ''
  password += lowercase[randomValues[0] % lowercase.length]
  password += uppercase[randomValues[1] % uppercase.length]
  password += numbers[randomValues[2] % numbers.length]
  password += special[randomValues[3] % special.length]
  
  for (let i = 4; i < length; i++) {
    password += allChars[randomValues[i] % allChars.length]
  }
  
  const chars = password.split('')
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1)
    const temp = chars[i]
    chars[i] = chars[j]
    chars[j] = temp
  }
  return chars.join('')
}

const PAYMENT_METHODS_CONFIG: Record<PaymentMethod, { name: string; description: string }> = {
  paypal: { name: "PayPal", description: "PayPal account or card" },
  paystack: { name: "PayStack", description: "Cards, Bank, USSD, Mobile" },
}

export function StepPayment() {
  const router = useRouter()
  const { formData, setPaymentMethod, setIpCountry, prevStep, resetForm, isNigeria, ipCountry } = useOrderStore()

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
  } = formData

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [ipDetected, setIpDetected] = useState(false)

  useEffect(() => {
    const detectCountry = async () => {
      if (ipDetected) return
      
      try {
        const res = await fetch("/api/geo")
        const data = await res.json()
        setIpCountry(data.country, data.countryCode, data.isNigeria)
        setIpDetected(true)
      } catch (err) {
        console.error("Failed to detect location:", err)
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
    if (!captchaToken) {
      fetchCaptcha()
      return
    }

    setIsVerifying(true)
    
    try {
      const res = await fetch("/api/captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: captchaToken,
          answer: parseInt(captchaInput)
        })
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

  const handleSubmitOrder = async () => {
    if (!captchaVerified) {
      toast.error("Please complete verification")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      let userId = user?.id
      let isNewUser = false

      if (!userId) {
        const tempPassword = generateSecurePassword(12)
        const fullName = email.split("@")[0]
        
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: { data: { full_name: fullName } },
        })

        if (signUpError) {
          console.log("Sign up error:", signUpError.message)
        }

        if (newUser?.user) {
          userId = newUser.user.id
          isNewUser = true
          
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          })
        }
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          email: email,
          status: "pending",
          payment_status: "unpaid",
          payment_method: paymentMethod,
          currency: pricing.currency,
          total_amount: pricing.total,
          services: services,
          customer_country: formData.customerCountry || null,
          customer_country_code: formData.customerCountryCode || null,
          delivery_method: deliverySpeed || "normal",
        })
        .select()
        .single()

      if (orderError) throw orderError

      const customerName = email.split("@")[0]
      
      if (isNewUser && userId) {
        try {
          await fetch('/api/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: 'Welcome! Your Account Has Been Created',
              type: 'welcome',
              data: { name: customerName }
            })
          })
        } catch (emailErr) {
          console.log('Welcome email error:', emailErr)
        }
      }

      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: `Order Confirmed - ${order.id.slice(0, 8).toUpperCase()}`,
            type: 'order_placed',
            data: { name: customerName, orderId: order.id, services: formData.services }
          })
        })
      } catch (emailErr) {
        console.log('Order confirmation email error:', emailErr)
      }

      resetForm()
      toast.success("Order created successfully! Check your email for login details.")
      router.push(`/order/confirmation?id=${order.id}`)
    } catch (error) {
      console.error("Order error:", error)
      toast.error("Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 font-outfit">
      <section className="p-3 border rounded">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded text-white", captchaVerified ? "bg-green-600" : "bg-[#c8143d]")}>
            {captchaVerified ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">!</span>}
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
                  isSelected
                    ? "border-[#c8143d] bg-[#fff7f9]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    isSelected
                      ? "border-[#c8143d]"
                      : "border-slate-300"
                  )}
                >
                  {isSelected && <div className="h-2 w-2 rounded-full bg-[#c8143d]" />}
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={isSelected}
                  onChange={() => setPaymentMethod(method)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{config.name}</p>
                  <p className="text-sm text-slate-500">{config.description}</p>
                </div>
              </label>
            )
          })}
        </div>
      </section>

      <section className="flex items-center justify-between p-3 border border-[#c8143d] bg-[#fff7f9] rounded">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-black">Total Amount</p>
          <p className="text-sm text-black mt-0.5">
            {pricing.currency === "NGN" ? "Naira" : "USD"} • {PAYMENT_METHODS_CONFIG[paymentMethod].name}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium uppercase tracking-wider text-black">Total</span>
          <p className="text-xl font-semibold text-[#c8143d]">{formatCurrency(pricing.total, pricing.currency)}</p>
        </div>
      </section>

      <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
        <Lock className="h-3 w-3" />
        <span>Your payment is secure and encrypted</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="h-9 px-3 rounded-md text-xs">
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back
        </Button>
        <Button onClick={handleSubmitOrder} disabled={!captchaVerified || isSubmitting} className="flex-1 h-9 rounded-md bg-[#c8143d] hover:bg-[#b01030] font-medium text-xs">
          {isSubmitting ? (
            <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Processing...</>
          ) : (
            <>Pay {formatCurrency(pricing.total, pricing.currency)}</>
          )}
        </Button>
      </div>
    </div>
  )
}
