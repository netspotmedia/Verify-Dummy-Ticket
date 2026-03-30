-- 009_reconcile_schema_and_admin.sql
-- Purpose:
-- 1) Force-set specific user(s) as admin in profiles
-- 2) Reconcile order_id vs order_item_id model safely
-- 3) Validate/add required columns + indexes expected by current app code

BEGIN;

-- =========================================================
-- 0) EXTENSIONS (safe idempotent)
-- =========================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- 1) FORCE-SET ADMIN PROFILE ROLE
-- =========================================================
-- Update by explicit user id (recommended)
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE id = 'f3c21c74-a630-4cae-a3cc-77bf8957117a'::uuid;

-- Optional safety net: update by email if profile row exists
UPDATE public.profiles
SET role = 'admin',
    updated_at = NOW()
WHERE lower(email) = lower('uncleyomight@gmail.com');

-- Ensure profile row exists (if not, create from auth.users)
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT u.id, u.email, 'admin', NOW(), NOW()
FROM auth.users u
WHERE u.id = 'f3c21c74-a630-4cae-a3cc-77bf8957117a'::uuid
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );

-- =========================================================
-- 2) RECONCILE orders.services FOR APP EXPECTATION
-- Current code writes/reads orders.services directly.
-- Keep existing jsonb model and enforce array shape.
-- =========================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS services jsonb;

-- Normalize null/non-array values to []
UPDATE public.orders
SET services = '[]'::jsonb
WHERE services IS NULL OR jsonb_typeof(services) IS DISTINCT FROM 'array';

-- Default and constraint
ALTER TABLE public.orders
  ALTER COLUMN services SET DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_services_is_array_chk'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_services_is_array_chk
      CHECK (jsonb_typeof(services) = 'array');
  END IF;
END $$;

-- =========================================================
-- 3) RECONCILE detail tables to support BOTH models
-- App code writes by order_id, legacy schema uses order_item_id.
-- We add order_id safely + backfill + sync trigger.
-- =========================================================

-- 3a) Add order_id columns if missing
ALTER TABLE public.flight_details    ADD COLUMN IF NOT EXISTS order_id uuid;
ALTER TABLE public.hotel_details     ADD COLUMN IF NOT EXISTS order_id uuid;
ALTER TABLE public.insurance_details ADD COLUMN IF NOT EXISTS order_id uuid;

-- 3b) Backfill from order_items for existing rows
UPDATE public.flight_details fd
SET order_id = oi.order_id
FROM public.order_items oi
WHERE fd.order_item_id = oi.id
  AND fd.order_id IS NULL;

UPDATE public.hotel_details hd
SET order_id = oi.order_id
FROM public.order_items oi
WHERE hd.order_item_id = oi.id
  AND hd.order_id IS NULL;

UPDATE public.insurance_details idt
SET order_id = oi.order_id
FROM public.order_items oi
WHERE idt.order_item_id = oi.id
  AND idt.order_id IS NULL;

-- 3c) FKs for new order_id columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'flight_details_order_id_fkey'
      AND conrelid = 'public.flight_details'::regclass
  ) THEN
    ALTER TABLE public.flight_details
      ADD CONSTRAINT flight_details_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'hotel_details_order_id_fkey'
      AND conrelid = 'public.hotel_details'::regclass
  ) THEN
    ALTER TABLE public.hotel_details
      ADD CONSTRAINT hotel_details_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'insurance_details_order_id_fkey'
      AND conrelid = 'public.insurance_details'::regclass
  ) THEN
    ALTER TABLE public.insurance_details
      ADD CONSTRAINT insurance_details_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES public.orders(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 3d) Sync trigger: if only order_item_id is provided, derive order_id.
-- If only order_id is provided, keep order_item_id nullable for backward compatibility.
CREATE OR REPLACE FUNCTION public.sync_order_id_from_order_item_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_id IS NULL AND NEW.order_item_id IS NOT NULL THEN
    SELECT oi.order_id INTO NEW.order_id
    FROM public.order_items oi
    WHERE oi.id = NEW.order_item_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_flight_order_id ON public.flight_details;
CREATE TRIGGER trg_sync_flight_order_id
BEFORE INSERT OR UPDATE ON public.flight_details
FOR EACH ROW EXECUTE FUNCTION public.sync_order_id_from_order_item_id();

DROP TRIGGER IF EXISTS trg_sync_hotel_order_id ON public.hotel_details;
CREATE TRIGGER trg_sync_hotel_order_id
BEFORE INSERT OR UPDATE ON public.hotel_details
FOR EACH ROW EXECUTE FUNCTION public.sync_order_id_from_order_item_id();

DROP TRIGGER IF EXISTS trg_sync_insurance_order_id ON public.insurance_details;
CREATE TRIGGER trg_sync_insurance_order_id
BEFORE INSERT OR UPDATE ON public.insurance_details
FOR EACH ROW EXECUTE FUNCTION public.sync_order_id_from_order_item_id();

-- =========================================================
-- 4) REQUIRED COLUMNS EXPECTED BY CURRENT APP
-- =========================================================
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_country text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_country_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method text DEFAULT 'normal';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes text;

-- Ensure status enums include values app uses
DO $$
BEGIN
  -- orders.status check
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
  END IF;

  ALTER TABLE public.orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending','processing','completed','cancelled','refunded'));

  -- orders.payment_status check
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'orders_payment_status_check'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_payment_status_check;
  END IF;

  ALTER TABLE public.orders
    ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('unpaid','pending','paid','failed','refunded'));
END $$;

-- =========================================================
-- 5) INDEXES FOR APP QUERY PATTERNS
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at
  ON public.orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders (status);

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders (payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_services_gin
  ON public.orders USING gin (services);

CREATE INDEX IF NOT EXISTS idx_travelers_order_id
  ON public.travelers (order_id);

CREATE INDEX IF NOT EXISTS idx_order_documents_order_id
  ON public.order_documents (order_id);

CREATE INDEX IF NOT EXISTS idx_flight_details_order_id
  ON public.flight_details (order_id);

CREATE INDEX IF NOT EXISTS idx_hotel_details_order_id
  ON public.hotel_details (order_id);

CREATE INDEX IF NOT EXISTS idx_insurance_details_order_id
  ON public.insurance_details (order_id);

-- =========================================================
-- 6) OPTIONAL SANITY REPORTS
-- =========================================================
-- Rows still missing order_id in detail tables (should be 0 for legacy-linked rows)
-- SELECT count(*) FROM public.flight_details WHERE order_id IS NULL;
-- SELECT count(*) FROM public.hotel_details WHERE order_id IS NULL;
-- SELECT count(*) FROM public.insurance_details WHERE order_id IS NULL;

COMMIT;
