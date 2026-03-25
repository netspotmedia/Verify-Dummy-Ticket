import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, Clock, Share2 } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author_name: string | null
  category: string | null
  is_published: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || `Read ${post.title} on Diplomatic Courier blog.`,
    keywords: [post.category || "", "visa tips", "travel guide", "diplomatic courier"].filter(Boolean),
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || "",
      type: "article",
      url: `/blog/${post.slug}`,
      siteName: "Diplomatic Courier",
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : [],
      publishedTime: post.published_at || undefined,
      authors: post.author_name ? [post.author_name] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || "",
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

function formatContent(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-slate-900 mt-8 mb-4">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-slate-900 mt-10 mb-5">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-slate-900 mt-10 mb-6">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 leading-relaxed">')
    .replace(/\n/g, '<br />')
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const formattedContent = formatContent(post.content)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.seo_description || "",
    image: post.featured_image || "",
    author: {
      "@type": "Person",
      name: post.author_name || "Diplomatic Courier",
    },
    publisher: {
      "@type": "Organization",
      name: "Diplomatic Courier",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.created_at,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1">
        <article>
          <header className="relative bg-gradient-to-b from-red-50 to-white">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-12">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-red-700 mb-8 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <div className="flex items-center gap-3 mb-4">
                {post.category && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                    {post.category}
                  </Badge>
                )}
                {post.is_featured && (
                  <Badge variant="outline" className="border-red-300 text-red-600">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-slate-500">
                {post.author_name && (
                  <span className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <User className="h-4 w-4 text-red-600" />
                    </div>
                    {post.author_name}
                  </span>
                )}
                {post.published_at && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(post.content.split(" ").length / 200)} min read
                </span>
              </div>
            </div>
          </header>

          {post.featured_image && (
            <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 md:py-16">
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: `<p class="mb-4 text-slate-700 leading-relaxed">${formattedContent}</p>` }}
            />

            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <User className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {post.author_name || "Diplomatic Courier Team"}
                    </p>
                    <p className="text-sm text-slate-500">Travel Document Experts</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-700 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </article>

        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Need Professional Help With Your Visa Documents?
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Get verified flight reservations, hotel bookings, and travel insurance for your visa application. Fast delivery within 24 hours.
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-800 text-white px-8 py-4 rounded-full font-semibold hover:from-red-800 hover:to-red-900 transition-all shadow-lg shadow-red-200"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
