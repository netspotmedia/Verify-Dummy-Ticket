"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-primary/80">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
          Get Your Reservations Today
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          Perfect solution for digital nomads and travellers who want to extend or apply for visas.
        </p>
        <div className="mt-8">
          <Link href="/order">
            <Button size="lg" variant="secondary" className="gap-2">
              Explore Our Products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
