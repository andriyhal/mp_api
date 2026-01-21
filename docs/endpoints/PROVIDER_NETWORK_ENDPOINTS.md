# Provider Network Endpoints

Healthcare provider matching and assignment endpoints.

**Route**: `routes/providerNetwork.js`  
**Authentication**: Required (JWT token)  
**Exported Function**: `assignExpertiseTypesForUser(userId)`

---

## GET /provider-network

Get recommended healthcare providers based on user's health needs.

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- None (user extracted from JWT)

### Response

**Success** (200 OK):

```json
{
    "providers": [
        {
            "id": 8,
            "name": "Dr. Sarah Johnson",
            "expertise_type_id": 3,
            "expertise_type": "Endocrinology",
            "expertise_category": "Metabolic Health",
            "location": "New York, NY",
            "phone": "+1-555-0123",
            "email": "sjohnson@healthclinic.com",
            "rating": 4.8,
            "bio": "Specializes in diabetes and metabolic disorders",
            "image_url": "http://localhost:4000/images/provider_8.jpg",
            "assigned_at": "2025-01-15T10:00:00.000Z"
        },
        {
            "id": 12,
            "name": "Dr. Michael Chen",
            "expertise_type_id": 1,
            "expertise_type": "Cardiology",
            "expertise_category": "Cardiovascular",
            "location": "New York, NY",
            "phone": "+1-555-0456",
            "email": "mchen@heartcenter.com",
            "rating": 4.9,
            "bio": "Expert in hypertension and cholesterol management",
            "image_url": "http://localhost:4000/images/provider_12.jpg",
            "assigned_at": "2025-01-15T10:00:00.000Z"
        }
    ]
}
```

**Error Responses**:

- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - No expertise types assigned to user
- `500 Internal Server Error` - Database error

### Business Logic

#### 1. Get User's Assigned Expertise Types

```sql
SELECT uet.expertise_type_id, et.name, et.category, uet.assigned_at
FROM user_expertise_types uet
JOIN expertise_types et ON uet.expertise_type_id = et.id
WHERE uet.user_id = ?
ORDER BY uet.assigned_at DESC
```

#### 2. Find Matching Providers

```sql
SELECT DISTINCT p.*, pet.expertise_type_id, et.name as expertise_type, et.category
FROM providers p
JOIN provider_expertise_types pet ON p.id = pet.provider_id
JOIN expertise_types et ON pet.expertise_type_id = et.id
WHERE pet.expertise_type_id IN (?)
  AND p.is_active = TRUE
ORDER BY p.rating DESC, p.name
```

#### 3. Format Image URLs

```javascript
const baseUrl = req.protocol + "://" + req.get("host");
provider.image_url = provider.image_url
    ? `${baseUrl}/images/${provider.image_url}`
    : null;
```

---

## Expertise Assignment (Automatic)

### Function: `assignExpertiseTypesForUser(userId)`

Called automatically after health data submission in `/submit-health-data` endpoint.

### Logic

#### 1. Get User's Biomarker Scores

```sql
SELECT biomarker_id, score
FROM user_scores
WHERE user_id = ?
```

#### 2. Find Matching Expertise Types

```sql
SELECT DISTINCT et.id as expertise_type_id, et.name, et.category
FROM expertise_types et
JOIN biomarker_expertise_score bes ON et.id = bes.expertise_type_id
WHERE bes.biomarker_id IN (?)
  AND bes.score IN (?)
```

Expertise types are matched based on:

- Biomarker IDs present in user's scores
- Score values matching expertise requirements
- Multiple expertise types can be assigned

#### 3. Assign Expertise Types to User

```sql
INSERT IGNORE INTO user_expertise_types (user_id, expertise_type_id, assigned_at)
VALUES (?, ?, NOW())
```

Uses `INSERT IGNORE` to prevent duplicates.

---

## GET /provider-network/cleanup

Remove duplicate expertise type assignments (maintenance endpoint).

### Request

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `userId` - User ID to cleanup duplicates for

### Response

**Success** (200 OK):

```json
{
    "message": "Cleanup completed",
    "duplicates_removed": 2
}
```

### Business Logic

```sql
-- Find duplicates
SELECT user_id, expertise_type_id, MIN(id) as keep_id
FROM user_expertise_types
WHERE user_id = ?
GROUP BY user_id, expertise_type_id
HAVING COUNT(*) > 1

-- Delete duplicates (keep earliest)
DELETE FROM user_expertise_types
WHERE id NOT IN (keep_ids)
```

---

## Expertise Categories

- **Metabolic Health** - Diabetes, obesity, endocrine disorders, hormonal imbalances
- **Cardiovascular** - Heart disease, hypertension, cholesterol management
- **Nutrition** - Dietitians, nutritionists, meal planning specialists
- **Mental Health** - Stress management, anxiety, lifestyle coaching
- **General Practice** - Primary care physicians, general health management

---

## Database Schema

### expertise_types

```sql
id, name, category, description, created_at
```

### providers

```sql
id, name, location, phone, email, rating, bio, image_url, is_active, created_at
```

### provider_expertise_types

```sql
provider_id, expertise_type_id
```

### biomarker_expertise_score

```sql
expertise_type_id, biomarker_id, score
```

### user_expertise_types

```sql
id, user_id, expertise_type_id, assigned_at
```

---

## Provider Rating System

Providers are sorted by:

1. **Rating** (descending) - Higher rated providers first
2. **Name** (alphabetical) - Tie-breaker

Rating scale: 0.0 - 5.0 (decimal)

---

## Related Documentation

- **[SCORING_ENDPOINTS.md](./SCORING_ENDPOINTS.md)** - Scores trigger expertise assignment
- **[HEALTH_DATA_ENDPOINTS.md](./HEALTH_DATA_ENDPOINTS.md)** - Data submission triggers assignment
