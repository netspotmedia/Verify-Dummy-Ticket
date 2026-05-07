-- Fix RLS policies for flight_details, hotel_details, insurance_details
-- The original policies checked access via order_items (old schema).
-- New orders write order_id directly, so order_item_id is NULL on new rows.
-- These updated policies use the direct order_id FK added in migration 009.

-- flight_details
DROP POLICY IF EXISTS "flight_details_select" ON public.flight_details;
CREATE POLICY "flight_details_select" ON public.flight_details FOR SELECT USING (
  -- New rows: order_id links directly to orders
  (order_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = flight_details.order_id
    AND (o.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
  OR
  -- Legacy rows: order_item_id links via order_items
  (order_item_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.id = flight_details.order_item_id
    AND (o.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
);

-- hotel_details
DROP POLICY IF EXISTS "hotel_details_select" ON public.hotel_details;
CREATE POLICY "hotel_details_select" ON public.hotel_details FOR SELECT USING (
  (order_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = hotel_details.order_id
    AND (o.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
  OR
  (order_item_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.id = hotel_details.order_item_id
    AND (o.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
);

-- insurance_details
DROP POLICY IF EXISTS "insurance_details_select" ON public.insurance_details;
CREATE POLICY "insurance_details_select" ON public.insurance_details FOR SELECT USING (
  (order_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = insurance_details.order_id
    AND (o.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
  OR
  (order_item_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.id = insurance_details.order_item_id
    AND (o.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ))
  ))
);
