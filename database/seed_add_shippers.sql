-- Create two default shipper users per warehouse (if missing)
-- Default password: password123
USE `333express`;

-- bcrypt hash for 'password123' (10 rounds)
SET @pwd := '$2a$10$VJX81fZAbu5pLGitymWT5.5fDjwgYT8zG0LA6Vcuw/e6Q6v1IFGEe';

-- Insert Shipper A for every warehouse (ignored if email exists)
INSERT IGNORE INTO users (email, password_hash, name, role, phone, address, warehouse_id)
SELECT CONCAT('shipper_', LOWER(REPLACE(REPLACE(code,'-','_'),' ','_')), '_a@example.com') AS email,
       @pwd,
       CONCAT('Shipper A ', name) AS name,
       'shipper' AS role,
       '0911111111' AS phone,
       province AS address,
       warehouse_id
FROM warehouses;

-- Insert Shipper B for every warehouse (ignored if email exists)
INSERT IGNORE INTO users (email, password_hash, name, role, phone, address, warehouse_id)
SELECT CONCAT('shipper_', LOWER(REPLACE(REPLACE(code,'-','_'),' ','_')), '_b@example.com') AS email,
       @pwd,
       CONCAT('Shipper B ', name) AS name,
       'shipper' AS role,
       '0922222222' AS phone,
       province AS address,
       warehouse_id
FROM warehouses;

-- View shippers by warehouse
SELECT warehouse_id, COUNT(*) AS shipper_count
FROM users WHERE role='shipper'
GROUP BY warehouse_id
ORDER BY warehouse_id;

