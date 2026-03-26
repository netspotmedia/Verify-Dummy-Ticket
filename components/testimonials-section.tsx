"use client"

import { useState, useEffect } from "react"
import type { Testimonial } from "@/lib/supabase"

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/landing/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.filter((t: Testimonial) => t.is_active))
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 w-64 mx-auto bg-slate-200 rounded mb-16" />
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 p-8 rounded-3xl h-48" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-12 md:mb-16 tracking-tight text-slate-900">
          What Our Clients Say
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-slate-50 p-6 md:p-8 rounded-2xl md:rounded-3xl relative">
              <div className="flex text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-slate-700 mb-6 italic leading-relaxed text-sm md:text-base">
                &quot;{testimonial.comment}&quot;
              </p>

              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 overflow-hidden">
                  {testimonial.avatar_url && (
                    <img src={testimonial.avatar_url} alt={testimonial.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm md:text-base">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
