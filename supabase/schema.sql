-- Run this in your Supabase SQL Editor

-- Logo in hero section (update existing row)
INSERT INTO hero_section (badge_text, badge_color, heading, heading_color, subheading, subheading_color, embassy_notice, embassy_notice_color, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, background_type)
VALUES (
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
  'https://wa.me/2348070076011',
  'gradient'
)
ON CONFLICT DO NOTHING;

-- Services
INSERT INTO service_item (title, description, icon, price_from, link, sort_order) VALUES
  ('Flight Ticket', 'Verified dummy flight tickets with valid PNR for visa applications', 'Plane', 'From $5', '/order?service=flight', 1),
  ('Hotel Booking', 'Confirmed hotel reservations for your visa application', 'Hotel', 'From $3', '/order?service=hotel', 2),
  ('Travel Insurance', 'Comprehensive travel insurance coverage', 'Shield', 'From $2', '/order?service=insurance', 3)
ON CONFLICT DO NOTHING;

-- How It Works
INSERT INTO how_it_works_item (step_number, title, description, icon) VALUES
  (1, 'Provide Details', 'Enter your travel dates, passenger information, and destination via our secure order form.', 'FileText'),
  (2, 'Fast Processing', 'Our travel specialists verify schedules and generate authentic PNR codes from the GDS system.', 'CreditCard'),
  (3, 'Instant Delivery', 'Receive your verified PDF documents via email within 24 hours, ready for embassy submission.', 'Mail')
ON CONFLICT DO NOTHING;

-- Guarantees
INSERT INTO guarantee_item (title, description, icon) VALUES
  ('Instant Delivery', 'Receive your documents within 24 hours', 'Zap'),
  ('100% Verifiable', 'All documents can be verified online', 'CheckCircle'),
  ('Money-Back Guarantee', 'Full refund if not satisfied', 'RefreshCw')
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO faq_item (question, answer, sort_order) VALUES
  ('Is this document real and verifiable?', 'Yes, all reservations are made through official GDS systems and generate a valid PNR that can be checked on the airline''s official website.', 1),
  ('How long will the reservation stay valid?', 'Typically, reservations are valid for 7-14 days depending on the airline''s policy, which is more than enough for embassy processing.', 2),
  ('What if my visa gets rejected?', 'While we cannot guarantee visa approval, we guarantee the authenticity of our documents. If the documents fail our delivery promise, we offer a full refund.', 3),
  ('What payment methods do you accept?', 'We accept Credit/Debit cards (Visa, Mastercard, Verve), PayPal, and PayStack. All payments are secure and encrypted.', 4)
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO testimonial (name, location, rating, comment, is_active) VALUES
  ('Sarah Johnson', 'United Kingdom', 5, 'Excellent service! Got my flight reservation within hours. Highly recommended for visa applications.', true),
  ('Michael Chen', 'United States', 5, 'Fast, reliable, and the documents were accepted at the embassy. Will use again!', true),
  ('Emma Wilson', 'Germany', 5, 'Perfect for my Schengen visa application. Professional service and great communication.', true)
ON CONFLICT DO NOTHING;

-- Site Settings for Logo
INSERT INTO site_settings (category, key, value, description, is_public)
VALUES 
  ('general', 'site_logo', '{"light": "/logo-light.svg", "dark": "/logo-dark.svg", "favicon": "/favicon.ico"}', 'Site logo URLs', true),
  ('general', 'site_name', '"VerifyDummyTickets"', 'Site display name', true),
  ('general', 'site_tagline', '"Flight, Hotel & Travel Insurance for Visa Applications"', 'Site tagline', true)
ON CONFLICT DO NOTHING;
