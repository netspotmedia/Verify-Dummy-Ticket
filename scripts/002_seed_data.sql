-- Seed initial data for the application

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'VerifyDummyTickets'),
  ('support_email', 'support@verifydummytickets.com'),
  ('support_phone', '+27 48 707 6011'),
  ('whatsapp_number', '+27 48 707 6011'),
  ('currency_usd_rate', '1'),
  ('currency_ngn_rate', '1600'),
  ('flight_price_single_usd', '15'),
  ('flight_price_couple_usd', '25'),
  ('flight_price_family_usd', '35'),
  ('hotel_price_single_usd', '12'),
  ('hotel_price_couple_usd', '20'),
  ('hotel_price_family_usd', '30'),
  ('insurance_price_single_usd', '20'),
  ('insurance_price_couple_usd', '35'),
  ('insurance_price_family_usd', '50'),
  ('paypal_enabled', 'true'),
  ('paystack_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (name, location, rating, content, is_approved) VALUES
  ('Perry K.', 'New York, USA', 5, 'I needed a dummy ticket for my visa application, and VerifyDummyTickets.com came through with flying colors! The service was quick, professional, and affordable. My visa was approved without any issues, thanks to the realistic ticket they provided. Highly recommended!', true),
  ('Alex T.', 'London, UK', 5, 'As a frequent traveler, I often need dummy tickets for visa applications, and I''ve tried several services. VerifyDummyTickets.com is by far the best! The process was smooth, and the customer support was very responsive. I got my dummy ticket within minutes. Will definitely use them again!', true),
  ('Priya S.', 'Mumbai, India', 5, 'I was a bit skeptical at first, but VerifyDummyTickets.com exceeded my expectations. The dummy ticket looked authentic, and it was exactly what I needed for my Schengen visa application. The entire process was hassle-free and quick. Five stars!', true),
  ('Carlos M.', 'Miami, USA', 5, 'VerifyDummyTickets.com saved me a lot of stress and money. The dummy ticket they provided was perfect for my visa application, and I received it almost instantly after placing the order. The site is easy to use, and the service is top-notch. I''ll be back for sure!', true),
  ('Amita B.', 'Dubai, UAE', 5, 'I''ve used VerifyDummyTickets.com twice now, and both times, the service has been exceptional. The dummy tickets look very real, and I''ve never had any issues with my visa applications. The prices are reasonable, and the delivery is fast. I highly recommend this service!', true),
  ('Adegoke B.', 'Lagos, Nigeria', 5, 'I needed a dummy ticket on short notice, and VerifyDummyTickets.com delivered! The ticket looked so real that I had no issues with my visa application. The website is user-friendly, and the customer service team is very helpful. I''ll definitely use this service again in the future.', true)
ON CONFLICT DO NOTHING;
