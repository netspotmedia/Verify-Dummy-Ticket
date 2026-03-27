-- Migration: Add missing columns to orders table
-- Fixes schema mismatch between API and dashboard

-- Add services column (array of service types: flight, hotel, insurance)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';

-- Add delivery_method column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'email';

-- Add coupon_code column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Add admin_notes column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add separate_pnr_per_traveler column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS separate_pnr_per_traveler BOOLEAN DEFAULT false;

-- Add primary_contact column (for multi-traveler orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS primary_contact TEXT;

-- Add customer_country and customer_country_code columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_country TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_country_code TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_services ON public.orders USING GIN (services);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Add trigger for updated_at on new columns (already exists for orders table)
