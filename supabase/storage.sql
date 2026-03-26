-- ============================================
-- STORAGE SETUP FOR SUPABASE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create public bucket for general uploads (airlines, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('public', 'public', true, 10485760, ARRAY['image/svg+xml','image/png','image/jpeg','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Create logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('logos', 'logos', true, 5242880, ARRAY['image/svg+xml','image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', true, 10485760, ARRAY['application/pdf','image/png','image/jpeg'])
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for public bucket
DROP POLICY IF EXISTS "Public can view public" ON storage.objects;
CREATE POLICY "Public can view public" ON storage.objects FOR SELECT USING (bucket_id = 'public');

DROP POLICY IF EXISTS "Public can upload public" ON storage.objects;
CREATE POLICY "Public can upload public" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public');

DROP POLICY IF EXISTS "Public can update public" ON storage.objects;
CREATE POLICY "Public can update public" ON storage.objects FOR UPDATE USING (bucket_id = 'public');

-- Storage policies for logos bucket
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
CREATE POLICY "Public can view logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Public can upload logos" ON storage.objects;
CREATE POLICY "Public can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos');

DROP POLICY IF EXISTS "Public can update logos" ON storage.objects;
CREATE POLICY "Public can update logos" ON storage.objects FOR UPDATE USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Public can delete logos" ON storage.objects;
CREATE POLICY "Public can delete logos" ON storage.objects FOR DELETE USING (bucket_id = 'logos');

-- Storage policies for documents bucket
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
CREATE POLICY "Public can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;
CREATE POLICY "Public can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public can upload avatars" ON storage.objects;
CREATE POLICY "Public can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public can update avatars" ON storage.objects;
CREATE POLICY "Public can update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

-- Verify buckets were created
SELECT id, name, public FROM storage.buckets;
