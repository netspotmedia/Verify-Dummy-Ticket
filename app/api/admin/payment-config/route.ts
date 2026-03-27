import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth-helpers"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["paypal_enabled", "paypal_mode", "paystack_enabled", "card_enabled"])

    const settingsMap: Record<string, any> = {}
    settings?.forEach((item) => {
      settingsMap[item.key] = item.value
    })

    const paypalClientId = process.env.PAYPAL_CLIENT_ID
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET
    const paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

    return NextResponse.json({
      paypal_enabled: settingsMap.paypal_enabled !== false && settingsMap.paypal_enabled !== "false",
      paypal_mode: settingsMap.paypal_mode || "sandbox",
      paystack_enabled: settingsMap.paystack_enabled !== false && settingsMap.paystack_enabled !== "false",
      card_enabled: settingsMap.card_enabled !== false,
      hasPayPalSecrets: !!(paypalClientId && paypalClientSecret),
      hasPayStackSecrets: !!(paystackPublicKey && paystackSecretKey),
    })
  } catch (error) {
    console.error("Payment config error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { paypal_enabled, paypal_mode, paystack_enabled, card_enabled } = body

    const upsertSetting = async (key: string, value: any) => {
      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", key)
        .single()

      if (existing) {
        await supabase
          .from("site_settings")
          .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
          .eq("key", key)
      } else {
        await supabase
          .from("site_settings")
          .insert({ key, value: JSON.stringify(value), category: "payment", is_public: false })
      }
    }

    if (paypal_enabled !== undefined) {
      await upsertSetting("paypal_enabled", paypal_enabled)
    }
    if (paypal_mode !== undefined) {
      await upsertSetting("paypal_mode", paypal_mode)
    }
    if (paystack_enabled !== undefined) {
      await upsertSetting("paystack_enabled", paystack_enabled)
    }
    if (card_enabled !== undefined) {
      await upsertSetting("card_enabled", card_enabled)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment config save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
