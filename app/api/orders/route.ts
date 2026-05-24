import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getCaptchaSecret } from "@/lib/captcha"
import { calculatePriceBreakdown } from "@/lib/types"
import type { ServiceType, DeliverySpeed } from "@/lib/types"
import { z } from "zod"
import { rateLimitRequest, rateLimitResponse } from "@/lib/rate-limit"

function sanitize(value: string | undefined, maxLen = 200): string {
  if (!value) return ""
  return value
    .toString()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .slice(0, maxLen)
    .trim()
}

const travelerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  title: z.string().max(20).optional(),
  nationality: z.string().max(100).optional(),
  passportNumber: z.string().max(50).optional(),
  dateOfBirth: z.string().max(20).optional(),
})

const flightDetailsSchema = z.object({
  tripType: z.enum(["one_way", "return_trip", "multi_city"]),
  validity: z.enum(["3d", "7d", "14d", "21d", "30d"]),
  flightDetails: z.string().min(10).max(2000),
})

const hotelDetailsSchema = z.object({
  type: z.enum(["separate_per_traveler", "one_for_all"]),
})

const insuranceDetailsSchema = z.object({
  area: z.enum(["schengen", "worldwide_area_1", "worldwide_area_2"]),
  duration: z.enum(["21d", "3m", "6m", "1y"]),
})

const orderBodySchema = z.object({
  services: z.array(z.enum(["flight", "hotel", "insurance"])).min(1),
  email: z.string().email().max(254),
  currency: z.enum(["USD", "NGN"]),
  paymentMethod: z.enum(["paypal", "paystack"]),
  deliveryMethod: z.enum(["normal", "fast", "express"]).optional(),
  customerCountry: z.string().max(100).optional(),
  customerCountryCode: z.string().max(10).optional(),
  captchaToken: z.string().min(1),
  travelers: z.array(travelerSchema).min(1).max(10),
  flightDetails: flightDetailsSchema.optional(),
  hotelDetails: hotelDetailsSchema.optional(),
  insuranceDetails: insuranceDetailsSchema.optional(),
  couponCode: z.string().max(50).optional(),
})

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
    // Rate limiting — 10 order attempts per minute per IP
    const rl = await rateLimitRequest(request, "order")
    if (!rl.success) return rateLimitResponse(rl.resetIn)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()

    const parsed = orderBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.errors[0]?.message ?? "Invalid request body",
      }, { status: 400 })
    }

    // Validate that service detail objects are present for every selected service
    const selectedServices: ServiceType[] = parsed.data.services
    if (selectedServices.includes("flight") && !parsed.data.flightDetails) {
      return NextResponse.json({ error: "Flight details are required when flight service is selected." }, { status: 400 })
    }
    if (selectedServices.includes("hotel") && !parsed.data.hotelDetails) {
      return NextResponse.json({ error: "Hotel details are required when hotel service is selected." }, { status: 400 })
    }
    if (selectedServices.includes("insurance") && !parsed.data.insuranceDetails) {
      return NextResponse.json({ error: "Insurance details are required when insurance service is selected." }, { status: 400 })
    }


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
      couponCode,
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

    const orderEmail = sanitize(email || user?.email || "unknown@example.com", 254)

    // Fetch the live exchange rate from site_settings so we lock it at order time
    const { data: rateRow } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "currency_conversion_rate")
      .single()
    const liveExchangeRate = rateRow?.value ? parseFloat(rateRow.value) : 1650

    // Recalculate total using the live server-side rate (ignores client-supplied totalAmount)
    const serverPricing = calculatePriceBreakdown(
      normalizedServices,
      travelerCount,
      isNigeria,
      flightDetails,
      hotelDetails,
      insuranceDetails,
      deliverySpeed,
    )

    // Server-side coupon validation — apply discount if code is valid
    let couponDiscountPercent = 0
    const safeCouponCode = couponCode ? sanitize(couponCode, 50).toUpperCase() : null
    if (safeCouponCode) {
      const { data: couponRow } = await supabase
        .from("coupons")
        .select("discount_percent, is_active, max_uses, uses_count, expires_at")
        .eq("code", safeCouponCode)
        .single()

      if (
        couponRow?.is_active &&
        (!couponRow.expires_at || new Date(couponRow.expires_at) >= new Date()) &&
        (couponRow.max_uses === null || couponRow.uses_count < couponRow.max_uses)
      ) {
        couponDiscountPercent = couponRow.discount_percent
      }
    }

    const couponDiscountAmount = couponDiscountPercent > 0
      ? (serverPricing.total * couponDiscountPercent) / 100
      : 0
    const finalTotal = Math.max(0, serverPricing.total - couponDiscountAmount)

    // ── Build order payload with safe type handling ──────────────────────────
    const orderPayload: Record<string, unknown> = {
      order_number:       generateOrderNumber(),
      user_id:            user?.id || null,
      email:              orderEmail,
      status:             "pending",
      currency:           currency || "USD",
      total_amount:       finalTotal,
      payment_method:     paymentMethod || "paystack",
      payment_status:     "unpaid",
      // Extended columns (added by migrations 007/009/010)
      services:              normalizedServices,
      delivery_method:       deliverySpeed,
      customer_country:      sanitize(customerCountry, 100)     || null,
      customer_country_code: sanitize(customerCountryCode, 10)  || null,
      payment_reference:     paymentReference                   || null,
      // Lock the exchange rate used at order creation time (migration 015)
      exchange_rate_used: liveExchangeRate,
      // Coupon (migration 016)
      coupon_code:            safeCouponCode                    || null,
      coupon_discount_amount: couponDiscountAmount > 0 ? couponDiscountAmount : null,
    }


    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single()

    if (orderError) {
      console.error("Order insert failed", { code: orderError.code })

      // If it's a missing-column error, retry with the minimal guaranteed columns
      // This handles databases that haven't run all migrations.
      if (
        orderError.code === "42703" || // undefined_column
        orderError.message?.includes("column") ||
        orderError.message?.includes("does not exist")
      ) {

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

        return await finaliseOrder(supabase, orderRetry!, travelers, normalizedServices, flightDetails, hotelDetails, insuranceDetails, orderEmail, safeCouponCode)
      }

      return NextResponse.json({ error: "Failed to create order." }, { status: 500 })
    }

    return await finaliseOrder(supabase, order, travelers, normalizedServices, flightDetails, hotelDetails, insuranceDetails, orderEmail, safeCouponCode)

  } catch (error) {
    console.error("=== UNEXPECTED ERROR ===", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
  couponCode?: string | null,
) {
  // Increment coupon uses_count if a valid coupon was applied
  if (couponCode) {
    try { await supabase.rpc("increment_coupon_uses", { p_code: couponCode }) } catch {}
  }
  // ── Travelers ────────────────────────────────────────────────────────────
  if (Array.isArray(travelers) && travelers.length > 0) {
    for (const traveler of travelers) {
      const { error: travelerError } = await supabase
        .from("travelers")
        .insert({
          order_id:        order.id,
          first_name:      sanitize(traveler.firstName || traveler.first_name, 100),
          last_name:       sanitize(traveler.lastName  || traveler.last_name, 100),
          nationality:     sanitize(traveler.nationality, 100) || null,
          passport_number: sanitize(traveler.passportNumber || traveler.passport_number, 50) || null,
          date_of_birth:   traveler.dateOfBirth || null,
          email:           sanitize(traveler.email || orderEmail, 254),
        })

      if (travelerError) {
        console.error("Traveler insert error:", travelerError.message)
        // Block: if travelers can't be saved the order is unprocessable
        return NextResponse.json(
          { error: "Failed to save traveler details. Please try again." },
          { status: 500 }
        )
      }
    }
  }

  // ── Flight details ───────────────────────────────────────────────────────
  if (services.includes("flight") && flightDetails) {
    const { error: flightError } = await supabase
      .from("flight_details")
      .insert({
        order_id:       order.id,
        trip_type:      flightDetails.tripType   || flightDetails.trip_type  || "one_way",
        validity:       flightDetails.validity   || "3d",
        itinerary_text: flightDetails.flightDetails || null,
      })

    if (flightError) {
      console.error("Flight details error:", flightError.message, flightError.details)
    }
  }

  // ── Hotel details ────────────────────────────────────────────────────────
  if (services.includes("hotel") && hotelDetails) {
    const { error: hotelError } = await supabase
      .from("hotel_details")
      .insert({
        order_id:   order.id,
        hotel_type: hotelDetails.type || "separate_per_traveler",
      })

    if (hotelError) {
      console.error("Hotel details error:", hotelError.message, hotelError.details)
    }
  }

  // ── Insurance details ────────────────────────────────────────────────────
  if (services.includes("insurance") && insuranceDetails) {
    const { error: insuranceError } = await supabase
      .from("insurance_details")
      .insert({
        order_id:        order.id,
        coverage_type:   insuranceDetails.area     || "schengen",
        duration:        insuranceDetails.duration || "21d",
        coverage_amount: 50000,
      })

    if (insuranceError) {
      console.error("Insurance details error:", insuranceError.message, insuranceError.details)
    }
  }


  return NextResponse.json({
    success: true,
    orderId:     order.id,
    orderNumber: order.order_number,
  })
}
