-- Seed additional site settings (using proper JSONB format)
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', '"VerifyDummyTickets"'),
  ('support_phone', '"+27 48 707 6011"'),
  ('currency_usd_rate', '1'),
  ('currency_ngn_rate', '1600'),
  ('flight_price_single_usd', '15'),
  ('flight_price_couple_usd', '25'),
  ('flight_price_family_usd', '35'),
  ('hotel_price_single_usd', '12'),
  ('hotel_price_couple_usd', '20'),
  ('hotel_price_family_usd', '30'),
  ('insurance_price_single_usd', '20'),
  ('insurance_price_couple_usd', '35'),
  ('insurance_price_family_usd', '50')
ON CONFLICT (key) DO NOTHING;
