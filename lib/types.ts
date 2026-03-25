export type TripType = "one_way" | "return_trip" | "multi_city"

export type ServiceType = "flight" | "hotel" | "insurance"

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed"

export type PaymentMethod = "paypal" | "paystack"

export type Currency = "USD" | "NGN"

export type Title = "Mr" | "Mrs" | "Master" | "Miss"

export type FlightValidity = "3d" | "7d" | "14d" | "21d" | "30d"

export type DeliverySpeed = "normal" | "fast" | "express"

export type InsuranceArea = "schengen" | "worldwide_area_1" | "worldwide_area_2"

export type InsuranceDuration = "21d" | "3m" | "6m" | "1y"

export type HotelType = "separate_per_traveler" | "one_for_all"

export interface Traveler {
  id?: string
  title: Title
  firstName: string
  lastName: string
}

export interface FlightDetails {
  tripType: TripType
  flightDetails: string
  validity: FlightValidity
}

export interface HotelDetails {
  type: HotelType
}

export interface InsuranceDetails {
  area: InsuranceArea
  duration: InsuranceDuration
}

export interface OrderFormData {
  // Step 1: Service Selection
  services: ServiceType[]
  
  // Step 2: Common Information
  travelerCount: number
  travelers: Traveler[]
  email: string
  customerCountry: string
  customerCountryCode: string
  separatePnrPerTraveler: boolean
  
  // Step 3: Service-Specific Details
  flightDetails?: FlightDetails
  hotelDetails?: HotelDetails
  insuranceDetails?: InsuranceDetails
  
  // Step 4: Delivery
  deliverySpeed: DeliverySpeed
  
  // Payment
  currency: Currency
  paymentMethod: PaymentMethod
  captchaToken?: string
}

export interface PriceBreakdown {
  lines: PricingLine[]
  subtotal: number
  discount: number
  total: number
  currency: Currency
}

export interface PricingLine {
  code: string
  label: string
  pricingType: "per_traveler" | "flat" | "group_special"
  unitPriceUSD: number | null
  qty: number
  totalPriceUSD: number
}

// ===========================================
// PRICING CONFIGURATION (Per Spec Section 16)
// ===========================================

const PRICING_USD = {
  flight: {
    one_way: 5,
    return_trip: 8,
    multi_city: 15,
  },
  hotel: {
    separate_per_traveler: 5,
    one_for_all_first: 5,
    one_for_all_additional: 1,
  },
  insurance: {
    schengen: {
      "21d": 20,
      "3m": 30,
      "6m": 40,
      "1y": 50,
    },
    worldwide_area_1: {
      "21d": 25,
      "3m": 35,
      "6m": 45,
      "1y": 55,
    },
    worldwide_area_2: {
      "21d": 28,
      "3m": 48,
      "6m": 65,
      "1y": 80,
    },
  },
  flightValidity: {
    "3d": 0,
    "7d": 5,
    "14d": 10,
    "21d": 15,
    "30d": 20,
  },
  deliverySpeed: {
    normal: 0,
    fast: 5,
    express: 10,
  },
} as const

// Exchange rate (should come from backend in production)
export const USD_TO_NGN_RATE = 1650

// ===========================================
// PRICING CALCULATION (Per Spec Section 17)
// ===========================================

export function calculatePriceBreakdown(
  services: ServiceType[],
  travelerCount: number,
  customerCountryCode: string,
  flightDetails?: FlightDetails,
  hotelDetails?: HotelDetails,
  insuranceDetails?: InsuranceDetails,
  deliverySpeed: DeliverySpeed = "normal",
  discountPercent: number = 0
): PriceBreakdown {
  const lines: PricingLine[] = []
  
  // Determine currency based on country (per Spec Section 19)
  const currency: Currency = customerCountryCode === "NG" ? "NGN" : "USD"

  // Flight pricing (per traveler)
  if (services.includes("flight") && flightDetails) {
    const flightBase = PRICING_USD.flight[flightDetails.tripType]
    const flightTotal = flightBase * travelerCount
    
    lines.push({
      code: `flight_${flightDetails.tripType}`,
      label: `Flight Reservation - ${flightDetails.tripType.replace("_", " ")}`,
      pricingType: "per_traveler",
      unitPriceUSD: flightBase,
      qty: travelerCount,
      totalPriceUSD: flightTotal,
    })

    // Flight validity (flat per order)
    const validityPrice = PRICING_USD.flightValidity[flightDetails.validity]
    if (validityPrice > 0) {
      lines.push({
        code: `flight_validity_${flightDetails.validity}`,
        label: `Flight Validity - ${getValidityLabel(flightDetails.validity)}`,
        pricingType: "flat",
        unitPriceUSD: validityPrice,
        qty: 1,
        totalPriceUSD: validityPrice,
      })
    }
  }

  // Hotel pricing (per Spec Section 11)
  if (services.includes("hotel") && hotelDetails) {
    let hotelTotal: number
    
    if (hotelDetails.type === "separate_per_traveler") {
      hotelTotal = travelerCount * PRICING_USD.hotel.separate_per_traveler
      lines.push({
        code: "hotel_separate",
        label: "Hotel Confirmation - Separate for each traveler",
        pricingType: "per_traveler",
        unitPriceUSD: PRICING_USD.hotel.separate_per_traveler,
        qty: travelerCount,
        totalPriceUSD: hotelTotal,
      })
    } else {
      // one_for_all: $5 + $1 per additional traveler
      hotelTotal = PRICING_USD.hotel.one_for_all_first + 
        Math.max(travelerCount - 1, 0) * PRICING_USD.hotel.one_for_all_additional
      lines.push({
        code: "hotel_one_for_all",
        label: "Hotel Confirmation - One for all travelers",
        pricingType: "group_special",
        unitPriceUSD: null,
        qty: 1,
        totalPriceUSD: hotelTotal,
      })
    }
  }

  // Insurance pricing (per Spec Section 13)
  if (services.includes("insurance") && insuranceDetails) {
    const insuranceBase = PRICING_USD.insurance[insuranceDetails.area][insuranceDetails.duration]
    const insuranceTotal = insuranceBase * travelerCount
    
    lines.push({
      code: `insurance_${insuranceDetails.area}_${insuranceDetails.duration}`,
      label: `Travel Insurance - ${getAreaLabel(insuranceDetails.area)} - ${getDurationLabel(insuranceDetails.duration)}`,
      pricingType: "per_traveler",
      unitPriceUSD: insuranceBase,
      qty: travelerCount,
      totalPriceUSD: insuranceTotal,
    })
  }

  // Delivery speed (flat per order)
  const deliveryCost = PRICING_USD.deliverySpeed[deliverySpeed]
  if (deliveryCost > 0) {
    lines.push({
      code: `delivery_${deliverySpeed}`,
      label: `${getDeliveryLabel(deliverySpeed)} Delivery`,
      pricingType: "flat",
      unitPriceUSD: deliveryCost,
      qty: 1,
      totalPriceUSD: deliveryCost,
    })
  }

  // Calculate totals in USD
  const subtotalUSD = lines.reduce((sum, line) => sum + line.totalPriceUSD, 0)
  const discountUSD = (subtotalUSD * discountPercent) / 100
  const totalUSD = subtotalUSD - discountUSD

  // Convert to display currency
  const convertToDisplay = (usdAmount: number) => {
    if (currency === "NGN") {
      return Math.round(usdAmount * USD_TO_NGN_RATE)
    }
    return usdAmount
  }

  return {
    lines,
    subtotal: convertToDisplay(subtotalUSD),
    discount: convertToDisplay(discountUSD),
    total: convertToDisplay(totalUSD),
    currency,
  }
}

// Helper functions for labels
function getValidityLabel(validity: FlightValidity): string {
  const labels: Record<FlightValidity, string> = {
    "3d": "3 Days (72 hrs)",
    "7d": "7 Days",
    "14d": "14 Days",
    "21d": "21 Days",
    "30d": "30 Days",
  }
  return labels[validity]
}

function getAreaLabel(area: InsuranceArea): string {
  const labels: Record<InsuranceArea, string> = {
    schengen: "Schengen",
    worldwide_area_1: "Worldwide Area 1",
    worldwide_area_2: "Worldwide Area 2",
  }
  return labels[area]
}

function getDurationLabel(duration: InsuranceDuration): string {
  const labels: Record<InsuranceDuration, string> = {
    "21d": "Up to 21 Days",
    "3m": "Up to 3 Months",
    "6m": "Up to 6 Months",
    "1y": "Up to 1 Year",
  }
  return labels[duration]
}

function getDeliveryLabel(speed: DeliverySpeed): string {
  const labels: Record<DeliverySpeed, string> = {
    normal: "Normal",
    fast: "Fast",
    express: "Express",
  }
  return labels[speed]
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export function getAllowedPaymentMethods(countryCode: string): PaymentMethod[] {
  if (countryCode === "NG") {
    return ["paystack"] // Nigeria: Paystack only
  }
  return ["paypal", "paystack"] // Others: both
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (currency === "NGN") {
    return `₦${amount.toLocaleString()}`
  }
  return `$${amount.toFixed(2)}`
}
