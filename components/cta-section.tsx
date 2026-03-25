"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-slate-50 text-center">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
          Ready to Secure Your Visa?
        </h2>
        <p className="text-xl text-slate-600 mb-10">
          Don&apos;t risk your application with unverified documents. Get your professional itinerary today.
        </p>
        <Link href="/order">
          <Button size="lg" className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-2xl shadow-red-200/50 rounded-full px-10 py-6 text-xl font-bold gap-2 hover:scale-105 transition-transform">
            Start Your Order Now
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
