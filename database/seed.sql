USE `333express`;

-- Order statuses
INSERT INTO order_statuses (code, display_name, actor_role, description) VALUES
('created', 'Đã tạo đơn', 'customer', 'Đơn hàng vừa được tạo trên hệ thống'),
('waiting_for_pickup', 'Chờ lấy hàng', 'system', 'Chờ shipper/kho đến nhận'),
('picked_up', 'Đã lấy hàng', 'shipper', 'Shipper đã nhận hàng'),
('arrived_at_origin_hub', 'Đã đến kho gửi', 'warehouse', 'Hàng đã vào kho điểm gửi'),
('in_transit_to_sorting_center', 'Đang chuyển đến kho trung tâm', 'warehouse', 'Trên đường đến kho trung tâm'),
('arrived_at_sorting_hub', 'Đã đến kho trung tâm', 'warehouse', 'Hàng đến kho trung tâm vùng'),
('in_transit_to_destination_hub', 'Đang chuyển đến kho đích', 'warehouse', 'Đang trên đường đến kho đích'),
('arrived_at_destination_hub', 'Đã đến kho đích', 'warehouse', 'Hàng đã về kho gần người nhận'),
('out_for_delivery', 'Đang giao hàng', 'shipper', 'Shipper đang giao cho khách'),
('delivered', 'Giao hàng thành công', 'shipper', 'Khách hàng đã nhận hàng'),
('delivery_failed', 'Giao hàng thất bại', 'shipper', 'Không thể giao hàng'),
('returned_to_destination_hub', 'Đã trả lại kho đích', 'shipper', 'Trả về kho đích sau thất bại'),
('return_in_transit', 'Đang hoàn hàng', 'warehouse', 'Đang hoàn về kho gốc'),
('returned_to_origin', 'Đã hoàn về kho gửi', 'warehouse', 'Đã về kho ban đầu'),
('cancelled', 'Đã hủy', 'admin', 'Đơn hàng bị hủy'),
('lost', 'Thất lạc', 'admin', 'Đơn hàng thất lạc');

-- Warehouses
INSERT INTO warehouses (code, name, province, region, address, lat, lng, capacity, is_sorting_hub) VALUES
('WH_HN_CENTER', 'Kho Trung tâm Hà Nội', 'Hà Nội', 'north', 'Cầu Giấy, Hà Nội', 21.0285, 105.8542, 10000, 1),
('WH_HCM_CENTER', 'Kho Trung tâm TP.HCM', 'TP.HCM', 'south', 'Quận 1, TP.HCM', 10.7769, 106.7009, 12000, 1),
('WH_CG', 'Kho Cầu Giấy', 'Hà Nội', 'north', 'Cầu Giấy, Hà Nội', 21.0350, 105.7900, 5000, 0),
('WH_Q3', 'Kho Quận 3', 'TP.HCM', 'south', 'Quận 3, TP.HCM', 10.7820, 106.6950, 5000, 0);

-- Additional warehouses
INSERT INTO warehouses (code, name, province, region, address, lat, lng, capacity, is_sorting_hub) VALUES
('WH_DN_CENTER', 'Kho Trung tam Da Nang', 'Da Nang', 'central', 'Hai Chau, Da Nang', 16.0544, 108.2022, 9000, 1),
('WH_DN_TK', 'Kho Thanh Khe', 'Da Nang', 'central', 'Thanh Khe, Da Nang', 16.0753, 108.1716, 4000, 0),
('WH_TB', 'Kho Tan Binh', 'TP.HCM', 'south', 'Tan Binh, HCMC', 10.8010, 106.6520, 4000, 0),
('WH_LB', 'Kho Long Bien', 'Ha Noi', 'north', 'Long Bien, Ha Noi', 21.0550, 105.8860, 4500, 0);

-- Users (password: password123)
-- bcrypt hash for 'password123' generated with 10 rounds
SET @pwd := '$2a$10$VJX81fZAbu5pLGitymWT5.5fDjwgYT8zG0LA6Vcuw/e6Q6v1IFGEe';

INSERT INTO users (email, password_hash, name, role, phone, address, warehouse_id) VALUES
('customer@example.com', @pwd, 'Nguyễn Văn A', 'customer', '0901234567', '123 Lê Lợi, TP.HCM', NULL),
('warehouse@example.com', @pwd, 'Kho TP.HCM', 'warehouse', '0923456789', 'Kho Quận 3', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3')),
('shipper@example.com', @pwd, 'Trần Văn B', 'shipper', '0934567890', 'TP.HCM', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3')),
('admin@example.com', @pwd, 'Admin System', 'admin', '0945678901', 'Hà Nội', NULL);

-- Additional users
INSERT INTO users (email, password_hash, name, role, phone, address, warehouse_id) VALUES
('customer2@example.com', @pwd, 'Nguyen Thi B', 'customer', '0902222333', 'Quan 7, HCMC', NULL),
('customer3@example.com', @pwd, 'Pham Van C', 'customer', '0903333444', 'Cau Giay, Ha Noi', NULL),
('warehouse2@example.com', @pwd, 'Kho Da Nang', 'warehouse', '0911111222', 'Thanh Khe, Da Nang', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK')),
('shipper2@example.com', @pwd, 'Le Van C', 'shipper', '0939999888', 'Da Nang', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK')),
('shipper_hn@example.com', @pwd, 'Do Van D', 'shipper', '0937777666', 'Ha Noi', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'));

-- Extra shippers for HCMC (WH_Q3)
INSERT INTO users (email, password_hash, name, role, phone, address, warehouse_id) VALUES
('shipper_hcm2@example.com', @pwd, 'Nguyen Van C', 'shipper', '0931111222', 'HCMC', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3')),
('shipper_hcm3@example.com', @pwd, 'Pham Thi D', 'shipper', '0932222333', 'HCMC', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'));

-- Fee rules
INSERT INTO shipping_fee_rules (name, from_region, to_region, within_province, base_fee, base_weight_kg, max_weight_kg, extra_fee_per_kg, enabled) VALUES
('Nội tỉnh', NULL, NULL, 1, 25000, 1.00, 50.00, 5000, 1),
('Nội miền', 'south', 'south', 0, 35000, 1.00, 50.00, 7000, 1),
('Nội miền', 'north', 'north', 0, 35000, 1.00, 50.00, 7000, 1),
('Nội miền', 'central', 'central', 0, 35000, 1.00, 50.00, 7000, 1),
('Liên miền', 'south', 'north', 0, 45000, 1.00, 50.00, 9000, 1),
('Liên miền', 'north', 'south', 0, 45000, 1.00, 50.00, 9000, 1),
('Liên miền', 'north', 'central', 0, 40000, 1.00, 50.00, 8000, 1),
('Liên miền', 'central', 'north', 0, 40000, 1.00, 50.00, 8000, 1),
('Liên miền', 'south', 'central', 0, 40000, 1.00, 50.00, 8000, 1),
('Liên miền', 'central', 'south', 0, 40000, 1.00, 50.00, 8000, 1);

-- Sample order
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0001',
  (SELECT user_id FROM users WHERE email='customer@example.com'),
  (SELECT user_id FROM users WHERE email='shipper@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_CG'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'),
  'Cửa hàng ABC', '0912345678', '456 Nguyễn Huệ, TP.HCM', 10.7769, 106.7009,
  'Nguyễn Văn A', '0901234567', '123 Lê Lợi, Hà Nội', 21.0285, 105.8542,
  2.50, 45000.00, 45000.00, (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center')
);

INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0001'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Đơn hàng vừa được tạo', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 2 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0001'), (SELECT order_status_id FROM order_statuses WHERE code='picked_up'), 'Shipper nhận hàng', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0001'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'Vào kho Quận 3', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 1 DAY + INTERVAL 5 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0001'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'Đi kho trung tâm HCM', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 8 HOUR);

-- More sample orders
-- O2: HCMC -> HCMC, out_for_delivery
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0002',
  (SELECT user_id FROM users WHERE email='customer2@example.com'),
  (SELECT user_id FROM users WHERE email='shipper@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  'Shop ABC', '0912000000', 'Tan Binh, HCMC', 10.8010, 106.6520,
  'Nguyen Thi B', '0902222333', 'Quan 7, HCMC', 10.7380, 106.7210,
  0.70, 25000.00, 25000.00, (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0002'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'), NOW() - INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0002'), (SELECT order_status_id FROM order_statuses WHERE code='picked_up'), 'Picked by shipper', (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'), NOW() - INTERVAL 5 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0002'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'Arrived origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'), NOW() - INTERVAL 4 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0002'), (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery'), 'Out for delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 1 HOUR);

INSERT INTO order_assignments(order_id, shipper_user_id, assigned_by_user_id, assigned_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0002'), (SELECT user_id FROM users WHERE email='shipper@example.com'), (SELECT user_id FROM users WHERE email='warehouse@example.com'), NOW() - INTERVAL 2 HOUR);

-- O3: HCMC -> Ha Noi, delivered
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0003',
  (SELECT user_id FROM users WHERE email='customer@example.com'),
  (SELECT user_id FROM users WHERE email='shipper_hn@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  'Shop DEF', '0912333444', 'Quan 3, HCMC', 10.7820, 106.6950,
  'Nguyen Van A', '0901000000', 'Long Bien, Ha Noi', 21.0550, 105.8860,
  3.20, 72000.00, 72000.00, (SELECT order_status_id FROM order_statuses WHERE code='delivered')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 3 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='picked_up'), 'Picked up', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 3 DAY + INTERVAL 2 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 3 DAY + INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'To HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_sorting_hub'), 'Arrived HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 5 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 10 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery'), 'Out for delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 1 DAY + INTERVAL 12 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT order_status_id FROM order_statuses WHERE code='delivered'), 'Delivered to customer', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 1 DAY + INTERVAL 15 HOUR);

INSERT INTO order_assignments(order_id, shipper_user_id, assigned_by_user_id, assigned_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0003'), (SELECT user_id FROM users WHERE email='shipper_hn@example.com'), (SELECT user_id FROM users WHERE email='admin@example.com'), NOW() - INTERVAL 1 DAY + INTERVAL 11 HOUR);

-- O4: Da Nang -> Ha Noi, delivery_failed then returned_to_destination_hub
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0004',
  (SELECT user_id FROM users WHERE email='customer2@example.com'),
  (SELECT user_id FROM users WHERE email='shipper_hn@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  'Shop GHI', '0912666777', 'Thanh Khe, Da Nang', 16.0753, 108.1716,
  'Pham Van C', '0903333444', 'Long Bien, Ha Noi', 21.0550, 105.8860,
  1.50, 48000.00, 48000.00, (SELECT order_status_id FROM order_statuses WHERE code='returned_to_destination_hub')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'), NOW() - INTERVAL 2 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='picked_up'), 'Picked up', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'), NOW() - INTERVAL 2 DAY + INTERVAL 1 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'), NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'To DN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_sorting_hub'), 'Arrived DN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 8 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 5 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery'), 'Out for delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 1 DAY + INTERVAL 8 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='delivery_failed'), 'Customer unreachable', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 1 DAY + INTERVAL 11 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT order_status_id FROM order_statuses WHERE code='returned_to_destination_hub'), 'Returned to destination hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 1 DAY + INTERVAL 14 HOUR);

INSERT INTO order_assignments(order_id, shipper_user_id, assigned_by_user_id, assigned_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0004'), (SELECT user_id FROM users WHERE email='shipper_hn@example.com'), (SELECT user_id FROM users WHERE email='warehouse2@example.com'), NOW() - INTERVAL 1 DAY + INTERVAL 7 HOUR);

-- Additional regions: Hai Phong (north), Can Tho (south), Hue (central), Binh Duong (south)
INSERT INTO warehouses (code, name, province, region, address, lat, lng, capacity, is_sorting_hub) VALUES
('WH_HP', 'Kho Hai Phong', 'Hai Phong', 'north', 'Hai Phong', 20.8449, 106.6881, 4500, 0),
('WH_CT', 'Kho Can Tho', 'Can Tho', 'south', 'Can Tho', 10.0452, 105.7469, 4500, 0),
('WH_HUE', 'Kho Hue', 'Thua Thien Hue', 'central', 'Hue', 16.4637, 107.5909, 4200, 0),
('WH_BD', 'Kho Binh Duong', 'Binh Duong', 'south', 'Binh Duong', 10.9804, 106.6519, 4200, 0);

-- Users for new regions
INSERT INTO users (email, password_hash, name, role, phone, address, warehouse_id) VALUES
('warehouse_hp@example.com', @pwd, 'Kho Hai Phong', 'warehouse', '0901111222', 'Hai Phong', (SELECT warehouse_id FROM warehouses WHERE code='WH_HP')),
('shipper_hp@example.com', @pwd, 'Shipper Hai Phong', 'shipper', '0901111333', 'Hai Phong', (SELECT warehouse_id FROM warehouses WHERE code='WH_HP')),
('warehouse_ct@example.com', @pwd, 'Kho Can Tho', 'warehouse', '0902222111', 'Can Tho', (SELECT warehouse_id FROM warehouses WHERE code='WH_CT')),
('shipper_ct@example.com', @pwd, 'Shipper Can Tho', 'shipper', '0902222333', 'Can Tho', (SELECT warehouse_id FROM warehouses WHERE code='WH_CT')),
('warehouse_hue@example.com', @pwd, 'Kho Hue', 'warehouse', '0903333111', 'Hue', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE')),
('shipper_hue@example.com', @pwd, 'Shipper Hue', 'shipper', '0903333444', 'Hue', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE')),
('customer4@example.com', @pwd, 'Le Thi D', 'customer', '0904444555', 'Hai Phong', NULL),
('customer5@example.com', @pwd, 'Tran Van E', 'customer', '0905555666', 'Can Tho', NULL);

-- O7: Ha Noi -> Hai Phong (north intra-region), out_for_delivery
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0007',
  (SELECT user_id FROM users WHERE email='customer3@example.com'),
  (SELECT user_id FROM users WHERE email='shipper_hp@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HP'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HP'),
  'Sender HN', '0903000000', 'Long Bien, Ha Noi', 21.0550, 105.8860,
  'Receiver HP', '0903000001', 'Ngo Quyen, Hai Phong', 20.8449, 106.6881,
  1.10, 35000.00, 35000.00, (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 10 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT order_status_id FROM order_statuses WHERE code='picked_up'), 'Picked', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 9 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 8 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To HP', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived HP', (SELECT warehouse_id FROM warehouses WHERE code='WH_HP'), NOW() - INTERVAL 3 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery'), 'Out for delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_HP'), NOW() - INTERVAL 1 HOUR);
INSERT INTO order_assignments(order_id, shipper_user_id, assigned_by_user_id, assigned_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0007'), (SELECT user_id FROM users WHERE email='shipper_hp@example.com'), (SELECT user_id FROM users WHERE email='warehouse_hp@example.com'), NOW() - INTERVAL 2 HOUR);

-- O8: Can Tho -> HCMC (south intra-region), at destination hub
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0008',
  (SELECT user_id FROM users WHERE email='customer5@example.com'),
  (SELECT user_id FROM users WHERE email='shipper@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_CT'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'),
  'Sender CT', '0905000000', 'Ninh Kieu, Can Tho', 10.0452, 105.7469,
  'Receiver HCMC', '0905000001', 'Tan Binh, HCMC', 10.8010, 106.6520,
  4.20, 35000.00, 35000.00, (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0008'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_CT'), NOW() - INTERVAL 1 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0008'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'To HCMC center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 22 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0008'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived TB', (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'), NOW() - INTERVAL 20 HOUR);

-- O9: Hue -> Da Nang (central), delivered
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0009',
  (SELECT user_id FROM users WHERE email='customer4@example.com'),
  (SELECT user_id FROM users WHERE email='shipper_hue@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'),
  'Sender Hue', '0906000000', 'Hue', 16.4637, 107.5909,
  'Receiver DN', '0906000001', 'Thanh Khe, Da Nang', 16.0753, 108.1716,
  0.80, 25000.00, 25000.00, (SELECT order_status_id FROM order_statuses WHERE code='delivered')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'), NOW() - INTERVAL 10 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='picked_up'), 'Picked up', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'), NOW() - INTERVAL 9 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'), NOW() - INTERVAL 8 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To DN', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_CENTER'), NOW() - INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived DN TK', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'), NOW() - INTERVAL 4 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery'), 'Out for delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'), NOW() - INTERVAL 2 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT order_status_id FROM order_statuses WHERE code='delivered'), 'Delivered', (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'), NOW() - INTERVAL 1 HOUR);
INSERT INTO order_assignments(order_id, shipper_user_id, assigned_by_user_id, assigned_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0009'), (SELECT user_id FROM users WHERE email='shipper_hue@example.com'), (SELECT user_id FROM users WHERE email='warehouse_hue@example.com'), NOW() - INTERVAL 2 HOUR);

-- O10: Binh Duong -> Long Bien (cross-region heavy), in_transit_to_destination_hub
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0010',
  (SELECT user_id FROM users WHERE email='customer@example.com'),
  (SELECT user_id FROM users WHERE email='shipper_hn@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_BD'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'),
  'Sender BD', '0907777000', 'Binh Duong', 10.9804, 106.6519,
  'Receiver HN', '0907777001', 'Long Bien, Ha Noi', 21.0550, 105.8860,
  12.80, 90000.00, 90000.00, (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0010'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_BD'), NOW() - INTERVAL 2 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0010'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_BD'), NOW() - INTERVAL 2 DAY + INTERVAL 3 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0010'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'To HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 8 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0010'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_sorting_hub'), 'Arrived HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 12 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0010'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 6 HOUR);

-- O11: HN -> HCMC, failed then returned to origin
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0011',
  (SELECT user_id FROM users WHERE email='customer3@example.com'),
  (SELECT user_id FROM users WHERE email='shipper@example.com'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  'Sender HN', '0908888000', 'Long Bien, HN', 21.0550, 105.8860,
  'Receiver HCMC', '0908888001', 'Quan 3, HCMC', 10.7820, 106.6950,
  1.90, 55000.00, 55000.00, (SELECT order_status_id FROM order_statuses WHERE code='returned_to_origin')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 3 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 3 DAY + INTERVAL 1 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'To HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 3 DAY + INTERVAL 5 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_sorting_hub'), 'At HN center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER'), NOW() - INTERVAL 3 DAY + INTERVAL 9 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 6 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'At HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 2 DAY + INTERVAL 10 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='out_for_delivery'), 'Out for delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 2 DAY + INTERVAL 14 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='delivery_failed'), 'Failed delivery', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 2 DAY + INTERVAL 18 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='returned_to_destination_hub'), 'Back to dest hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 2 DAY + INTERVAL 20 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='return_in_transit'), 'Return in transit', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 1 DAY + INTERVAL 2 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0011'), (SELECT order_status_id FROM order_statuses WHERE code='returned_to_origin'), 'Returned to origin', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 1 DAY + INTERVAL 10 HOUR);

-- O12: Waiting for pickup
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0012',
  (SELECT user_id FROM users WHERE email='customer4@example.com'),
  NULL,
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'),
  'Sender Hue', '0906666777', 'Hue', 16.4637, 107.5909,
  'Receiver DN', '0906666888', 'Da Nang', 16.0544, 108.2022,
  0.40, 25000.00, 25000.00, (SELECT order_status_id FROM order_statuses WHERE code='waiting_for_pickup')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0012'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'), NOW() - INTERVAL 3 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0012'), (SELECT order_status_id FROM order_statuses WHERE code='waiting_for_pickup'), 'Waiting for pickup', (SELECT warehouse_id FROM warehouses WHERE code='WH_HUE'), NOW() - INTERVAL 2 HOUR);

-- O5: Cancelled order
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0005',
  (SELECT user_id FROM users WHERE email='customer3@example.com'),
  NULL,
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'),
  'Sender X', '0905000001', 'Long Bien, Ha Noi', 21.0580, 105.9000,
  'Receiver Y', '0906000002', 'Quan 3, HCMC', 10.7820, 106.6950,
  0.30, 25000.00, 25000.00, (SELECT order_status_id FROM order_statuses WHERE code='cancelled')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0005'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 12 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0005'), (SELECT order_status_id FROM order_statuses WHERE code='cancelled'), 'Order cancelled by admin', (SELECT warehouse_id FROM warehouses WHERE code='WH_LB'), NOW() - INTERVAL 11 HOUR);

-- O6: Lost order
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0006',
  (SELECT user_id FROM users WHERE email='customer@example.com'),
  NULL,
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'),
  'Sender Z', '0907777333', 'Quan 3, HCMC', 10.7820, 106.6950,
  'Receiver Z', '0908888444', 'Thanh Khe, Da Nang', 16.0753, 108.1716,
  2.00, 40000.00, 40000.00, (SELECT order_status_id FROM order_statuses WHERE code='lost')
);
INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0006'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 7 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0006'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_origin_hub'), 'At origin hub', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 6 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0006'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_sorting_center'), 'To HCM center', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 5 DAY),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0006'), (SELECT order_status_id FROM order_statuses WHERE code='lost'), 'Lost in transit', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 4 DAY);

-- More orders specifically at WH_Q3 (for assignment demo)
INSERT INTO orders (
  tracking_code, customer_user_id, shipper_user_id, origin_warehouse_id, destination_warehouse_id, current_warehouse_id,
  sender_name, sender_phone, sender_address, sender_lat, sender_lng,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  weight_kg, shipping_fee, total_amount, current_status_id
) VALUES (
  'VN20251024-0013',
  (SELECT user_id FROM users WHERE email='customer2@example.com'),
  NULL,
  (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  'Cty ABC', '0902000000', 'Tan Binh, HCMC', 10.8010, 106.6520,
  'Nguoi nhan Q3', '0902000001', 'Quan 3, HCMC', 10.7840, 106.6950,
  1.20, 25000.00, 25000.00, (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub')
), (
  'VN20251024-0014',
  (SELECT user_id FROM users WHERE email='customer@example.com'),
  NULL,
  (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'),
  'Shop XYZ', '0902111222', 'District 1, HCMC', 10.7769, 106.7009,
  'Nguoi nhan Q3-2', '0902111223', 'Quan 3, HCMC', 10.7815, 106.6840,
  0.80, 25000.00, 25000.00, (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub')
);

INSERT INTO order_status_history(order_id, order_status_id, note, warehouse_id, created_at) VALUES
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0013'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_TB'), NOW() - INTERVAL 10 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0013'), (SELECT order_status_id FROM order_statuses WHERE code='in_transit_to_destination_hub'), 'To WH_Q3', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 7 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0013'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived WH_Q3', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 3 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0014'), (SELECT order_status_id FROM order_statuses WHERE code='created'), 'Order created', (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER'), NOW() - INTERVAL 12 HOUR),
((SELECT order_id FROM orders WHERE tracking_code='VN20251024-0014'), (SELECT order_status_id FROM order_statuses WHERE code='arrived_at_destination_hub'), 'Arrived WH_Q3', (SELECT warehouse_id FROM warehouses WHERE code='WH_Q3'), NOW() - INTERVAL 5 HOUR);
