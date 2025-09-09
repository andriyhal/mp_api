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

// GET /user-scores - Get user scores and biomarker details
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        // Get user sex
        const [userRows] = await pool.execute(
            `SELECT Sex FROM users WHERE UserID = ?`,
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        let sex = userRows[0].Sex;
        if (sex === 'Other') {
            sex = 'Male';
        }

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

        // Calculate scores using the formula
        const scoreTables = {
            'Waist Circumference (cm)': [
                { range: [0.4, 0.49], score: 90 },
                { range: [0.5, 0.54], score: 80 },
                { range: [0.55, 0.59], score: 50 },
                { range: [0.6, 0.69], score: 20 },
                { range: '<0.4', score: 100 },
                { range: '>0.7', score: 0 }
            ],
            'Blood Pressure (Systolic)': [
                { range: [90, 120], score: 100 },
                { range: [121, 130], score: 90 },
                { range: [131, 140], score: 80 },
                { range: [141, 160], score: 60 },
                { range: '>160', score: 40 },
                { range: '<90', score: 70 }
            ],
            'Blood Pressure (Diastolic)': [
                { range: [60, 80], score: 100 },
                { range: [81, 85], score: 90 },
                { range: [86, 90], score: 80 },
                { range: [91, 100], score: 60 },
                { range: '>100', score: 40 },
                { range: '<60', score: 70 }
            ],
            'Fasting Blood Glucose (mg/dL)': [
                { range: [85, 89], score: 90 },
                { range: [90, 99], score: 80 },
                { range: [100, 109], score: 60 },
                { range: [110, 125], score: 40 },
                { range: '>126', score: 20 },
                { range: '<85', score: 100 }
            ],
            'Male HDL Cholesterol (mg/dL)': [
                { range: [50, 59], score: 90 },
                { range: [40, 49], score: 80 },
                { range: [30, 39], score: 60 },
                { range: '>60', score: 100 },
                { range: '<30', score: 40 }
            ],
            'Female HDL Cholesterol (mg/dL)': [
                { range: [55, 59], score: 90 },
                { range: [45, 54], score: 80 },
                { range: [30, 44], score: 60 },
                { range: '>60', score: 100 },
                { range: '<30', score: 40 }
            ],
            'Triglycerides (mg/dL)': [
                { range: [80, 99], score: 90 },
                { range: [100, 149], score: 80 },
                { range: [150, 199], score: 60 },
                { range: [200, 299], score: 40 },
                { range: '<80', score: 100 },
                { range: '>300', score: 20 }
            ]
        };

        const parameters = [
            { value: 'waistCircumference', label: 'Waist Circumference (cm)' },
            { value: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)' },
            { value: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)' },
            { value: 'fastingBloodGlucose', label: 'Fasting Blood Glucose (mg/dL)' },
            { value: 'hdlCholesterol', label: sex + ' HDL Cholesterol (mg/dL)' },
            { value: 'triglycerides', label: 'Triglycerides (mg/dL)' }
        ];

        function calcScore(value, table, label) {
            if (label === 'Blood Pressure (Diastolic)' && value >= 81 && value <= 85) {
                return 90 - (value - 81) * 2.673;
            }
            for (const row of table) {
                const { range, score } = row;
                if (typeof range === 'string') {
                    if (range.startsWith('<') && value < parseFloat(range.slice(1))) {
                        return score;
                    }
                    if (range.startsWith('>') && value > parseFloat(range.slice(1))) {
                        return score;
                    }
                } else if (Array.isArray(range) && value >= range[0] && value <= range[1]) {
                    return score;
                }
            }
            return 0;
        }

        function calculateTotalScore(parameterValues) {
            let totalScore = 0;
            let parameterScoreJson = {};

            for (const parameter of parameters) {
                const label = parameter.label;
                const value = parameterValues[label];
                const table = scoreTables[label];

                if (value !== undefined && table) {
                    const score = calcScore(value, table, parameter.label);
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

        const parameterValues = {
            'Waist Circumference (cm)': latestData.waistCircumference ? latestData.waistCircumference / Number(latestData.height) : 0,
            'Blood Pressure (Systolic)': latestData.bloodPressureSystolic || 0,
            'Blood Pressure (Diastolic)': latestData.bloodPressureDiastolic || 0,
            'Fasting Blood Glucose (mg/dL)': latestData.fastingBloodGlucose || 0,
            [sex + ' HDL Cholesterol (mg/dL)']: latestData.hdlCholesterol || 0,
            'Triglycerides (mg/dL)': latestData.triglycerides || 0
        };

        const totalScoreJson = calculateTotalScore(parameterValues);
        const centralHealthScore = parseFloat(totalScoreJson.score);

        // Get biomarkers
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

            return {
                id: bio.id,
                score: totalScoreJson[bio.name] || 0,
                measure_value: lastMeasureValue,
                lastMeasureDate
            };
        });

        res.json({
            centralHealthScore: isNaN(centralHealthScore) ? 0 : centralHealthScore,
            biomarkers: biomarkersDetails
        });

    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ error: 'An error occurred while fetching user scores' });
    }
});

export default router;
