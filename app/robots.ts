import { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"

async function getSiteUrl(): Promise<string> {
  try {
    if (supabase) {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "site_url")
        .single()

      if (data?.value) {
        return String(data.value).replace(/"/g, "")
      }
    }
  } catch (error) {
    console.error("Failed to fetch site URL:", error)
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://verifydummytickets.com"
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getSiteUrl()

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
