# Backend Implementation Guide

This document contains backend-specific implementation details for the MP Platform dashboard API endpoints.

## Overview

Backend implementation in Express.js with MySQL database, JWT authentication, and business logic for health scoring, recommendations, digital journey, and provider network.

**Related Documentation:**

- [API Contracts](/docs/dashboards/API_CONTRACTS.md) - Request/response schemas
- [Enum Mapping](/docs/dashboards/ENUM_MAPPING.md) - Value mappings
- [Architecture](/docs/dashboards/ARCHITECTURE.md) - System overview

---

## Table of Contents

1. [Authentication Middleware](#authentication-middleware)
2. [User Scores Implementation](#user-scores-implementation)
3. [Recommendation Engine](#recommendation-engine)
4. [Digital Journey Management](#digital-journey-management)
5. [Provider Network Matching](#provider-network-matching)
6. [Database Connection](#database-connection)

---

## Authentication Middleware

### JWT Verification Middleware

**File:** `mp_api/server.js` or route files

```javascript
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.userId = decoded.id;
        next();
    });
};
```

**Usage in Routes:**

```javascript
router.get("/user-scores", verifyToken, async (req, res) => {
    const userId = req.userId; // Extracted from JWT
    // ... endpoint logic
});
```

**Token Generation (Login):**

```javascript
// POST /login endpoint
const token = jwt.sign(
    { id: user.UserID, email: user.Email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
);

res.json({ token, user: { UserID, name, Sex, DateOfBirth } });
```

---

## User Scores Implementation

### Endpoint Handler

**File:** `mp_api/routes/userScores.js`

```javascript
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get latest health data for user
        const [healthRows] = await pool.execute(
            `SELECT * FROM health_data 
             WHERE UserID = ? 
             ORDER BY CreatedAt DESC LIMIT 1`,
            [userId],
        );

        if (healthRows.length === 0) {
            return res.status(404).json({ error: "No health data found" });
        }

        const healthData = healthRows[0];

        // Calculate scores using shared function (don't store for GET)
        const result = await calculateAndStoreUserScores(
            userId,
            healthData,
            null,
            false, // shouldStore = false for GET requests
        );

        // Get biomarkers for response formatting
        const [biomarkers] = await pool.execute(
            `SELECT id, name FROM biomarkers`,
        );

        // Format biomarkers array for response
        const biomarkerArray = [];
        for (const bio of biomarkers) {
            const score = result.biomarkerScores[bio.id];
            if (score !== undefined) {
                // Get measure value from health data
                let measureValue = null;
                switch (bio.name) {
                    case "waistCircumference":
                        measureValue =
                            healthData.waistCircumference / healthData.height;
                        break;
                    case "bloodPressureSystolic":
                        measureValue = healthData.BloodPressureSystolic;
                        break;
                    case "bloodPressureDiastolic":
                        measureValue = healthData.BloodPressureDiastolic;
                        break;
                    case "fastingBloodGlucose":
                        measureValue = healthData.FastingBloodGlucose;
                        break;
                    case "hdlCholesterol":
                        measureValue = healthData.HDLCholesterol;
                        break;
                    case "triglycerides":
                        measureValue = healthData.Triglycerides;
                        break;
                }

                biomarkerArray.push({
                    id: bio.id,
                    name: bio.name,
                    score: score,
                    measure_value: measureValue,
                    lastMeasureDate: healthData.CreatedAt,
                });
            }
        }

        // Determine status based on score
        let status = "Good";
        if (result.centralHealthScore >= 70) status = "Excellent";
        else if (result.centralHealthScore < 50) status = "Need to improve";

        // Return formatted response
        res.json({
            centralHealthScore: result.centralHealthScore,
            status: status,
            description:
                "Your result is much better compared to last month! Recommended health score: more than 70%",
            lastUpdate: healthData.CreatedAt,
            biomarkers: biomarkerArray,
            // Legacy fields for backwards compatibility
            waistCircumference:
                healthData.waistCircumference / healthData.height,
            bloodPressureSystolic: healthData.BloodPressureSystolic,
            bloodPressureDiastolic: healthData.BloodPressureDiastolic,
            fastingBloodGlucose: healthData.FastingBloodGlucose,
            hdlCholesterol: healthData.HDLCholesterol,
            triglycerides: healthData.Triglycerides,
            general_health_score: result.centralHealthScore,
        });
    } catch (error) {
        console.error("Error fetching health score:", error);
        res.status(500).json({
            error: "An error occurred while fetching health score",
        });
    }
});
```

### Score Calculation Function

**See:** [SCORING_LOGIC.md](./SCORING_LOGIC.md) for complete details.

---

## Recommendation Engine

### Endpoint Handler

**File:** `mp_api/routes/recommendation.js`

```javascript
router.get("/", async (req, res) => {
    let userId = null;
    let userVitals = {};
    let userScores = {};
    let isAuthenticated = false;
    let generalScore = 0;

    try {
        // Try to extract user info from JWT (optional authentication)
        const token = req.headers["authorization"]?.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
            isAuthenticated = true;
        }
    } catch (e) {
        // Not authenticated - continue as guest
    }

    try {
        let products;
        console.log(
            "Starting recommendation request, isAuthenticated:",
            isAuthenticated,
        );

        // If authenticated, get user vitals and scores
        if (isAuthenticated && userId) {
            // Fetch user vitals
            const [vitals] = await pool.execute(
                `SELECT * FROM health_data WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1`,
                [userId],
            );

            if (vitals.length > 0) {
                userVitals = vitals[0];

                // Fetch existing scores from user_scores table
                const [scoreRows] = await pool.execute(
                    `SELECT biomarker_id, score FROM user_scores WHERE user_id = ?`,
                    [userId],
                );

                // Map scores to userScores object
                for (const scoreRow of scoreRows) {
                    userScores[scoreRow.biomarker_id] = scoreRow.score;
                }

                // Get general health score from users table
                const [userRows] = await pool.execute(
                    `SELECT general_health_score FROM users WHERE UserID = ?`,
                    [userId],
                );
                generalScore =
                    userRows.length > 0 ? userRows[0].general_health_score : 0;
            }

            // Query products with joins
            [products] = await pool.execute(`
                SELECT DISTINCT p.id, p.name, p.description, p.details, p.type, p.price, 
                       p.image_url, p.digital_url, p.public_visible, p.created_at,
                       pbs.biomarker_id, pbs.score, pbs.priority, b.name as biomarker_name
                FROM products p
                LEFT JOIN product_biomarker_score pbs ON p.id = pbs.product_id
                LEFT JOIN biomarkers b ON pbs.biomarker_id = b.id
                WHERE p.is_active = 1
                ORDER BY p.id, pbs.priority DESC
            `);
        } else {
            // Unauthenticated: show all active products
            [products] = await pool.execute(`
                SELECT DISTINCT p.id, p.name, p.description, p.details, p.type, p.price, 
                       p.image_url, p.digital_url, p.public_visible, p.created_at,
                       pbs.biomarker_id, pbs.score, pbs.priority, b.name as biomarker_name
                FROM products p
                LEFT JOIN product_biomarker_score pbs ON p.id = pbs.product_id
                LEFT JOIN biomarkers b ON pbs.biomarker_id = b.id
                WHERE p.is_active = 1
                ORDER BY p.id, pbs.priority DESC
            `);
        }

        // Group products by category and filter by biomarker matching
        const grouped = {};
        const processedProducts = new Set();
        const baseUrl = req.protocol + "://" + req.get("host");

        for (const prod of products) {
            // Skip if already processed
            if (processedProducts.has(prod.id)) continue;

            // If authenticated, check biomarker matching
            if (isAuthenticated && prod.biomarker_id) {
                const userScore = userScores[prod.biomarker_id];
                // Skip if user doesn't have this biomarker score
                if (userScore === undefined || userScore === null) continue;
                // Skip if score doesn't match
                if (userScore !== prod.score) continue;
            }

            // Mark as processed
            processedProducts.add(prod.id);

            // Remove biomarker fields from response
            const {
                biomarker_id,
                biomarker_name,
                score: biomarkerScore,
                priority: biomarkerPriority,
                ...rest
            } = prod;

            // Set image_url to FQDN
            rest.image_url = prod.image_url
                ? `${baseUrl}/images/${prod.image_url}`
                : null;

            // Initialize type array if doesn't exist
            const productType = prod.type || "General";
            if (!grouped[productType]) {
                grouped[productType] = [];
            }

            // Add product to its type
            grouped[productType].push(rest);
        }

        // Sort each group by priority
        for (const category in grouped) {
            grouped[category].sort(
                (a, b) => (a.priority || 99) - (b.priority || 99),
            );
        }

        const response = { grouped, isAuthenticated };
        if (isAuthenticated) {
            response.general_health_score = generalScore;
        }

        res.json(response);
    } catch (error) {
        console.error("Error in /recommendation:", error);
        res.status(500).json({
            error: "An error occurred while recommending products",
        });
    }
});
```

### Product Matching Algorithm

1. **Fetch user's biomarker scores** from `user_scores` table
2. **Query products** with `LEFT JOIN` on `product_biomarker_score`
3. **Filter products** where:
    - `product_biomarker_score.biomarker_id` matches user's biomarker
    - `product_biomarker_score.score` matches user's calculated score
4. **Group by product type** (digital, supplement, food, device)
5. **Sort by priority** within each group

---

## Digital Journey Management

### Get User's Journey

**File:** `mp_api/routes/digitalJourney.js`

```javascript
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get user's assigned plan
        const [userPlans] = await pool.execute(
            `SELECT udp.id as user_plan_id, dp.name as plan_name, udp.assigned_at
             FROM user_digital_plans udp
             JOIN digital_plans dp ON udp.plan_id = dp.id
             WHERE udp.user_id = ?
             ORDER BY udp.assigned_at DESC LIMIT 1`,
            [userId],
        );

        if (userPlans.length === 0) {
            return res.json({ message: "No digital journey plan assigned." });
        }

        const userPlan = userPlans[0];

        // Get digital items for this plan, ordered by scheduled_date
        const [items] = await pool.execute(
            `SELECT udi.scheduled_date, di.name, di.description, di.type, 
                    di.image_url, di.content_url
             FROM user_digital_plan_items udi
             JOIN digital_items di ON udi.item_id = di.id
             WHERE udi.user_plan_id = ?
             ORDER BY udi.scheduled_date ASC`,
            [userPlan.user_plan_id],
        );

        // Set image_url to FQDN
        const baseUrl = req.protocol + "://" + req.get("host");
        items.forEach((item) => {
            item.image_url = item.image_url
                ? `${baseUrl}/images/${item.image_url}`
                : null;
        });

        res.json({ plan: userPlan, items });
    } catch (error) {
        console.error("Error fetching digital journey:", error);
        res.status(500).json({
            error: "An error occurred while fetching digital journey.",
        });
    }
});
```

### Plan Assignment Logic

**See:** [SCORING_LOGIC.md - Plan Assignment](./SCORING_LOGIC.md#digital-plan-assignment) for complete algorithm.

---

## Provider Network Matching

### Get Recommended Providers

**File:** `mp_api/routes/providerNetwork.js`

```javascript
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get user's assigned expertise types
        const [userTypes] = await pool.execute(
            `SELECT uet.expertise_type_id, et.name as expertise_name, 
                    et.category as expertise_category
             FROM user_expertise_types uet
             JOIN expertise_types et ON uet.expertise_type_id = et.id
             WHERE uet.user_id = ?`,
            [userId],
        );

        if (userTypes.length === 0) {
            return res.json({
                message: "No recommended expertise types for user.",
            });
        }

        const expertiseTypeIds = userTypes.map((t) => t.expertise_type_id);

        // Get providers for these types
        const [providers] = await pool.execute(
            `SELECT p.*, et.name as expertise_type, et.category as expertise_category
             FROM providers p
             JOIN expertise_types et ON p.expertise_type_id = et.id
             WHERE p.expertise_type_id IN (${expertiseTypeIds.map(() => "?").join(",")})`,
            expertiseTypeIds,
        );

        // Set image_url to FQDN
        const baseUrl = req.protocol + "://" + req.get("host");
        providers.forEach((p) => {
            p.image_url = p.image_url
                ? `${baseUrl}/images/${p.image_url}`
                : null;
        });

        res.json({ providers });
    } catch (error) {
        console.error("Error fetching providers:", error);
        res.status(500).json({
            error: "An error occurred while fetching providers.",
        });
    }
});
```

### Expertise Assignment Logic

**See:** [SCORING_LOGIC.md - Expertise Assignment](./SCORING_LOGIC.md#expertise-type-assignment) for complete algorithm.

---

## Database Connection

### Connection Pool Configuration

**File:** `mp_api/server.js` or route files

```javascript
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false },
});
```

### Query Patterns

**Parameterized Queries (Prevent SQL Injection):**

```javascript
// CORRECT - Using parameterized query
const [rows] = await pool.execute(`SELECT * FROM users WHERE UserID = ?`, [
    userId,
]);

// WRONG - String concatenation (vulnerable to SQL injection)
const [rows] = await pool.execute(
    `SELECT * FROM users WHERE UserID = '${userId}'`,
);
```

**Multiple Parameters:**

```javascript
const [rows] = await pool.execute(
    `INSERT INTO user_scores (user_id, biomarker_id, score) VALUES (?, ?, ?)`,
    [userId, biomarkerId, score],
);
```

**Dynamic IN Clause:**

```javascript
const ids = [1, 2, 3, 4];
const placeholders = ids.map(() => "?").join(",");
const [rows] = await pool.execute(
    `SELECT * FROM providers WHERE expertise_type_id IN (${placeholders})`,
    ids,
);
```

### Error Handling

```javascript
try {
    const [rows] = await pool.execute(query, params);
    // Process rows
} catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database operation failed" });
}
```

---

## Environment Variables

**File:** `mp_api/.env`

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=health_database
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_X_API_KEY=your_openai_key
ENABLE_OPENAI_SCORE=false
ENABLE_OPENAI_DATA_EXTRACTION=true
```

---

## Testing

### Manual API Testing

```bash
# Test user scores endpoint
curl -X GET http://localhost:4000/user-scores \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test recommendations
curl -X GET http://localhost:4000/recommendation \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Automated Tests

**File:** `mp_api/test/api_tests.js`

See test file for examples of endpoint testing.

---

## Related Documentation

- **[SCORING_LOGIC.md](./SCORING_LOGIC.md)** - Score calculation algorithms
- **[DATABASE_OPERATIONS.md](./DATABASE_OPERATIONS.md)** - Database queries and operations
- **[API Contracts](/docs/dashboards/API_CONTRACTS.md)** - Request/response schemas
- **[Architecture](/docs/dashboards/ARCHITECTURE.md)** - System overview
