"use client"

import { useOrderStore } from "@/lib/order-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TripType, MultiCityFlight } from "@/lib/types"
import { ArrowLeft, ArrowRight, Plane, Building2, Shield, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

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

  // Local state for multi-city flights
  const [localMultiCity, setLocalMultiCity] = useState<MultiCityFlight[]>(
    multiCityFlights || [
      { from: "", to: "", date: "" },
      { from: "", to: "", date: "" },
    ]
  )

  useEffect(() => {
    if (tripType === "multi_city") {
      setMultiCityFlights(localMultiCity)
    }
  }, [localMultiCity, tripType, setMultiCityFlights])

  const addMultiCityFlight = () => {
    if (localMultiCity.length < 5) {
      setLocalMultiCity([...localMultiCity, { from: "", to: "", date: "" }])
    }
  }

  const removeMultiCityFlight = (index: number) => {
    if (localMultiCity.length > 2) {
      setLocalMultiCity(localMultiCity.filter((_, i) => i !== index))
    }
  }

  const updateMultiCityFlight = (index: number, field: keyof MultiCityFlight, value: string) => {
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
    <div className="space-y-6">
      {/* Number of Travelers */}
      <div className="space-y-3">
        <Label>Number of Travelers</Label>
        <Select
          value={numberOfTravelers.toString()}
          onValueChange={(value) => setNumberOfTravelers(parseInt(value))}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} {n === 1 ? "Traveler" : "Travelers"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Flight Details */}
      {hasFlight && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plane className="h-5 w-5 text-primary" />
              Flight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trip Type */}
            <div className="space-y-2">
              <Label>Trip Type</Label>
              <RadioGroup
                value={tripType}
                onValueChange={(value) => setTripType(value as TripType)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="one_way" id="one_way" />
                  <Label htmlFor="one_way" className="cursor-pointer">One Way</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="round_trip" id="round_trip" />
                  <Label htmlFor="round_trip" className="cursor-pointer">Round Trip</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multi_city" id="multi_city" />
                  <Label htmlFor="multi_city" className="cursor-pointer">Multi-City</Label>
                </div>
              </RadioGroup>
            </div>

            {/* One Way / Round Trip */}
            {tripType !== "multi_city" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Departure City</Label>
                  <Input
                    placeholder="e.g., New York (JFK)"
                    value={flightDetails?.departureCity || ""}
                    onChange={(e) =>
                      setFlightDetails({ ...flightDetails!, departureCity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival City</Label>
                  <Input
                    placeholder="e.g., London (LHR)"
                    value={flightDetails?.arrivalCity || ""}
                    onChange={(e) =>
                      setFlightDetails({ ...flightDetails!, arrivalCity: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Input
                    type="date"
                    value={flightDetails?.departureDate || ""}
                    onChange={(e) =>
                      setFlightDetails({ ...flightDetails!, departureDate: e.target.value })
                    }
                  />
                </div>
                {tripType === "round_trip" && (
                  <div className="space-y-2">
                    <Label>Return Date</Label>
                    <Input
                      type="date"
                      value={flightDetails?.returnDate || ""}
                      onChange={(e) =>
                        setFlightDetails({ ...flightDetails!, returnDate: e.target.value })
                      }
                    />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <Label>Preferred Airline (Optional)</Label>
                  <Input
                    placeholder="e.g., Emirates, British Airways"
                    value={flightDetails?.preferredAirline || ""}
                    onChange={(e) =>
                      setFlightDetails({ ...flightDetails!, preferredAirline: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Multi-City */}
            {tripType === "multi_city" && (
              <div className="space-y-4">
                {localMultiCity.map((flight, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-4 items-end p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <Input
                        placeholder="City"
                        value={flight.from}
                        onChange={(e) => updateMultiCityFlight(index, "from", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <Input
                        placeholder="City"
                        value={flight.to}
                        onChange={(e) => updateMultiCityFlight(index, "to", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={flight.date}
                        onChange={(e) => updateMultiCityFlight(index, "date", e.target.value)}
                      />
                    </div>
                    <div>
                      {localMultiCity.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeMultiCityFlight(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {localMultiCity.length < 5 && (
                  <Button type="button" variant="outline" onClick={addMultiCityFlight}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Flight
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hotel Details */}
      {hasHotel && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Hotel Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>City / Destination</Label>
                <Input
                  placeholder="e.g., Paris, France"
                  value={hotelDetails?.city || ""}
                  onChange={(e) =>
                    setHotelDetails({ ...hotelDetails!, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Input
                  type="date"
                  value={hotelDetails?.checkInDate || ""}
                  onChange={(e) =>
                    setHotelDetails({ ...hotelDetails!, checkInDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Input
                  type="date"
                  value={hotelDetails?.checkOutDate || ""}
                  onChange={(e) =>
                    setHotelDetails({ ...hotelDetails!, checkOutDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Preferred Hotel (Optional)</Label>
                <Input
                  placeholder="e.g., Hilton, Marriott"
                  value={hotelDetails?.hotelName || ""}
                  onChange={(e) =>
                    setHotelDetails({ ...hotelDetails!, hotelName: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance Details */}
      {hasInsurance && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Travel Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Destination Country</Label>
                <Input
                  placeholder="e.g., France, Germany, UK"
                  value={insuranceDetails?.destination || ""}
                  onChange={(e) =>
                    setInsuranceDetails({
                      ...insuranceDetails!,
                      destination: e.target.value,
                      coverageAmount: 35000,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Coverage Start Date</Label>
                <Input
                  type="date"
                  value={insuranceDetails?.startDate || ""}
                  onChange={(e) =>
                    setInsuranceDetails({ ...insuranceDetails!, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Coverage End Date</Label>
                <Input
                  type="date"
                  value={insuranceDetails?.endDate || ""}
                  onChange={(e) =>
                    setInsuranceDetails({ ...insuranceDetails!, endDate: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Coverage: $35,000 | Validity: Up to 90 days | Includes medical emergencies, travel delays, and more.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isValid()} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
