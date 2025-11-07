-- Create missing warehouse operator users for every warehouse
-- Default password for all created users: password123
-- Make sure you are using the correct database first
USE `333express`;

-- bcrypt hash for 'password123' (10 rounds)
SET @pwd := '$2a$10$VJX81fZAbu5pLGitymWT5.5fDjwgYT8zG0LA6Vcuw/e6Q6v1IFGEe';

-- Insert one warehouse user per warehouse if not already present
INSERT INTO users (email, password_hash, name, role, phone, address, warehouse_id)
SELECT CONCAT('warehouse_', LOWER(REPLACE(REPLACE(w.code,'-','_'),' ','_')), '@example.com') AS email,
       @pwd,
       CONCAT('Kho ', w.name) AS name,
       'warehouse' AS role,
       '0900000000' AS phone,
       w.province AS address,
       w.warehouse_id
FROM warehouses w
LEFT JOIN users u ON u.warehouse_id = w.warehouse_id AND u.role = 'warehouse'
WHERE u.user_id IS NULL;

-- View created/available warehouse users
SELECT user_id, email, name, role, warehouse_id FROM users WHERE role='warehouse' ORDER BY warehouse_id;

