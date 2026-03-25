"use client"

import { FileText, CreditCard, Mail, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: 1,
    icon: FileText,
    title: "Provide Details",
    description: "Enter your travel dates, passenger information, and destination via our secure order form.",
  },
  {
    number: 2,
    icon: CreditCard,
    title: "Fast Processing",
    description: "Our travel specialists verify schedules and generate authentic PNR codes from the GDS system.",
  },
  {
    number: 3,
    icon: Mail,
    title: "Instant Delivery",
    description: "Receive your verified PDF documents via email within 24 hours, ready for embassy submission.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <span className="text-red-700 font-bold tracking-widest uppercase text-xs mb-4 block">The Process</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-8">
              Three Simple Steps to Get Your Documents
            </h2>

            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-red-700 to-red-800 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-200/50">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="lg:w-1/2">
            <div className="relative p-4">
              <div className="absolute inset-0 bg-red-100/50 rounded-[3rem] rotate-3 translate-x-4 translate-y-4" />
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=600&fit=crop"
                alt="Premium passport and tickets"
                className="relative rounded-[2.5rem] shadow-2xl w-full aspect-square object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
