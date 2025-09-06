-- Migration: 20250904_add_details_column_to_products_table.sql
-- Description: Add details column to products table and populate with product information

-- Schema Changes
ALTER TABLE products ADD COLUMN details TEXT NULL AFTER description;

-- Populate details column with existing product information
UPDATE products SET details = description WHERE id = 1;
UPDATE products SET details = description WHERE id = 2;
UPDATE products SET details = description WHERE id = 3;
UPDATE products SET details = description WHERE id = 4;
UPDATE products SET details = description WHERE id = 5;
UPDATE products SET details = description WHERE id = 6;
UPDATE products SET details = description WHERE id = 7;
UPDATE products SET details = description WHERE id = 8;
UPDATE products SET details = description WHERE id = 9;
UPDATE products SET details = description WHERE id = 10;
UPDATE products SET details = description WHERE id = 11;
UPDATE products SET details = description WHERE id = 12;
UPDATE products SET details = description WHERE id = 13;
UPDATE products SET details = description WHERE id = 14;
UPDATE products SET details = description WHERE id = 15;
UPDATE products SET details = description WHERE id = 16;
UPDATE products SET details = description WHERE id = 17;
UPDATE products SET details = description WHERE id = 18;
UPDATE products SET details = description WHERE id = 19;
UPDATE products SET details = description WHERE id = 20;
UPDATE products SET details = description WHERE id = 21;
UPDATE products SET details = description WHERE id = 22;
UPDATE products SET details = description WHERE id = 23;
UPDATE products SET details = description WHERE id = 24;
UPDATE products SET details = description WHERE id = 25;
UPDATE products SET details = description WHERE id = 26;
UPDATE products SET details = description WHERE id = 27;
UPDATE products SET details = description WHERE id = 28;
UPDATE products SET details = description WHERE id = 29;
UPDATE products SET details = description WHERE id = 30;
UPDATE products SET details = description WHERE id = 31;
UPDATE products SET details = description WHERE id = 32;
UPDATE products SET details = description WHERE id = 33;
UPDATE products SET details = description WHERE id = 34;
UPDATE products SET details = description WHERE id = 35;
UPDATE products SET details = description WHERE id = 36;
UPDATE products SET details = description WHERE id = 37;
UPDATE products SET details = description WHERE id = 38;
UPDATE products SET details = description WHERE id = 39;
UPDATE products SET details = description WHERE id = 40;
UPDATE products SET details = description WHERE id = 41;
UPDATE products SET details = description WHERE id = 42;
UPDATE products SET details = description WHERE id = 43;
UPDATE products SET details = description WHERE id = 44;
UPDATE products SET details = description WHERE id = 45;
UPDATE products SET details = description WHERE id = 46;

-- Rollback Instructions:
-- ALTER TABLE products DROP COLUMN details;
