-- Run in Supabase SQL Editor
-- Fixes all RLS warnings flagged by Supabase Security Advisor

-- ============================================================================
-- 1. Public landing-page content tables
--    Anyone can read. Only admins can insert/update/delete.
-- ============================================================================

ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hero_section_public_read" ON public.hero_section;
DROP POLICY IF EXISTS "hero_section_admin_all"   ON public.hero_section;
CREATE POLICY "hero_section_public_read" ON public.hero_section FOR SELECT USING (true);
CREATE POLICY "hero_section_admin_all"   ON public.hero_section FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.service_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_item_public_read" ON public.service_item;
DROP POLICY IF EXISTS "service_item_admin_all"   ON public.service_item;
CREATE POLICY "service_item_public_read" ON public.service_item FOR SELECT USING (true);
CREATE POLICY "service_item_admin_all"   ON public.service_item FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.how_it_works_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "how_it_works_public_read" ON public.how_it_works_item;
DROP POLICY IF EXISTS "how_it_works_admin_all"   ON public.how_it_works_item;
CREATE POLICY "how_it_works_public_read" ON public.how_it_works_item FOR SELECT USING (true);
CREATE POLICY "how_it_works_admin_all"   ON public.how_it_works_item FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.guarantee_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "guarantee_item_public_read" ON public.guarantee_item;
DROP POLICY IF EXISTS "guarantee_item_admin_all"   ON public.guarantee_item;
CREATE POLICY "guarantee_item_public_read" ON public.guarantee_item FOR SELECT USING (true);
CREATE POLICY "guarantee_item_admin_all"   ON public.guarantee_item FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.faq_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faq_item_public_read" ON public.faq_item;
DROP POLICY IF EXISTS "faq_item_admin_all"   ON public.faq_item;
CREATE POLICY "faq_item_public_read" ON public.faq_item FOR SELECT USING (true);
CREATE POLICY "faq_item_admin_all"   ON public.faq_item FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.testimonial ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "testimonial_public_read"        ON public.testimonial;
DROP POLICY IF EXISTS "testimonials_select_approved"   ON public.testimonial;
DROP POLICY IF EXISTS "testimonial_admin_all"          ON public.testimonial;
DROP POLICY IF EXISTS "testimonials_admin"             ON public.testimonial;
CREATE POLICY "testimonial_public_read" ON public.testimonial FOR SELECT USING (true);
CREATE POLICY "testimonial_admin_all"   ON public.testimonial FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.airline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "airline_public_read" ON public.airline;
DROP POLICY IF EXISTS "airline_admin_all"   ON public.airline;
CREATE POLICY "airline_public_read" ON public.airline FOR SELECT USING (true);
CREATE POLICY "airline_admin_all"   ON public.airline FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- 2. contact_messages — policies existed but RLS was disabled
--    Public can submit. Only admins can read and update.
-- ============================================================================
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_messages_insert_any"    ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin"         ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_admin_update"  ON public.contact_messages;
CREATE POLICY "contact_messages_insert_any"   ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_admin_select" ON public.contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "contact_messages_admin_update" ON public.contact_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- 3. site_settings — policies existed but RLS was disabled
--    Public can read rows where is_public = true. Admins have full access.
-- ============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_select_any"  ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin"        ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_all"    ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_public_read"  ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_admin_write"  ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT USING (
  is_public = true
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "site_settings_admin_write" ON public.site_settings FOR ALL
  USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================================
-- 4. profiles — remove policy that referenced user_metadata (user-controlled)
--    Use only profiles.role which is server-controlled.
-- ============================================================================
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
