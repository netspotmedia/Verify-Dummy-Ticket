-- ============================================
-- FIX RLS POLICIES FOR SUPABASE TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS on public tables for anonymous access
ALTER TABLE hero_section DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE how_it_works_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE guarantee_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq_item DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled, use these policies instead:

-- Hero Section
-- DROP POLICY IF EXISTS "Public read access" ON hero_section;
-- CREATE POLICY "Public read access" ON hero_section FOR SELECT USING (true);
-- CREATE POLICY "Public insert" ON hero_section FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update" ON hero_section FOR UPDATE USING (true);

-- Service Item
-- DROP POLICY IF EXISTS "Public read services" ON service_item;
-- CREATE POLICY "Public read services" ON service_item FOR SELECT USING (true);
-- CREATE POLICY "Public insert services" ON service_item FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update services" ON service_item FOR UPDATE USING (true);
-- CREATE POLICY "Public delete services" ON service_item FOR DELETE USING (true);

-- How It Works
-- DROP POLICY IF EXISTS "Public read how_it_works" ON how_it_works_item;
-- CREATE POLICY "Public read how_it_works" ON how_it_works_item FOR SELECT USING (true);
-- CREATE POLICY "Public insert how_it_works" ON how_it_works_item FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update how_it_works" ON how_it_works_item FOR UPDATE USING (true);
-- CREATE POLICY "Public delete how_it_works" ON how_it_works_item FOR DELETE USING (true);

-- Guarantees
-- DROP POLICY IF EXISTS "Public read guarantees" ON guarantee_item;
-- CREATE POLICY "Public read guarantees" ON guarantee_item FOR SELECT USING (true);
-- CREATE POLICY "Public insert guarantees" ON guarantee_item FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update guarantees" ON guarantee_item FOR UPDATE USING (true);
-- CREATE POLICY "Public delete guarantees" ON guarantee_item FOR DELETE USING (true);

-- FAQ
-- DROP POLICY IF EXISTS "Public read faq" ON faq_item;
-- CREATE POLICY "Public read faq" ON faq_item FOR SELECT USING (true);
-- CREATE POLICY "Public insert faq" ON faq_item FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update faq" ON faq_item FOR UPDATE USING (true);
-- CREATE POLICY "Public delete faq" ON faq_item FOR DELETE USING (true);

-- Testimonials
-- DROP POLICY IF EXISTS "Public read testimonials" ON testimonial;
-- CREATE POLICY "Public read testimonials" ON testimonial FOR SELECT USING (true);
-- CREATE POLICY "Public insert testimonials" ON testimonial FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update testimonials" ON testimonial FOR UPDATE USING (true);
-- CREATE POLICY "Public delete testimonials" ON testimonial FOR DELETE USING (true);

-- Site Settings
-- DROP POLICY IF EXISTS "Public read settings" ON site_settings;
-- CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (is_public = true);
-- CREATE POLICY "Public update settings" ON site_settings FOR UPDATE USING (true);

-- Contact Messages
-- DROP POLICY IF EXISTS "Public read messages" ON contact_messages;
-- CREATE POLICY "Public read messages" ON contact_messages FOR SELECT USING (true);
-- DROP POLICY IF EXISTS "Public insert messages" ON contact_messages;
-- CREATE POLICY "Public insert messages" ON contact_messages FOR INSERT WITH CHECK (true);
-- DROP POLICY IF EXISTS "Public update messages" ON contact_messages;
-- CREATE POLICY "Public update messages" ON contact_messages FOR UPDATE USING (true);
-- DROP POLICY IF EXISTS "Public delete messages" ON contact_messages;
-- CREATE POLICY "Public delete messages" ON contact_messages FOR DELETE USING (true);

-- Verify tables are accessible
SELECT 'hero_section' as table_name, count(*) as count FROM hero_section
UNION ALL SELECT 'service_item', count(*) FROM service_item
UNION ALL SELECT 'how_it_works_item', count(*) FROM how_it_works_item
UNION ALL SELECT 'guarantee_item', count(*) FROM guarantee_item
UNION ALL SELECT 'faq_item', count(*) FROM faq_item
UNION ALL SELECT 'testimonial', count(*) FROM testimonial
UNION ALL SELECT 'site_settings', count(*) FROM site_settings;
