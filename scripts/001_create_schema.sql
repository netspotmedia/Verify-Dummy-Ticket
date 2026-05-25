-- VerifyDummyTickets Database Schema
-- Tables for users, orders, services, and admin management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Types table
CREATE TABLE IF NOT EXISTS public.service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price_usd DECIMAL(10,2) NOT NULL,
  base_price_ngn DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default service types
INSERT INTO public.service_types (name, description, base_price_usd, base_price_ngn) VALUES
  ('flight_oneway', 'One-way Flight Reservation', 25.00, 25000.00),
  ('flight_roundtrip', 'Round-trip Flight Reservation', 35.00, 35000.00),
  ('flight_multicity', 'Multi-city Flight Reservation', 45.00, 45000.00),
  ('hotel', 'Hotel Booking Confirmation', 30.00, 30000.00),
  ('travel_insurance', 'Travel Medical Insurance', 40.00, 40000.00)
ON CONFLICT (name) DO NOTHING;

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('paypal', 'paystack')),
  payment_reference TEXT,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'NGN')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items table (individual services in an order)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_type_id UUID NOT NULL REFERENCES public.service_types(id),
  service_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traveler Information table
CREATE TABLE IF NOT EXISTS public.travelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  nationality TEXT,
  passport_number TEXT,
  date_of_birth DATE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flight Details table
CREATE TABLE IF NOT EXISTS public.flight_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  flight_type TEXT NOT NULL CHECK (flight_type IN ('oneway', 'roundtrip', 'multicity')),
  departure_city TEXT NOT NULL,
  departure_country TEXT NOT NULL,
  arrival_city TEXT NOT NULL,
  arrival_country TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  preferred_airline TEXT,
  cabin_class TEXT DEFAULT 'economy' CHECK (cabin_class IN ('economy', 'business', 'first')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotel Details table
CREATE TABLE IF NOT EXISTS public.hotel_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  hotel_name TEXT,
  room_type TEXT,
  number_of_rooms INTEGER DEFAULT 1,
  number_of_guests INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Details table
CREATE TABLE IF NOT EXISTS public.insurance_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  coverage_amount DECIMAL(12,2) DEFAULT 50000.00,
  destination_country TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  coverage_type TEXT DEFAULT 'standard' CHECK (coverage_type IN ('standard', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings table (for admin configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('whatsapp_number', '"+27687076011"'),
  ('support_email', '"support@verifydummytickets.com"'),
  ('paypal_enabled', 'true'),
  ('paystack_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Orders (users see their own, admins see all)
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_insert_any" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Order Items
CREATE POLICY "order_items_select" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "order_items_insert_any" ON public.order_items FOR INSERT WITH CHECK (true);

-- RLS Policies for Travelers
CREATE POLICY "travelers_select" ON public.travelers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "travelers_insert_any" ON public.travelers FOR INSERT WITH CHECK (true);

-- RLS Policies for Flight Details
CREATE POLICY "flight_details_select" ON public.flight_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.orders o ON oi.order_id = o.id 
    WHERE oi.id = order_item_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "flight_details_insert_any" ON public.flight_details FOR INSERT WITH CHECK (true);

-- RLS Policies for Hotel Details
CREATE POLICY "hotel_details_select" ON public.hotel_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.orders o ON oi.order_id = o.id 
    WHERE oi.id = order_item_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "hotel_details_insert_any" ON public.hotel_details FOR INSERT WITH CHECK (true);

-- RLS Policies for Insurance Details
CREATE POLICY "insurance_details_select" ON public.insurance_details FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.order_items oi 
    JOIN public.orders o ON oi.order_id = o.id 
    WHERE oi.id = order_item_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "insurance_details_insert_any" ON public.insurance_details FOR INSERT WITH CHECK (true);

-- RLS Policies for Contact Messages (only admins can read)
CREATE POLICY "contact_messages_insert_any" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_admin" ON public.contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "contact_messages_admin_update" ON public.contact_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Testimonials (public read for approved, admin all)
CREATE POLICY "testimonials_select_approved" ON public.testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "testimonials_insert_any" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "testimonials_admin" ON public.testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Site Settings (public read, admin write)
CREATE POLICY "site_settings_select_any" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings_admin" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Service Types (public read, admin write)
CREATE POLICY "service_types_select_any" ON public.service_types FOR SELECT USING (true);
CREATE POLICY "service_types_admin" ON public.service_types FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.orders;
  new_number := 'VDT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 5, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample testimonials
INSERT INTO public.testimonials (name, location, rating, content, is_featured, is_approved) VALUES
  ('Percy M.', 'New York, USA', 5, 'I needed a dummy ticket for my visa application, and VerifyDummyTicket.com came through with flying colors! The service was quick, professional, and affordable. My visa was approved without any issues, thanks to the realistic ticket they provided. Highly recommended!', true, true),
  ('Amy B.', 'London, UK', 5, 'As a frequent traveler, I often need dummy tickets for visa applications, and I''ve tried several services. VerifyDummyTicket.com is by far the best! The process was smooth, and the customer support was very responsive. I got my dummy ticket within minutes. Will definitely use them again!', true, true),
  ('Priya K.', 'Mumbai, India', 5, 'I was a bit skeptical at first, but VerifyDummyTicket.com exceeded my expectations. The dummy ticket looked authentic, and it was exactly what I needed for my Schengen visa application. The entire process was hassle-free and quick. Five stars!', true, true),
  ('Carlos H.', 'Madrid, Spain', 5, 'VerifyDummyTicket.com saved me a lot of stress and money. The dummy ticket they provided was perfect for my visa application, and I received it almost instantly after placing the order. The site is easy to use, and the service is top-notch. I''ll be back for sure!', true, true),
  ('Anitha R.', 'Dubai, UAE', 5, 'I''ve used verifydummytickets.com twice now, and both times, the service has been exceptional. The dummy tickets look very real, and I''ve never had any issues with my visa applications. The prices are reasonable, and the delivery is fast. I highly recommend their service!', true, true),
  ('Adepipe B.', 'Lagos, Nigeria', 5, 'I needed a dummy ticket on short notice, and VerifyDummyTicket.com delivered! The ticket looked so real that I had no issues with my visa application. The website is user-friendly, and the customer service team is very helpful. I''ll definitely use their service again in the future.', true, true)
ON CONFLICT DO NOTHING;
