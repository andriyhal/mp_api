# Recommendations System Documentation

## Purpose

Multi-layered recommendation engine that personalizes health products, healthcare providers, and digital journey plans based on user biomarker scores and health status.

---

## System Architecture

### Recommendation Layers

1. **Product Recommendations** - Health products (digital, supplements, food, devices)
2. **Provider Network** - Healthcare specialists matched to user needs
3. **Digital Journey Plans** - Personalized multi-day health programs
4. **Expertise Type Assignment** - Automatic specialist type matching

### Authentication Modes

- **Authenticated Mode**: Personalized recommendations based on biomarker scores
- **Guest Mode**: Generic public recommendations without personalization

---

## Product Recommendation Logic

### Matching Algorithm

**Step 1: Data Retrieval**

For authenticated users:

1. Fetch user biomarker scores from `user_scores` table
2. Get `general_health_score` from `users` table
3. Retrieve latest `health_data` for context

**Step 2: Product Query**

```
Query products with biomarker mappings:
- Join products with product_biomarker_score
- Filter by is_active = 1
- Include biomarker_id, target score, priority
```

**Step 3: Score Matching**

For each product:

1. Check if product has biomarker requirements (`product_biomarker_score` entries)
2. Get user's score for that biomarker from `user_scores`
3. Match user score against product's target score
4. Include product only if scores match exactly

**Logic:**

```
if (product.biomarker_id exists) {
    userScore = user_scores[product.biomarker_id]
    if (userScore === product.target_score) {
        → Include product
    } else {
        → Skip product
    }
}
```

**Step 4: Grouping & Sorting**

1. Group products by `type` field (digital, supplement, food, device)
2. Remove duplicates (same product_id)
3. Sort within each group by `priority` (ascending)

### Guest Mode Logic

For unauthenticated users:

1. Return all products where `is_active = 1` and `public_visible = 1`
2. No biomarker filtering applied
3. Group by type, sort by priority

---

## Product Types

### Category Definitions

| Type           | Description                | Examples                                          |
| -------------- | -------------------------- | ------------------------------------------------- |
| **digital**    | Apps, programs, courses    | Blood Pressure Management Program, Meditation App |
| **supplement** | Nutritional supplements    | Omega-3 Fish Oil, Vitamin D3, Probiotics          |
| **food**       | Food products, meal plans  | Organic Green Tea, Mediterranean Diet Guide       |
| **device**     | Health monitoring hardware | Smart Blood Pressure Monitor, Glucose Meter       |

### Product Visibility

- `is_active = 1` - Product available in catalog
- `is_active = 0` - Product hidden from all users
- `public_visible = 1` - Shown to guest users
- `public_visible = 0` - Authenticated users only

---

## Provider Network Recommendations

### Expertise Type Assignment

**Automatic Assignment Flow:**

After user biomarker scores are calculated:

1. **Query biomarker_expertise_score table**
    - Match each biomarker_id and score combination
    - Retrieve associated expertise_type_id

2. **Insert into user_expertise_types**
    - Store user_id + expertise_type_id pairs
    - Use UPSERT to prevent duplicates
    - Timestamp: assigned_at

3. **Cleanup Duplicates**
    - Remove duplicate expertise_type_id entries for same user
    - Keep earliest assignment (MIN(id))

**Mapping Logic:**

```
biomarker_expertise_score table structure:
- biomarker_id: References biomarkers.id
- score: Target score (0-100)
- expertise_type_id: References expertise_types.id

Example:
biomarker_id=3 (WHR), score=50 → expertise_type_id=2 (Nutritionist)
biomarker_id=4 (BP Systolic), score=60 → expertise_type_id=1 (Cardiologist)
```

### Provider Retrieval

**Step 1: Get User's Expertise Types**

```
Query user_expertise_types:
- Filter by user_id
- JOIN with expertise_types to get name and category
- Returns list of expertise_type_id values
```

**Step 2: Match Providers**

```
Query providers table:
- Filter WHERE expertise_type_id IN (user's types)
- JOIN with expertise_types for metadata
- Return provider details with expertise information
```

**Step 3: Response Formatting**

- Set image URLs to fully qualified domain names (FQDN)
- Include expertise_type and expertise_category for each provider
- Sort by provider priority or other criteria

### Provider Data Structure

**providers table:**

- Basic info: name, description, contact details
- `expertise_type_id` - Links to single expertise type
- `image_url` - Provider profile image filename
- `price` - Consultation fee (optional)

**expertise_types table:**

- `name` - Expertise type name (e.g., "Cardiologist", "Nutritionist")
- `category` - Broader category grouping
- `description` - Detailed description of expertise

---

## Digital Journey Plans

### Plan Assignment Logic

**Triggered by:** Low biomarker scores (< 70) during score calculation

**Step 1: Identify Low-Scoring Biomarkers**

After calculating user scores:

1. Check each biomarker score
2. If score < 70 → Flag biomarker as "needs improvement"
3. Collect all flagged biomarker_id values

**Step 2: Find Matching Plans**

```
Query digital_plans:
- No direct biomarker matching in current schema
- Plans may be pre-assigned based on health goals
- Future: Add plan_biomarker_score mapping table
```

**Step 3: Assign Plan to User**

```
Insert into user_digital_plans:
- user_id: User identifier
- plan_id: Selected digital plan
- assigned_at: Timestamp of assignment
```

**Step 4: Generate Plan Items Schedule**

```
Query digital_plan_items:
- Get all items for assigned plan_id
- Each item has day_offset (days from start)

Calculate scheduled_date:
scheduled_date = assigned_at + day_offset

Insert into user_digital_plan_items:
- user_plan_id: Reference to user_digital_plans
- item_id: Reference to digital_items
- scheduled_date: Calculated date for item
```

### Plan Retrieval

**Step 1: Get User's Active Plan**

```
Query user_digital_plans:
- Filter by user_id
- JOIN with digital_plans for plan metadata
- ORDER BY assigned_at DESC LIMIT 1 (most recent)
```

**Step 2: Get Plan Items**

```
Query user_digital_plan_items:
- Filter by user_plan_id
- JOIN with digital_items for item details
- ORDER BY scheduled_date ASC (chronological)
```

**Step 3: Response Structure**

```
{
    plan: {
        user_plan_id: 123,
        plan_name: "Heart Health 30-Day Plan",
        assigned_at: "2025-01-15T08:00:00.000Z"
    },
    items: [
        {
            scheduled_date: "2025-01-15",
            name: "Day 1: Understanding Blood Pressure",
            description: "Learn basics of cardiovascular health",
            type: "article",
            image_url: "http://api.example.com/images/bp_intro.jpg",
            content_url: "https://content.example.com/bp-guide"
        },
        // ... more items ordered by date
    ]
}
```

### Digital Item Types

- **article** - Educational content
- **video** - Video lessons or tutorials
- **exercise** - Physical activity plans
- **meditation** - Mindfulness exercises
- **assessment** - Health check-ins

---

## Database Schema

### Products and Matching

**products**

- `id`, `name`, `description`, `details`
- `type` - ENUM: digital, supplement, food, device
- `price` - Decimal (10,2)
- `image_url`, `digital_url`
- `is_active` - Boolean (product availability)
- `public_visible` - Boolean (guest access)
- `created_at` - Timestamp

**product_biomarker_score**

- `id` - Primary key
- `product_id` - Foreign key to products
- `biomarker_id` - Foreign key to biomarkers
- `score` - Target score (0-100) for matching
- `priority` - Sorting priority (lower = higher priority)

**Indexes:**

- `idx_product_biomarker_score_biomarker` on biomarker_id
- `idx_product_biomarker_score_score` on score
- `product_id` on product_id

### Provider Network

**providers**

- `id`, `name`, `description`
- `expertise_type_id` - Foreign key to expertise_types
- `contact`, `location`, `availability`
- `image_url` - Profile image filename
- `price` - Consultation fee
- `created_at` - Timestamp

**expertise_types**

- `id`, `name`, `description`
- `category` - Expertise category grouping

**biomarker_expertise_score**

- `id` - Primary key
- `biomarker_id` - Foreign key to biomarkers
- `score` - Target score triggering this expertise
- `expertise_type_id` - Foreign key to expertise_types

**user_expertise_types**

- `id` - Primary key
- `user_id` - User identifier
- `expertise_type_id` - Assigned expertise type
- `assigned_at` - Assignment timestamp

### Digital Plans

**digital_plans**

- `id`, `name`, `description`
- `duration_days` - Plan length in days
- `created_at` - Timestamp

**digital_items**

- `id`, `name`, `description`
- `type` - Item type (article, video, exercise, etc.)
- `image_url`, `content_url`
- `created_at` - Timestamp

**digital_plan_items**

- `id` - Primary key
- `plan_id` - Foreign key to digital_plans
- `item_id` - Foreign key to digital_items
- `day_offset` - Days from plan start (0-based)

**user_digital_plans**

- `id` - Primary key (user_plan_id)
- `user_id` - User identifier
- `plan_id` - Foreign key to digital_plans
- `assigned_at` - Assignment timestamp

**user_digital_plan_items**

- `id` - Primary key
- `user_plan_id` - Foreign key to user_digital_plans
- `item_id` - Foreign key to digital_items
- `scheduled_date` - Calculated date for this item
- `completed` - Boolean (item completion status)
- `completed_at` - Completion timestamp

---

## API Response Structure

### Product Recommendations Response

**Authenticated:**

```json
{
    "grouped": {
        "digital": [
            /* array of products */
        ],
        "supplement": [
            /* array of products */
        ],
        "food": [
            /* array of products */
        ],
        "device": [
            /* array of products */
        ]
    },
    "isAuthenticated": true,
    "general_health_score": 84.5
}
```

**Guest:**

```json
{
    "grouped": {
        "digital": [
            /* public products */
        ],
        "supplement": [
            /* public products */
        ],
        "food": [
            /* public products */
        ],
        "device": [
            /* public products */
        ]
    },
    "isAuthenticated": false
}
```

### Provider Network Response

```json
{
    "providers": [
        {
            "id": 1,
            "name": "Dr. Jane Smith",
            "description": "Board-certified cardiologist",
            "expertise_type": "Cardiologist",
            "expertise_category": "Cardiovascular Health",
            "contact": "jane.smith@clinic.com",
            "price": "150.00",
            "image_url": "http://api.example.com/images/dr_smith.jpg"
        }
    ]
}
```

### Digital Journey Response

```json
{
    "plan": {
        "user_plan_id": 42,
        "plan_name": "Heart Health 30-Day Plan",
        "assigned_at": "2025-01-15T08:00:00.000Z"
    },
    "items": [
        {
            "scheduled_date": "2025-01-15",
            "name": "Day 1: Understanding Blood Pressure",
            "description": "Introduction to cardiovascular health",
            "type": "article",
            "image_url": "http://api.example.com/images/bp_intro.jpg",
            "content_url": "https://content.example.com/bp-guide"
        }
    ]
}
```

---

## Recommendation Triggers

### Automatic Triggers

1. **After Score Calculation**
    - Expertise types assigned based on low scores
    - Digital plans assigned if scores < 70
    - Updates user recommendations automatically

2. **On Dashboard Load**
    - Product recommendations fetched
    - Provider network retrieved
    - Digital journey items displayed

3. **After Health Data Update**
    - Scores recalculated
    - Recommendations refreshed
    - New products/providers may appear

### Manual Triggers

1. **Cleanup Endpoints**
    - `/digital-journey/cleanup` - Remove duplicate plan items
    - `/provider-network/cleanup` - Remove duplicate expertise assignments

2. **Refresh Actions**
    - User manually refreshes dashboard
    - Re-fetches latest recommendations

---

## Personalization Logic Summary

### Priority Ranking

**Products:**

1. Exact biomarker score match (required)
2. Priority field (lower = higher priority)
3. Product type grouping

**Providers:**

1. Expertise type assignment based on low scores
2. Multiple providers per expertise type possible
3. Provider-specific priority (if implemented)

**Digital Plans:**

1. Assigned automatically on low scores
2. One active plan per user (most recent)
3. Items scheduled chronologically by day_offset

### Filtering Rules

**Products:**

- `is_active = 1` - Must be active
- Authenticated: Match user biomarker scores exactly
- Guest: `public_visible = 1` only

**Providers:**

- Active expertise types assigned to user
- Provider `expertise_type_id` matches user assignments

**Digital Plans:**

- Assigned plans only (from user_digital_plans)
- Items ordered by scheduled_date

---

## Error Handling

### No Recommendations Found

**Products:**

- Return empty arrays for each type group
- Still return `isAuthenticated` flag
- Indicate no matching products available

**Providers:**

- Return message: "No recommended expertise types for user"
- Occurs when user has no expertise assignments

**Digital Plans:**

- Return message: "No digital journey plan assigned"
- Occurs when user has no assigned plans

### Data Validation

**Products:**

- Skip products with missing biomarker_id if score matching required
- Handle null image_url gracefully (return null)
- Default priority to 99 if not set

**Providers:**

- Validate expertise_type_id exists before querying
- Handle empty expertise type lists

**Digital Plans:**

- Validate user_plan_id before fetching items
- Handle missing scheduled_date values

---

## Performance Considerations

### Query Optimization

**Products:**

- Use DISTINCT to prevent duplicate products
- Index on `product_biomarker_score.biomarker_id` and `score`
- LEFT JOIN allows products without biomarker mappings

**Providers:**

- Index on `providers.expertise_type_id`
- Batch query all expertise types in single SQL statement
- Use IN clause with parameterized values

**Digital Plans:**

- Index on `user_digital_plans.user_id`
- Index on `user_digital_plan_items.user_plan_id`
- ORDER BY scheduled_date uses index

### Caching Strategies

- Cache user biomarker scores during request lifecycle
- Reuse database connection pool across requests
- Consider caching product catalog for guest users

### Response Size Management

- Group products by type to structure response
- Limit digital journey items to active plan only
- Remove internal fields before sending (biomarker_id, priority for products)

---

## Integration Points

### Score Calculation → Recommendations

After `calculateAndStoreUserScores()`:

1. Low scores trigger expertise type assignment
2. Expertise types link to provider recommendations
3. Digital plans assigned based on score thresholds

### Dashboard → Recommendations

Frontend components fetch:

- `/recommendation` - Product recommendations
- `/provider-network` - Healthcare providers
- `/digital-journey` - Plan items

### Health Data Update → Refresh

Flow:

1. User updates health data
2. Scores recalculated
3. Recommendations automatically updated
4. Dashboard refetches latest data
