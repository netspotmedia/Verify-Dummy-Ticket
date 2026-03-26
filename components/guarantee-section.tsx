"use client"

import { useState, useEffect } from "react"
import { Shield, Zap, CheckCircle, RefreshCw, Clock, Globe, Award } from "lucide-react"
import type { GuaranteeItem } from "@/lib/supabase"

const iconMap: Record<string, any> = {
  Shield: Shield,
  Zap: Zap,
  CheckCircle: CheckCircle,
  RefreshCw: RefreshCw,
  Clock: Clock,
  Globe: Globe,
  Award: Award,
}

const defaultGuarantees: GuaranteeItem[] = [
  {
    id: '1',
    title: 'Instant Delivery',
    description: 'Receive your documents within 24 hours',
    icon: 'Zap',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    title: '100% Verifiable',
    description: 'All documents can be verified online',
    icon: 'CheckCircle',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    title: 'Money-Back Guarantee',
    description: 'Full refund if not satisfied',
    icon: 'RefreshCw',
    is_active: true,
    created_at: '',
    updated_at: '',
  },
]

export function GuaranteeSection() {
  const [guarantees, setGuarantees] = useState<GuaranteeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuarantees()
  }, [])

  const fetchGuarantees = async () => {
    try {
      const res = await fetch('/api/landing/guarantees')
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setGuarantees(data)
        } else {
          setGuarantees(defaultGuarantees)
        }
      } else {
        setGuarantees(defaultGuarantees)
      }
    } catch (error) {
      console.error('Failed to fetch guarantees:', error)
      setGuarantees(defaultGuarantees)
    } finally {
      setLoading(false)
    }
  }

  const displayGuarantees = guarantees.length > 0 ? guarantees : defaultGuarantees

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

            {/* Guarantee Items */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-white/20">
              {displayGuarantees.map((item) => {
                const IconComponent = iconMap[item.icon || 'CheckCircle'] || CheckCircle
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <IconComponent className="w-6 h-6 opacity-80" />
                    <span className="font-semibold">{item.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
