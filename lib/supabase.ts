import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

export type HeroSection = {
  id: string
  badge_text: string | null
  badge_color: string | null
  heading: string
  heading_color: string | null
  subheading: string | null
  subheading_color: string | null
  embassy_notice: string | null
  embassy_notice_color: string | null
  cta_primary_text: string | null
  cta_primary_link: string | null
  cta_secondary_text: string | null
  cta_secondary_link: string | null
  background_type: string | null
  background_color: string | null
  background_image_url: string | null
  created_at: string
  updated_at: string
}

export type ServiceItem = {
  id: string
  section_id: string | null
  title: string
  description: string | null
  icon: string | null
  image_url: string | null
  price_from: string | null
  link: string | null
  sort_order: number | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export type HowItWorksItem = {
  id: string
  step_number: number
  title: string
  description: string | null
  icon: string | null
  image_url: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export type Testimonial = {
  id: string
  name: string
  location: string | null
  avatar_url: string | null
  rating: number | null
  comment: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
  sort_order: number | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export type GuaranteeItem = {
  id: string
  title: string
  description: string | null
  icon: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export type SiteSettings = {
  id: string
  category: string
  key: string
  value: any
  description: string | null
  is_public: boolean | null
  updated_at: string
  updated_by: string | null
}
