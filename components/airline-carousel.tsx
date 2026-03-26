"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll)
      return () => container.removeEventListener("scroll", checkScroll)
    }
  }, [airlines])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (airlines.length === 0) {
    return null
  }

  return (
    <section className="py-8 md:py-12 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Left Button */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`hidden md:flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all shrink-0 ${
              canScrollLeft
                ? "hover:bg-slate-50 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 pb-2">
              {airlines.map((airline) => (
                <div
                  key={airline.id}
                  className="flex-shrink-0 flex flex-col items-center gap-1 md:gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default"
                >
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white border shadow-sm flex items-center justify-center overflow-hidden p-1">
                    {airline.logo_url ? (
                      <img src={airline.logo_url} alt={airline.name} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-slate-700">{airline.code}</span>
                    )}
                  </div>
                  <span className="text-xs md:text-xs font-medium text-slate-600 whitespace-nowrap">
                    {airline.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Button */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`hidden md:flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all shrink-0 ${
              canScrollRight
                ? "hover:bg-slate-50 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
          </button>
        </div>
      </div>
    </section>
  )
}
