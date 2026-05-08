-- Fix service detail table columns to match what the order form actually collects.
--
-- The original schema had structured columns (departure_city, check_in_date, etc.)
-- but the order form collects: free-text itinerary, trip type, validity (flight);
-- confirmation type (hotel); coverage area + duration (insurance).
-- This migration adds the missing columns and makes unused NOT NULL columns nullable.

-- ============================================================
-- flight_details
-- ============================================================

-- The API writes `trip_type` but the original schema has `flight_type` (different name + values)
ALTER TABLE public.flight_details ADD COLUMN IF NOT EXISTS trip_type    TEXT;
ALTER TABLE public.flight_details ADD COLUMN IF NOT EXISTS validity      TEXT;  -- 3d | 7d | 14d | 21d | 30d
ALTER TABLE public.flight_details ADD COLUMN IF NOT EXISTS itinerary_text TEXT; -- free-text the user typed

-- Make structured columns optional (form doesn't collect them)
ALTER TABLE public.flight_details ALTER COLUMN flight_type      DROP NOT NULL;
ALTER TABLE public.flight_details ALTER COLUMN departure_city   DROP NOT NULL;
ALTER TABLE public.flight_details ALTER COLUMN departure_country DROP NOT NULL;
ALTER TABLE public.flight_details ALTER COLUMN arrival_city     DROP NOT NULL;
ALTER TABLE public.flight_details ALTER COLUMN arrival_country  DROP NOT NULL;
ALTER TABLE public.flight_details ALTER COLUMN departure_date   DROP NOT NULL;

-- ============================================================
-- hotel_details
-- ============================================================

-- The form only collects confirmation type (separate | shared), not city or dates
ALTER TABLE public.hotel_details ADD COLUMN IF NOT EXISTS hotel_type TEXT; -- separate_per_traveler | one_for_all

-- Make structured columns optional
ALTER TABLE public.hotel_details ALTER COLUMN city           DROP NOT NULL;
ALTER TABLE public.hotel_details ALTER COLUMN country        DROP NOT NULL;
ALTER TABLE public.hotel_details ALTER COLUMN check_in_date  DROP NOT NULL;
ALTER TABLE public.hotel_details ALTER COLUMN check_out_date DROP NOT NULL;

-- ============================================================
-- insurance_details
-- ============================================================

-- The form collects area (schengen / worldwide_*) and duration (21d | 3m | 6m | 1y), not dates
ALTER TABLE public.insurance_details ADD COLUMN IF NOT EXISTS duration TEXT; -- 21d | 3m | 6m | 1y

-- Make structured columns optional
ALTER TABLE public.insurance_details ALTER COLUMN destination_country DROP NOT NULL;
ALTER TABLE public.insurance_details ALTER COLUMN start_date          DROP NOT NULL;
ALTER TABLE public.insurance_details ALTER COLUMN end_date            DROP NOT NULL;
