-- Migration: Add blog posts table
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_name TEXT DEFAULT 'Admin',
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "blog_posts_select_published" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "blog_posts_admin_all" ON public.blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(is_featured);

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, is_published, is_featured, published_at, seo_title, seo_description) VALUES
(
  'How to Get a Flight Reservation for Visa Application',
  'flight-reservation-visa-application',
  'Learn everything you need to know about getting a flight reservation for your visa application, including tips and best practices.',
  '## Why You Need a Flight Reservation for Visa Applications

When applying for a visa, most embassies require proof of onward travel. This means you need to show that you have plans to leave the country before your visa expires.

A flight reservation (also called a dummy ticket or itinerary) is a confirmed booking that has not been paid for. It provides a valid PNR that can be verified on the airline website.

## Benefits of Using Our Service

- **Instant Delivery**: Receive your itinerary within 24 hours
- **100% Verifiable**: Real PNR codes from GDS systems
- **Embassy Accepted**: Works with all major embassies worldwide
- **Money-Back Guarantee**: Full refund if not satisfied

## How It Works

1. Submit your travel details
2. We create a verified reservation
3. Receive your PDF via email
4. Use for your visa application',
  'Visa Tips',
  true,
  true,
  NOW(),
  'Flight Reservation for Visa Application | Expert Guide',
  'Learn how to get a flight reservation for your visa application. Complete guide with tips, requirements, and best practices.'
),
(
  'Schengen Visa Requirements: Complete Checklist',
  'schengen-visa-requirements-checklist',
  'Everything you need to know about Schengen visa requirements and what documents to prepare for your application.',
  '## Understanding Schengen Visa Requirements

The Schengen Area includes 26 European countries. To visit any of these countries, you may need a Schengen visa depending on your nationality.

## Required Documents

1. **Valid Passport**: Must be valid for 3 months beyond your planned stay
2. **Visa Application Form**: Completed and signed
3. **Photo**: Recent passport-sized photos (2)
4. **Travel Insurance**: Minimum €30,000 coverage
5. **Flight Itinerary**: Confirmed round-trip booking
6. **Hotel Reservation**: Proof of accommodation
7. **Proof of Funds**: Bank statements, payslips
8. **Employment Letter**: From your employer

## Processing Time

Visa processing typically takes 15 calendar days, but can be extended to 45 days in some cases.',
  'Visa Guides',
  true,
  false,
  NOW(),
  'Schengen Visa Requirements Checklist | Complete Guide',
  'Complete checklist of Schengen visa requirements. Learn what documents you need for your application.'
),
(
  'Hotel Booking for Visa: What You Need to Know',
  'hotel-booking-visa-requirements',
  'Everything about hotel bookings for visa applications, including how to get verifiable confirmations.',
  '## Hotel Booking Requirements for Visas

Many visa applications require proof of accommodation. Here is what you need to know about hotel bookings for visa purposes.

## Can You Use Hotel Bookings?

Yes! Hotel booking confirmations are widely accepted for visa applications. The key is to ensure the booking is verifiable.

## Benefits of Our Hotel Service

- **Instant Confirmation**: Get your booking within hours
- **Fully Verifiable**: Can be checked on hotel portals
- **Free Cancellation**: No financial risk
- **Global Coverage**: Hotels in any destination

## Tips for Visa Applications

1. Book for your entire stay
2. Include all travelers on the booking
3. Ensure booking is in your name
4. Get written confirmation',
  'Visa Guides',
  true,
  false,
  NOW(),
  'Hotel Booking for Visa Application | Expert Guide',
  'Learn about hotel booking requirements for visa applications. Get verifiable hotel confirmations.'
);
