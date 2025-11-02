-- MySQL schema for 333_Express logistics system
-- Requires MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `333express`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `333express`;

-- Users and Roles
CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(191) NOT NULL,
  role ENUM('customer','warehouse','shipper','admin') NOT NULL DEFAULT 'customer',
  phone VARCHAR(32) NULL,
  address VARCHAR(255) NULL,
  warehouse_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB;

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  warehouse_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  province VARCHAR(191) NOT NULL,
  region ENUM('north','central','south') NOT NULL,
  address VARCHAR(255) NULL,
  lat DECIMAL(10,6) NOT NULL,
  lng DECIMAL(10,6) NOT NULL,
  capacity INT NULL,
  is_sorting_hub TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (warehouse_id)
) ENGINE=InnoDB;

ALTER TABLE users
  ADD CONSTRAINT fk_users_warehouse
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Shipping fee configuration rules
CREATE TABLE IF NOT EXISTS shipping_fee_rules (
  shipping_fee_rule_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  from_region ENUM('north','central','south') NULL,
  to_region ENUM('north','central','south') NULL,
  within_province TINYINT(1) NOT NULL DEFAULT 0,
  base_fee DECIMAL(10,2) NOT NULL,
  base_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 0.5,
  max_weight_kg DECIMAL(10,2) NOT NULL DEFAULT 50.0,
  extra_fee_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0.0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (shipping_fee_rule_id)
) ENGINE=InnoDB;

-- Master table for order statuses
CREATE TABLE IF NOT EXISTS order_statuses (
  order_status_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  display_name VARCHAR(191) NOT NULL,
  actor_role ENUM('customer','warehouse','shipper','admin','system') NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_status_id)
) ENGINE=InnoDB;

-- Orders and status history
CREATE TABLE IF NOT EXISTS orders (
  order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tracking_code VARCHAR(64) NOT NULL UNIQUE,
  customer_user_id BIGINT UNSIGNED NOT NULL,
  shipper_user_id BIGINT UNSIGNED NULL,
  origin_warehouse_id BIGINT UNSIGNED NULL,
  destination_warehouse_id BIGINT UNSIGNED NULL,
  current_warehouse_id BIGINT UNSIGNED NULL,
  sender_name VARCHAR(191) NOT NULL,
  sender_phone VARCHAR(32) NOT NULL,
  sender_address VARCHAR(255) NOT NULL,
  sender_lat DECIMAL(10,6) NOT NULL,
  sender_lng DECIMAL(10,6) NOT NULL,
  receiver_name VARCHAR(191) NOT NULL,
  receiver_phone VARCHAR(32) NOT NULL,
  receiver_address VARCHAR(255) NOT NULL,
  receiver_lat DECIMAL(10,6) NOT NULL,
  receiver_lng DECIMAL(10,6) NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NULL,
  current_status_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  PRIMARY KEY (order_id),
  KEY idx_orders_customer (customer_user_id),
  KEY idx_orders_shipper (shipper_user_id),
  KEY idx_orders_origin_wh (origin_warehouse_id),
  KEY idx_orders_dest_wh (destination_warehouse_id),
  KEY idx_orders_curr_wh (current_warehouse_id)
) ENGINE=InnoDB;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_user_id) REFERENCES users(user_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_orders_shipper FOREIGN KEY (shipper_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_orders_origin_wh FOREIGN KEY (origin_warehouse_id) REFERENCES warehouses(warehouse_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_orders_dest_wh FOREIGN KEY (destination_warehouse_id) REFERENCES warehouses(warehouse_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_orders_current_wh FOREIGN KEY (current_warehouse_id) REFERENCES warehouses(warehouse_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT fk_orders_current_status FOREIGN KEY (current_status_id) REFERENCES order_statuses(order_status_id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS order_status_history (
  order_status_history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  order_status_id BIGINT UNSIGNED NOT NULL,
  note VARCHAR(255) NULL,
  warehouse_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_status_history_id),
  KEY idx_hist_order (order_id),
  KEY idx_hist_status (order_status_id)
) ENGINE=InnoDB;

ALTER TABLE order_status_history
  ADD CONSTRAINT fk_hist_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_hist_status FOREIGN KEY (order_status_id) REFERENCES order_statuses(order_status_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT fk_hist_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional: shipper assignments
CREATE TABLE IF NOT EXISTS order_assignments (
  order_assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  shipper_user_id BIGINT UNSIGNED NOT NULL,
  assigned_by_user_id BIGINT UNSIGNED NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_assignment_id),
  UNIQUE KEY uniq_order_assignment (order_id),
  KEY idx_assign_shipper (shipper_user_id)
) ENGINE=InnoDB;

ALTER TABLE order_assignments
  ADD CONSTRAINT fk_assign_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_assign_shipper FOREIGN KEY (shipper_user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT fk_assign_by FOREIGN KEY (assigned_by_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Password reset tokens (optional)
CREATE TABLE IF NOT EXISTS password_resets (
  password_reset_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(191) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (password_reset_id)
) ENGINE=InnoDB;

ALTER TABLE password_resets
  ADD CONSTRAINT fk_pwreset_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE;
