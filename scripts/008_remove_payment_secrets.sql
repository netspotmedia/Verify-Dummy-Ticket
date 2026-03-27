-- Migration: Remove payment secrets from database
-- Move all secrets to environment variables

-- Delete payment-related secrets from site_settings
DELETE FROM public.site_settings WHERE key IN (
  'paypal_client_id',
  'paypal_client_secret',
  'paystack_public_key',
  'paystack_secret_key',
  'paystack_merchant_email'
);

-- Keep only the enable/disable flags and modes
-- These can still be configured via admin dashboard
