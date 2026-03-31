"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCaptchaSecret } from "@/lib/captcha"
import { calculatePriceBreakdown } from "@/lib/types"
import type { ServiceType, DeliverySpeed } from "@/lib/types"

const CAPTCHA_EXPIRY = 5 * 60 * 1000

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const randomSuffix = crypto.randomInt(0, 100000).toString().padStart(5, "0")
  return `VDT-${timestamp}-${randomSuffix}`
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

    console.log("=== ORDER API CALLED ===")
    console.log("User:", user?.id ?? "anonymous")

    const captchaSecret = getCaptchaSecret()
    if (!captchaSecret) {
      console.error("CAPTCHA_SECRET is not configured")
      return NextResponse.json({
        error: "Server configuration error. Please contact support."
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
      console.error("CAPTCHA verification failed")
      return NextResponse.json({
        error: "Invalid or expired security check. Please refresh the page and try again."
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

    const orderEmail = email || user?.email || "unknown@example.com"

    // ── Build order payload with safe type handling ──────────────────────────
    // `services` may be stored as TEXT[] or JSONB depending on migration state.
    // We cast to a plain array; PostgREST handles both column types correctly.
    const orderPayload: Record<string, unknown> = {
      order_number:   generateOrderNumber(),
      user_id:        user?.id || null,
      email:          orderEmail,
      status:         "pending",
      currency:       currency || "USD",
      total_amount:   pricing.total,
      payment_method: paymentMethod || "paystack",
      payment_status: "unpaid",
      // Extended columns (added by migrations 007/009/010)
      services:              normalizedServices,
      delivery_method:       deliverySpeed,
      customer_country:      customerCountry      || null,
      customer_country_code: customerCountryCode  || null,
      payment_reference:     paymentReference     || null,
    }

    console.log("Inserting order for:", orderEmail, "| services:", normalizedServices)

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

      // If it's a missing-column error, retry with the minimal guaranteed columns
      // This handles databases that haven't run all migrations.
      if (
        orderError.code === "42703" || // undefined_column
        orderError.message?.includes("column") ||
        orderError.message?.includes("does not exist")
      ) {
        console.log("Retrying with minimal payload (schema migration may be incomplete)...")

        const minimalPayload = {
          order_number:   orderPayload.order_number,
          user_id:        orderPayload.user_id,
          email:          orderPayload.email,
          status:         "pending",
          currency:       orderPayload.currency,
          total_amount:   orderPayload.total_amount,
          payment_method: orderPayload.payment_method,
          payment_status: "unpaid",
        }

        const { data: orderRetry, error: retryError } = await supabase
          .from("orders")
          .insert(minimalPayload)
          .select()
          .single()

        if (retryError) {
          console.error("Retry also failed:", retryError.message)
          return NextResponse.json({
            error: "Failed to create order. Please ensure the database migrations have been run.",
            details: retryError.message,
          }, { status: 500 })
        }

        // Try to backfill extended columns
        await supabase
          .from("orders")
          .update({
            services:              normalizedServices,
            delivery_method:       deliverySpeed,
            customer_country:      customerCountry      || null,
            customer_country_code: customerCountryCode  || null,
          })
          .eq("id", orderRetry!.id)
          .then(({ error: updateErr }) => {
            if (updateErr) console.warn("Could not update extended columns:", updateErr.message)
          })

        console.log("Order created (minimal):", orderRetry!.id)
        return await finaliseOrder(supabase, orderRetry!, travelers, normalizedServices, flightDetails, hotelDetails, insuranceDetails, orderEmail)
      }

      return NextResponse.json({
        error: "Failed to create order. " + (orderError.message || ""),
        details: orderError.message,
      }, { status: 500 })
    }

    console.log("Order created:", order.id)
    return await finaliseOrder(supabase, order, travelers, normalizedServices, flightDetails, hotelDetails, insuranceDetails, orderEmail)

  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

/** Insert travelers + service details, then return the success response. */
async function finaliseOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  order: { id: string; order_number: string },
  travelers: any[],
  services: ServiceType[],
  flightDetails: any,
  hotelDetails: any,
  insuranceDetails: any,
  orderEmail: string,
) {
  // ── Travelers ────────────────────────────────────────────────────────────
  if (Array.isArray(travelers) && travelers.length > 0) {
    for (const traveler of travelers) {
      const { error: travelerError } = await supabase
        .from("travelers")
        .insert({
          order_id:        order.id,
          first_name:      traveler.firstName || traveler.first_name || "",
          last_name:       traveler.lastName  || traveler.last_name  || "",
          nationality:     traveler.nationality     || null,
          passport_number: traveler.passportNumber  || traveler.passport_number || null,
          email:           traveler.email           || orderEmail,
        })

      if (travelerError) {
        console.error("Traveler insert error:", travelerError.message)
      }
    }
  }

  // ── Flight details ───────────────────────────────────────────────────────
  if (services.includes("flight") && flightDetails) {
    const today = new Date().toISOString().split("T")[0]
    const { error: flightError } = await supabase
      .from("flight_details")
      .insert({
        order_id:          order.id,
        // The FlightDetails interface uses tripType/flightDetails/validity.
        // Map to DB columns; fall back to safe defaults.
        trip_type:         flightDetails.tripType          || flightDetails.trip_type || "one_way",
        departure_city:    flightDetails.departureCity     || flightDetails.departure_city     || "N/A",
        arrival_city:      flightDetails.arrivalCity       || flightDetails.arrival_city       || "N/A",
        departure_date:    flightDetails.departureDate     || flightDetails.departure_date     || today,
        return_date:       flightDetails.returnDate        || flightDetails.return_date        || null,
        preferred_airline: flightDetails.preferredAirline || flightDetails.preferred_airline  || null,
        // Store the free-text itinerary in the notes-like column if it exists
        // (flight_details column on the FlightDetails object)
      })

    if (flightError) {
      console.error("Flight details error:", flightError.message, flightError.details)
    }
  }

  // ── Hotel details ────────────────────────────────────────────────────────
  if (services.includes("hotel") && hotelDetails) {
    const today = new Date().toISOString().split("T")[0]
    const { error: hotelError } = await supabase
      .from("hotel_details")
      .insert({
        order_id:       order.id,
        city:           hotelDetails.city           || hotelDetails.destination || "N/A",
        check_in_date:  hotelDetails.checkInDate    || hotelDetails.check_in_date  || today,
        check_out_date: hotelDetails.checkOutDate   || hotelDetails.check_out_date || today,
        hotel_name:     hotelDetails.hotelName      || hotelDetails.hotel_name     || null,
      })

    if (hotelError) {
      console.error("Hotel details error:", hotelError.message, hotelError.details)
    }
  }

  // ── Insurance details ────────────────────────────────────────────────────
  if (services.includes("insurance") && insuranceDetails) {
    const today = new Date().toISOString().split("T")[0]
    const { error: insuranceError } = await supabase
      .from("insurance_details")
      .insert({
        order_id:           order.id,
        coverage_type:      insuranceDetails.area      || "schengen",
        destination_country: insuranceDetails.area     || "Europe",
        start_date:         insuranceDetails.startDate || insuranceDetails.start_date || today,
        end_date:           insuranceDetails.endDate   || insuranceDetails.end_date   || today,
        coverage_amount:    50000,
      })

    if (insuranceError) {
      console.error("Insurance details error:", insuranceError.message, insuranceError.details)
    }
  }

  console.log("=== ORDER COMPLETE:", order.id, "===")

  return NextResponse.json({
    success: true,
    orderId:     order.id,
    orderNumber: order.order_number,
  })
}
