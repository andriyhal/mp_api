# Recommendations Endpoints

Product recommendation engine endpoints.

**Route**: `routes/recommendation.js`  
**Authentication**: Optional (enhanced with JWT token)

---

## GET /recommendation

Get personalized product recommendations based on user's biomarker scores.

### Request

**Headers** (optional):

```
Authorization: Bearer <jwt_token>
```

### Response (Authenticated User)

**Success** (200 OK):

```json
{
    "grouped": {
        "digital": [
            {
                "id": 5,
                "name": "Blood Pressure Management Program",
                "description": "12-week digital program for hypertension",
                "details": "Comprehensive plan with daily activities",
                "type": "digital",
                "price": "49.99",
                "image_url": "http://localhost:4000/images/bp_program.jpg",
                "digital_url": "https://app.example.com/bp-program",
                "public_visible": true,
                "created_at": "2025-01-10T10:00:00.000Z"
            }
        ],
        "supplement": [
            {
                "id": 12,
                "name": "Omega-3 Fish Oil",
                "description": "Supports cardiovascular health",
                "details": "1000mg EPA+DHA per serving",
                "type": "supplement",
                "price": "29.99",
                "image_url": "http://localhost:4000/images/omega3.jpg",
                "digital_url": null,
                "public_visible": true,
                "created_at": "2025-01-05T14:30:00.000Z"
            }
        ],
        "food": [],
        "device": []
    },
    "isAuthenticated": true,
    "general_health_score": 84.0
}
```

### Response (Guest User)

**Success** (200 OK):

```json
{
    "grouped": {
        "digital": [
            {
                "id": 1,
                "name": "General Wellness Guide",
                "description": "Introduction to healthy living",
                "type": "digital",
                "price": "0.00",
                "public_visible": true
            }
        ],
        "supplement": [],
        "food": [],
        "device": []
    },
    "isAuthenticated": false
}
```

**Error Responses**:

- `500 Internal Server Error` - Database or processing error

### Business Logic

#### For Authenticated Users

1. **Extract User from JWT**:

```javascript
const token = req.headers["authorization"]?.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
userId = decoded.id;
```

2. **Fetch User Vitals**:

```sql
SELECT * FROM health_data
WHERE UserID = ?
ORDER BY CreatedAt DESC LIMIT 1
```

3. **Fetch User Scores**:

```sql
SELECT biomarker_id, score
FROM user_scores
WHERE user_id = ?
```

4. **Fetch General Health Score**:

```sql
SELECT general_health_score
FROM users
WHERE UserID = ?
```

5. **Query Products with Biomarker Matching**:

```sql
SELECT DISTINCT p.*, pbs.biomarker_id, pbs.score, pbs.priority
FROM products p
LEFT JOIN product_biomarker_score pbs ON p.id = pbs.product_id
WHERE p.is_active = 1
ORDER BY p.id, pbs.priority DESC
```

6. **Filter by User Scores**:

```javascript
// Only include products where:
// - Product has biomarker requirement
// - User has that biomarker score
// - User's score matches product's target score
if (prod.biomarker_id) {
    const userScore = userScores[prod.biomarker_id];
    if (userScore === prod.score) {
        // Include product
    }
}
```

7. **Group by Product Type**:

```javascript
grouped[productType] = [...products];
```

8. **Sort by Priority**:

```javascript
grouped[category].sort((a, b) => a.priority - b.priority);
```

#### For Guest Users

1. **Show All Public Products**:

```sql
SELECT DISTINCT p.*
FROM products p
WHERE p.is_active = 1 AND p.public_visible = 1
```

2. **No Filtering** - All public products returned

3. **Group and Sort** - Same as authenticated flow

### Product Types

- **digital** - Digital health programs, apps, courses
- **supplement** - Nutritional supplements
- **food** - Food products, meal plans
- **device** - Health monitoring devices

### Product Matching Logic

Products are matched to users based on:

1. **Biomarker Scores**: Product defines target score ranges
2. **Score Matching**: User's biomarker score must match product's target
3. **Priority**: Products sorted by priority within each category
4. **Active Status**: Only `is_active = TRUE` products shown

### Database Schema

**products** table:

```sql
id, name, description, details, type, price,
image_url, digital_url, public_visible, is_active
```

**product_biomarker_score** table:

```sql
product_id, biomarker_id, score, priority
```

### Image URL Handling

Images are served from `/images` endpoint:

```javascript
const baseUrl = req.protocol + "://" + req.get("host");
product.image_url = `${baseUrl}/images/${filename}`;
```

---

## Legacy Endpoints

### GET /get-reco-actions

**Deprecated** - Use `/recommendation` instead.

Returns action recommendations based on biomarker values.

### GET /get-reco-products

**Deprecated** - Use `/recommendation` instead.

Returns supplement-specific recommendations only.

---

## Related Documentation

- **[SCORING_ENDPOINTS.md](./SCORING_ENDPOINTS.md)** - How scores are calculated
- **[DATABASE_OPERATIONS.md](../DATABASE_OPERATIONS.md)** - Products and biomarker tables
