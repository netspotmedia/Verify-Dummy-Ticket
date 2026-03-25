"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plane, Building2, Shield } from "lucide-react"

const services = [
  {
    icon: Plane,
    title: "Flight Reservation",
    description: "Confirmed flight itinerary with a valid PNR from major airlines, accepted by all embassies for visa applications.",
    badge: "Most Popular",
    features: ["Valid PNR code", "Verifiable booking", "Any airline worldwide", "Instant delivery"],
    href: "/order?service=flight",
  },
  {
    icon: Building2,
    title: "Hotel Reservation",
    description: "Verified hotel bookings without prepayment. Fully refundable and verifiable proof of accommodation for your stay.",
    badge: null,
    features: ["Any destination", "Confirmation letter", "Group discounts", "Free cancellation"],
    href: "/order?service=hotel",
  },
  {
    icon: Shield,
    title: "Travel Insurance",
    description: "Embassy-compliant travel insurance policies covering health, emergency evacuation, and personal liability.",
    badge: "Required",
    features: ["$35,000 coverage", "90 days validity", "Medical emergencies", "Travel delays covered"],
    href: "/order?service=insurance",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-red-700 font-bold tracking-widest uppercase text-xs mb-4 block">Our Expertise</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4">
            World-Class Documentation Services
          </h2>
          <p className="text-slate-600 text-lg">
            We specialize in providing high-verifiability documentation required by consulates and embassies worldwide.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.title} 
              className="group bg-slate-50 p-10 rounded-[2rem] hover:bg-slate-100 transition-all duration-300 border border-transparent hover:border-red-100"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <service.icon className="h-8 w-8 text-red-700" />
              </div>

              {/* Badge */}
              {service.badge && (
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  service.badge === "Most Popular" 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-green-100 text-green-800"
                }`}>
                  {service.badge}
                </div>
              )}

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed mb-8">{service.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-8">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={service.href}>
                <Button variant="outline" className="w-full rounded-xl group-hover:bg-red-700 group-hover:border-red-700 group-hover:text-white transition-colors font-semibold">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
