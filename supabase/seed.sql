-- ============================================
-- SEED DATA FOR VERIFYDUMMYTICKETS
-- Run this in Supabase SQL Editor
-- ============================================

-- Clear existing data (optional - remove if you want to keep existing)
DELETE FROM testimonial WHERE true;
DELETE FROM faq_item WHERE true;
DELETE FROM how_it_works_item WHERE true;
DELETE FROM guarantee_item WHERE true;
DELETE FROM service_item WHERE true;
DELETE FROM hero_section WHERE true;
DELETE FROM site_settings WHERE true;

-- ============================================
-- SITE SETTINGS (Logo, Site Name, etc.)
-- ============================================
INSERT INTO site_settings (category, key, value, description, is_public) VALUES
  ('general', 'site_name', '"VerifyDummyTickets"', 'Site display name', true),
  ('general', 'site_tagline', '"Flight, Hotel & Travel Insurance for Visa Applications"', 'Site tagline', true),
  ('general', 'site_logo', '{"light": "/logo-light.svg", "dark": "/logo-dark.svg", "favicon": "/favicon.ico"}', 'Logo URLs', true);

-- ============================================
-- HERO SECTION
-- ============================================
INSERT INTO hero_section (
  badge_text, 
  badge_color, 
  heading, 
  heading_color, 
  subheading, 
  subheading_color, 
  embassy_notice, 
  embassy_notice_color, 
  cta_primary_text, 
  cta_primary_link, 
  cta_secondary_text, 
  cta_secondary_link, 
  background_type
) VALUES (
  'Trusted by 12,653,898+ travelers',
  'rgb(204, 25, 57)',
  'Flight, Hotel & Travel Insurance for Visa Applications',
  'rgb(15, 23, 42)',
  'Get Verify Dummy Ticket & Hotel for visa application and Airport proof of return with valid PNR. Our tickets are receive instantly within 24 hours.',
  'rgb(0, 0, 0)',
  'Embassy recommends not to purchase tickets until visa is approved. So don''t risk your money, time and effort by buying actual tickets. We provide you confirmed flight reservations, hotel bookings and travel medical insurance that are perfect for visa application. Once you get your visa, make your own travel plans!',
  'rgb(221, 24, 59)',
  'Start Your Order',
  '/order',
  'Chat on WhatsApp',
  'https://wa.me/27687076011',
  'gradient'
);

-- ============================================
-- SERVICES
-- ============================================
INSERT INTO service_item (section_id, title, description, icon, price_from, link, sort_order) VALUES
  ('services', 'Flight Ticket', 'Verified dummy flight tickets with valid PNR for visa applications', 'Plane', 'From $5', '/order?service=flight', 1),
  ('services', 'Hotel Booking', 'Confirmed hotel reservations for your visa application', 'Hotel', 'From $3', '/order?service=hotel', 2),
  ('services', 'Travel Insurance', 'Comprehensive travel insurance coverage', 'Shield', 'From $2', '/order?service=insurance', 3);

-- ============================================
-- HOW IT WORKS
-- ============================================
INSERT INTO how_it_works_item (step_number, title, description, icon, is_active) VALUES
  (1, 'Provide Details', 'Enter your travel dates, passenger information, and destination via our secure order form.', 'FileText', true),
  (2, 'Fast Processing', 'Our travel specialists verify schedules and generate authentic PNR codes from the GDS system.', 'CreditCard', true),
  (3, 'Instant Delivery', 'Receive your verified PDF documents via email within 24 hours, ready for embassy submission.', 'Mail', true);

-- ============================================
-- GUARANTEES
-- ============================================
INSERT INTO guarantee_item (title, description, icon, is_active) VALUES
  ('Instant Delivery', 'Receive your documents within 24 hours', 'Zap', true),
  ('100% Verifiable', 'All documents can be verified online', 'CheckCircle', true),
  ('Money-Back Guarantee', 'Full refund if not satisfied', 'RefreshCw', true);

-- ============================================
-- FAQ
-- ============================================
INSERT INTO faq_item (question, answer, sort_order, is_active) VALUES
  ('Is this document real and verifiable?', 'Yes, all reservations are made through official GDS systems and generate a valid PNR that can be checked on the airline''s official website.', 1, true),
  ('How long will the reservation stay valid?', 'Typically, reservations are valid for 7-14 days depending on the airline''s policy, which is more than enough for embassy processing.', 2, true),
  ('What if my visa gets rejected?', 'While we cannot guarantee visa approval, we guarantee the authenticity of our documents. If the documents fail our delivery promise, we offer a full refund.', 3, true),
  ('What payment methods do you accept?', 'We accept Credit/Debit cards (Visa, Mastercard, Verve), PayPal, and PayStack. All payments are secure and encrypted.', 4, true),
  ('How quickly will I receive my documents?', 'We deliver your verified documents within 24 hours of order confirmation. Express delivery is available for urgent requests.', 5, true);

-- ============================================
-- TESTIMONIALS
-- ============================================
INSERT INTO testimonial (name, location, rating, comment, is_active) VALUES
  ('Sarah Johnson', 'United Kingdom', 5, 'Excellent service! Got my flight reservation within hours. Highly recommended for visa applications.', true),
  ('Michael Chen', 'United States', 5, 'Fast, reliable, and the documents were accepted at the embassy. Will use again!', true),
  ('Emma Wilson', 'Germany', 5, 'Perfect for my Schengen visa application. Professional service and great communication.', true),
  ('David Kim', 'Canada', 5, 'Saved me a lot of money! No need to buy actual tickets before visa approval. Great concept!', true),
  ('Lisa Anderson', 'Australia', 5, 'The hotel booking was perfect for my tourist visa. Will definitely recommend to friends.', true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Hero Section' as table_name, COUNT(*) as row_count FROM hero_section
UNION ALL
SELECT 'Services', COUNT(*) FROM service_item
UNION ALL
SELECT 'How It Works', COUNT(*) FROM how_it_works_item
UNION ALL
SELECT 'Guarantees', COUNT(*) FROM guarantee_item
UNION ALL
SELECT 'FAQ', COUNT(*) FROM faq_item
UNION ALL
SELECT 'Testimonials', COUNT(*) FROM testimonial
UNION ALL
SELECT 'Site Settings', COUNT(*) FROM site_settings;
