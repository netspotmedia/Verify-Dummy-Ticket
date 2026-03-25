"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Clock, Shield, Star } from "lucide-react"

const features = [
  "Instant delivery within 24 hours",
  "100% verifiable documents",
  "Money-back guarantee",
]

const stats = [
  { value: "100K+", label: "Reservations Sold" },
  { value: "12K+", label: "Five Star Reviews" },
  { value: "5K+", label: "5-Star Rating" },
  { value: "12", label: "Years on Market" },
]

const airlines = [
  "Swiss Air",
  "Lufthansa",
  "Qatar Airways",
  "British Airways",
  "Air France",
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-6">
            <Badge variant="secondary" className="w-fit gap-2">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              Trusted by 100,000+ travelers
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Flight, Hotel &{" "}
              <span className="text-primary">Travel Insurance</span>{" "}
              for Visa Applications
            </h1>

            <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
              Get Verified Dummy Ticket & Hotel for visa application and Airport proof of return with valid PNR. Our tickets are received instantly within 24 hours.
            </p>

            <ul className="flex flex-col gap-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
              <Link href="/order">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Start Your Order
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://wa.me/2348070076011" target="_blank">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  Chat on WhatsApp
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-4 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-accent" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                <span>24h Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Content - Stats Card */}
          <div className="relative">
            <div className="rounded-2xl border bg-card p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-card-foreground mb-6">
                Trusted by Thousands of Travelers
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">Powering 12,653,998+ of Airlines</p>
                <div className="flex flex-wrap gap-2">
                  {airlines.map((airline) => (
                    <Badge key={airline} variant="outline" className="text-xs">
                      {airline}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 hidden lg:block">
              <div className="rounded-lg border bg-card p-3 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-xs font-medium">100% Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
