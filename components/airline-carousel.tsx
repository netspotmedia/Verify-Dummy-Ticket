"use client"

import { useState, useEffect, useRef } from "react"

interface Airline {
  id: string
  name: string
  code: string
  logo_url: string | null
  sort_order: number | null
  is_active: boolean | null
}

export function AirlineCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const animationRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)

  useEffect(() => {
    fetchAirlines()
  }, [])

  const fetchAirlines = async () => {
    try {
      const res = await fetch('/api/landing/airlines')
      if (res.ok) {
        const data = await res.json()
        setAirlines(data)
      }
    } catch (error) {
      console.error('Failed to fetch airlines:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || airlines.length === 0) return

    let lastTime = 0
    const speed = 0.5

    const animate = (currentTime: number) => {
      if (!container) return
      
      if (!lastTime) lastTime = currentTime
      const delta = currentTime - lastTime
      lastTime = currentTime

      if (!isPausedRef.current) {
        container.scrollLeft += speed * (delta / 16)

        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleMouseEnter = () => {
      isPausedRef.current = true
    }

    const handleMouseLeave = () => {
      isPausedRef.current = false
      lastTime = 0
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [airlines])

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 md:gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex-shrink-0">
                <div className="h-14 w-14 md:h-20 md:w-20 rounded-xl bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (airlines.length === 0) {
    return null
  }

  const duplicatedAirlines = [...airlines, ...airlines]

  return (
    <section className="py-12 md:py-16 bg-slate-50 border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-6 md:gap-10 overflow-hidden"
        >
          {duplicatedAirlines.map((airline, index) => (
            <div
              key={`${airline.id}-${index}`}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="h-14 w-14 md:h-20 md:w-20 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-2 hover:shadow-md transition-shadow duration-300">
                {airline.logo_url ? (
                  <img 
                    src={airline.logo_url} 
                    alt={airline.name} 
                    className="h-full w-full object-contain" 
                  />
                ) : (
                  <span className="text-sm md:text-base font-bold text-slate-500">{airline.code}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
