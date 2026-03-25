-- Migration: Add logo settings and storage bucket
-- Run this SQL in Supabase SQL Editor

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.site_settings WHERE key = 'logo_url') THEN
        INSERT INTO public.site_settings (category, key, value, description, is_public) 
        VALUES ('general', 'logo_url', '""', 'Site logo URL', true);
    END IF;
END $$;

-- Note: You also need to create a storage bucket in Supabase:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named "site-assets"
-- 3. Set it as Public bucket
-- 4. Add this policy for public access:
-- CREATE POLICY "site_assets_public" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
