# Database Operations Guide

SQL queries, schema operations, and database management for MP Platform dashboards.

**Related Documentation:**

- [Backend Implementation](./BACKEND_IMPLEMENTATION.md) - API handlers
- [Scoring Logic](./SCORING_LOGIC.md) - Score calculations
- [Architecture](/docs/ARCHITECTURE.md) - Database schema relationships

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Queries](#core-queries)
3. [Score Storage](#score-storage)
4. [Assignment Operations](#assignment-operations)
5. [Data Retrieval](#data-retrieval)
6. [Cleanup Operations](#cleanup-operations)
7. [Indexes and Optimization](#indexes-and-optimization)

---

## Schema Overview

### Key Tables for Dashboards

```sql
-- User health data
users (UserID, Sex, general_health_score, DateOfBirth, ...)
health_data (id, UserID, Weight, waistCircumference, height, BloodPressure*, ...)

-- Biomarkers and scoring
biomarkers (id, name, description)
biomarker_scores (id, biomarker_id, range_from, range_to, score)
user_scores (id, user_id, biomarker_id, score, calculated_at)

-- Products and recommendations
products (id, name, description, type, price, is_active, ...)
product_biomarker_score (id, product_id, biomarker_id, score, priority)

-- Digital journey
digital_plans (id, name, description)
digital_items (id, name, description, type, image_url, content_url)
digital_plan_items (id, plan_id, item_id, day_offset)
biomarker_plan_score (id, biomarker_id, score, plan_id)
user_digital_plans (id, user_id, plan_id, assigned_at)
user_digital_plan_items (id, user_plan_id, item_id, scheduled_date, completed)

-- Provider network
expertise_types (id, name, description, category)
providers (id, name, title, expertise_type_id, price, image_url, booking_url)
biomarker_expertise_score (id, biomarker_id, score, expertise_type_id)
user_expertise_types (id, user_id, expertise_type_id, assigned_at)
```

**Schema File:** `mp_api/data/setup/schema.sql`

---

## Core Queries

### Get User Information

```sql
-- Get user with health score
SELECT UserID, Sex, general_health_score, DateOfBirth, Email, Name
FROM users
WHERE UserID = ?;
```

### Get Latest Health Data

```sql
-- Get most recent health measurements
SELECT *
FROM health_data
WHERE UserID = ?
ORDER BY CreatedAt DESC
LIMIT 1;
```

### Get All Biomarkers

```sql
-- Get biomarker definitions
SELECT id, name, description
FROM biomarkers;
```

**Common Biomarker IDs:**

- 3: waistCircumference
- 4: bloodPressureSystolic
- 5: bloodPressureDiastolic
- 6: fastingBloodGlucose
- 7: hdlCholesterol
- 8: triglycerides

---

## Score Storage

### Store Individual Biomarker Score

```sql
-- Insert or update biomarker score for user
INSERT INTO user_scores (user_id, biomarker_id, score)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE
    score = VALUES(score),
    calculated_at = CURRENT_TIMESTAMP;
```

**Example:**

```javascript
await pool.execute(
    `INSERT INTO user_scores (user_id, biomarker_id, score) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE score = VALUES(score), calculated_at = CURRENT_TIMESTAMP`,
    ["user@example.com", 4, 90], // BP Systolic score = 90
);
```

### Update General Health Score

```sql
-- Update user's overall health score
UPDATE users
SET general_health_score = ?
WHERE UserID = ?;
```

**Example:**

```javascript
await pool.execute(
    `UPDATE users SET general_health_score = ? WHERE UserID = ?`,
    [66.45, "user@example.com"],
);
```

### Get User Scores

```sql
-- Get all calculated scores for user
SELECT biomarker_id, score, calculated_at
FROM user_scores
WHERE user_id = ?;
```

---

## Assignment Operations

### Digital Plan Assignment

**Check Existing Assignment:**

```sql
SELECT id, plan_id
FROM user_digital_plans
WHERE user_id = ?;
```

**Assign New Plan:**

```sql
INSERT INTO user_digital_plans (user_id, plan_id)
VALUES (?, ?);
```

**Get Plan Items:**

```sql
SELECT item_id, day_offset
FROM digital_plan_items
WHERE plan_id = ?;
```

**Schedule Plan Items:**

```sql
INSERT INTO user_digital_plan_items (user_plan_id, item_id, scheduled_date)
VALUES (?, ?, ?);
```

**Find Matching Plan by Score:**

```sql
SELECT bps.plan_id, bps.biomarker_id, bps.score
FROM biomarker_plan_score bps;
-- Filter in application logic to match user's scores
```

### Expertise Type Assignment

**Check Existing Assignment:**

```sql
SELECT expertise_type_id
FROM user_expertise_types
WHERE user_id = ?;
```

**Assign Expertise Type:**

```sql
INSERT INTO user_expertise_types (user_id, expertise_type_id)
VALUES (?, ?);
```

**Find Matching Expertise by Score:**

```sql
SELECT bes.expertise_type_id, bes.biomarker_id, bes.score
FROM biomarker_expertise_score bes;
-- Filter in application logic to match user's scores
```

---

## Data Retrieval

### Get Recommendations (Products)

**All Active Products with Biomarker Scores:**

```sql
SELECT DISTINCT
    p.id, p.name, p.description, p.details, p.type, p.price,
    p.image_url, p.digital_url, p.public_visible, p.created_at,
    pbs.biomarker_id, pbs.score, pbs.priority,
    b.name as biomarker_name
FROM products p
LEFT JOIN product_biomarker_score pbs ON p.id = pbs.product_id
LEFT JOIN biomarkers b ON pbs.biomarker_id = b.id
WHERE p.is_active = 1
ORDER BY p.id, pbs.priority DESC;
```

**Filter by User Scores (Application Logic):**

```javascript
// After fetching products, filter where:
// userScores[prod.biomarker_id] === prod.score
```

### Get Digital Journey

**Get User's Assigned Plan:**

```sql
SELECT
    udp.id as user_plan_id,
    dp.name as plan_name,
    udp.assigned_at
FROM user_digital_plans udp
JOIN digital_plans dp ON udp.plan_id = dp.id
WHERE udp.user_id = ?
ORDER BY udp.assigned_at DESC
LIMIT 1;
```

**Get Scheduled Items for Plan:**

```sql
SELECT
    udi.scheduled_date,
    di.name,
    di.description,
    di.type,
    di.image_url,
    di.content_url
FROM user_digital_plan_items udi
JOIN digital_items di ON udi.item_id = di.id
WHERE udi.user_plan_id = ?
ORDER BY udi.scheduled_date ASC;
```

### Get Provider Network

**Get User's Expertise Types:**

```sql
SELECT
    uet.expertise_type_id,
    et.name as expertise_name,
    et.category as expertise_category
FROM user_expertise_types uet
JOIN expertise_types et ON uet.expertise_type_id = et.id
WHERE uet.user_id = ?;
```

**Get Providers by Expertise Types:**

```sql
SELECT
    p.*,
    et.name as expertise_type,
    et.category as expertise_category
FROM providers p
JOIN expertise_types et ON p.expertise_type_id = et.id
WHERE p.expertise_type_id IN (?, ?, ?);  -- Dynamic list of IDs
```

**Dynamic IN Clause Example:**

```javascript
const expertiseTypeIds = [1, 3, 5];
const placeholders = expertiseTypeIds.map(() => "?").join(",");
const [providers] = await pool.execute(
    `SELECT p.*, et.name as expertise_type 
     FROM providers p
     JOIN expertise_types et ON p.expertise_type_id = et.id
     WHERE p.expertise_type_id IN (${placeholders})`,
    expertiseTypeIds,
);
```

---

## Cleanup Operations

### Remove Duplicate Plan Items

**Find Duplicates:**

```sql
SELECT
    item_id,
    scheduled_date,
    COUNT(*) as count,
    MIN(id) as keep_id
FROM user_digital_plan_items
WHERE user_plan_id = ?
GROUP BY item_id, scheduled_date
HAVING COUNT(*) > 1;
```

**Delete Duplicates (Keep First):**

```sql
DELETE FROM user_digital_plan_items
WHERE user_plan_id = ?
  AND item_id = ?
  AND scheduled_date = ?
  AND id != ?;  -- Keep the one with MIN(id)
```

### Remove Duplicate Expertise Types

**Find Duplicates:**

```sql
SELECT
    expertise_type_id,
    COUNT(*) as count,
    MIN(id) as keep_id
FROM user_expertise_types
WHERE user_id = ?
GROUP BY expertise_type_id
HAVING COUNT(*) > 1;
```

**Delete Duplicates (Keep First):**

```sql
DELETE FROM user_expertise_types
WHERE user_id = ?
  AND expertise_type_id = ?
  AND id != ?;  -- Keep the one with MIN(id)
```

---

## Indexes and Optimization

### Existing Indexes

**User Scores:**

```sql
CREATE INDEX idx_user_scores_user ON user_scores (user_id);
CREATE INDEX idx_user_scores_biomarker ON user_scores (biomarker_id);
CREATE UNIQUE INDEX uk_user_biomarker ON user_scores (user_id, biomarker_id);
```

**Product Biomarker Score:**

```sql
CREATE INDEX product_id ON product_biomarker_score (product_id);
CREATE INDEX idx_product_biomarker_score_biomarker ON product_biomarker_score (biomarker_id);
CREATE INDEX idx_product_biomarker_score_score ON product_biomarker_score (score);
```

**Biomarker Scores:**

```sql
CREATE INDEX idx_biomarker_scores_biomarker ON biomarker_scores (biomarker_id);
```

### Query Optimization Tips

**Use EXPLAIN to analyze queries:**

```sql
EXPLAIN SELECT * FROM user_scores WHERE user_id = 'user@example.com';
```

**Avoid SELECT \*:**

```sql
-- Bad
SELECT * FROM products WHERE is_active = 1;

-- Good
SELECT id, name, description, type, price FROM products WHERE is_active = 1;
```

**Use JOINs instead of subqueries:**

```sql
-- Less efficient
SELECT * FROM providers
WHERE expertise_type_id IN (
    SELECT expertise_type_id FROM user_expertise_types WHERE user_id = ?
);

-- More efficient
SELECT DISTINCT p.*
FROM providers p
JOIN user_expertise_types uet ON p.expertise_type_id = uet.expertise_type_id
WHERE uet.user_id = ?;
```

---

## Migration Patterns

### Migration Files Location

`mp_api/data/migration/`

### Example Migration: Add Column

**File:** `20250904_add_category_column_to_expertise_types_table.sql`

```sql
-- Add category column to expertise_types
ALTER TABLE expertise_types
ADD COLUMN category VARCHAR(100) NULL AFTER name;

-- Update existing records (optional)
UPDATE expertise_types
SET category = 'general'
WHERE category IS NULL;
```

### Example Migration: Add Price to Providers

**File:** `20250906_add_price_column_to_providers_table.sql`

```sql
-- Add price column to providers
ALTER TABLE providers
ADD COLUMN price DECIMAL(10, 2) NULL AFTER booking_url;
```

### Migration Best Practices

1. **Use descriptive filenames** with date prefix: `YYYYMMDD_description.sql`
2. **Include rollback statements** in comments
3. **Test migrations** on dev database first
4. **Document breaking changes**
5. **Use transactions** when possible:

```sql
START TRANSACTION;
-- Migration statements
COMMIT;
-- ROLLBACK; -- Use if error occurs
```

---

## Seed Data

### Seed File Location

`mp_api/data/setup/seed.sql`

### Biomarker Seeding Example

```sql
-- Insert biomarkers
INSERT INTO biomarkers (name, description) VALUES
('waistCircumference', 'Waist-to-Height Ratio'),
('bloodPressureSystolic', 'Systolic Blood Pressure'),
('bloodPressureDiastolic', 'Diastolic Blood Pressure'),
('fastingBloodGlucose', 'Fasting Blood Glucose Level'),
('hdlCholesterol', 'HDL Cholesterol Level'),
('triglycerides', 'Triglycerides Level');
```

### Product Seeding Example

```sql
-- Insert products
INSERT INTO products (name, description, type, price, is_active, image_url) VALUES
('Omega-3 Fish Oil', 'Supports heart health and cholesterol', 'supplement', 25.99, 1, 'omega3.png'),
('Meditation App', 'Guided meditation for stress reduction', 'digital', 9.99, 1, 'meditation.png');

-- Link products to biomarker scores
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(1, 7, 60, 1),  -- Omega-3 for low HDL (score 60)
(2, 4, 70, 1);  -- Meditation for elevated BP (score 70)
```

---

## Connection Pool Management

### Pool Configuration

```javascript
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Max 10 simultaneous connections
    queueLimit: 0, // Unlimited queue
    ssl: { rejectUnauthorized: false },
});
```

### Connection Best Practices

**Always use parameterized queries:**

```javascript
// CORRECT
const [rows] = await pool.execute("SELECT * FROM users WHERE UserID = ?", [
    userId,
]);

// WRONG - SQL Injection vulnerability
const [rows] = await pool.execute(
    `SELECT * FROM users WHERE UserID = '${userId}'`,
);
```

**Handle connection errors:**

```javascript
try {
    const [rows] = await pool.execute(query, params);
    return rows;
} catch (error) {
    console.error("Database error:", error);
    throw new Error("Database operation failed");
}
```

**Use transactions for multiple related operations:**

```javascript
const connection = await pool.getConnection();
try {
    await connection.beginTransaction();

    // Multiple operations
    await connection.execute(query1, params1);
    await connection.execute(query2, params2);

    await connection.commit();
} catch (error) {
    await connection.rollback();
    throw error;
} finally {
    connection.release();
}
```

---

## Backup and Restore

### Backup Database

```bash
# Backup entire database
mysqldump -u root -p health_database > backup_$(date +%Y%m%d).sql

# Backup specific tables
mysqldump -u root -p health_database users health_data user_scores > backup_users_$(date +%Y%m%d).sql
```

### Restore Database

```bash
# Restore from backup
mysql -u root -p health_database < backup_20250119.sql
```

---

## Related Documentation

- **[Backend Implementation](./BACKEND_IMPLEMENTATION.md)** - API handlers using these queries
- **[Scoring Logic](./SCORING_LOGIC.md)** - How scores are calculated
- **[Architecture](/docs/ARCHITECTURE.md)** - Database schema relationships
- **Schema File:** `mp_api/data/setup/schema.sql`
- **Seed File:** `mp_api/data/setup/seed.sql`
- **Migrations:** `mp_api/data/migration/`
