-- VerifyDummyTickets Database Schema - Dashboard Features
-- Tables for documents, support tickets, and enhanced settings

-- Enable UUID extension (if not already)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Order Documents table (uploaded by admin, downloaded by users)
CREATE TABLE IF NOT EXISTS public.order_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Support Ticket Messages table (chat-style)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_admin_message BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Status for account management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspend_reason TEXT;

-- Enhanced Site Settings with categories
-- Drop existing and recreate with better structure
DROP TABLE IF EXISTS public.site_settings CASCADE;

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('general', 'pricing', 'payment', 'delivery', 'notifications', 'footer', 'landing')),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(category, key)
);

-- Insert default settings by category
-- General Settings
INSERT INTO public.site_settings (category, key, value, description, is_public) VALUES
  ('general', 'site_name', '"Verify Dummy Ticket"', 'Website name', true),
  ('general', 'whatsapp_number', '"+27687076011"', 'WhatsApp contact number', true),
  ('general', 'support_email', '"support@verifydummytickets.com"', 'Support email address', true),
  ('general', 'currency_conversion_rate', '1650', 'USD to NGN conversion rate', false),

-- Pricing Settings
  ('pricing', 'flight_one_way', '5', 'One-way flight price in USD', false),
  ('pricing', 'flight_return_trip', '8', 'Return trip flight price in USD', false),
  ('pricing', 'flight_multi_city', '15', 'Multi-city flight price in USD', false),
  ('pricing', 'hotel_separate', '5', 'Hotel separate per traveler in USD', false),
  ('pricing', 'hotel_one_for_all_first', '5', 'Hotel one for all first traveler in USD', false),
  ('pricing', 'hotel_one_for_all_additional', '1', 'Hotel one for all additional traveler in USD', false),
  ('pricing', 'insurance_schengen_21d', '20', 'Schengen insurance 21 days in USD', false),
  ('pricing', 'insurance_schengen_3m', '30', 'Schengen insurance 3 months in USD', false),
  ('pricing', 'insurance_schengen_6m', '40', 'Schengen insurance 6 months in USD', false),
  ('pricing', 'insurance_schengen_1y', '50', 'Schengen insurance 1 year in USD', false),
  ('pricing', 'insurance_wa1_21d', '25', 'Worldwide Area 1 insurance 21 days in USD', false),
  ('pricing', 'insurance_wa1_3m', '35', 'Worldwide Area 1 insurance 3 months in USD', false),
  ('pricing', 'insurance_wa1_6m', '45', 'Worldwide Area 1 insurance 6 months in USD', false),
  ('pricing', 'insurance_wa1_1y', '55', 'Worldwide Area 1 insurance 1 year in USD', false),
  ('pricing', 'insurance_wa2_21d', '28', 'Worldwide Area 2 insurance 21 days in USD', false),
  ('pricing', 'insurance_wa2_3m', '48', 'Worldwide Area 2 insurance 3 months in USD', false),
  ('pricing', 'insurance_wa2_6m', '65', 'Worldwide Area 2 insurance 6 months in USD', false),
  ('pricing', 'insurance_wa2_1y', '80', 'Worldwide Area 2 insurance 1 year in USD', false),
  ('pricing', 'flight_validity_3d', '0', 'Flight validity 3 days in USD', false),
  ('pricing', 'flight_validity_7d', '5', 'Flight validity 7 days in USD', false),
  ('pricing', 'flight_validity_14d', '10', 'Flight validity 14 days in USD', false),
  ('pricing', 'flight_validity_21d', '15', 'Flight validity 21 days in USD', false),
  ('pricing', 'flight_validity_30d', '20', 'Flight validity 30 days in USD', false),
  ('pricing', 'delivery_normal', '0', 'Normal delivery price in USD', false),
  ('pricing', 'delivery_fast', '5', 'Fast delivery price in USD', false),
  ('pricing', 'delivery_express', '10', 'Express delivery price in USD', false),

-- Payment Settings
  ('payment', 'paypal_mode', '"sandbox"', 'PayPal mode: sandbox or live', false),
  ('payment', 'paypal_client_id', '""', 'PayPal client ID', false),
  ('payment', 'paypal_client_secret', '""', 'PayPal client secret', false),
  ('payment', 'paystack_public_key', '""', 'PayStack public key', false),
  ('payment', 'paystack_secret_key', '""', 'PayStack secret key', false),
  ('payment', 'paystack_merchant_email', '""', 'PayStack merchant email', false),
  ('payment', 'paypal_enabled', 'true', 'Enable PayPal payment', true),
  ('payment', 'paystack_enabled', 'true', 'Enable PayStack payment', true),

-- Delivery Settings
  ('delivery', 'normal_hours', '24', 'Normal delivery hours', false),
  ('delivery', 'fast_hours', '12', 'Fast delivery hours', false),
  ('delivery', 'express_hours', '6', 'Express delivery hours', false),

-- Notification Settings
  ('notifications', 'order_confirmation', 'true', 'Send order confirmation email', false),
  ('notifications', 'payment_receipt', 'true', 'Send payment receipt email', false),
  ('notifications', 'order_completed', 'true', 'Send order completed email', false),
  ('notifications', 'new_ticket_reply', 'true', 'Send new ticket reply email', false)
ON CONFLICT (category, key) DO NOTHING;

-- Enable Row Level Security for new tables
ALTER TABLE public.order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Order Documents
CREATE POLICY "order_documents_select" ON public.order_documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "order_documents_insert_admin" ON public.order_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "order_documents_delete_admin" ON public.order_documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Support Tickets
CREATE POLICY "support_tickets_select_own" ON public.support_tickets FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "support_tickets_insert_any" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "support_tickets_update_own" ON public.support_tickets FOR UPDATE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Ticket Messages
CREATE POLICY "ticket_messages_select" ON public.ticket_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE id = ticket_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "ticket_messages_insert_any" ON public.ticket_messages FOR INSERT WITH CHECK (true);

-- RLS Policies for Site Settings
CREATE POLICY "site_settings_select_any" ON public.site_settings FOR SELECT USING (is_public = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "site_settings_admin_all" ON public.site_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Update profiles RLS for is_active
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add updated_at trigger for support_tickets
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for documents (run in Supabase dashboard or via API)
-- This requires creating a storage bucket named 'order-documents'
