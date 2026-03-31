"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCaptchaSecret } from "@/lib/captcha"
import { calculatePriceBreakdown } from "@/lib/types"
import type { ServiceType, DeliverySpeed } from "@/lib/types"

const CAPTCHA_EXPIRY = 5 * 60 * 1000

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

function amountsMatch(calculated: number, submitted: number, currency: string): boolean {
  // Allow ±5% tolerance for floating point / rate differences
  const tolerance = 0.05
  const diff = Math.abs(calculated - submitted) / (calculated || 1)
  return diff <= tolerance
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
      email,
    } = body

    if (!verifyCaptchaToken(captchaToken, captchaSecret)) {
      return NextResponse.json({ error: "Invalid or expired CAPTCHA" }, { status: 400 })
    }

    const travelerCount = Array.isArray(travelers) && travelers.length > 0 ? travelers.length : 1
    const deliverySpeed = (deliveryMethod || "normal") as DeliverySpeed
    const normalizedServices = (Array.isArray(services) ? services : []) as ServiceType[]
    const isNigeria = currency === "NGN"

    // Validate total amount
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
      console.warn("Amount mismatch", { calculated: pricing.total, submitted: totalAmount })
      // Don't block — just log for now. Uncomment below to enforce strictly:
      // return NextResponse.json({ error: "Invalid order total" }, { status: 400 })
    }

    // Create the order
    const orderEmail = email || user?.email || "unknown@example.com"

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        email: orderEmail,
        status: "pending",
        services: normalizedServices,
        currency,
        total_amount: pricing.total,
        payment_method: paymentMethod || "paystack",
        payment_reference: paymentReference || null,
        payment_status: "pending",
        customer_country: customerCountry || null,
        customer_country_code: customerCountryCode || null,
        delivery_method: deliverySpeed,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order: " + orderError.message }, { status: 500 })
    }

    // Create travelers
    if (travelers && Array.isArray(travelers)) {
      for (const traveler of travelers) {
        const { error: travelerError } = await supabase.from("travelers").insert({
          order_id: order.id,
          first_name: traveler.firstName || traveler.first_name,
          last_name: traveler.lastName || traveler.last_name,
          nationality: traveler.nationality || null,
          passport_number: traveler.passportNumber || traveler.passport_number || null,
          email: traveler.email || orderEmail,
        })

        if (travelerError) {
          console.error("Traveler creation error:", travelerError)
        }
      }
    }

    // Create flight details
    if (normalizedServices.includes("flight") && flightDetails) {
      const { error: flightError } = await supabase.from("flight_details").insert({
        order_id: order.id,
        departure_city: flightDetails.departureCity || flightDetails.departure_city || "",
        arrival_city: flightDetails.arrivalCity || flightDetails.arrival_city || "",
        departure_date: flightDetails.departureDate || flightDetails.departure_date || new Date().toISOString().split("T")[0],
        return_date: flightDetails.returnDate || flightDetails.return_date || null,
        preferred_airline: flightDetails.preferredAirline || flightDetails.preferred_airline || null,
        // Store extra details in JSON if columns don't exist
        ...(flightDetails.tripType ? { trip_type: flightDetails.tripType } : {}),
        ...(flightDetails.flightDetails ? { notes: flightDetails.flightDetails } : {}),
        ...(flightDetails.validity ? { validity: flightDetails.validity } : {}),
      })

      if (flightError) {
        console.error("Flight details error:", flightError)
      }
    }

    // Create hotel details
    if (normalizedServices.includes("hotel") && hotelDetails) {
      const { error: hotelError } = await supabase.from("hotel_details").insert({
        order_id: order.id,
        city: hotelDetails.city || hotelDetails.destination || "",
        check_in_date: hotelDetails.checkInDate || hotelDetails.check_in_date || new Date().toISOString().split("T")[0],
        check_out_date: hotelDetails.checkOutDate || hotelDetails.check_out_date || new Date().toISOString().split("T")[0],
        hotel_name: hotelDetails.hotelName || hotelDetails.hotel_name || null,
      })

      if (hotelError) {
        console.error("Hotel details error:", hotelError)
      }
    }

    // Create insurance details
    if (normalizedServices.includes("insurance") && insuranceDetails) {
      const { error: insuranceError } = await supabase.from("insurance_details").insert({
        order_id: order.id,
        coverage_type: insuranceDetails.area || insuranceDetails.coverageType || "schengen",
        start_date: insuranceDetails.startDate || insuranceDetails.start_date || new Date().toISOString().split("T")[0],
        end_date: insuranceDetails.endDate || insuranceDetails.end_date || new Date().toISOString().split("T")[0],
        coverage_amount: insuranceDetails.coverageAmount || 50000,
        destination_country: insuranceDetails.area || "Europe",
      })

      if (insuranceError) {
        console.error("Insurance details error:", insuranceError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error) {
    console.error("Order submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}