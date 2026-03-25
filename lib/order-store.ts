"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { OrderFormData, ServiceType, TripType, Currency, PaymentMethod } from "./types"

interface OrderStore {
  // Form data
  formData: OrderFormData
  currentStep: number
  
  // Actions
  setServices: (services: ServiceType[]) => void
  setTripType: (tripType: TripType) => void
  setFlightDetails: (details: OrderFormData["flightDetails"]) => void
  setMultiCityFlights: (flights: OrderFormData["multiCityFlights"]) => void
  setHotelDetails: (details: OrderFormData["hotelDetails"]) => void
  setInsuranceDetails: (details: OrderFormData["insuranceDetails"]) => void
  setNumberOfTravelers: (count: number) => void
  setTravelers: (travelers: OrderFormData["travelers"]) => void
  setContactInfo: (info: Pick<OrderFormData, "contactEmail" | "contactPhone" | "whatsappNumber" | "deliveryMethod">) => void
  setCurrency: (currency: Currency) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setCouponCode: (code: string) => void
  
  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  
  // Reset
  resetForm: () => void
}

const initialFormData: OrderFormData = {
  services: [],
  tripType: "round_trip",
  numberOfTravelers: 1,
  travelers: [{ firstName: "", lastName: "", email: "" }],
  contactEmail: "",
  contactPhone: "",
  deliveryMethod: "email",
  currency: "USD",
  paymentMethod: "paypal",
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      currentStep: 0,

      setServices: (services) =>
        set((state) => ({
          formData: { ...state.formData, services },
        })),

      setTripType: (tripType) =>
        set((state) => ({
          formData: { ...state.formData, tripType },
        })),

      setFlightDetails: (flightDetails) =>
        set((state) => ({
          formData: { ...state.formData, flightDetails },
        })),

      setMultiCityFlights: (multiCityFlights) =>
        set((state) => ({
          formData: { ...state.formData, multiCityFlights },
        })),

      setHotelDetails: (hotelDetails) =>
        set((state) => ({
          formData: { ...state.formData, hotelDetails },
        })),

      setInsuranceDetails: (insuranceDetails) =>
        set((state) => ({
          formData: { ...state.formData, insuranceDetails },
        })),

      setNumberOfTravelers: (numberOfTravelers) =>
        set((state) => {
          const travelers = [...state.formData.travelers]
          // Add or remove travelers as needed
          while (travelers.length < numberOfTravelers) {
            travelers.push({ firstName: "", lastName: "", email: "" })
          }
          while (travelers.length > numberOfTravelers) {
            travelers.pop()
          }
          return {
            formData: { ...state.formData, numberOfTravelers, travelers },
          }
        }),

      setTravelers: (travelers) =>
        set((state) => ({
          formData: { ...state.formData, travelers },
        })),

      setContactInfo: (info) =>
        set((state) => ({
          formData: { ...state.formData, ...info },
        })),

      setCurrency: (currency) =>
        set((state) => ({
          formData: {
            ...state.formData,
            currency,
            paymentMethod: currency === "NGN" ? "paystack" : "paypal",
          },
        })),

      setPaymentMethod: (paymentMethod) =>
        set((state) => ({
          formData: { ...state.formData, paymentMethod },
        })),

      setCouponCode: (couponCode) =>
        set((state) => ({
          formData: { ...state.formData, couponCode },
        })),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      goToStep: (step) =>
        set(() => ({
          currentStep: Math.max(0, Math.min(step, 4)),
        })),

      resetForm: () =>
        set(() => ({
          formData: initialFormData,
          currentStep: 0,
        })),
    }),
    {
      name: "order-form-storage",
    }
  )
)
