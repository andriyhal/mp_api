import express from 'express';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Use the same pool as in server.js
import dotenv from 'dotenv';
dotenv.config();

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

// Middleware to verify JWT (copy from server.js)
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

// GET /recommendation - Recommend products for user (or prioritized for unauthenticated)
router.get('/', async (req, res) => {
    let userId = null;
    let userVitals = {};
    let userScores = {};
    let isAuthenticated = false;
    let generalScore = 0; // Declare generalScore here
    try {
        // Try to extract user info from JWT
        const token = req.headers["authorization"]?.split(" ")[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
            isAuthenticated = true;
        }
    } catch (e) {
        // Not authenticated
    }

    try {
        let products;
        // If authenticated, get user vitals and scores from user_scores table
        if (isAuthenticated && userId) {
            const [vitals] = await pool.execute(
                `SELECT * FROM health_data WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1`,
                [userId]
            );
            if (vitals.length > 0) {
                userVitals = vitals[0];
                
                // Fetch existing scores from user_scores table
                const [scoreRows] = await pool.execute(
                    `SELECT biomarker_id, score FROM user_scores WHERE user_id = ?`,
                    [userId]
                );
                
                // Map scores to userScores object
                for (const scoreRow of scoreRows) {
                    userScores[scoreRow.biomarker_id] = scoreRow.score;
                }

                // Get general health score from users table
                const [userRows] = await pool.execute(
                    `SELECT general_health_score FROM users WHERE UserID = ?`,
                    [userId]
                );
                generalScore = userRows.length > 0 ? userRows[0].general_health_score : 0;
            }
            [products] = await pool.execute(`
                SELECT p.*, pbs.biomarker_id, pbs.score, pbs.priority, b.name as biomarker_name
                FROM products p
                LEFT JOIN product_biomarker_score pbs ON p.id = pbs.product_id
                LEFT JOIN biomarkers b ON pbs.biomarker_id = b.id
            `);
        } else {
            // Unauthenticated: only show active products
            [products] = await pool.execute(`
                SELECT p.*, pbs.biomarker_id, pbs.score, pbs.priority, b.name as biomarker_name
                FROM products p
                LEFT JOIN product_biomarker_score pbs ON p.id = pbs.product_id
                LEFT JOIN biomarkers b ON pbs.biomarker_id = b.id
                WHERE p.is_active = 1
            `);
        }

                // Group products by category and order by priority
                const grouped = {};
                // Get server base URL for image links
                const baseUrl = req.protocol + '://' + req.get('host');
                for (const prod of products) {
                        // If user is authenticated, filter by biomarker score
                        if (isAuthenticated && prod.biomarker_id) {
                                const userScore = userScores[prod.biomarker_id];
                                // If user doesn't have this biomarker score, skip
                                if (userScore === undefined || userScore === null) continue;
                                // If score doesn't match, skip
                                if (userScore !== prod.score) continue;
                        }
                        // Remove biomarker_id from response and set image_url to FQDN
                        const { biomarker_id, ...rest } = prod;
                        rest.image_url = prod.image_url ? `${baseUrl}/images/${prod.image_url}` : null;
                        if (!grouped[prod.category]) grouped[prod.category] = [];
                        grouped[prod.category].push(rest);
                }
        // Sort each group by priority
        for (const category in grouped) {
            grouped[category].sort((a, b) => (a.priority || 99) - (b.priority || 99));
        }
        const response = { grouped, isAuthenticated };
        if (isAuthenticated) {
            response.general_health_score = generalScore;
        }
        res.json(response);
    } catch (error) {
        console.error('Error in /recommendation:', error);
        res.status(500).json({ error: 'An error occurred while recommending products' });
    }
});

export default router;
