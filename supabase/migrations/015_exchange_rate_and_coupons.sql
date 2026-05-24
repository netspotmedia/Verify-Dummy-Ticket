-- Migration 015: exchange rate locking + coupon system
-- Run this against your Supabase project via the SQL editor or CLI.

-- ── 1. Lock exchange rate at order creation time ──────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS exchange_rate_used NUMERIC DEFAULT 1650;

-- ── 2. Coupon tracking on orders ──────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_code         TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS coupon_discount_amount NUMERIC DEFAULT NULL;

-- ── 3. Coupons table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT        NOT NULL UNIQUE,
  discount_percent NUMERIC     NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  max_uses         INTEGER     DEFAULT NULL,  -- NULL = unlimited
  uses_count       INTEGER     NOT NULL DEFAULT 0,
  expires_at       TIMESTAMPTZ DEFAULT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons (code);

-- RLS: only service-role can insert/update coupons; public can read for validation
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'coupons' AND policyname = 'Public can read active coupons'
  ) THEN
    CREATE POLICY "Public can read active coupons"
      ON coupons FOR SELECT
      USING (is_active = TRUE);
  END IF;
END $$;

-- ── 4. RPC: atomically increment uses_count ───────────────────────────────────
CREATE OR REPLACE FUNCTION increment_coupon_uses(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE coupons
  SET uses_count = uses_count + 1,
      updated_at = NOW()
  WHERE code = p_code
    AND is_active = TRUE
    AND (max_uses IS NULL OR uses_count < max_uses);
END;
$$;
