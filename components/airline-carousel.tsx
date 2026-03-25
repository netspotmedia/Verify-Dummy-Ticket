"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const airlines = [
  { name: "Emirates", code: "EK" },
  { name: "Qatar Airways", code: "QR" },
  { name: "Singapore Airlines", code: "SQ" },
  { name: "Lufthansa", code: "LH" },
  { name: "Cathay Pacific", code: "CX" },
  { name: "Etihad Airways", code: "EY" },
  { name: "Turkish Airlines", code: "TK" },
  { name: "Air France", code: "AF" },
  { name: "British Airways", code: "BA" },
  { name: "KLM", code: "KL" },
  { name: "Swiss Air", code: "LX" },
  { name: "Austrian Airlines", code: "OS" },
  { name: "Brussels Airlines", code: "SN" },
  { name: "Delta Airlines", code: "DL" },
  { name: "United Airlines", code: "UA" },
  { name: "American Airlines", code: "AA" },
  { name: "Southwest Airlines", code: "WN" },
  { name: "Air Canada", code: "AC" },
  { name: "Virgin Atlantic", code: "VS" },
  { name: "Iberia", code: "IB" },
  { name: "Alitalia", code: "AZ" },
  { name: "Aegean Airlines", code: "A3" },
  { name: "Thai Airways", code: "TG" },
  { name: "Malaysia Airlines", code: "MH" },
  { name: "Garuda Indonesia", code: "GA" },
  { name: "Japan Airlines", code: "JL" },
  { name: "ANA", code: "NH" },
  { name: "Korean Air", code: "KE" },
  { name: "Asiana Airlines", code: "OZ" },
  { name: "Oman Air", code: "WY" },
  { name: "EgyptAir", code: "MS" },
  { name: "Kenya Airways", code: "KQ" },
  { name: "Ethiopian Airlines", code: "ET" },
  { name: "South African Airways", code: "SA" },
  { name: "Air India", code: "AI" },
  { name: "IndiGo", code: "6E" },
  { name: "Emirates", code: "EK" },
]

export function AirlineCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

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
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          {/* Left Button */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`hidden md:flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all ${
              canScrollLeft
                ? "hover:bg-slate-50 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-8 pb-2">
              {airlines.map((airline, index) => (
                <div
                  key={`${airline.code}-${index}`}
                  className="flex-shrink-0 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-default"
                >
                  <div className="h-10 w-10 rounded-full bg-white border shadow-sm flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-700">{airline.code}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
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
            className={`hidden md:flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-sm transition-all ${
              canScrollRight
                ? "hover:bg-slate-50 cursor-pointer"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>
    </section>
  )
}
