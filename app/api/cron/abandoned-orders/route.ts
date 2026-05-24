import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Max runtime for Vercel Hobby plan
export const maxDuration = 10

// Vercel invokes cron routes with GET
export async function GET(request: NextRequest) {
  // Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically.
  // We also accept direct calls with the same header for manual triggering.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured")
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const internalSecret = process.env.INTERNAL_API_SECRET
  if (!internalSecret) {
    console.error("INTERNAL_API_SECRET is not configured")
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://verifydummytickets.com"

  const supabase = createAdminClient()

  // Find orders that are:
  // - unpaid
  // - created more than 1 hour ago (but less than 48 hours, to avoid spamming old dead orders)
  // - haven't had a reminder sent yet
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: abandonedOrders, error: queryError } = await supabase
    .from("orders")
    .select("id, email, order_number, services, total_amount, currency, created_at")
    .eq("payment_status", "unpaid")
    .is("abandoned_reminder_sent_at", null)
    .lt("created_at", oneHourAgo)
    .gt("created_at", fortyEightHoursAgo)
    .limit(50)

  if (queryError) {
    // Column may not exist yet if migration 014 hasn't run
    if (queryError.code === "42703" || queryError.message?.includes("abandoned_reminder_sent_at")) {
      console.warn("abandoned_reminder_sent_at column missing — run migration 014")
      return NextResponse.json({ error: "Migration 014 not applied" }, { status: 500 })
    }
    console.error("Failed to query abandoned orders:", queryError.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  if (!abandonedOrders || abandonedOrders.length === 0) {
    return NextResponse.json({ sent: 0, message: "No abandoned orders to remind" })
  }

  let sent = 0
  let failed = 0

  for (const order of abandonedOrders) {
    try {
      const services = Array.isArray(order.services) ? order.services as string[] : []

      const emailRes = await fetch(`${siteUrl}/api/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": internalSecret,
        },
        body: JSON.stringify({
          to: order.email,
          subject: "You left something behind — complete your order",
          type: "order_abandoned",
          data: {
            orderId: order.id,
            orderNumber: order.order_number,
            services,
            totalAmount: order.total_amount,
            currency: order.currency,
            resumeUrl: `${siteUrl}/order`,
          },
        }),
      })

      if (!emailRes.ok) {
        const body = await emailRes.text()
        console.error(`Email failed for order ${order.order_number}:`, body)
        failed++
        continue
      }

      // Mark reminder as sent
      const { error: updateError } = await supabase
        .from("orders")
        .update({ abandoned_reminder_sent_at: new Date().toISOString() })
        .eq("id", order.id)

      if (updateError) {
        console.error(`Failed to mark reminder for order ${order.order_number}:`, updateError.message)
        failed++
      } else {
        sent++
      }
    } catch (err) {
      console.error(`Error processing order ${order.order_number}:`, err)
      failed++
    }
  }

  console.log(`Abandoned order reminders: ${sent} sent, ${failed} failed`)
  return NextResponse.json({ sent, failed, total: abandonedOrders.length })
}
