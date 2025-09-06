-- Migration: 20250906_add_price_column_to_providers_table.sql
-- Description: Add price column to providers table for consulting fees and update existing records

-- Schema Changes
ALTER TABLE providers ADD COLUMN price DECIMAL(10, 2) NULL AFTER booking_url;

-- Update existing records with default prices based on expertise type
-- Nutrition Specialists: $150
UPDATE providers SET price = 150.00 WHERE expertise_type_id = 1;

-- Exercise Physiologists: $120
UPDATE providers SET price = 120.00 WHERE expertise_type_id = 2;

-- Metabolic Health Consultants: $200
UPDATE providers SET price = 200.00 WHERE expertise_type_id = 3;

-- Set default price for any remaining providers without prices
UPDATE providers SET price = 150.00 WHERE price IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE providers MODIFY COLUMN price DECIMAL(10, 2) NOT NULL;

-- Rollback Instructions:
-- 1. ALTER TABLE providers DROP COLUMN price;
