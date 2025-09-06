-- Migration: 20250904_add_category_column_to_expertise_types_table.sql
-- Description: Add category column to expertise_types table and populate with appropriate categories

-- Schema Changes
ALTER TABLE expertise_types ADD COLUMN category VARCHAR(100) NULL AFTER description;

-- Populate category column with appropriate values based on expertise type
UPDATE expertise_types SET category = 'Medical' WHERE id = 1; -- Physician
UPDATE expertise_types SET category = 'Nutrition' WHERE id = 2; -- Diet Expert
UPDATE expertise_types SET category = 'Nutrition' WHERE id = 3; -- Nutrition Specialist
UPDATE expertise_types SET category = 'Fitness' WHERE id = 4; -- Exercise Physiologist
UPDATE expertise_types SET category = 'Medical' WHERE id = 5; -- Metabolic Health Consultant

-- Rollback Instructions:
-- ALTER TABLE expertise_types DROP COLUMN category;
