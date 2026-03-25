"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, CheckCircle2 } from "lucide-react"
import { AirlineCarousel } from "./airline-carousel"

const features = [
  { icon: Shield, text: "Instant delivery within 24 hours" },
  { icon: CheckCircle2, text: "100% verifiable documents" },
  { icon: Clock, text: "Money-back guarantee" },
]

const stats = [
  { value: "100K+", label: "Reservations Sold" },
  { value: "12 Years", label: "On Market" },
]

const airlines = [
  { name: "Swiss Air", logo: "/airline-swiss.svg" },
  { name: "Lufthansa", logo: "/airline-lufthansa.svg" },
  { name: "Qatar Airways", logo: "/airline-qatar.svg" },
  { name: "British Airways", logo: "/airline-ba.svg" },
  { name: "Air France", logo: "/airline-af.svg" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-slate-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-1.5 rounded-full text-red-800 text-xs font-bold tracking-widest uppercase mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Official Diplomatic Service
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
              Flight, Hotel & <span className="text-red-700 italic">Travel Insurance</span> for Visa Applications
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
              Get Verified Dummy Ticket & Hotel for visa application and Airport proof of return with valid PNR. Our tickets are received instantly within 24 hours.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/order">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white shadow-xl shadow-red-200/50 rounded-full px-8 py-6 text-lg font-bold gap-2">
                  Start Your Order
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://wa.me/2348070076011" target="_blank">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-semibold border-2 hover:bg-red-50 hover:border-red-200">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200/50">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 shrink-0">
                    <feature.icon className="h-5 w-5 text-red-700" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 leading-tight">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative mt-12 lg:mt-0">
            {/* Main Image */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=1000&fit=crop"
                alt="Modern airplane wing soaring through bright blue sky"
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 to-transparent" />
            </div>

            {/* Floating Money Back Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[240px] animate-bounce-slow">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="w-8 h-8 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-900">100% Money-Back</p>
                <p className="text-xs text-slate-500">Satisfaction Guarantee</p>
              </div>
            </div>

            {/* Trust Stats Floating */}
            <div className="absolute -top-4 -right-4 hidden md:flex flex-col bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl space-y-4">
              <div className="text-center">
                <p className="text-3xl font-black text-red-700 leading-none">100K+</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Reservations Sold</p>
              </div>
              <div className="w-full h-px bg-slate-200/50" />
              <div className="text-center">
                <p className="text-3xl font-black text-red-700 leading-none">12 Years</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">On Market</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Airline Carousel */}
      <AirlineCarousel />
    </section>
  )
}
