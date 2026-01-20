# Scoring Logic Documentation

Complete details on health score calculation, biomarker scoring, and assignment algorithms.

**Related Documentation:**

- [Backend Implementation](./BACKEND_IMPLEMENTATION.md) - API endpoint handlers
- [Database Operations](./DATABASE_OPERATIONS.md) - SQL queries
- [API Contracts](/docs/dashboards/API_CONTRACTS.md) - Response schemas
- [Enum Mapping](/docs/dashboards/ENUM_MAPPING.md) - Score categories

---

## Table of Contents

1. [Score Tables](#score-tables)
2. [Score Calculation Function](#score-calculation-function)
3. [Central Health Score Formula](#central-health-score-formula)
4. [Complete Calculation Function](#complete-calculation-function)
5. [Digital Plan Assignment](#digital-plan-assignment)
6. [Expertise Type Assignment](#expertise-type-assignment)

---

## Score Tables

### Biomarker Score Ranges

**File:** `mp_api/routes/userScores.js`

```javascript
const scoreTables = {
    "Waist Circumference (cm)": [
        { range: "<0.4", score: 100 },
        { range: [0.4, 0.49], score: 90 },
        { range: [0.5, 0.54], score: 80 },
        { range: [0.55, 0.59], score: 50 },
        { range: [0.6, 0.69], score: 20 },
        { range: ">0.7", score: 0 },
    ],
    "Blood Pressure (Systolic)": [
        { range: "<90", score: 70 },
        { range: [90, 120], score: 100 },
        { range: [121, 130], score: 90 },
        { range: [131, 140], score: 80 },
        { range: [141, 160], score: 60 },
        { range: ">160", score: 40 },
    ],
    "Blood Pressure (Diastolic)": [
        { range: "<60", score: 70 },
        { range: [60, 80], score: 100 },
        { range: [81, 85], score: 90 },
        { range: [86, 90], score: 80 },
        { range: [91, 100], score: 60 },
        { range: ">100", score: 40 },
    ],
    "Fasting Blood Glucose (mg/dL)": [
        { range: "<85", score: 100 },
        { range: [85, 89], score: 90 },
        { range: [90, 99], score: 80 },
        { range: [100, 109], score: 60 },
        { range: [110, 125], score: 40 },
        { range: ">126", score: 20 },
    ],
    "Male HDL Cholesterol (mg/dL)": [
        { range: "<30", score: 40 },
        { range: [30, 39], score: 60 },
        { range: [40, 49], score: 80 },
        { range: [50, 59], score: 90 },
        { range: ">60", score: 100 },
    ],
    "Female HDL Cholesterol (mg/dL)": [
        { range: "<30", score: 40 },
        { range: [30, 44], score: 60 },
        { range: [45, 54], score: 80 },
        { range: [55, 59], score: 90 },
        { range: ">60", score: 100 },
    ],
    "Triglycerides (mg/dL)": [
        { range: "<80", score: 100 },
        { range: [80, 99], score: 90 },
        { range: [100, 149], score: 80 },
        { range: [150, 199], score: 60 },
        { range: [200, 299], score: 40 },
        { range: ">300", score: 20 },
    ],
};
```

### Parameter Mapping

```javascript
const parameters = [
    { value: "waistCircumference", label: "Waist Circumference (cm)" },
    { value: "bloodPressureSystolic", label: "Blood Pressure (Systolic)" },
    { value: "bloodPressureDiastolic", label: "Blood Pressure (Diastolic)" },
    { value: "fastingBloodGlucose", label: "Fasting Blood Glucose (mg/dL)" },
    { value: "hdlCholesterol", label: "HDL Cholesterol (mg/dL)" },
    { value: "triglycerides", label: "Triglycerides (mg/dL)" },
];
```

---

## Score Calculation Function

### Individual Score Calculation

```javascript
function calcScore(value, table, label) {
    console.log(`calcScore called with value=${value}, label=${label}`);

    for (const row of table) {
        const { range, score } = row;
        console.log(
            `Checking range: ${JSON.stringify(range)}, score: ${score}`,
        );

        if (typeof range === "string") {
            // Handle string ranges: '<X' or '>X'
            if (range.startsWith("<") && value < parseFloat(range.slice(1))) {
                console.log(
                    `Match found: ${value} < ${parseFloat(range.slice(1))}, returning ${score}`,
                );
                return score;
            }
            if (range.startsWith(">") && value > parseFloat(range.slice(1))) {
                console.log(
                    `Match found: ${value} > ${parseFloat(range.slice(1))}, returning ${score}`,
                );
                return score;
            }
        } else if (
            Array.isArray(range) &&
            value >= range[0] &&
            value <= range[1]
        ) {
            // Handle array ranges: [min, max]
            console.log(
                `Match found: ${value} is between ${range[0]} and ${range[1]}, returning ${score}`,
            );
            return score;
        }
    }

    console.log(`No match found for value ${value}, returning 0`);
    return 0;
}
```

### Examples

```javascript
// Example 1: Waist-Height Ratio = 0.45
calcScore(
    0.45,
    scoreTables["Waist Circumference (cm)"],
    "Waist Circumference (cm)",
);
// Returns: 90 (matches range [0.4, 0.49])

// Example 2: Blood Pressure Systolic = 115
calcScore(
    115,
    scoreTables["Blood Pressure (Systolic)"],
    "Blood Pressure (Systolic)",
);
// Returns: 100 (matches range [90, 120])

// Example 3: Fasting Blood Glucose = 95
calcScore(
    95,
    scoreTables["Fasting Blood Glucose (mg/dL)"],
    "Fasting Blood Glucose (mg/dL)",
);
// Returns: 80 (matches range [90, 99])

// Example 4: Triglycerides = 250
calcScore(250, scoreTables["Triglycerides (mg/dL)"], "Triglycerides (mg/dL)");
// Returns: 40 (matches range [200, 299])
```

---

## Central Health Score Formula

### Weighted Score Calculation

```javascript
function calculateTotalScore(parameterValues, sex) {
    let totalScore = 0;
    let parameterScoreJson = {};

    // Update HDL label based on sex
    const hdlLabel = sex + " HDL Cholesterol (mg/dL)";

    // Calculate individual scores
    for (const parameter of parameters) {
        const label = parameter.label;
        let value = parameterValues[label];

        // Handle HDL cholesterol with sex-specific label
        if (parameter.value === "hdlCholesterol") {
            value = parameterValues[hdlLabel];
        }

        const table = scoreTables[label];
        if (value !== undefined && value !== null && table) {
            const score = calcScore(value, table, label);
            totalScore += score;
            parameterScoreJson[parameter.value] = score;
        }
    }

    // Recalculate waistCircumference to waist-height ratio score
    // Formula: 100 - ((WHR - 0.4) / 0.3) * 100
    parameterScoreJson.waistCircumference =
        100 -
        ((parseFloat(parameterValues["Waist Circumference (cm)"]) - 0.4) /
            0.3) *
            100;

    // Apply weighting to get final score
    parameterScoreJson["score"] =
        parseFloat(parameterScoreJson.waistCircumference) * 0.3 +
        ((parseFloat(parameterScoreJson.bloodPressureSystolic) +
            parseFloat(parameterScoreJson.bloodPressureDiastolic)) /
            2) *
            0.2 +
        parseFloat(parameterScoreJson.fastingBloodGlucose) * 0.15 +
        parseFloat(parameterScoreJson.hdlCholesterol) * 0.15 +
        parseFloat(parameterScoreJson.triglycerides) * 0.2;

    parameterScoreJson["score"] = parameterScoreJson["score"].toFixed(2);

    return parameterScoreJson;
}
```

### Formula Breakdown

**Central Health Score = Weighted Sum**

```
Score = (WHR_score × 0.30) +
        (BP_avg_score × 0.20) +
        (FBG_score × 0.15) +
        (HDL_score × 0.15) +
        (Trig_score × 0.20)

Where:
- WHR_score = Waist-Height Ratio score (recalculated)
- BP_avg_score = (BP_systolic_score + BP_diastolic_score) / 2
- FBG_score = Fasting Blood Glucose score
- HDL_score = HDL Cholesterol score (sex-specific)
- Trig_score = Triglycerides score

Weights:
- Waist-Height Ratio: 30%
- Blood Pressure (avg): 20%
- Fasting Blood Glucose: 15%
- HDL Cholesterol: 15%
- Triglycerides: 20%
```

### Calculation Example

**User Data:**

- Sex: Male
- Waist: 90 cm
- Height: 180 cm
- WHR: 0.5
- BP Systolic: 125 mmHg
- BP Diastolic: 78 mmHg
- FBG: 92 mg/dL
- HDL: 48 mg/dL
- Triglycerides: 140 mg/dL

**Step 1: Calculate Individual Scores**

```javascript
WHR_score (0.5):          80  // Range [0.5, 0.54]
BP_Systolic (125):        90  // Range [121, 130]
BP_Diastolic (78):       100  // Range [60, 80]
FBG (92):                 80  // Range [90, 99]
HDL_Male (48):            80  // Range [40, 49]
Triglycerides (140):      80  // Range [100, 149]
```

**Step 2: Recalculate WHR Score**

```javascript
WHR_score = 100 - ((0.5 - 0.4) / 0.3) * 100
          = 100 - (0.1 / 0.3) * 100
          = 100 - 33.33
          = 66.67
```

**Step 3: Calculate BP Average**

```javascript
BP_avg_score = (90 + 100) / 2 = 95
```

**Step 4: Apply Weights**

```javascript
Central_Health_Score = (66.67 × 0.30) +
                       (95 × 0.20) +
                       (80 × 0.15) +
                       (80 × 0.15) +
                       (80 × 0.20)
                     = 20.00 + 19.00 + 12.00 + 12.00 + 16.00
                     = 79.00
```

**Result:** Central Health Score = **79.00** (Excellent)

---

## Complete Calculation Function

### calculateAndStoreUserScores()

**File:** `mp_api/routes/userScores.js`

```javascript
export async function calculateAndStoreUserScores(
    userId,
    healthData,
    combinedData = null,
    shouldStore = true,
) {
    try {
        // Get user sex
        const [userRows] = await pool.execute(
            `SELECT Sex FROM users WHERE UserID = ?`,
            [userId],
        );

        if (userRows.length === 0) {
            throw new Error("User not found");
        }

        let sex = userRows[0].Sex;
        if (sex === "Other") {
            sex = "Male"; // Default to Male for scoring
        }

        console.log("User sex:", sex);
        console.log("Health data:", JSON.stringify(healthData, null, 2));

        // Prepare parameter values
        const parameterValues = {
            "Waist Circumference (cm)": healthData.waistCircumference
                ? healthData.waistCircumference / Number(healthData.height)
                : 0,
            "Blood Pressure (Systolic)": healthData.BloodPressureSystolic || 0,
            "Blood Pressure (Diastolic)":
                healthData.BloodPressureDiastolic || 0,
            "Fasting Blood Glucose (mg/dL)": combinedData
                ? combinedData["Blood Glucose"].Value
                : healthData.FastingBloodGlucose || 0,
            [sex + " HDL Cholesterol (mg/dL)"]: combinedData
                ? combinedData["HDL Cholesterol"].Value
                : healthData.HDLCholesterol || 0,
            "Triglycerides (mg/dL)": combinedData
                ? combinedData["Triglycerides level"].Value
                : healthData.Triglycerides || 0,
        };

        // Calculate scores
        const totalScoreJson = calculateTotalScore(parameterValues, sex);
        const centralHealthScore = parseFloat(totalScoreJson.score);

        // Get biomarkers
        const [biomarkers] = await pool.execute(
            `SELECT id, name FROM biomarkers`,
        );
        let userScores = {};

        // Calculate individual biomarker scores and store them
        for (const bio of biomarkers) {
            let value = null;
            let label = null;

            // Map biomarker names to values and labels
            switch (bio.name) {
                case "waistCircumference":
                    const waist = parseFloat(healthData.waistCircumference);
                    const height = parseFloat(healthData.height);
                    if (waist && height && height > 0) {
                        value = waist / height;
                    }
                    label = "Waist Circumference (cm)";
                    break;
                case "bloodPressureSystolic":
                    value = parseFloat(healthData.BloodPressureSystolic);
                    label = "Blood Pressure (Systolic)";
                    break;
                case "bloodPressureDiastolic":
                    value = parseFloat(healthData.BloodPressureDiastolic);
                    label = "Blood Pressure (Diastolic)";
                    break;
                case "fastingBloodGlucose":
                    value = combinedData
                        ? parseFloat(combinedData["Blood Glucose"].Value)
                        : parseFloat(healthData.FastingBloodGlucose);
                    label = "Fasting Blood Glucose (mg/dL)";
                    break;
                case "hdlCholesterol":
                    value = combinedData
                        ? parseFloat(combinedData["HDL Cholesterol"].Value)
                        : parseFloat(healthData.HDLCholesterol);
                    label = sex + " HDL Cholesterol (mg/dL)";
                    break;
                case "triglycerides":
                    value = combinedData
                        ? parseFloat(combinedData["Triglycerides level"].Value)
                        : parseFloat(healthData.Triglycerides);
                    label = "Triglycerides (mg/dL)";
                    break;
            }

            if (value !== undefined && value !== null && label) {
                const table = scoreTables[label];
                if (table) {
                    const score = calcScore(value, table, label);
                    console.log(
                        `Calculated score for ${bio.name} (ID ${bio.id}): value=${value}, score=${score}`,
                    );
                    userScores[bio.id] = score;

                    // Store in user_scores table only if shouldStore is true
                    if (shouldStore) {
                        await pool.execute(
                            `INSERT INTO user_scores (user_id, biomarker_id, score) 
                             VALUES (?, ?, ?) 
                             ON DUPLICATE KEY UPDATE 
                             score = VALUES(score), 
                             calculated_at = CURRENT_TIMESTAMP`,
                            [userId, bio.id, score],
                        );
                    }
                }
            }
        }

        // Calculate general health score
        const waistScore = userScores[3] || 0; // waistCircumference (ID 3)
        const bpScore = ((userScores[4] || 0) + (userScores[5] || 0)) / 2; // BP avg
        const hdlScore = userScores[7] || 0; // HDL (ID 7)
        const trigScore = userScores[8] || 0; // Triglycerides (ID 8)
        const fbgScore = userScores[6] || 0; // FBG (ID 6)

        const generalScore =
            waistScore * 0.3 +
            bpScore * 0.2 +
            hdlScore * 0.15 +
            trigScore * 0.2 +
            fbgScore * 0.15;

        console.log("General score calculation:", {
            waistScore,
            bpScore,
            hdlScore,
            trigScore,
            fbgScore,
            generalScore,
            userScores: JSON.stringify(userScores),
        });

        // Update user's general health score only if shouldStore is true
        if (shouldStore) {
            await pool.execute(
                `UPDATE users SET general_health_score = ? WHERE UserID = ?`,
                [generalScore, userId],
            );
        }

        return {
            centralHealthScore: generalScore,
            biomarkerScores: userScores,
            generalScore,
            parameterScores: totalScoreJson,
        };
    } catch (error) {
        console.error("Error calculating and storing user scores:", error);
        throw error;
    }
}
```

---

## Digital Plan Assignment

### assignDigitalPlanForUser()

**File:** `mp_api/routes/digitalJourney.js`

```javascript
export async function assignDigitalPlanForUser(userId, userBiomarkers) {
    // userBiomarkers: { biomarker_id: value, ... }
    try {
        // Check if user already has a plan assigned
        const [existingPlans] = await pool.execute(
            `SELECT id FROM user_digital_plans WHERE user_id = ?`,
            [userId],
        );

        if (existingPlans.length > 0) {
            console.log(
                "User already has a digital plan assigned, skipping assignment",
            );
            return existingPlans[0].id;
        }

        // First, calculate scores for the user
        const userScores = {};
        for (const biomarkerId in userBiomarkers) {
            const value = userBiomarkers[biomarkerId];
            if (value !== undefined && value !== null) {
                const [scoreRows] = await pool.execute(
                    `SELECT score FROM biomarker_scores 
                     WHERE biomarker_id = ? 
                     AND (range_from IS NULL OR ? >= range_from) 
                     AND (range_to IS NULL OR ? <= range_to) 
                     ORDER BY score ASC LIMIT 1`,
                    [biomarkerId, value, value],
                );
                if (scoreRows.length > 0) {
                    userScores[biomarkerId] = scoreRows[0].score;
                }
            }
        }

        // Find a plan for the user's biomarker scores
        const [rows] = await pool.execute(
            `SELECT bps.plan_id, bps.biomarker_id, bps.score
             FROM biomarker_plan_score bps`,
        );

        let selectedPlanId = null;
        for (const row of rows) {
            const userScore = userScores[row.biomarker_id];
            if (userScore !== undefined && userScore === row.score) {
                selectedPlanId = row.plan_id;
                break;
            }
        }

        if (!selectedPlanId) {
            console.log("No suitable plan found for user scores");
            return null;
        }

        // Assign plan to user
        const [result] = await pool.execute(
            `INSERT INTO user_digital_plans (user_id, plan_id) VALUES (?, ?)`,
            [userId, selectedPlanId],
        );
        const userPlanId = result.insertId;

        // Get plan items and schedule them (T+day_offset from today)
        const [planItems] = await pool.execute(
            `SELECT item_id, day_offset FROM digital_plan_items WHERE plan_id = ?`,
            [selectedPlanId],
        );

        const today = new Date();
        for (const item of planItems) {
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + item.day_offset);
            await pool.execute(
                `INSERT INTO user_digital_plan_items (user_plan_id, item_id, scheduled_date) 
                 VALUES (?, ?, ?)`,
                [
                    userPlanId,
                    item.item_id,
                    scheduledDate.toISOString().slice(0, 10),
                ],
            );
        }

        console.log(
            `Assigned digital plan ${selectedPlanId} to user ${userId} with ${planItems.length} items`,
        );
        return userPlanId;
    } catch (error) {
        console.error("Error assigning digital plan:", error);
        return null;
    }
}
```

### Algorithm Steps

1. **Check existing assignment**: Skip if user already has a plan
2. **Calculate user scores**: Convert biomarker values to scores using `biomarker_scores` table
3. **Find matching plan**: Query `biomarker_plan_score` table for plan where user's score matches
4. **Assign plan**: Insert into `user_digital_plans`
5. **Schedule items**: Insert into `user_digital_plan_items` with `scheduled_date = today + day_offset`

---

## Expertise Type Assignment

### assignExpertiseTypesForUser()

**File:** `mp_api/routes/providerNetwork.js`

```javascript
export async function assignExpertiseTypesForUser(userId, userBiomarkers) {
    // userBiomarkers: { biomarker_id: value, ... }
    try {
        // Check if user already has expertise types assigned
        const [existingTypes] = await pool.execute(
            `SELECT expertise_type_id FROM user_expertise_types WHERE user_id = ?`,
            [userId],
        );

        if (existingTypes.length > 0) {
            console.log(
                "User already has expertise types assigned, skipping assignment",
            );
            return existingTypes.map((t) => t.expertise_type_id);
        }

        // First, calculate scores for the user
        const userScores = {};
        for (const biomarkerId in userBiomarkers) {
            const value = userBiomarkers[biomarkerId];
            if (value !== undefined && value !== null) {
                const [scoreRows] = await pool.execute(
                    `SELECT score FROM biomarker_scores 
                     WHERE biomarker_id = ? 
                     AND (range_from IS NULL OR ? >= range_from) 
                     AND (range_to IS NULL OR ? <= range_to) 
                     ORDER BY score ASC LIMIT 1`,
                    [biomarkerId, value, value],
                );
                if (scoreRows.length > 0) {
                    userScores[biomarkerId] = scoreRows[0].score;
                }
            }
        }

        // Find expertise types for the user's biomarker scores
        const [rows] = await pool.execute(
            `SELECT bes.expertise_type_id, bes.biomarker_id, bes.score
             FROM biomarker_expertise_score bes`,
        );

        const assignedTypes = new Set();
        for (const row of rows) {
            const userScore = userScores[row.biomarker_id];
            if (userScore !== undefined && userScore === row.score) {
                assignedTypes.add(row.expertise_type_id);
            }
        }

        for (const typeId of assignedTypes) {
            await pool.execute(
                `INSERT INTO user_expertise_types (user_id, expertise_type_id) 
                 VALUES (?, ?)`,
                [userId, typeId],
            );
        }

        console.log(
            `Assigned ${assignedTypes.size} expertise types to user ${userId}`,
        );
        return Array.from(assignedTypes);
    } catch (error) {
        console.error("Error assigning expertise types:", error);
        return [];
    }
}
```

### Algorithm Steps

1. **Check existing assignment**: Skip if user already has expertise types
2. **Calculate user scores**: Convert biomarker values to scores using `biomarker_scores` table
3. **Find matching expertise types**: Query `biomarker_expertise_score` table for types where user's score matches
4. **Assign expertise types**: Insert into `user_expertise_types` for each matched type

---

## Related Documentation

- **[Backend Implementation](./BACKEND_IMPLEMENTATION.md)** - API handlers and middleware
- **[Database Operations](./DATABASE_OPERATIONS.md)** - SQL queries and schema
- **[API Contracts](/docs/dashboards/API_CONTRACTS.md)** - Response schemas
- **[Enum Mapping](/docs/dashboards/ENUM_MAPPING.md)** - Score to category mapping
