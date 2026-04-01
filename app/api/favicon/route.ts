import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_logo")
      .single()

    if (data?.value) {
      const logo = typeof data.value === "string" ? JSON.parse(data.value) : data.value
      const faviconUrl = logo?.favicon

      if (faviconUrl && faviconUrl.startsWith("http")) {
        return NextResponse.redirect(faviconUrl, { status: 302 })
      }
    }
  } catch {
    // fall through to default
  }

  // Return default favicon (redirect to built-in icon)
  return NextResponse.redirect(new URL("/icon.svg", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), { status: 302 })
}
