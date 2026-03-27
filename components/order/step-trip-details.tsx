"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Plane, Building2, Shield, Plus, Trash2, Info } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const TRIP_TYPES = [
  { value: "one_way", label: "One Way" },
  { value: "round_trip", label: "Round Trip" },
  { value: "multi_city", label: "Multi-City" },
]

export function StepTripDetails() {
  const {
    formData,
    setTripType,
    setFlightDetails,
    setMultiCityFlights,
    setHotelDetails,
    setInsuranceDetails,
    setNumberOfTravelers,
    nextStep,
    prevStep,
  } = useOrderStore()

  const { services, tripType, flightDetails, multiCityFlights, hotelDetails, insuranceDetails, numberOfTravelers } = formData
  const hasFlight = services.includes("flight")
  const hasHotel = services.includes("hotel")
  const hasInsurance = services.includes("insurance")

  const [localMultiCity, setLocalMultiCity] = useState(
    multiCityFlights || [{ from: "", to: "", date: "" }, { from: "", to: "", date: "" }]
  )

  const addMultiCityFlight = () => {
    if (localMultiCity.length < 5) setLocalMultiCity([...localMultiCity, { from: "", to: "", date: "" }])
  }

  const removeMultiCityFlight = (index: number) => {
    if (localMultiCity.length > 2) setLocalMultiCity(localMultiCity.filter((_, i) => i !== index))
  }

  const updateMultiCityFlight = (index: number, field: "from" | "to" | "date", value: string) => {
    const updated = [...localMultiCity]
    updated[index] = { ...updated[index], [field]: value }
    setLocalMultiCity(updated)
  }

  const isValid = () => {
    if (hasFlight) {
      if (tripType === "multi_city") {
        if (!localMultiCity.every(f => f.from && f.to && f.date)) return false
      } else {
        if (!flightDetails?.departureCity || !flightDetails?.arrivalCity || !flightDetails?.departureDate) return false
        if (tripType === "round_trip" && !flightDetails?.returnDate) return false
      }
    }
    if (hasHotel) {
      if (!hotelDetails?.city || !hotelDetails?.checkInDate || !hotelDetails?.checkOutDate) return false
    }
    if (hasInsurance) {
      if (!insuranceDetails?.destination || !insuranceDetails?.startDate || !insuranceDetails?.endDate) return false
    }
    return true
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Label className="text-sm font-medium uppercase tracking-wider text-black">Number of Travelers</Label>
        <Select value={numberOfTravelers.toString()} onValueChange={(v) => setNumberOfTravelers(parseInt(v))}>
          <SelectTrigger className="w-32 h-10 rounded-lg border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "Traveler" : "Travelers"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFlight && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Flight Details</span>
          </div>
          
          <div className="flex gap-2">
            {TRIP_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setTripType(type.value as any)}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                  tripType === type.value
                    ? "bg-[#c8143d]/10 text-[#c8143d] ring-1 ring-[#c8143d]/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>

          {tripType !== "multi_city" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm text-black">Departure City</Label>
                <Input placeholder="e.g., New York (JFK)" value={flightDetails?.departureCity || ""} onChange={(e) => setFlightDetails({ ...flightDetails!, departureCity: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-black">Arrival City</Label>
                <Input placeholder="e.g., London (LHR)" value={flightDetails?.arrivalCity || ""} onChange={(e) => setFlightDetails({ ...flightDetails!, arrivalCity: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-black">Departure Date</Label>
                <Input type="date" value={flightDetails?.departureDate || ""} onChange={(e) => setFlightDetails({ ...flightDetails!, departureDate: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
              </div>
              {tripType === "round_trip" && (
                <div className="space-y-1.5">
                  <Label className="text-sm text-black">Return Date</Label>
                  <Input type="date" value={flightDetails?.returnDate || ""} onChange={(e) => setFlightDetails({ ...flightDetails!, returnDate: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
                </div>
              )}
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-sm text-black">Preferred Airline (Optional)</Label>
                <Input placeholder="e.g., Emirates, British Airways" value={flightDetails?.preferredAirline || ""} onChange={(e) => setFlightDetails({ ...flightDetails!, preferredAirline: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {localMultiCity.map((flight, index) => (
                <div key={index} className="grid gap-2 md:grid-cols-4 p-3 bg-slate-50 rounded-lg">
                  <Input placeholder="From" value={flight.from} onChange={(e) => updateMultiCityFlight(index, "from", e.target.value)} className="h-9 rounded-lg bg-white text-sm" />
                  <Input placeholder="To" value={flight.to} onChange={(e) => updateMultiCityFlight(index, "to", e.target.value)} className="h-9 rounded-lg bg-white text-sm" />
                  <Input type="date" value={flight.date} onChange={(e) => updateMultiCityFlight(index, "date", e.target.value)} className="h-9 rounded-lg bg-white text-sm" />
                  {localMultiCity.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMultiCityFlight(index)} className="h-9 w-9">
                      <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  )}
                </div>
              ))}
              {localMultiCity.length < 5 && (
                <Button type="button" variant="ghost" onClick={addMultiCityFlight} className="text-xs text-[#c8143d]">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Flight
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {hasHotel && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Hotel Details</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm text-black">City / Destination</Label>
              <Input placeholder="e.g., Paris, France" value={hotelDetails?.city || ""} onChange={(e) => setHotelDetails({ ...hotelDetails!, city: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-black">Check-in</Label>
              <Input type="date" value={hotelDetails?.checkInDate || ""} onChange={(e) => setHotelDetails({ ...hotelDetails!, checkInDate: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-black">Check-out</Label>
              <Input type="date" value={hotelDetails?.checkOutDate || ""} onChange={(e) => setHotelDetails({ ...hotelDetails!, checkOutDate: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm text-black">Preferred Hotel (Optional)</Label>
              <Input placeholder="e.g., Hilton, Marriott" value={hotelDetails?.hotelName || ""} onChange={(e) => setHotelDetails({ ...hotelDetails!, hotelName: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
          </div>
        </div>
      )}

      {hasInsurance && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Insurance Details</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm text-black">Destination Country</Label>
              <Input placeholder="e.g., France, Germany, UK" value={insuranceDetails?.destination || ""} onChange={(e) => setInsuranceDetails({ ...insuranceDetails!, destination: e.target.value, coverageAmount: 35000 })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-black">Start Date</Label>
              <Input type="date" value={insuranceDetails?.startDate || ""} onChange={(e) => setInsuranceDetails({ ...insuranceDetails!, startDate: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-black">End Date</Label>
              <Input type="date" value={insuranceDetails?.endDate || ""} onChange={(e) => setInsuranceDetails({ ...insuranceDetails!, endDate: e.target.value })} className="h-10 rounded-lg border-slate-200 bg-white text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            <Info className="h-3.5 w-3.5" />
            <span>Coverage: $35,000 | Up to 90 days | Medical emergencies, travel delays</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={prevStep} className="h-10 px-4 rounded-lg">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="flex-1 h-10 rounded-lg bg-[#c8143d] hover:bg-[#b01030] font-medium">
          Continue
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}