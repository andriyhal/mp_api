# Scoring Logic Documentation

## Purpose

Health score calculation system that evaluates biomarker data and produces individual scores and a weighted central health score.

---

## Biomarker Score Tables

### Waist-Height Ratio (WHR)

| Range       | Score |
| ----------- | ----- |
| < 0.4       | 100   |
| 0.4 - 0.49  | 90    |
| 0.5 - 0.54  | 80    |
| 0.55 - 0.59 | 50    |
| 0.6 - 0.69  | 20    |
| > 0.7       | 0     |

**Calculation:** `waistCircumference / height`

### Blood Pressure (Systolic)

| Range (mmHg) | Score |
| ------------ | ----- |
| < 90         | 70    |
| 90 - 120     | 100   |
| 121 - 130    | 90    |
| 131 - 140    | 80    |
| 141 - 160    | 60    |
| > 160        | 40    |

### Blood Pressure (Diastolic)

| Range (mmHg) | Score |
| ------------ | ----- |
| < 60         | 70    |
| 60 - 80      | 100   |
| 81 - 85      | 90    |
| 86 - 90      | 80    |
| 91 - 100     | 60    |
| > 100        | 40    |

### Fasting Blood Glucose

| Range (mg/dL) | Score |
| ------------- | ----- |
| < 85          | 100   |
| 85 - 89       | 90    |
| 90 - 99       | 80    |
| 100 - 109     | 60    |
| 110 - 125     | 40    |
| > 126         | 20    |

### HDL Cholesterol (Male)

| Range (mg/dL) | Score |
| ------------- | ----- |
| < 30          | 40    |
| 30 - 39       | 60    |
| 40 - 49       | 80    |
| 50 - 59       | 90    |
| > 60          | 100   |

### HDL Cholesterol (Female)

| Range (mg/dL) | Score |
| ------------- | ----- |
| < 30          | 40    |
| 30 - 44       | 60    |
| 45 - 54       | 80    |
| 55 - 59       | 90    |
| > 60          | 100   |

### Triglycerides

| Range (mg/dL) | Score |
| ------------- | ----- |
| < 80          | 100   |
| 80 - 99       | 90    |
| 100 - 149     | 80    |
| 150 - 199     | 60    |
| 200 - 299     | 40    |
| > 300         | 20    |

---

## Score Calculation Logic

### Range Matching Algorithm

1. **String ranges (`"<X"`, `">X"`)**: Direct comparison with boundary value
2. **Array ranges (`[min, max]`)**: Inclusive range check (min <= value <= max)
3. **No match**: Return score 0

### Sex-Specific Scoring

- HDL Cholesterol uses different tables for Male/Female
- Default to Male table if sex is "Other"
- Sex determined from `users.Sex` field

---

## Central Health Score Formula

### Weighted Components

```
Central Health Score =
    (WHR_score × 0.30) +
    (BP_avg_score × 0.20) +
    (FBG_score × 0.15) +
    (HDL_score × 0.15) +
    (Triglycerides_score × 0.20)
```

**Where:**

- `WHR_score` = Waist-Height Ratio score (recalculated, not table lookup)
- `BP_avg_score` = (BP_Systolic_score + BP_Diastolic_score) / 2
- `FBG_score` = Fasting Blood Glucose score
- `HDL_score` = HDL Cholesterol score (sex-specific)
- `Triglycerides_score` = Triglycerides score

### Component Weights

| Biomarker             | Weight | Rationale                   |
| --------------------- | ------ | --------------------------- |
| Waist-Height Ratio    | 30%    | Primary metabolic indicator |
| Blood Pressure (avg)  | 20%    | Cardiovascular health       |
| Fasting Blood Glucose | 15%    | Glycemic control            |
| HDL Cholesterol       | 15%    | Lipid profile               |
| Triglycerides         | 20%    | Metabolic health            |

**Total:** 100%

### WHR Score Recalculation

After table lookup, WHR score is recalculated using continuous formula:

```
WHR_score = 100 - ((WHR_value - 0.4) / 0.3) × 100
```

**Logic:**

- Normalizes WHR to 0-100 scale
- 0.4 = optimal baseline (100 points)
- 0.7 = critical threshold (0 points)
- Linear interpolation between

---

## Biomarker Mapping

### Database IDs to Biomarkers

| ID  | Biomarker                | Database Field                 | Processing      |
| --- | ------------------------ | ------------------------------ | --------------- |
| 3   | Waist-Height Ratio       | `waistCircumference`, `height` | Calculate ratio |
| 4   | Blood Pressure Systolic  | `bloodPressureSystolic`        | Direct value    |
| 5   | Blood Pressure Diastolic | `bloodPressureDiastolic`       | Direct value    |
| 6   | Fasting Blood Glucose    | `fastingBloodGlucose`          | Direct value    |
| 7   | HDL Cholesterol          | `hdlCholesterol`               | Direct value    |
| 8   | Triglycerides            | `triglycerides`                | Direct value    |

### Data Sources Priority

1. **combinedData** (from file upload) - Takes precedence if available
    - `"Blood Glucose".Value` → Fasting Blood Glucose
    - `"HDL Cholesterol".Value` → HDL Cholesterol
    - `"Triglycerides level".Value` → Triglycerides

2. **healthData** (from database) - Fallback values
    - `FastingBloodGlucose`
    - `HDLCholesterol`
    - `Triglycerides`
    - `waistCircumference`, `height`, `BloodPressureSystolic`, `BloodPressureDiastolic`

---

## Calculation Flow

### Step 1: Prepare Input Data

1. Retrieve user sex from `users` table
2. Calculate WHR from waist/height if both available
3. Determine data source (combinedData vs healthData)
4. Map values to parameter structure

### Step 2: Calculate Individual Scores

For each biomarker:

1. Get value from prepared data
2. Select appropriate score table (consider sex for HDL)
3. Match value against ranges
4. Return score (0-100)

### Step 3: Calculate Central Score

1. Get all individual scores
2. Recalculate WHR score using continuous formula
3. Calculate BP average: `(systolic + diastolic) / 2`
4. Apply weights to all components
5. Sum weighted scores

### Step 4: Store Results

1. Insert/update individual scores in `user_scores` table
    - `user_id`, `biomarker_id`, `score`
    - Update timestamp on duplicate

2. Update `general_health_score` in `users` table
    - Stores final weighted score

---

## Database Schema

### user_scores Table

Stores individual biomarker scores:

- `user_id` - Foreign key to users
- `biomarker_id` - Foreign key to biomarkers
- `score` - Calculated score (0-100)
- `calculated_at` - Timestamp of calculation

**Update Strategy:** UPSERT on `(user_id, biomarker_id)`

### users Table

- `general_health_score` - Central Health Score (weighted average)
- Updated after each score calculation

### biomarkers Table

Reference table for biomarker metadata:

- `id` - Biomarker identifier
- `name` - Internal name (e.g., "waistCircumference")

---

## Score Interpretation

### General Health Score Ranges

| Score  | Category  | Description                    |
| ------ | --------- | ------------------------------ |
| 90-100 | Excellent | Optimal health metrics         |
| 80-89  | Good      | Most metrics in healthy range  |
| 70-79  | Fair      | Some metrics need attention    |
| 60-69  | Poor      | Multiple metrics outside range |
| < 60   | Critical  | Significant health concerns    |

### Individual Biomarker Thresholds

**Low-scoring biomarkers (< 70)** trigger:

1. Digital Journey Plan assignment
2. Expertise Type recommendations
3. Personalized product suggestions

---

## Calculation Modes

### Standard Mode (shouldStore = true)

- Calculate all scores
- Store in database (user_scores, users)
- Trigger post-processing (plans, experts)

### Preview Mode (shouldStore = false)

- Calculate all scores
- Return results without database updates
- Used for "what-if" scenarios or previews

---

## Data Validation

### Required Fields

- User must exist in `users` table
- User must have valid `Sex` value
- At least one biomarker value must be present

### Default Values

- Missing biomarker values: Skip calculation for that biomarker
- "Other" sex: Default to Male scoring tables
- Missing height/waist: WHR score = 0

### Error Handling

- User not found: Throw error
- All values missing: Return empty scores object
- Calculation error: Log and throw with context
