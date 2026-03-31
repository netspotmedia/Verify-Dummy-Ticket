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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()

    // ── DEBUG: log exactly what we received ──────────────────────────
    console.log("=== ORDER API CALLED ===")
    console.log("User:", user?.id ?? "anonymous")
    console.log("Body keys:", Object.keys(body))
    console.log("Services:", body.services)
    console.log("Currency:", body.currency)
    console.log("TotalAmount:", body.totalAmount)
    console.log("Email:", body.email)
    console.log("Travelers:", JSON.stringify(body.travelers))
    // ─────────────────────────────────────────────────────────────────

    const captchaSecret = getCaptchaSecret()
    if (!captchaSecret) {
      console.error("CAPTCHA_SECRET is not configured")
      return NextResponse.json({
        error: "CAPTCHA is not configured on the server. Set CAPTCHA_SECRET env variable (min 32 chars)."
      }, { status: 503 })
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

    // Verify captcha
    if (!verifyCaptchaToken(captchaToken, captchaSecret)) {
      console.error("CAPTCHA verification failed. Token:", captchaToken ? "present" : "missing")
      return NextResponse.json({
        error: "Invalid or expired CAPTCHA. Please refresh and try again."
      }, { status: 400 })
    }

    const travelerCount = Array.isArray(travelers) && travelers.length > 0 ? travelers.length : 1
    const deliverySpeed = (deliveryMethod || "normal") as DeliverySpeed
    const normalizedServices = (Array.isArray(services) ? services : []) as ServiceType[]
    const isNigeria = currency === "NGN"

    if (normalizedServices.length === 0) {
      return NextResponse.json({ error: "No services selected." }, { status: 400 })
    }

    const pricing = calculatePriceBreakdown(
      normalizedServices,
      travelerCount,
      isNigeria,
      flightDetails,
      hotelDetails,
      insuranceDetails,
      deliverySpeed
    )

    console.log("Calculated total:", pricing.total, "Submitted total:", totalAmount)

    // ── Step 1: Insert order ─────────────────────────────────────────
    const orderEmail = email || user?.email || "unknown@example.com"

    const orderPayload = {
      user_id: user?.id || null,
      email: orderEmail,
      status: "pending",
      services: normalizedServices,
      currency: currency || "USD",
      total_amount: pricing.total,
      payment_method: paymentMethod || "paystack",
      payment_reference: paymentReference || null,
      // Use "unpaid" for compatibility with the original schema check constraint.
      // Some environments may not yet include the later migration that added "pending".
      payment_status: "unpaid",
      customer_country: customerCountry || null,
      customer_country_code: customerCountryCode || null,
      delivery_method: deliverySpeed,
    }

    console.log("Inserting order payload:", JSON.stringify(orderPayload))

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single()

    if (orderError) {
      console.error("=== ORDER INSERT FAILED ===")
      console.error("Code:", orderError.code)
      console.error("Message:", orderError.message)
      console.error("Details:", orderError.details)
      console.error("Hint:", orderError.hint)
      return NextResponse.json({
        error: "Failed to create order",
        debug: {
          code: orderError.code,
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
        }
      }, { status: 500 })
    }

    console.log("Order created:", order.id)

    // ── Step 2: Travelers ────────────────────────────────────────────
    if (travelers && Array.isArray(travelers)) {
      for (const traveler of travelers) {
        const travelerPayload = {
          order_id: order.id,
          first_name: traveler.firstName || traveler.first_name || "",
          last_name: traveler.lastName || traveler.last_name || "",
          nationality: traveler.nationality || null,
          passport_number: traveler.passportNumber || traveler.passport_number || null,
          email: traveler.email || orderEmail,
        }

        const { error: travelerError } = await supabase
          .from("travelers")
          .insert(travelerPayload)

        if (travelerError) {
          console.error("Traveler insert error:", travelerError.message, travelerError.details)
        }
      }
    }

    // ── Step 3: Flight details ───────────────────────────────────────
    if (normalizedServices.includes("flight") && flightDetails) {
      const flightPayload: Record<string, unknown> = {
        order_id: order.id,
        departure_city: flightDetails.departureCity || flightDetails.departure_city || "N/A",
        arrival_city: flightDetails.arrivalCity || flightDetails.arrival_city || "N/A",
        departure_date: flightDetails.departureDate || flightDetails.departure_date || new Date().toISOString().split("T")[0],
        return_date: flightDetails.returnDate || flightDetails.return_date || null,
        preferred_airline: flightDetails.preferredAirline || flightDetails.preferred_airline || null,
      }

      console.log("Inserting flight details:", JSON.stringify(flightPayload))

      const { error: flightError } = await supabase
        .from("flight_details")
        .insert(flightPayload)

      if (flightError) {
        console.error("Flight details error:", flightError.message, flightError.details, flightError.hint)
      }
    }

    // ── Step 4: Hotel details ────────────────────────────────────────
    if (normalizedServices.includes("hotel") && hotelDetails) {
      const today = new Date().toISOString().split("T")[0]
      const hotelPayload: Record<string, unknown> = {
        order_id: order.id,
        city: hotelDetails.city || hotelDetails.destination || "N/A",
        check_in_date: hotelDetails.checkInDate || hotelDetails.check_in_date || today,
        check_out_date: hotelDetails.checkOutDate || hotelDetails.check_out_date || today,
        hotel_name: hotelDetails.hotelName || hotelDetails.hotel_name || null,
      }

      const { error: hotelError } = await supabase
        .from("hotel_details")
        .insert(hotelPayload)

      if (hotelError) {
        console.error("Hotel details error:", hotelError.message, hotelError.details, hotelError.hint)
      }
    }

    // ── Step 5: Insurance details ────────────────────────────────────
    if (normalizedServices.includes("insurance") && insuranceDetails) {
      const today = new Date().toISOString().split("T")[0]
      const insurancePayload: Record<string, unknown> = {
        order_id: order.id,
        coverage_type: insuranceDetails.area || "schengen",
        destination_country: insuranceDetails.area || "Europe",
        start_date: insuranceDetails.startDate || insuranceDetails.start_date || today,
        end_date: insuranceDetails.endDate || insuranceDetails.end_date || today,
        coverage_amount: 50000,
      }

      const { error: insuranceError } = await supabase
        .from("insurance_details")
        .insert(insurancePayload)

      if (insuranceError) {
        console.error("Insurance details error:", insuranceError.message, insuranceError.details, insuranceError.hint)
      }
    }

    console.log("=== ORDER COMPLETE:", order.id, "===")

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    })

  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===", error)
    return NextResponse.json({
      error: "Internal server error",
      debug: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
