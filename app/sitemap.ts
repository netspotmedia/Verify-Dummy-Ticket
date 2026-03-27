import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

async function getSiteUrl(): Promise<string> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_url")
      .single()
    
    if (data?.value) {
      return data.value.replace(/"/g, "")
    }
  } catch (error) {
    console.error("Failed to fetch site URL:", error)
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://verifydummytickets.com"
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getSiteUrl()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  try {
    const supabase = await createClient()
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("is_published", true)

    const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    return [...staticPages, ...blogPages]
  } catch {
    return staticPages
  }
}
