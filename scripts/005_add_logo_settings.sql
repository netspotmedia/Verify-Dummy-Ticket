-- Migration: Add logo settings and storage bucket
-- Run this SQL in Supabase SQL Editor

-- Ensure logo_url setting exists
INSERT INTO public.site_settings (key, value) VALUES
  ('logo_url', '""')
ON CONFLICT (key) DO NOTHING;

-- Note: You also need to create a storage bucket in Supabase:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named "site-assets"
-- 3. Set it as Public bucket
-- 4. Add this policy for public access:
-- CREATE POLICY "site_assets_public" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
