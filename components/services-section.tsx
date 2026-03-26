"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plane, Building2, Shield } from "lucide-react"
import type { ServiceItem } from "@/lib/supabase"

const iconMap: Record<string, any> = {
  Plane: Plane,
  Hotel: Building2,
  Shield: Shield,
}

const defaultServices: ServiceItem[] = [
  {
    id: '1',
    section_id: 'services',
    title: 'Flight Reservation',
    description: 'Confirmed flight itinerary with a valid PNR from major airlines, accepted by all embassies for visa applications.',
    icon: 'Plane',
    price_from: 'From $5',
    link: '/order?service=flight',
    sort_order: 1,
    is_active: true,
    image_url: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    section_id: 'services',
    title: 'Hotel Reservation',
    description: 'Verified hotel bookings without prepayment. Fully refundable and verifiable proof of accommodation for your stay.',
    icon: 'Hotel',
    price_from: 'From $3',
    link: '/order?service=hotel',
    sort_order: 2,
    is_active: true,
    image_url: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    section_id: 'services',
    title: 'Travel Insurance',
    description: 'Embassy-compliant travel insurance policies covering health, emergency evacuation, and personal liability.',
    icon: 'Shield',
    price_from: 'From $2',
    link: '/order?service=insurance',
    sort_order: 3,
    is_active: true,
    image_url: null,
    created_at: '',
    updated_at: '',
  },
]

export function ServicesSection() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/landing/services')
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setServices(data)
        } else {
          setServices(defaultServices)
        }
      } else {
        setServices(defaultServices)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      setServices(defaultServices)
    } finally {
      setLoading(false)
    }
  }

  const displayServices = services.length > 0 ? services : defaultServices

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
          {displayServices.map((service) => {
            const IconComponent = iconMap[service.icon || 'Plane'] || Plane
            return (
              <div 
                key={service.id} 
                className="group bg-slate-50 p-10 rounded-[2rem] hover:bg-slate-100 transition-all duration-300 border border-transparent hover:border-red-100"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <IconComponent className="h-8 w-8 text-red-700" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>

                {/* Description */}
                <p className="text-slate-600 leading-relaxed mb-8">{service.description}</p>

                {/* Price */}
                {service.price_from && (
                  <p className="text-sm font-semibold text-red-700 mb-6">{service.price_from}</p>
                )}

                {/* CTA */}
                <Link href={service.link || '/order'}>
                  <Button variant="outline" className="w-full rounded-xl group-hover:bg-red-700 group-hover:border-red-700 group-hover:text-white transition-colors font-semibold">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
