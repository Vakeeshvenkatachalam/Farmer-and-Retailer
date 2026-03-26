-- ============================================================
-- Farmer-Retailer Platform: Database Cleanup & Reset Script
-- Run this in MySQL Workbench BEFORE starting the backend
-- ============================================================

-- Step 1: Select your database
USE farmer_retailer_db;  -- ⚠️ Change this to match your actual DB name

-- Step 2: Disable foreign key checks (to avoid constraint errors during truncate)
SET FOREIGN_KEY_CHECKS = 0;

-- Step 3: Clear all existing data
TRUNCATE TABLE feedback;
TRUNCATE TABLE payments;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE farmer;
TRUNCATE TABLE retailer;
TRUNCATE TABLE users;

-- Step 4: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Step 5: Add a default Admin user (password = "admin123")
-- BCrypt hash of "admin123" (cost 10) — Spring will verify this correctly
-- ============================================================
INSERT INTO users (name, email, password, role, phone, village, district, state, approval_status)
VALUES (
  'Platform Admin',
  'admin@platform.com',
  '$2a$10$7QtBJ2Z0hZZuKJgjQ1YmH.7Z6GN8yHa4uMF.VhB/ozmXH1LNx9w2G',
  'ADMIN',
  '9999999999',
  NULL,
  NULL,
  NULL,
  'APPROVED'
);

-- ============================================================
-- Verification: Check users table after running
-- ============================================================
SELECT id, name, email, role, approval_status FROM users;

-- ============================================================
-- NOTES:
-- 1. After running this script, restart your Spring Boot backend.
-- 2. Go to http://localhost:5173/register to create new farmer/retailer
--    accounts through the app (passwords will be BCrypt-encoded).
-- 3. Admin login: http://localhost:5173/admin-login
--    Email:    admin@platform.com
--    Password: admin123
-- ============================================================
