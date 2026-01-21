# Health Data Endpoints

Endpoints for managing user health measurements and metrics.

**Controller**: Direct in `server.js` (to be refactored)  
**Authentication**: All endpoints require JWT token

---

## POST /submit-health-data

Submit user's health measurements and trigger automated score calculation.

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:

```json
{
    "userId": 1,
    "height": 170,
    "weight": 68,
    "waist": 76,
    "systolic": 115,
    "diastolic": 75,
    "glucose": 92,
    "hdl": 55,
    "ldl": 110,
    "triglycerides": 120
}
```

### Response

**Success** (200 OK):

```json
{
    "message": "Health data submitted successfully",
    "scores": {
        "central_health_score": 84.0,
        "status": "Excellent"
    }
}
```

**Error Responses**:

- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Invalid measurement values
- `500 Internal Server Error` - Database or calculation error

### Business Logic

1. **Data Storage**: Inserts/updates `health_data` table
2. **Score Calculation**: Calls `calculateAndStoreUserScores()`:
    - Calculates waist-height ratio (WHR)
    - Computes individual biomarker scores
    - Calculates weighted central health score
3. **Plan Assignment**: Calls `assignDigitalPlanForUser()`:
    - Matches user scores to digital plans
    - Schedules plan items
4. **Provider Matching**: Calls `assignExpertiseTypesForUser()`:
    - Assigns healthcare provider expertise types

### Biomarkers Tracked

- **Height, Weight, Waist** - For WHR calculation
- **Blood Pressure** - Systolic & Diastolic
- **Fasting Blood Glucose**
- **Cholesterol** - HDL & LDL
- **Triglycerides**

---

## GET /get-health-data

Retrieve user's latest health measurements.

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `userId` (required) - User ID to fetch data for
- `waistHeightRatio` (optional) - "1" to get WHR instead of raw waist value

### Response

**Success** (200 OK):

```json
{
    "height": 170,
    "weight": 68,
    "waistCircumference": 76,
    "bloodPressureSystolic": 115,
    "bloodPressureDiastolic": 75,
    "fastingBloodGlucose": 92,
    "hdlCholesterol": 55,
    "triglycerides": 120,
    "lastUpdate": "2025-01-15T12:00:00.000Z"
}
```

**Error Responses**:

- `400 Bad Request` - Missing userId
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - No health data for user
- `500 Internal Server Error` - Database error

### Business Logic

- Queries latest record from `health_data` table (ORDER BY CreatedAt DESC LIMIT 1)
- If `waistHeightRatio=1`: calculates WHR = waist / height
- Returns all measurements with timestamp

---

## GET /get-health-history

Retrieve time-series health data for trend analysis.

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `userId` (required) - User ID to fetch history for
- `parameter` (optional) - Specific biomarker to filter (currently unused)

### Response

**Success** (200 OK):

```json
[
    {
        "UserID": "user@example.com",
        "weight": 68,
        "bloodPressureSystolic": 115,
        "bloodPressureDiastolic": 75,
        "fastingBloodGlucose": 92,
        "hdlCholesterol": 55,
        "triglycerides": 120,
        "date": "2025-01-15T12:00:00.000Z",
        "height": 170,
        "waistCircumference": 0.45,
        "vitaminD2": null,
        "vitaminD3": null
    }
]
```

**Error Responses**:

- `400 Bad Request` - Missing userId or parameter
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Database error

### Business Logic

- Queries all historical records from `health_data` table
- Calculates waist-height ratio for each record
- Orders by date (used for chart visualizations)

---

## GET /average-health-metrics

Get population averages for benchmarking against age/sex cohort.

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `age` (optional) - User's age; if missing, extracted from JWT + DateOfBirth
- `sex` (optional) - "Male"/"Female"; if missing, extracted from user profile

### Response

**Success** (200 OK):

```json
{
    "weight": 62.5,
    "height": 165.2,
    "waistCircumference": 72.8,
    "bloodPressureSystolic": 118.3,
    "bloodPressureDiastolic": 76.4,
    "fastingBloodGlucose": 92.1,
    "hdlCholesterol": 56.7,
    "triglycerides": 115.3
}
```

**Error Responses**:

- `400 Bad Request` - Invalid age
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Database error

### Business Logic

- Queries `average_health_data` table
- Filters by sex (0=male, 1=female)
- Filters by age range: `age_from <= age <= age_to`
- Returns population averages for comparison

### Database Schema

```sql
CREATE TABLE average_health_data (
  sex TINYINT,           -- 0=male, 1=female
  age_from INT,
  age_to INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  waist DECIMAL(5,2),
  BP_Systolic INT,
  BP_Diastolic INT,
  Fasting_Blood_Glucose INT,
  HDL_Cholesterol INT,
  Triglycerides INT
);
```

---

## GET /calc-health-score

**Deprecated** - Use `/user-scores` instead.

Calculate health score for user (legacy endpoint).

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `userId` (required) - User ID to calculate score for

### Response

Same as `/user-scores` endpoint.

### Migration Note

This endpoint is maintained for backward compatibility. New integrations should use `/user-scores` which provides the same functionality with better organization.
