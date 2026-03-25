"use client"

import { Shield } from "lucide-react"

export function GuaranteeSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-[3rem] p-12 md:p-20 text-white text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="relative z-10">
            {/* Icon */}
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              100% Satisfaction Guarantee
            </h2>

            {/* Description */}
            <p className="text-xl text-red-100 max-w-3xl mx-auto mb-10">
              Join over 100,000 travelers who trusted us for their visa journey. If your documents are not delivered as promised, we provide a full refund. No questions asked.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12 pt-8 border-t border-white/20">
              <div>
                <p className="text-4xl font-black">12K+</p>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">5-Star Reviews</p>
              </div>
              <div>
                <p className="text-4xl font-black">5K+</p>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">5-Star Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
