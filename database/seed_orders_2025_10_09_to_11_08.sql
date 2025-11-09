-- Seed ~60 sample orders between 2025-10-09 and 2025-11-08
-- MariaDB-compatible (no CTE dependency); works on typical XAMPP MariaDB
-- Usage: import this file in phpMyAdmin or mysql client after schema/seed.

USE `333express`;

-- Insert around 60 orders for 2025-10-09 .. 2025-11-08
-- Strategy: generate day offsets (0..63) via CROSS JOIN, then take days in range.
-- Two orders per day except 2025-10-09 and 2025-10-10 (only 1 order) => 60 total.

INSERT INTO orders (
  tracking_code,
  customer_user_id,
  shipper_user_id,
  origin_warehouse_id,
  destination_warehouse_id,
  current_warehouse_id,
  sender_name,
  sender_phone,
  sender_address,
  sender_lat,
  sender_lng,
  receiver_name,
  receiver_phone,
  receiver_address,
  receiver_lat,
  receiver_lng,
  weight_kg,
  shipping_fee,
  total_amount,
  current_status_id,
  created_at,
  delivered_at
)
SELECT
  CONCAT('VN', DATE_FORMAT(dd.day, '%Y%m%d'), '-', LPAD(ks.k, 4, '0')) AS tracking_code,
  CASE ((dd.day_idx % 5))
    WHEN 1 THEN (SELECT user_id FROM users WHERE email='customer@example.com' LIMIT 1)
    WHEN 2 THEN (SELECT user_id FROM users WHERE email='customer2@example.com' LIMIT 1)
    WHEN 3 THEN (SELECT user_id FROM users WHERE email='customer3@example.com' LIMIT 1)
    WHEN 4 THEN (SELECT user_id FROM users WHERE email='customer4@example.com' LIMIT 1)
    ELSE (SELECT user_id FROM users WHERE email='customer5@example.com' LIMIT 1)
  END AS customer_user_id,

  CASE (((dd.day_idx + ks.k) % 6))
    WHEN 0 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT user_id FROM users WHERE email='shipper@example.com' LIMIT 1)
        WHEN 1 THEN (SELECT user_id FROM users WHERE email='shipper2@example.com' LIMIT 1)
        ELSE (SELECT user_id FROM users WHERE email='shipper_hn@example.com' LIMIT 1)
      END
    )
    WHEN 1 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT user_id FROM users WHERE email='shipper@example.com' LIMIT 1)
        WHEN 1 THEN (SELECT user_id FROM users WHERE email='shipper2@example.com' LIMIT 1)
        ELSE (SELECT user_id FROM users WHERE email='shipper_hn@example.com' LIMIT 1)
      END
    )
    WHEN 3 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT user_id FROM users WHERE email='shipper@example.com' LIMIT 1)
        WHEN 1 THEN (SELECT user_id FROM users WHERE email='shipper2@example.com' LIMIT 1)
        ELSE (SELECT user_id FROM users WHERE email='shipper_hn@example.com' LIMIT 1)
      END
    )
    ELSE NULL
  END AS shipper_user_id,

  CASE ((dd.day_idx % 3))
    WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
    WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK' LIMIT 1)
    ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
  END AS origin_warehouse_id,

  CASE ((dd.day_idx % 3))
    WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
    WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
    ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_HP' LIMIT 1)
  END AS destination_warehouse_id,

  CASE (((dd.day_idx + ks.k) % 6))
    WHEN 0 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
        WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
        ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_HP' LIMIT 1)
      END
    )
    WHEN 1 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
        WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
        ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_HP' LIMIT 1)
      END
    )
    WHEN 2 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
        WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
        ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_HP' LIMIT 1)
      END
    )
    WHEN 3 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
        WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
        ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_HP' LIMIT 1)
      END
    )
    WHEN 4 THEN (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_TB' LIMIT 1)
        WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_TK' LIMIT 1)
        ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_LB' LIMIT 1)
      END
    )
    ELSE (
      CASE (dd.day_idx % 3)
        WHEN 0 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_HCM_CENTER' LIMIT 1)
        WHEN 1 THEN (SELECT warehouse_id FROM warehouses WHERE code='WH_DN_CENTER' LIMIT 1)
        ELSE (SELECT warehouse_id FROM warehouses WHERE code='WH_HN_CENTER' LIMIT 1)
      END
    )
  END AS current_warehouse_id,

  CONCAT('Sender ', (dd.day_idx * 2 + ks.k)) AS sender_name,
  CONCAT('090', LPAD(((dd.day_idx * 2 + ks.k) % 10000000), 7, '0')) AS sender_phone,
  CASE ((dd.day_idx % 3))
    WHEN 0 THEN 'Tan Binh, HCMC'
    WHEN 1 THEN 'Thanh Khe, Da Nang'
    ELSE 'Long Bien, Ha Noi'
  END AS sender_address,
  CASE ((dd.day_idx % 3))
    WHEN 0 THEN 10.8010
    WHEN 1 THEN 16.0753
    ELSE 21.0550
  END AS sender_lat,
  CASE ((dd.day_idx % 3))
    WHEN 0 THEN 106.6520
    WHEN 1 THEN 108.1716
    ELSE 105.8860
  END AS sender_lng,

  CONCAT('Receiver ', (dd.day_idx * 2 + ks.k)) AS receiver_name,
  CONCAT('091', LPAD(((dd.day_idx * 2 + ks.k) % 10000000), 7, '0')) AS receiver_phone,
  CASE ((dd.day_idx % 3))
    WHEN 0 THEN 'Cau Giay, Ha Noi'
    WHEN 1 THEN 'Quan 3, HCMC'
    ELSE 'Ngo Quyen, Hai Phong'
  END AS receiver_address,
  CASE ((dd.day_idx % 3))
    WHEN 0 THEN 21.0285
    WHEN 1 THEN 10.7820
    ELSE 20.8449
  END AS receiver_lat,
  CASE ((dd.day_idx % 3))
    WHEN 0 THEN 105.8542
    WHEN 1 THEN 106.6950
    ELSE 106.6881
  END AS receiver_lng,

  (0.5 + (((dd.day_idx * 2 + ks.k) % 10) * 0.5)) AS weight_kg,
  (30000 + (((dd.day_idx + ks.k) % 6) * 5000)) AS shipping_fee,
  (30000 + (((dd.day_idx + ks.k) % 6) * 5000)) AS total_amount,

  (
    SELECT order_status_id FROM order_statuses WHERE code = (
      CASE (((dd.day_idx + ks.k) % 6))
        WHEN 0 THEN 'delivered'
        WHEN 1 THEN 'out_for_delivery'
        WHEN 2 THEN 'arrived_at_destination_hub'
        WHEN 3 THEN 'delivery_failed'
        WHEN 4 THEN 'in_transit_to_destination_hub'
        ELSE 'arrived_at_sorting_hub'
      END
    ) LIMIT 1
  ) AS current_status_id,

  (dd.day + INTERVAL (CASE WHEN ks.k=1 THEN 10 ELSE 15 END) HOUR) AS created_at,

  CASE (((dd.day_idx + ks.k) % 6))
    WHEN 0 THEN (dd.day + INTERVAL (CASE WHEN ks.k=1 THEN 18 ELSE 20 END) HOUR)
    ELSE NULL
  END AS delivered_at
FROM (
  -- Resolve actual day and index
  SELECT DATE_ADD(DATE('2025-10-09'), INTERVAL (a.n + b.n*8) DAY) AS day,
         (a.n + b.n*8) AS day_idx
  FROM (
    SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
  ) a
  CROSS JOIN (
    SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7
  ) b
) dd
CROSS JOIN (
  SELECT 1 AS k UNION ALL SELECT 2
) ks
WHERE dd.day BETWEEN DATE('2025-10-09') AND DATE('2025-11-08')
  AND ( (dd.day <= DATE('2025-10-10') AND ks.k = 1) OR (dd.day > DATE('2025-10-10')) )
  AND NOT EXISTS (
    SELECT 1 FROM orders o2
    WHERE o2.tracking_code = CONCAT('VN', DATE_FORMAT(dd.day, '%Y%m%d'), '-', LPAD(ks.k, 4, '0'))
  );

-- Insert status history for these orders (idempotent by note flag)
INSERT INTO order_status_history (order_id, order_status_id, note, warehouse_id, created_at)
SELECT o.order_id,
       (SELECT order_status_id FROM order_statuses WHERE code='created' LIMIT 1) AS order_status_id,
       'Seed: created',
       o.origin_warehouse_id,
       o.created_at
FROM orders o
WHERE o.created_at >= '2025-10-09' AND o.created_at < '2025-11-09'
  AND RIGHT(o.tracking_code, 4) IN ('0001','0002')
  AND NOT EXISTS (
    SELECT 1 FROM order_status_history h WHERE h.order_id = o.order_id AND h.note = 'Seed: created'
  );

INSERT INTO order_status_history (order_id, order_status_id, note, warehouse_id, created_at)
SELECT o.order_id,
       o.current_status_id,
       'Seed: current',
       o.current_warehouse_id,
       CASE WHEN o.delivered_at IS NOT NULL THEN o.delivered_at ELSE o.created_at + INTERVAL 4 HOUR END
FROM orders o
WHERE o.created_at >= '2025-10-09' AND o.created_at < '2025-11-09'
  AND RIGHT(o.tracking_code, 4) IN ('0001','0002')
  AND NOT EXISTS (
    SELECT 1 FROM order_status_history h WHERE h.order_id = o.order_id AND h.note = 'Seed: current'
  );

