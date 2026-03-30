"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCaptchaSecret } from "@/lib/captcha"
import { calculatePriceBreakdown, type DeliverySpeed, type ServiceType } from "@/lib/types"

const CAPTCHA_EXPIRY = 5 * 60 * 1000

function amountsMatch(expected: number, provided: number, currency: string): boolean {
  const tolerance = currency === "NGN" ? 1 : 0.01
  return Math.abs(expected - provided) <= tolerance
}

function verifyCaptchaToken(token: string, secret: string): boolean {
  if (!token) return false
  
  try {
    const parts = token.split(".")
    if (parts.length !== 2) return false
    
    const [payloadBase64, signature] = parts

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadBase64)
      .digest("base64url")
    
    if (signature !== expectedSignature) return false
    
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString())
    if (Date.now() - payload.timestamp > CAPTCHA_EXPIRY) return false
    
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const captchaSecret = getCaptchaSecret()
    if (!captchaSecret) {
      return NextResponse.json({ error: "CAPTCHA is not configured" }, { status: 503 })
    }

    const {
      captchaToken,
      services,
      travelers,
      flightDetails,
      hotelDetails,
      insuranceDetails,
      currency,
      totalAmount,
      paymentMethod,
      paymentReference,
      customerCountry,
      customerCountryCode,
      deliveryMethod,
    } = body

    if (!verifyCaptchaToken(captchaToken, captchaSecret)) {
      return NextResponse.json({ error: "Invalid or expired CAPTCHA" }, { status: 400 })
    }

    const travelerCount = Array.isArray(travelers) && travelers.length > 0 ? travelers.length : 1
    const deliverySpeed = (deliveryMethod || "normal") as DeliverySpeed
    const normalizedServices = (Array.isArray(services) ? services : []) as ServiceType[]
    const isNigeria = currency === "NGN"

    const pricing = calculatePriceBreakdown(
      normalizedServices,
      travelerCount,
      isNigeria,
      flightDetails,
      hotelDetails,
      insuranceDetails,
      deliverySpeed
    )

    if (!amountsMatch(pricing.total, Number(totalAmount), currency)) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 })
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        email: user?.email || body.email || "unknown@example.com",
        status: "pending",
        services: normalizedServices,
        currency,
        total_amount: pricing.total,
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        payment_status: "pending",
        customer_country: customerCountry || null,
        customer_country_code: customerCountryCode || null,
        delivery_method: deliveryMethod || "normal",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    if (travelers && Array.isArray(travelers)) {
      for (const traveler of travelers) {
        const { error: travelerError } = await supabase.from("travelers").insert({
          order_id: order.id,
          first_name: traveler.firstName,
          last_name: traveler.lastName,
          nationality: traveler.nationality,
          passport_number: traveler.passportNumber,
          email: traveler.email,
        })

        if (travelerError) {
          console.error("Traveler creation error:", travelerError)
        }
      }
    }

    if (services?.includes("flight") && flightDetails) {
      const { error: flightError } = await supabase.from("flight_details").insert({
        order_id: order.id,
        departure_city: flightDetails.departureCity,
        arrival_city: flightDetails.arrivalCity,
        departure_date: flightDetails.departureDate,
        return_date: flightDetails.returnDate || null,
        preferred_airline: flightDetails.preferredAirline || null,
      })

      if (flightError) {
        console.error("Flight details error:", flightError)
      }
    }

    if (services?.includes("hotel") && hotelDetails) {
      const { error: hotelError } = await supabase.from("hotel_details").insert({
        order_id: order.id,
        city: hotelDetails.city,
        check_in_date: hotelDetails.checkInDate,
        check_out_date: hotelDetails.checkOutDate,
        hotel_name: hotelDetails.hotelName || null,
      })

      if (hotelError) {
        console.error("Hotel details error:", hotelError)
      }
    }

    if (services?.includes("insurance") && insuranceDetails) {
      const { error: insuranceError } = await supabase.from("insurance_details").insert({
        order_id: order.id,
        coverage_type: insuranceDetails.coverageType,
        start_date: insuranceDetails.startDate,
        end_date: insuranceDetails.endDate,
        coverage_amount: insuranceDetails.coverageAmount,
      })

      if (insuranceError) {
        console.error("Insurance details error:", insuranceError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.order_number 
    })
  } catch (error) {
    console.error("Order submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
