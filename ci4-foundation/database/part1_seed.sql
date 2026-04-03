INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES
('admin@example.com', '$2y$10$replace_with_real_hash', 'System', 'Admin', 'super_admin', 'active'),
('agent@example.com', '$2y$10$replace_with_real_hash', 'Support', 'Agent', 'agent', 'active'),
('customer@example.com', '$2y$10$replace_with_real_hash', 'Sample', 'Customer', 'customer', 'active');

INSERT INTO services (service_code, name, category, description, base_price, active, display_order)
VALUES
('FLIGHT_VERIFY', 'Flight Ticket Verification', 'flight', 'Ticket validation and processing workflow', 120.00, 1, 1),
('HOTEL_CONFIRM', 'Hotel Booking Confirmation', 'hotel', 'Hotel booking confirmation support', 80.00, 1, 2),
('INS_COVER', 'Travel Insurance', 'insurance', 'Optional travel insurance package', 45.00, 1, 3),
('VIP_FAST', 'Priority Processing', 'other', 'Rush processing and direct support', 60.00, 1, 4);

INSERT INTO site_settings (setting_key, setting_value, is_public)
VALUES
('site_name', 'Verify Dummy Ticket', 1),
('support_email', 'support@example.com', 1),
('default_currency', 'USD', 1),
('maintenance_mode', '0', 0);
