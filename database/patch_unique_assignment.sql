-- Ensure unique assignment per order
USE `333express`;

-- Add unique key if not present
ALTER TABLE order_assignments
  ADD UNIQUE KEY IF NOT EXISTS uniq_order_assignment (order_id);

