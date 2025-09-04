# Database Migration Guide

This guide provides a standardized approach to database migrations for the Metabolic Point Platform API.

## Migration Structure

All migrations are stored in this `migration/` folder. Each migration is a single SQL file that contains all necessary changes.

### Migration File Naming Convention
Migration files should be named descriptively, following this pattern:
```
YYYYMMDD_description_of_changes.sql
```

Examples:
- `20240904_adding_category_to_product_table.sql`
- `20240905_update_user_health_data_schema.sql`
- `20240906_add_new_biomarker_types.sql`

## First-Time Setup

For new installations or complete database rebuilds:

### Step 1: Run Schema SQL
Execute the main schema file to create all tables, indexes, and constraints:

```bash
mysql -u [username] -p [database_name] < data/setup/schema.sql
```

### Step 2: Run Seed Data
Populate the database with initial data:

```bash
mysql -u [username] -p [database_name] < data/setup/seed.sql
```

## Migration Process

### Creating a New Migration

1. **Create Migration File**: Create a new SQL file in this `migration/` folder following the naming convention.

2. **Include All Changes**: Each migration file should contain:
   - **Schema Changes**: ALTER TABLE, CREATE TABLE, DROP TABLE, etc.
   - **Default Values**: Any new default values for existing columns
   - **Seed Values**: INSERT statements for new data required by the changes

3. **Example Migration Structure**:
```sql
-- Migration: 20240904_adding_category_to_product_table.sql
-- Description: Add category column to products table with default values and seed data

-- Schema Changes
ALTER TABLE products ADD COLUMN category ENUM('digital', 'supplement', 'food', 'device') NOT NULL DEFAULT 'supplement' AFTER name;

-- Update existing records with appropriate categories
UPDATE products SET category = 'digital' WHERE type = 'digital';
UPDATE products SET category = 'supplement' WHERE type = 'supplement';
UPDATE products SET category = 'food' WHERE type = 'food';
UPDATE products SET category = 'device' WHERE type = 'device';

-- Seed new categories if needed
INSERT INTO product_categories (name, description) VALUES
('Metabolic Health', 'Products focused on metabolic health improvement'),
('Nutrition', 'Nutritional supplements and foods');

-- Drop old column after migration
ALTER TABLE products DROP COLUMN type;
```

### Running Migrations

1. **Backup First**: Always backup your database before running migrations
```bash
mysqldump -u [username] -p [database_name] > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. **Execute Migration**:
```bash
mysql -u [username] -p [database_name] < migration/YYYYMMDD_description.sql
```

3. **Verify Changes**: Check that the migration completed successfully
```sql
-- Example verification queries
SELECT COUNT(*) FROM products WHERE category IS NOT NULL;
SHOW COLUMNS FROM products;
```

## Migration Best Practices

### Schema Changes
- Use descriptive ALTER TABLE statements
- Add new columns with appropriate defaults
- Consider data migration for existing records
- Update indexes as needed

### Default Values
- Always provide sensible defaults for new columns
- Use NOT NULL constraints appropriately
- Consider backward compatibility

### Seed Data
- Include all necessary reference data
- Use INSERT IGNORE for safe re-runs
- Consider foreign key relationships
- Add data in correct dependency order

### Error Handling
- Test migrations on development environment first
- Include rollback instructions in comments
- Document any manual steps required

## Rollback Strategy

Each migration should include rollback instructions in comments:

```sql
-- Rollback Instructions:
-- 1. ALTER TABLE products ADD COLUMN type ENUM('digital', 'supplement', 'food', 'device');
-- 2. UPDATE products SET type = category;
-- 3. ALTER TABLE products DROP COLUMN category;
-- 4. DELETE FROM product_categories WHERE name IN ('Metabolic Health', 'Nutrition');
```

## Migration Order

Run migrations in chronological order:
1. `20240904_adding_category_to_product_table.sql`
2. `20240905_update_user_health_data_schema.sql`
3. `20240906_add_new_biomarker_types.sql`

## Post-Migration Tasks

1. **Update Application Code**: Modify code to use new schema
2. **Update API Documentation**: Reflect schema changes
3. **Test All Features**: Ensure no breaking changes
4. **Update Client Applications**: If schema changes affect API responses

## Troubleshooting

### Common Issues
- **Foreign Key Constraints**: Ensure related data exists before adding constraints
- **Data Type Mismatches**: Verify data types match between tables
- **Permission Errors**: Ensure database user has ALTER privileges
- **Duplicate Key Errors**: Use INSERT IGNORE or ON DUPLICATE KEY UPDATE

### Verification Steps
- Check table structures: `DESCRIBE table_name;`
- Verify data integrity: `SELECT COUNT(*) FROM table_name;`
- Test foreign keys: `SHOW CREATE TABLE table_name;`
- Check for orphaned records

## Support

For migration issues:
1. Review MySQL error logs
2. Check migration file syntax
3. Verify database permissions
4. Test on development environment first
5. Document any custom steps required
