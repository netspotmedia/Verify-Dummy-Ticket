"use server"

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const body = await request.json()
    const {
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

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        email: user?.email || body.email || "unknown@example.com",
        status: "pending",
        services: services || [],
        currency,
        total_amount: totalAmount,
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
