import { z } from "zod"

export const emailSchema = z.string().email("Invalid email address")

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format")

export const uuidSchema = z.string().uuid("Invalid ID format")

export const orderCreateSchema = z.object({
  services: z.array(z.enum(["flight", "hotel", "insurance"])).min(1, "At least one service is required"),
  travelerCount: z.number().int().min(1).max(10),
  email: emailSchema,
  customerCountry: z.string().min(1, "Country is required"),
  customerCountryCode: z.string().length(2),
  travelers: z.array(
    z.object({
      title: z.enum(["Mr", "Mrs", "Master", "Miss"]),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
    })
  ).min(1),
  flightDetails: z.object({
    tripType: z.enum(["one_way", "return_trip", "multi_city"]),
    flightDetails: z.string().min(10, "Please provide flight details"),
    validity: z.enum(["3d", "7d", "14d", "21d", "30d"]),
  }).optional(),
  hotelDetails: z.object({
    type: z.enum(["separate_per_traveler", "one_for_all"]),
  }).optional(),
  insuranceDetails: z.object({
    area: z.enum(["schengen", "worldwide_area_1", "worldwide_area_2"]),
    duration: z.enum(["21d", "3m", "6m", "1y"]),
  }).optional(),
  deliverySpeed: z.enum(["normal", "fast", "express"]),
  paymentMethod: z.enum(["paypal", "paystack"]),
  currency: z.enum(["USD", "NGN"]),
})

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  subject: z.string().min(5, "Subject must be at least 5 characters").optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  orderId: z.string().uuid().optional().nullable(),
})

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed" }
    }
    return { success: false, error: "Validation failed" }
  }
}
