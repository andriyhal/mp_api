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

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ error: "No token provided" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.userId = decoded.id;
        next();
    });
};

// GET /provider-network - Get recommended providers for the user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        // Get user's assigned expertise types
        const [userTypes] = await pool.execute(
            `SELECT uet.expertise_type_id, et.name as expertise_name, et.category as expertise_category
             FROM user_expertise_types uet
             JOIN expertise_types et ON uet.expertise_type_id = et.id
             WHERE uet.user_id = ?`,
            [userId]
        );
        if (userTypes.length === 0) {
            return res.json({ message: 'No recommended expertise types for user.' });
        }
        const expertiseTypeIds = userTypes.map(t => t.expertise_type_id);
        // Get providers for these types
        const [providers] = await pool.execute(
            `SELECT p.*, et.name as expertise_type, et.category as expertise_category
             FROM providers p
             JOIN expertise_types et ON p.expertise_type_id = et.id
             WHERE p.expertise_type_id IN (${expertiseTypeIds.map(() => '?').join(',')})`,
            expertiseTypeIds
        );
        // Set image_url to FQDN
        const baseUrl = req.protocol + '://' + req.get('host');
        providers.forEach(p => {
            p.image_url = p.image_url ? `${baseUrl}/images/${p.image_url}` : null;
        });
        res.json({ providers });
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'An error occurred while fetching providers.' });
    }
});

export default router;

// Function to assign expertise types to a user based on biomarker scores
export async function assignExpertiseTypesForUser(userId, userBiomarkers) {
    // userBiomarkers: { biomarker_id: value, ... }
    try {
        // First, calculate scores for the user
        const userScores = {};
        for (const biomarkerId in userBiomarkers) {
            const value = userBiomarkers[biomarkerId];
            if (value !== undefined && value !== null) {
                const [scoreRows] = await pool.execute(
                    `SELECT score FROM biomarker_scores WHERE biomarker_id = ? AND (range_from IS NULL OR ? >= range_from) AND (range_to IS NULL OR ? <= range_to) ORDER BY score ASC LIMIT 1`,
                    [biomarkerId, value, value]
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
                `INSERT INTO user_expertise_types (user_id, expertise_type_id) VALUES (?, ?)`,
                [userId, typeId]
            );
        }
        return Array.from(assignedTypes);
    } catch (error) {
        console.error('Error assigning expertise types:', error);
        return [];
    }
}
