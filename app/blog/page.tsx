import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog - Visa Tips & Travel Guides | Diplomatic Courier",
  description: "Expert visa application tips, travel document guides, and insider advice for seamless international travel. Stay updated with the latest visa requirements and travel insurance insights.",
  keywords: ["visa tips", "travel guide", "visa application", "travel documents", "visa requirements", "travel insurance"],
  openGraph: {
    title: "Blog - Visa Tips & Travel Guides | Diplomatic Courier",
    description: "Expert visa application tips, travel document guides, and insider advice for seamless international travel.",
    type: "website",
    url: "/blog",
    siteName: "Diplomatic Courier",
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  author_name: string | null
  category: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
  return data || []
}

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const featuredPost = posts.find(p => p.is_featured) || posts[0]
  const regularPosts = posts.filter(p => p.id !== featuredPost?.id)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-red-50 to-white py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge variant="outline" className="mb-4 border-red-200 text-red-700 bg-red-50">
                Our Blog
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                Visa Tips & Travel Guides
              </h1>
              <p className="text-lg text-slate-600">
                Expert advice, insider tips, and the latest updates on visa applications and travel documentation.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {featuredPost && (
              <div className="mb-12">
                <Link href={`/blog/${featuredPost.slug}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                    {featuredPost.featured_image ? (
                      <img
                        src={featuredPost.featured_image}
                        alt={featuredPost.title}
                        className="w-full h-[400px] md:h-[500px] object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-red-700 to-red-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <Badge className="mb-4 bg-red-600 hover:bg-red-700">
                        Featured
                      </Badge>
                      {featuredPost.category && (
                        <Badge variant="secondary" className="mb-4">
                          {featuredPost.category}
                        </Badge>
                      )}
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 group-hover:text-red-200 transition-colors">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-slate-300 mb-4 line-clamp-2 max-w-2xl">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {featuredPost.author_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {featuredPost.author_name}
                          </span>
                        )}
                        {featuredPost.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(featuredPost.published_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {regularPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Latest Articles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-red-100 transition-all"
                    >
                      <div className="aspect-video overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                            <span className="text-4xl">✈️</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          {post.category && (
                            <Badge variant="outline" className="text-xs border-red-200 text-red-700">
                              {post.category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-red-700 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {post.author_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.author_name}
                              </span>
                            )}
                            {post.published_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.published_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {posts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Coming Soon</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  We&apos;re working on exciting content for you. Check back soon for expert visa tips and travel guides.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Need Help With Your Visa Documents?
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Get professional assistance with flight reservations, hotel bookings, and travel insurance for your visa application.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 text-white px-8 py-4 rounded-full font-semibold hover:from-red-800 hover:to-red-900 transition-all shadow-lg shadow-red-200"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
