import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://verifydummytickets.com"

async function getSiteUrl(): Promise<string> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_url")
      .single()

    if (data?.value) {
      return String(data.value).replace(/"/g, "")
    }
  } catch { /* fall through to default */ }
  return DEFAULT_URL
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getSiteUrl()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
