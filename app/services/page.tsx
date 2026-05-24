import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Plane, Building2, Shield } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Services – Verify Dummy Tickets",
  description: "Flight itineraries, hotel confirmations, and travel insurance dummy documents for visa applications. Fast delivery, verifiable PNR codes.",
  openGraph: {
    title: "Our Services – Verify Dummy Tickets",
    description: "Flight itineraries, hotel confirmations, and travel insurance for visa applications.",
    type: "website",
    url: "https://verifydummytickets.com/services",
    siteName: "Verify Dummy Tickets",
  },
  twitter: {
    card: "summary",
    title: "Services – Verify Dummy Tickets",
    description: "Dummy travel documents for visa applications. Fast, verifiable, secure.",
  },
}

const services = [
  {
    id: "flight",
    name: "Flight Reservation",
    description: "Verifiable flight itineraries with valid PNR for visa applications",
    icon: Plane,
    features: [
      "Valid PNR (Passenger Name Record)",
      "One-way or Round-trip options",
      "Multi-city available",
      "All major airlines",
      "Delivered within 2-4 hours",
      "100% verifiable online",
    ],
    pricing: {
      usd: { single: 15, couple: 25, family: 35 },
      ngn: { single: 5000, couple: 8000, family: 12000 },
    },
  },
  {
    id: "hotel",
    name: "Hotel Reservation",
    description: "Confirmed hotel bookings with valid reference numbers",
    icon: Building2,
    features: [
      "Valid booking confirmation",
      "Hotels worldwide",
      "Flexible check-in dates",
      "Group bookings available",
      "Delivered within 2-4 hours",
      "100% verifiable",
    ],
    pricing: {
      usd: { single: 12, couple: 20, family: 30 },
      ngn: { single: 4000, couple: 7000, family: 10000 },
    },
  },
  {
    id: "insurance",
    name: "Travel Insurance",
    description: "Comprehensive travel medical insurance for visa requirements",
    icon: Shield,
    features: [
      "$50,000 coverage",
      "Valid for Schengen visas",
      "Medical emergencies covered",
      "Trip cancellation included",
      "Instant certificate",
      "Worldwide coverage",
    ],
    pricing: {
      usd: { single: 20, couple: 35, family: 50 },
      ngn: { single: 7000, couple: 12000, family: 17000 },
    },
  },
]

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Our Services
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
              Everything you need for your visa application, delivered fast and verified authentic.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <service.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{service.name}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6 rounded-lg bg-muted p-4">
                      <p className="mb-2 text-sm font-medium text-muted-foreground">
                        Starting from
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">
                          ${service.pricing.usd.single}
                        </span>
                        <span className="text-muted-foreground">USD</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or NGN {service.pricing.ngn.single.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/order?service=${service.id}`}>
                        Order Now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Complete Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Transparent pricing with discounts for couples and families
            </p>

            <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-xl border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left font-semibold">Service</th>
                    <th className="px-6 py-4 text-center font-semibold">Single</th>
                    <th className="px-6 py-4 text-center font-semibold">Couple (2)</th>
                    <th className="px-6 py-4 text-center font-semibold">Family (3+)</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b last:border-b-0">
                      <td className="px-6 py-4 font-medium">{service.name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold">${service.pricing.usd.single}</span>
                        <span className="block text-sm text-muted-foreground">
                          NGN {service.pricing.ngn.single.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold">${service.pricing.usd.couple}</span>
                        <span className="block text-sm text-muted-foreground">
                          NGN {service.pricing.ngn.couple.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold">${service.pricing.usd.family}</span>
                        <span className="block text-sm text-muted-foreground">
                          NGN {service.pricing.ngn.family.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-center">
              <Button asChild size="lg">
                <Link href="/order">Start Your Order</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bundle Discount */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-3xl border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:flex-row md:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  %
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Bundle & Save</h3>
                  <p className="mt-2 text-muted-foreground">
                    Order multiple services together and save up to 20% on your total order. 
                    Perfect for complete visa application packages.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/order">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
