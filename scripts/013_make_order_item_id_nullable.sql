-- Fix: make order_item_id nullable on service detail tables
--
-- The original schema declared order_item_id NOT NULL, but migration 009
-- switched the app to write order_id directly (no order_items row).
-- Any order placed after migration 009 fails to save flight/hotel/insurance
-- details because order_item_id violates the NOT NULL constraint.

ALTER TABLE public.flight_details    ALTER COLUMN order_item_id DROP NOT NULL;
ALTER TABLE public.hotel_details     ALTER COLUMN order_item_id DROP NOT NULL;
ALTER TABLE public.insurance_details ALTER COLUMN order_item_id DROP NOT NULL;
