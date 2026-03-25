"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrderStore } from "@/lib/order-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { calculatePrice, SERVICE_PRICES } from "@/lib/types"
import { ArrowLeft, Loader2, CreditCard, CheckCircle2, Shield, Plane, Building2 } from "lucide-react"
import { toast } from "sonner"

export function StepPayment() {
  const router = useRouter()
  const { formData, prevStep, resetForm } = useOrderStore()
  const [couponCode, setCouponCode] = useState(formData.couponCode || "")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { services, numberOfTravelers, currency, paymentMethod } = formData
  const pricing = calculatePrice(services, numberOfTravelers, currency, discount)

  const formatCurrency = (amount: number) => {
    if (currency === "USD") return `$${amount.toFixed(2)}`
    return `₦${amount.toLocaleString()}`
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setIsApplyingCoupon(true)
    
    // Simulate coupon validation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Demo coupon codes
    if (couponCode.toUpperCase() === "SAVE10") {
      setDiscount(10)
      toast.success("Coupon applied! 10% discount")
    } else if (couponCode.toUpperCase() === "WELCOME20") {
      setDiscount(20)
      toast.success("Coupon applied! 20% discount")
    } else {
      toast.error("Invalid coupon code")
    }
    
    setIsApplyingCoupon(false)
  }

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      // Get current user (optional - orders can be placed by guests)
      const { data: { user } } = await supabase.auth.getUser()

      // Create order in database
      const orderData = {
        user_id: user?.id || null,
        status: "pending",
        payment_status: "unpaid",
        payment_method: paymentMethod,
        currency: currency,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        total: pricing.total,
        coupon_code: discount > 0 ? couponCode : null,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        whatsapp_number: formData.whatsappNumber,
        delivery_method: formData.deliveryMethod,
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // Create services
      for (const service of services) {
        const serviceData = {
          order_id: order.id,
          service_type: service,
          price: SERVICE_PRICES[service][currency] * numberOfTravelers,
          status: "pending",
        }

        const { data: serviceRecord, error: serviceError } = await supabase
          .from("order_services")
          .insert(serviceData)
          .select()
          .single()

        if (serviceError) throw serviceError

        // Add service-specific details
        if (service === "flight" && formData.flightDetails) {
          await supabase.from("flight_details").insert({
            service_id: serviceRecord.id,
            trip_type: formData.tripType,
            departure_city: formData.flightDetails.departureCity,
            arrival_city: formData.flightDetails.arrivalCity,
            departure_date: formData.flightDetails.departureDate,
            return_date: formData.flightDetails.returnDate,
            preferred_airline: formData.flightDetails.preferredAirline,
          })
        }

        if (service === "hotel" && formData.hotelDetails) {
          await supabase.from("hotel_details").insert({
            service_id: serviceRecord.id,
            city: formData.hotelDetails.city,
            check_in_date: formData.hotelDetails.checkInDate,
            check_out_date: formData.hotelDetails.checkOutDate,
            hotel_name: formData.hotelDetails.hotelName,
          })
        }

        if (service === "insurance" && formData.insuranceDetails) {
          await supabase.from("insurance_details").insert({
            service_id: serviceRecord.id,
            destination: formData.insuranceDetails.destination,
            start_date: formData.insuranceDetails.startDate,
            end_date: formData.insuranceDetails.endDate,
            coverage_amount: formData.insuranceDetails.coverageAmount,
          })
        }
      }

      // Create travelers
      for (const traveler of formData.travelers) {
        await supabase.from("travelers").insert({
          order_id: order.id,
          first_name: traveler.firstName,
          last_name: traveler.lastName,
          email: traveler.email,
          phone: traveler.phone,
          date_of_birth: traveler.dateOfBirth,
          nationality: traveler.nationality,
          passport_number: traveler.passportNumber,
        })
      }

      // Reset form and redirect
      resetForm()
      toast.success("Order created successfully!")
      
      // Redirect to payment page or confirmation
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
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Services */}
          {services.includes("flight") && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span>Flight Itinerary x{numberOfTravelers}</span>
              </div>
              <span>{formatCurrency(pricing.flightPrice)}</span>
            </div>
          )}
          {services.includes("hotel") && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Hotel Booking x{numberOfTravelers}</span>
              </div>
              <span>{formatCurrency(pricing.hotelPrice)}</span>
            </div>
          )}
          {services.includes("insurance") && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Travel Insurance x{numberOfTravelers}</span>
              </div>
              <span>{formatCurrency(pricing.insurancePrice)}</span>
            </div>
          )}

          <Separator />

          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(pricing.subtotal)}</span>
          </div>

          {/* Discount */}
          {pricing.discount > 0 && (
            <div className="flex items-center justify-between text-sm text-accent">
              <span>Discount ({discount}%)</span>
              <span>-{formatCurrency(pricing.discount)}</span>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(pricing.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <div className="space-y-2">
        <Label htmlFor="coupon">Coupon Code (Optional)</Label>
        <div className="flex gap-2">
          <Input
            id="coupon"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={discount > 0}
          />
          <Button
            type="button"
            variant="outline"
            onClick={applyCoupon}
            disabled={isApplyingCoupon || discount > 0}
          >
            {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </div>
        {discount > 0 && (
          <p className="text-sm text-accent flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Coupon applied: {discount}% off
          </p>
        )}
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-16 bg-background rounded flex items-center justify-center border">
                <span className="font-bold text-sm">
                  {paymentMethod === "paypal" ? "PayPal" : "Paystack"}
                </span>
              </div>
              <div>
                <p className="font-medium">
                  {paymentMethod === "paypal" ? "Pay with PayPal" : "Pay with Paystack"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentMethod === "paypal"
                    ? "Secure payment via PayPal (USD)"
                    : "Secure payment via Paystack (NGN)"}
                </p>
              </div>
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

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Processing..." : `Pay ${formatCurrency(pricing.total)}`}
        </Button>
      </div>
    </div>
  )
}
