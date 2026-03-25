"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, Building2, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Plane,
    title: "Flight Itinerary",
    description: "We provide verifiable one way, round trip, and multi-city flight bookings for any country visa within minutes at an affordable price without you having to pay for actual tickets. Pay only $15/ticket.",
    price: "From $15",
    features: [
      "Valid PNR code",
      "Verifiable booking",
      "Any airline worldwide",
      "Instant delivery",
    ],
    href: "/order?service=flight",
  },
  {
    icon: Building2,
    title: "Hotel Booking",
    description: "Get your hotel bookings for any city in the world within minutes. Perfect for visa purposes. Group discounts available. We also work at cancellations at no cost to you.",
    price: "From $10",
    features: [
      "Any destination",
      "Confirmation letter",
      "Group discounts",
      "Free cancellation",
    ],
    href: "/order?service=hotel",
  },
  {
    icon: Shield,
    title: "Travel Insurance",
    description: "We provide legit international travel medical insurance within minutes for any country visa. $35,000 policy coverage with 90 days validity. Valid during travel.",
    price: "From $25",
    features: [
      "$35,000 coverage",
      "90 days validity",
      "Medical emergencies",
      "Travel delays covered",
    ],
    href: "/order?service=insurance",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Our Services</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            What We Offer
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Everything you need for your visa application, delivered fast and professionally
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.title} className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="outline">{service.price}</Badge>
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={service.href}>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Order Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
