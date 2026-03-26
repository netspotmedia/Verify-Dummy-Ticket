-- Landing Page Content Management Schema for Supabase

-- Hero Section
CREATE TABLE IF NOT EXISTS hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_text TEXT,
  badge_color TEXT,
  heading TEXT NOT NULL,
  heading_color TEXT,
  subheading TEXT,
  subheading_color TEXT,
  embassy_notice TEXT,
  embassy_notice_color TEXT,
  cta_primary_text TEXT,
  cta_primary_link TEXT,
  cta_secondary_text TEXT,
  cta_secondary_link TEXT,
  background_type TEXT DEFAULT 'gradient',
  background_color TEXT,
  background_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Section
CREATE TABLE IF NOT EXISTS service_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id TEXT DEFAULT 'services',
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  price_from TEXT,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- How It Works Section
CREATE TABLE IF NOT EXISTS how_it_works_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials Section
CREATE TABLE IF NOT EXISTS testimonial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Section
CREATE TABLE IF NOT EXISTS faq_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guarantee/Trust Section
CREATE TABLE IF NOT EXISTS guarantee_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings (global)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default hero section
INSERT INTO hero_section (badge_text, badge_color, heading, subheading, embassy_notice)
VALUES (
  'Trusted by 12,653,898+ travelers',
  'rgb(204, 25, 57)',
  'Flight, Hotel & Travel Insurance for Visa Applications',
  'Get Verify Dummy Ticket & Hotel for visa application and Airport proof of return with valid PNR. Our tickets are receive instantly within 24 hours.',
  'Embassy recommends not to purchase tickets until visa is approved. So don''t risk your money, time and effort by buying actual tickets. We provide you confirmed flight reservations, hotel bookings and travel medical insurance that are perfect for visa application. Once you get your visa, make your own travel plans!'
)
ON CONFLICT DO NOTHING;

-- Insert default services
INSERT INTO service_item (title, description, icon, price_from, sort_order) VALUES
  ('Flight Ticket', 'Verified dummy flight tickets with valid PNR for visa applications', 'Plane', 'From $5', 1),
  ('Hotel Booking', 'Confirmed hotel reservations for your visa application', 'Hotel', 'From $3', 2),
  ('Travel Insurance', 'Comprehensive travel insurance coverage', 'Shield', 'From $2', 3)
ON CONFLICT DO NOTHING;

-- Insert default how it works
INSERT INTO how_it_works_item (step_number, title, description, icon) VALUES
  (1, 'Select Your Services', 'Choose the visa support services you need - flight tickets, hotel bookings, or travel insurance', 'ClipboardList'),
  (2, 'Submit Details', 'Provide your travel information and personal details securely', 'User'),
  (3, 'Receive Documents', 'Get your verified documents delivered within 24 hours', 'FileCheck'),
  (4, 'Apply for Visa', 'Use your documents to apply for your visa with confidence', 'Stamp')
ON CONFLICT DO NOTHING;

-- Insert default FAQs
INSERT INTO faq_item (question, answer, sort_order) VALUES
  ('What is a dummy ticket?', 'A dummy ticket (also called flight reservation or itinerary) is a confirmed flight booking that you can use for your visa application. It shows embassy officials that you have planned your travel without requiring you to purchase an actual ticket.', 1),
  ('How long does delivery take?', 'We deliver your verified documents within 24 hours of order confirmation. Express delivery options are available for urgent requests.', 2),
  ('Will my documents be accepted at the embassy?', 'Yes, our documents are verifiable through official airline booking systems and include valid PNR codes that embassies can confirm.', 3),
  ('Is there a money-back guarantee?', 'Yes, we offer a 100% money-back guarantee if your documents are not accepted or if we cannot fulfill your order.', 4)
ON CONFLICT DO NOTHING;

-- Insert default guarantees
INSERT INTO guarantee_item (title, description, icon) VALUES
  ('Instant Delivery', 'Receive your documents within 24 hours', 'Zap'),
  ('100% Verifiable', 'All documents can be verified online', 'CheckCircle'),
  ('Money-Back Guarantee', 'Full refund if not satisfied', 'RefreshCw')
ON CONFLICT DO NOTHING;
