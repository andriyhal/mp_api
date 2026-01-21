# Digital Journey Endpoints

Digital health journey and plan management endpoints.

**Route**: `routes/digitalJourney.js`  
**Authentication**: Required (JWT token)  
**Exported Function**: `assignDigitalPlanForUser(userId)`

---

## GET /digital-journey

Get user's assigned digital plan items with scheduling.

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
    "user_plan_id": 42,
    "plan_name": "Metabolic Health Journey",
    "assigned_at": "2025-01-15T10:00:00.000Z",
    "items": [
        {
            "user_plan_item_id": 156,
            "item_id": 15,
            "name": "Understanding Blood Sugar",
            "type": "article",
            "content": "Educational content about glucose management",
            "url": "https://example.com/articles/blood-sugar",
            "image_url": "http://localhost:4000/images/article_15.jpg",
            "day_offset": 0,
            "assigned_date": "2025-01-15",
            "status": "available"
        },
        {
            "user_plan_item_id": 157,
            "item_id": 18,
            "name": "Meal Planning Basics",
            "type": "video",
            "content": "Video guide to healthy meal prep",
            "url": "https://example.com/videos/meal-planning",
            "image_url": "http://localhost:4000/images/video_18.jpg",
            "day_offset": 3,
            "assigned_date": "2025-01-18",
            "status": "upcoming"
        },
        {
            "user_plan_item_id": 158,
            "item_id": 22,
            "name": "Exercise and Glucose",
            "type": "task",
            "content": "Complete 30 minutes of moderate activity",
            "url": null,
            "image_url": null,
            "day_offset": 7,
            "assigned_date": "2025-01-22",
            "status": "upcoming"
        }
    ]
}
```

**Error Responses**:

- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - No plan assigned to user
- `500 Internal Server Error` - Database error

### Business Logic

#### 1. Get User's Assigned Plan

```sql
SELECT udp.id as user_plan_id, dp.name as plan_name, udp.assigned_at
FROM user_digital_plans udp
JOIN digital_plans dp ON udp.plan_id = dp.id
WHERE udp.user_id = ?
ORDER BY udp.assigned_at DESC
LIMIT 1
```

#### 2. Get Plan Items

```sql
SELECT
  udpi.id as user_plan_item_id,
  di.id as item_id,
  di.name,
  di.type,
  di.content,
  di.url,
  di.image_url,
  dpi.day_offset,
  DATE_ADD(udp.assigned_at, INTERVAL dpi.day_offset DAY) as assigned_date
FROM user_digital_plan_items udpi
JOIN digital_plan_items dpi ON udpi.plan_item_id = dpi.id
JOIN digital_items di ON dpi.item_id = di.id
JOIN user_digital_plans udp ON udpi.user_plan_id = udp.id
WHERE udpi.user_plan_id = ?
ORDER BY dpi.day_offset
```

#### 3. Calculate Status

```javascript
const today = new Date();
const assignedDate = new Date(item.assigned_date);

if (assignedDate <= today) {
    item.status = "available";
} else {
    item.status = "upcoming";
}

// Check if user completed
if (item.completed_at) {
    item.status = "completed";
}
```

#### 4. Format Image URLs

```javascript
const baseUrl = req.protocol + "://" + req.get("host");
item.image_url = item.image_url ? `${baseUrl}/images/${item.image_url}` : null;
```

---

## Plan Assignment (Automatic)

### Function: `assignDigitalPlanForUser(userId)`

Called automatically after health data submission in `/submit-health-data` endpoint.

### Logic

#### 1. Get User's Biomarker Scores

```sql
SELECT biomarker_id, score
FROM user_scores
WHERE user_id = ?
```

#### 2. Find Matching Plan

```sql
SELECT DISTINCT dp.id as plan_id, dp.name, COUNT(*) as match_count
FROM digital_plans dp
JOIN biomarker_plan_score bps ON dp.id = bps.plan_id
WHERE bps.biomarker_id IN (?)
  AND bps.score IN (?)
GROUP BY dp.id, dp.name
ORDER BY match_count DESC
LIMIT 1
```

Plans are matched based on:

- Biomarker IDs present in user's scores
- Score values matching plan requirements
- Plan with most matching criteria wins

#### 3. Assign Plan to User

```sql
INSERT INTO user_digital_plans (user_id, plan_id, assigned_at)
VALUES (?, ?, NOW())
```

#### 4. Assign Plan Items

```sql
INSERT INTO user_digital_plan_items (user_plan_id, plan_item_id)
SELECT ?, dpi.id
FROM digital_plan_items dpi
WHERE dpi.plan_id = ?
```

---

## GET /digital-journey/cleanup

Remove duplicate journey item assignments (maintenance endpoint).

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
    "duplicates_removed": 3
}
```

### Business Logic

```sql
-- Find duplicates
SELECT user_plan_id, plan_item_id, MIN(id) as keep_id
FROM user_digital_plan_items
WHERE user_plan_id IN (
  SELECT id FROM user_digital_plans WHERE user_id = ?
)
GROUP BY user_plan_id, plan_item_id
HAVING COUNT(*) > 1

-- Delete duplicates (keep earliest)
DELETE FROM user_digital_plan_items
WHERE id NOT IN (keep_ids)
```

---

## Item Types

- **article** - Educational articles, reading materials
- **video** - Video content, tutorials
- **quiz** - Interactive quizzes, assessments
- **task** - Action items to complete

---

## Database Schema

### digital_plans

```sql
id, name, description, created_at
```

### digital_items

```sql
id, name, type, content, url, image_url, created_at
```

### digital_plan_items

```sql
id, plan_id, item_id, day_offset, order_index
```

### biomarker_plan_score

```sql
plan_id, biomarker_id, score
```

### user_digital_plans

```sql
id, user_id, plan_id, assigned_at
```

### user_digital_plan_items

```sql
id, user_plan_id, plan_item_id, completed_at
```

---

## Related Documentation

- **[SCORING_ENDPOINTS.md](./SCORING_ENDPOINTS.md)** - Scores trigger plan assignment
- **[HEALTH_DATA_ENDPOINTS.md](./HEALTH_DATA_ENDPOINTS.md)** - Data submission triggers assignment
