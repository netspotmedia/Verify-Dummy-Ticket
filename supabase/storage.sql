-- ============================================
-- STORAGE BUCKETS FOR SUPABASE
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage buckets (public access for logos and uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('logos', 'logos', true, 5242880, ARRAY['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']),
  ('documents', 'documents', true, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for public access

-- Logos bucket policies
CREATE POLICY "Public read access for logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Public upload for logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Public update for logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'logos');

-- Documents bucket policies
CREATE POLICY "Public read access for documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Public upload for documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents');

-- Avatars bucket policies
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Public upload for avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Public update for avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');
