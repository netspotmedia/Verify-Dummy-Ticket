"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, CreditCard, Shield, Check, Info, Zap, Lock, RefreshCw } from "lucide-react"
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

const PAYMENT_METHODS_CONFIG: Record<
  PaymentMethod,
  { name: string; description: string; icon: string }
> = {
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
  const { formData, setPaymentMethod, setCaptchaToken, prevStep, resetForm } =
    useOrderStore()

  const {
    services,
    travelerCount,
    customerCountryCode,
    paymentMethod,
    flightDetails,
    hotelDetails,
    insuranceDetails,
    deliverySpeed,
    email,
  } = formData

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

  const [captchaQuestion, setCaptchaQuestion] = useState<{ question: string; answer: number } | null>(null)
  const [captchaInput, setCaptchaInput] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const generateCaptcha = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1
    const b = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion({ question: `${a} + ${b} = ?`, answer: a + b })
    setCaptchaInput("")
    setCaptchaVerified(false)
  }, [])

  useEffect(() => {
    generateCaptcha()
  }, [generateCaptcha])

  const handleCaptcha = async () => {
    if (!captchaQuestion) {
      generateCaptcha()
      return
    }

    setIsVerifying(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (parseInt(captchaInput) === captchaQuestion.answer) {
      setCaptchaVerified(true)
      setCaptchaToken("verified_" + Date.now())
      toast.success("Verification complete")
    } else {
      toast.error("Incorrect answer. Please try again.")
      generateCaptcha()
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let userId = user?.id
      let isNewUser = false

      if (!userId) {
        const tempPassword = generateSecurePassword(12)
        const fullName = email.split("@")[0]
        
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: {
              full_name: fullName,
            },
          },
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
          contact_email: email,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Send emails
      const customerName = email.split("@")[0]
      
      // Send welcome email for new users
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

      // Send order confirmation
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
    <div className="space-y-8">
      <section
        className={cn(
          "rounded-[30px] p-5 transition-all",
          captchaVerified ? "bg-[#edf9f0]" : "bg-[#eef2fa]"
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm",
              captchaVerified
                ? "bg-[#16a34a] text-white"
                : "bg-white text-[#c8143d]"
            )}
          >
            {captchaVerified ? (
              <Check className="h-5 w-5" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
          </div>

          <div>
            <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
              Security Verification
            </Label>
            <p className="mt-1 text-sm text-slate-500">
              Complete verification before payment
            </p>
          </div>
        </div>

        {captchaVerified ? (
          <div className="rounded-[22px] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 text-[#15803d]">
              <Check className="h-5 w-5" />
              <span className="font-semibold">Verification complete</span>
            </div>
          </div>
        ) : (
            <div className="space-y-4 rounded-[22px] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 font-mono text-lg font-bold text-slate-700">
                  {captchaQuestion?.question}
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="?"
                  className="h-10 w-20 rounded-lg border border-slate-200 px-3 text-center text-lg font-bold focus:border-[#c8143d] focus:outline-none"
                />
              </div>

              <Button
                onClick={handleCaptcha}
                disabled={!captchaInput || isVerifying}
                variant="outline"
                className="h-11 rounded-full border-[#ead8dd] bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-[#fff7f9]"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={generateCaptcha}
                className="text-xs text-slate-500 hover:text-[#c8143d]"
              >
                Refresh Challenge
              </Button>

              <div className="flex items-start gap-3 rounded-[18px] bg-[#f7f5f4] p-3 text-sm text-slate-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Solve the math problem to verify you&apos;re human.</span>
              </div>
            </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <Label className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7d6670]">
            Payment Method
          </Label>
          <p className="mt-1 text-sm text-slate-500">
            Choose a secure payment option
          </p>
        </div>

        <div className="rounded-[24px] bg-[#eef2fa] p-4">
          <div className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1f4] text-[#c8143d]">
              <Zap className="h-4 w-4" />
            </div>
            <p className="text-sm text-slate-600">
              Secure payment with 256-bit SSL encryption
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {allowedMethods.map((method) => {
              const config = PAYMENT_METHODS_CONFIG[method]
              const isSelected = paymentMethod === method

              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-[26px] p-[1px] text-left transition-all",
                    isSelected
                      ? "bg-gradient-to-r from-[#c8143d] via-[#d94a6d] to-[#efc5d0] shadow-[0_16px_30px_rgba(200,20,61,0.12)]"
                      : "bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-4 rounded-[25px] px-5 py-5 transition-all",
                      isSelected
                        ? "bg-white"
                        : "bg-[#e9edf5] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.05)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-all",
                        isSelected
                          ? "bg-[#c8143d] text-white"
                          : "bg-white text-slate-600 shadow-sm"
                      )}
                    >
                      {config.icon}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{config.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {config.description}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full transition-all",
                        isSelected
                          ? "bg-[#c8143d] text-white"
                          : "border border-slate-300 bg-white text-transparent"
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-[#eef2fa] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#c8143d] shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
                Total Amount
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {pricing.currency === "NGN" ? "Naira" : "USD"} •{" "}
                {PAYMENT_METHODS_CONFIG[paymentMethod].name}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a27f88]">
              Total
            </p>
            <p className="mt-1 text-3xl font-semibold text-[#c8143d]">
              {formatCurrency(pricing.total, pricing.currency)}
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <Lock className="h-4 w-4" />
        <span>Your payment is secure and encrypted</span>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="gap-2 rounded-full px-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmitOrder} disabled={!captchaVerified || isSubmitting} className="gap-2 rounded-full bg-gradient-to-r from-[#c8143d] to-[#d94a6d] hover:from-[#d94a6d] hover:to-[#c8143d] text-white shadow-lg shadow-red-200/50 px-6">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay {formatCurrency(pricing.total, pricing.currency)}</>
          )}
        </Button>
      </div>
    </div>
  )
}