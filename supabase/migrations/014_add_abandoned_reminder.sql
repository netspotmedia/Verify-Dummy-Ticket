-- Migration 014: Add abandoned_reminder_sent_at to orders table
-- This column tracks when (if ever) an abandoned-order reminder email was sent.
-- A NULL value means no reminder has been sent yet.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS abandoned_reminder_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Index for the cron query: unpaid orders with no reminder sent yet
CREATE INDEX IF NOT EXISTS idx_orders_abandoned_reminder
  ON orders (payment_status, created_at, abandoned_reminder_sent_at)
  WHERE payment_status = 'unpaid' AND abandoned_reminder_sent_at IS NULL;
