import express from 'express';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

// Middleware to verify JWT
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

// Score calculation tables and functions
const scoreTables = {
    'Waist Circumference (cm)': [
        { range: '<0.4', score: 100 },
        { range: [0.4, 0.49], score: 90 },
        { range: [0.5, 0.54], score: 80 },
        { range: [0.55, 0.59], score: 50 },
        { range: [0.6, 0.69], score: 20 },
        { range: '>0.7', score: 0 }
    ],
    'Blood Pressure (Systolic)': [
        { range: '<90', score: 70 },
        { range: [90, 120], score: 100 },
        { range: [121, 130], score: 90 },
        { range: [131, 140], score: 80 },
        { range: [141, 160], score: 60 },
        { range: '>160', score: 40 }
    ],
    'Blood Pressure (Diastolic)': [
        { range: '<60', score: 70 },
        { range: [60, 80], score: 100 },
        { range: [81, 85], score: 90 },
        { range: [86, 90], score: 80 },
        { range: [91, 100], score: 60 },
        { range: '>100', score: 40 }
    ],
    'Fasting Blood Glucose (mg/dL)': [
        { range: '<85', score: 100 },
        { range: [85, 89], score: 90 },
        { range: [90, 99], score: 80 },
        { range: [100, 109], score: 60 },
        { range: [110, 125], score: 40 },
        { range: '>126', score: 20 }
    ],
    'Male HDL Cholesterol (mg/dL)': [
        { range: '<30', score: 40 },
        { range: [30, 39], score: 60 },
        { range: [40, 49], score: 80 },
        { range: [50, 59], score: 90 },
        { range: '>60', score: 100 }
    ],
    'Female HDL Cholesterol (mg/dL)': [
        { range: '<30', score: 40 },
        { range: [30, 44], score: 60 },
        { range: [45, 54], score: 80 },
        { range: [55, 59], score: 90 },
        { range: '>60', score: 100 }
    ],
    'Triglycerides (mg/dL)': [
        { range: '<80', score: 100 },
        { range: [80, 99], score: 90 },
        { range: [100, 149], score: 80 },
        { range: [150, 199], score: 60 },
        { range: [200, 299], score: 40 },
        { range: '>300', score: 20 }
    ]
};

const parameters = [
    { value: 'waistCircumference', label: 'Waist Circumference (cm)' },
    { value: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)' },
    { value: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)' },
    { value: 'fastingBloodGlucose', label: 'Fasting Blood Glucose (mg/dL)' },
    { value: 'hdlCholesterol', label: 'HDL Cholesterol (mg/dL)' },
    { value: 'triglycerides', label: 'Triglycerides (mg/dL)' }
];

function calcScore(value, table, label) {
    console.log(`calcScore called with value=${value}, label=${label}`);
    for (const row of table) {
        const { range, score } = row;
        console.log(`Checking range: ${JSON.stringify(range)}, score: ${score}`);
        if (typeof range === 'string') {
            if (range.startsWith('<') && value < parseFloat(range.slice(1))) {
                console.log(`Match found: ${value} < ${parseFloat(range.slice(1))}, returning ${score}`);
                return score;
            }
            if (range.startsWith('>') && value > parseFloat(range.slice(1))) {
                console.log(`Match found: ${value} > ${parseFloat(range.slice(1))}, returning ${score}`);
                return score;
            }
        } else if (Array.isArray(range) && value >= range[0] && value <= range[1]) {
            console.log(`Match found: ${value} is between ${range[0]} and ${range[1]}, returning ${score}`);
            return score;
        }
    }
    console.log(`No match found for value ${value}, returning 0`);
    return 0;
}

function calculateTotalScore(parameterValues, sex) {
    let totalScore = 0;
    let parameterScoreJson = {};

    // Update HDL label based on sex
    const hdlLabel = sex + ' HDL Cholesterol (mg/dL)';

    for (const parameter of parameters) {
        const label = parameter.label;
        let value = parameterValues[label];

        // Handle HDL cholesterol with sex-specific label
        if (parameter.value === 'hdlCholesterol') {
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
    parameterScoreJson.waistCircumference = 100 - ((parseFloat(parameterValues['Waist Circumference (cm)']) - 0.4) / 0.3) * 100;

    // Apply weighting
    parameterScoreJson['score'] = parseFloat(parameterScoreJson.waistCircumference) * 0.3
        + (parseFloat(parameterScoreJson.bloodPressureSystolic) + parseFloat(parameterScoreJson.bloodPressureDiastolic)) / 2 * 0.2
        + parseFloat(parameterScoreJson.fastingBloodGlucose) * 0.15
        + parseFloat(parameterScoreJson.hdlCholesterol) * 0.15
        + parseFloat(parameterScoreJson.triglycerides) * 0.2;

    parameterScoreJson['score'] = parameterScoreJson['score'].toFixed(2);

    return parameterScoreJson;
}

// Main function to calculate and store user scores
export async function calculateAndStoreUserScores(userId, healthData, combinedData = null, shouldStore = true) {
    try {
        // Get user sex
        const [userRows] = await pool.execute(
            `SELECT Sex FROM users WHERE UserID = ?`,
            [userId]
        );

        if (userRows.length === 0) {
            throw new Error('User not found');
        }

        let sex = userRows[0].Sex;
        if (sex === 'Other') {
            sex = 'Male';
        }

        console.log('User sex:', sex);
        console.log('Health data:', JSON.stringify(healthData, null, 2));

        // Prepare parameter values
        const parameterValues = {
            'Waist Circumference (cm)': healthData.waistCircumference ? healthData.waistCircumference / Number(healthData.height) : 0,
            'Blood Pressure (Systolic)': healthData.BloodPressureSystolic || 0,
            'Blood Pressure (Diastolic)': healthData.BloodPressureDiastolic || 0,
            'Fasting Blood Glucose (mg/dL)': combinedData ? combinedData["Blood Glucose"].Value : (healthData.FastingBloodGlucose || 0),
            [sex + ' HDL Cholesterol (mg/dL)']: combinedData ? combinedData["HDL Cholesterol"].Value : (healthData.HDLCholesterol || 0),
            'Triglycerides (mg/dL)': combinedData ? combinedData["Triglycerides level"].Value : (healthData.Triglycerides || 0)
        };

        // Calculate scores
        const totalScoreJson = calculateTotalScore(parameterValues, sex);
        const centralHealthScore = parseFloat(totalScoreJson.score);

        // Get biomarkers
        const [biomarkers] = await pool.execute(`SELECT id, name FROM biomarkers`);
        let userScores = {};
        let generalScore = 0;

        // Calculate individual biomarker scores and store them
        for (const bio of biomarkers) {
            let value = null;
            let label = null;

            // Map biomarker names to values and labels
            switch(bio.name) {
                case 'waistCircumference':
                    const waist = parseFloat(healthData.waistCircumference);
                    const height = parseFloat(healthData.height);
                    if (waist && height && height > 0) {
                        value = waist / height;
                    }
                    label = 'Waist Circumference (cm)';
                    break;
                case 'bloodPressureSystolic':
                    value = parseFloat(healthData.BloodPressureSystolic);
                    label = 'Blood Pressure (Systolic)';
                    break;
                case 'bloodPressureDiastolic':
                    value = parseFloat(healthData.BloodPressureDiastolic);
                    label = 'Blood Pressure (Diastolic)';
                    break;
                case 'fastingBloodGlucose':
                    value = combinedData ? parseFloat(combinedData["Blood Glucose"].Value) : parseFloat(healthData.FastingBloodGlucose);
                    label = 'Fasting Blood Glucose (mg/dL)';
                    break;
                case 'hdlCholesterol':
                    value = combinedData ? parseFloat(combinedData["HDL Cholesterol"].Value) : parseFloat(healthData.HDLCholesterol);
                    label = sex + ' HDL Cholesterol (mg/dL)';
                    break;
                case 'triglycerides':
                    value = combinedData ? parseFloat(combinedData["Triglycerides level"].Value) : parseFloat(healthData.Triglycerides);
                    label = 'Triglycerides (mg/dL)';
                    break;
            }

            if (value !== undefined && value !== null && label) {
                const table = scoreTables[label];
                if (table) {
                    const score = calcScore(value, table, label);
                    console.log(`Calculated score for ${bio.name} (ID ${bio.id}): value=${value}, label=${label}, score=${score}, table=${JSON.stringify(table)}`);
                    userScores[bio.id] = score;
                    // Store in user_scores table only if shouldStore is true
                    if (shouldStore) {
                        await pool.execute(
                            `INSERT INTO user_scores (user_id, biomarker_id, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score), calculated_at = CURRENT_TIMESTAMP`,
                            [userId, bio.id, score]
                        );
                    }
                } else {
                    console.log(`No score table found for ${bio.name} (ID ${bio.id}): label=${label}`);
                }
            } else {
                console.log(`Skipping ${bio.name} (ID ${bio.id}): value=${value}, label=${label}`);
            }
        }

        // Calculate general health score
        const waistScore = userScores[3] || 0; // waistCircumference (ID 3)
        const bpScore = ((userScores[4] || 0) + (userScores[5] || 0)) / 2; // Average of systolic (ID 4) and diastolic (ID 5)
        const hdlScore = userScores[7] || 0; // HDL (ID 7)
        const trigScore = userScores[8] || 0; // Triglycerides (ID 8)
        const fbgScore = userScores[6] || 0; // Fasting Blood Glucose (ID 6)
        generalScore = (waistScore * 0.3) + (bpScore * 0.2) + (hdlScore * 0.15) + (trigScore * 0.2) + (fbgScore * 0.15);

        console.log('General score calculation:', {
            waistScore, bpScore, hdlScore, trigScore, fbgScore, generalScore,
            userScores: JSON.stringify(userScores)
        });

        // Update user's general health score only if shouldStore is true
        if (shouldStore) {
            await pool.execute(
                `UPDATE users SET general_health_score = ? WHERE UserID = ?`,
                [generalScore, userId]
            );
        }

        return {
            centralHealthScore: generalScore,
            biomarkerScores: userScores,
            generalScore,
            parameterScores: totalScoreJson
        };

    } catch (error) {
        console.error('Error calculating and storing user scores:', error);
        throw error;
    }
}
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get latest health data for user
        const [healthData] = await pool.execute(
            `SELECT * FROM health_data WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1`,
            [userId]
        );

        if (healthData.length === 0) {
            return res.status(404).json({ error: 'No health data found for user' });
        }

        const latestData = healthData[0];
        const lastMeasureDate = latestData.CreatedAt;

        // Use the shared score calculation function (but don't store - this is a GET request)
        const scoreResult = await calculateAndStoreUserScores(userId, latestData, null, false);

        // Get biomarkers for response formatting
        const [biomarkers] = await pool.execute(`SELECT id, name FROM biomarkers`);

        // Build biomarkers array
        const biomarkersDetails = biomarkers.map(bio => {
            let lastMeasureValue = null;

            switch (bio.name) {
                case 'height':
                    lastMeasureValue = latestData.height;
                    break;
                case 'weight':
                    lastMeasureValue = latestData.Weight;
                    break;
                case 'waistCircumference':
                    lastMeasureValue = latestData.waistCircumference;
                    break;
                case 'bloodPressureSystolic':
                    lastMeasureValue = latestData.BloodPressureSystolic;
                    break;
                case 'bloodPressureDiastolic':
                    lastMeasureValue = latestData.BloodPressureDiastolic;
                    break;
                case 'fastingBloodGlucose':
                    lastMeasureValue = latestData.FastingBloodGlucose;
                    break;
                case 'hdlCholesterol':
                    lastMeasureValue = latestData.HDLCholesterol;
                    break;
                case 'triglycerides':
                    lastMeasureValue = latestData.Triglycerides;
                    break;
                default:
                    lastMeasureValue = null;
            }

            // Get score from biomarkerScores by ID
            let score = scoreResult.biomarkerScores[bio.id] || 0;

            return {
                id: bio.id,
                score: score,
                measure_value: lastMeasureValue,
                lastMeasureDate
            };
        });

        res.json({
            centralHealthScore: scoreResult.generalScore || 0,
            biomarkers: biomarkersDetails
        });

    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ error: 'An error occurred while fetching user scores' });
    }
});

export default router;
