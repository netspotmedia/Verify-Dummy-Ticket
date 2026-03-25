export type TripType = "one_way" | "round_trip" | "multi_city"

export type ServiceType = "flight" | "hotel" | "insurance"

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded"

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed"

export type PaymentMethod = "paypal" | "paystack"

export type Currency = "USD" | "NGN"

export interface Traveler {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  passportNumber?: string
}

export interface FlightDetails {
  tripType: TripType
  departureCity: string
  arrivalCity: string
  departureDate: string
  returnDate?: string
  preferredAirline?: string
}

export interface MultiCityFlight {
  from: string
  to: string
  date: string
}

export interface HotelDetails {
  city: string
  checkInDate: string
  checkOutDate: string
  hotelName?: string
}

export interface InsuranceDetails {
  startDate: string
  endDate: string
  coverageAmount: number
  destination: string
}

export interface OrderFormData {
  // Step 1: Service Selection
  services: ServiceType[]
  
  // Step 2: Trip Details
  tripType: TripType
  flightDetails?: FlightDetails
  multiCityFlights?: MultiCityFlight[]
  hotelDetails?: HotelDetails
  insuranceDetails?: InsuranceDetails
  
  // Step 3: Traveler Information
  numberOfTravelers: number
  travelers: Traveler[]
  
  // Step 4: Contact & Delivery
  contactEmail: string
  contactPhone: string
  whatsappNumber?: string
  deliveryMethod: "email" | "whatsapp" | "both"
  
  // Payment
  currency: Currency
  paymentMethod: PaymentMethod
  couponCode?: string
}

export interface PriceBreakdown {
  flightPrice: number
  hotelPrice: number
  insurancePrice: number
  subtotal: number
  discount: number
  total: number
}

// Service pricing
export const SERVICE_PRICES = {
  flight: {
    USD: 15,
    NGN: 6000,
  },
  hotel: {
    USD: 10,
    NGN: 4000,
  },
  insurance: {
    USD: 25,
    NGN: 10000,
  },
} as const

export function calculatePrice(
  services: ServiceType[],
  numberOfTravelers: number,
  currency: Currency,
  discountPercent: number = 0
): PriceBreakdown {
  const flightPrice = services.includes("flight")
    ? SERVICE_PRICES.flight[currency] * numberOfTravelers
    : 0
  const hotelPrice = services.includes("hotel")
    ? SERVICE_PRICES.hotel[currency] * numberOfTravelers
    : 0
  const insurancePrice = services.includes("insurance")
    ? SERVICE_PRICES.insurance[currency] * numberOfTravelers
    : 0

  const subtotal = flightPrice + hotelPrice + insurancePrice
  const discount = (subtotal * discountPercent) / 100
  const total = subtotal - discount

  return {
    flightPrice,
    hotelPrice,
    insurancePrice,
    subtotal,
    discount,
    total,
  }
}
