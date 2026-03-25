-- Migration: Add services management features
-- Run this SQL in Supabase SQL Editor

-- Add icon column to service_types if not exists
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'default';

-- Ensure default services exist
INSERT INTO public.service_types (name, description, base_price_usd, base_price_ngn, icon, is_active) VALUES
  ('flight_oneway', 'One-way Flight Reservation', 25.00, 41250.00, 'flight', true),
  ('flight_roundtrip', 'Round-trip Flight Reservation', 35.00, 57750.00, 'flight', true),
  ('flight_multicity', 'Multi-city Flight Reservation', 45.00, 74250.00, 'flight', true),
  ('hotel', 'Hotel Booking Confirmation', 30.00, 49500.00, 'hotel', true),
  ('travel_insurance', 'Travel Medical Insurance', 40.00, 66000.00, 'insurance', true)
ON CONFLICT (name) DO NOTHING;

-- Update existing services with icons if missing
UPDATE public.service_types SET icon = 'flight' WHERE name LIKE 'flight_%' AND (icon IS NULL OR icon = 'default');
UPDATE public.service_types SET icon = 'hotel' WHERE name = 'hotel' AND (icon IS NULL OR icon = 'default');
UPDATE public.service_types SET icon = 'insurance' WHERE name LIKE '%insurance%' AND (icon IS NULL OR icon = 'default');

-- Ensure payment gateway settings exist
INSERT INTO public.site_settings (key, value) VALUES
  ('paypal_mode', '"sandbox"'),
  ('paypal_client_id', '""'),
  ('paypal_client_secret', '""'),
  ('paystack_public_key', '""'),
  ('paystack_secret_key', '""'),
  ('paystack_merchant_email', '""')
ON CONFLICT (key) DO NOTHING;
