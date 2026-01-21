# Scoring Endpoints

Health scoring and analytics endpoints.

**Route**: `routes/userScores.js`  
**Authentication**: Required (JWT token)

---

## GET /user-scores

Calculate and return user's comprehensive health scores with status indicators.

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `userId` (optional) - User ID to calculate scores for (extracted from JWT if not provided)

### Response

**Success** (200 OK):

```json
{
    "user_id": "user@example.com",
    "central_health_score": 84.0,
    "status": "Excellent",
    "biomarker_scores": [
        {
            "biomarker_name": "waistCircumference",
            "measure_value": 0.45,
            "score": 80,
            "status": "Good"
        },
        {
            "biomarker_name": "bloodPressureSystolic",
            "measure_value": 115,
            "score": 95,
            "status": "Excellent"
        },
        {
            "biomarker_name": "fastingBloodGlucose",
            "measure_value": 92,
            "score": 80,
            "status": "Good"
        },
        {
            "biomarker_name": "hdlCholesterol",
            "measure_value": 55,
            "score": 90,
            "status": "Excellent"
        },
        {
            "biomarker_name": "triglycerides",
            "measure_value": 120,
            "score": 80,
            "status": "Good"
        }
    ]
}
```

**Error Responses**:

- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - No health data found for user
- `500 Internal Server Error` - Calculation error

### Business Logic

#### 1. Data Retrieval

Queries latest health data from `health_data` table:

```sql
SELECT * FROM health_data
WHERE UserID = ?
ORDER BY CreatedAt DESC LIMIT 1
```

#### 2. Score Calculation

**Waist-Height Ratio (WHR)**:

```javascript
whr = waist / height;
```

**Blood Pressure Average**:

```javascript
bp_avg = (systolic + diastolic) / 2;
```

**Individual Biomarker Scores**:
Uses `calcScore()` function:

- Queries `biomarker_scores` table for range definitions
- Finds matching range for user's value
- Returns 0-100 score based on range
- Sex-specific ranges for accuracy

#### 3. Weighted Central Score Formula

```javascript
central_health_score =
  whr_score × 30% +
  bp_score × 20% +
  glucose_score × 15% +
  hdl_score × 15% +
  triglycerides_score × 20%
```

#### 4. Status Assignment

```javascript
if (score >= 70) status = "Excellent";
else if (score >= 50) status = "Good";
else status = "Need to improve";
```

#### 5. Database Storage

Stores results in two places:

```sql
-- Individual biomarker scores
INSERT INTO user_scores (user_id, biomarker_id, score) VALUES (?, ?, ?)

-- Central health score
UPDATE users SET general_health_score = ? WHERE UserID = ?
```

### Implementation Details

**Function**: `calculateAndStoreUserScores(userId, healthData, scores, shouldStore)`

**Parameters**:

- `userId` - User identifier
- `healthData` - Latest health measurements
- `scores` - Pre-calculated scores (optional)
- `shouldStore` - Whether to persist to database (default: true)

**Returns**: Object with `centralHealthScore` and `biomarkerScores`

**See Also**: [SCORING_LOGIC.md](../dashboards/SCORING_LOGIC.md) for complete scoring algorithm details.

---

## POST /user-scores

Calculate and store user's health scores (typically called after data submission).

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:

```json
{
    "userId": "user@example.com"
}
```

### Response

Same as GET endpoint.

### Business Logic

Identical to GET endpoint, but explicitly stores results to database (`shouldStore = true`).

This endpoint is called automatically by `/submit-health-data` but can also be invoked manually to recalculate scores.

---

## Related Documentation

- **[SCORING_LOGIC.md](../dashboards/SCORING_LOGIC.md)** - Detailed scoring algorithms and formulas
- **[DATABASE_OPERATIONS.md](../DATABASE_OPERATIONS.md)** - Database schema for scores tables
- **[HEALTH_DATA_ENDPOINTS.md](./HEALTH_DATA_ENDPOINTS.md)** - Data submission triggers scoring
