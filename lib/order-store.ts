"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { 
  OrderFormData, 
  ServiceType, 
  TripType, 
  Currency, 
  PaymentMethod,
  FlightDetails,
  HotelDetails,
  InsuranceDetails,
  DeliverySpeed,
  Title,
  Traveler
} from "./types"

type StepId = "services" | "common" | "flight" | "hotel" | "insurance" | "review" | "payment"

interface OrderStore {
  // Form data
  formData: OrderFormData
  currentStepIndex: number
  activeSteps: StepId[]
  
  // Actions
  setServices: (services: ServiceType[]) => void
  setCustomerInfo: (info: { 
    travelerCount?: number
    email?: string
    customerCountry?: string
    customerCountryCode?: string
    separatePnrPerTraveler?: boolean
  }) => void
  setTravelers: (travelers: Traveler[]) => void
  updateTraveler: (index: number, traveler: Partial<Traveler>) => void
  setFlightDetails: (details: FlightDetails) => void
  setHotelDetails: (details: HotelDetails) => void
  setInsuranceDetails: (details: InsuranceDetails) => void
  setDeliverySpeed: (speed: DeliverySpeed) => void
  setCurrency: (currency: Currency) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setCaptchaToken: (token: string) => void
  
  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (stepIndex: number) => void
  
  // Reset
  resetForm: () => void
  
  // Helpers
  computeActiveSteps: () => StepId[]
  syncTravelers: (count: number) => void
}

const initialFormData: OrderFormData = {
  services: [],
  travelerCount: 1,
  travelers: [{ title: "Mr", firstName: "", lastName: "" }],
  email: "",
  customerCountry: "",
  customerCountryCode: "",
  separatePnrPerTraveler: false,
  deliverySpeed: "normal",
  currency: "USD",
  paymentMethod: "paypal",
}

function computeActiveSteps(formData: OrderFormData): StepId[] {
  const steps: StepId[] = ["services", "common"]
  
  if (formData.services.includes("flight")) steps.push("flight")
  if (formData.services.includes("hotel")) steps.push("hotel")
  if (formData.services.includes("insurance")) steps.push("insurance")
  
  steps.push("review", "payment")
  
  return steps
}

function syncTravelers(count: number, travelers: Traveler[]): Traveler[] {
  const result = [...travelers]
  
  while (result.length < count) {
    result.push({ title: "Mr" as Title, firstName: "", lastName: "" })
  }
  
  return result.slice(0, count)
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      currentStepIndex: 0,
      activeSteps: ["services", "common", "review", "payment"],

      setServices: (services) =>
        set((state) => {
          const newFormData = { ...state.formData, services }
          return {
            formData: newFormData,
            activeSteps: computeActiveSteps(newFormData),
            currentStepIndex: 0,
          }
        }),

      setCustomerInfo: (info) =>
        set((state) => {
          const newFormData = { ...state.formData, ...info }
          
          // Auto-update payment method when country changes
          if (info.customerCountryCode) {
            if (info.customerCountryCode === "NG") {
              newFormData.currency = "NGN"
              newFormData.paymentMethod = "paystack"
            } else {
              newFormData.currency = "USD"
            }
          }
          
          return { formData: newFormData }
        }),

      setTravelers: (travelers) =>
        set((state) => ({
          formData: { ...state.formData, travelers },
        })),

      updateTraveler: (index, traveler) =>
        set((state) => {
          const travelers = [...state.formData.travelers]
          travelers[index] = { ...travelers[index], ...traveler }
          return {
            formData: { ...state.formData, travelers },
          }
        }),

      setFlightDetails: (flightDetails) =>
        set((state) => ({
          formData: { ...state.formData, flightDetails },
        })),

      setHotelDetails: (hotelDetails) =>
        set((state) => ({
          formData: { ...state.formData, hotelDetails },
        })),

      setInsuranceDetails: (insuranceDetails) =>
        set((state) => ({
          formData: { ...state.formData, insuranceDetails },
        })),

      setDeliverySpeed: (deliverySpeed) =>
        set((state) => ({
          formData: { ...state.formData, deliverySpeed },
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

      setCaptchaToken: (captchaToken) =>
        set((state) => ({
          formData: { ...state.formData, captchaToken },
        })),

      nextStep: () =>
        set((state) => {
          const maxIndex = state.activeSteps.length - 1
          return {
            currentStepIndex: Math.min(state.currentStepIndex + 1, maxIndex),
          }
        }),

      prevStep: () =>
        set((state) => ({
          currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
        })),

      goToStep: (stepIndex) =>
        set(() => ({
          currentStepIndex: Math.max(0, stepIndex),
        })),

      resetForm: () =>
        set(() => ({
          formData: initialFormData,
          currentStepIndex: 0,
          activeSteps: ["services", "common", "review", "payment"],
        })),

      computeActiveSteps: () => computeActiveSteps(get().formData),

      syncTravelers: (count) =>
        set((state) => {
          const travelers = syncTravelers(count, state.formData.travelers)
          return {
            formData: { ...state.formData, travelerCount: count, travelers },
          }
        }),
    }),
    {
      name: "order-form-storage",
    }
  )
)
