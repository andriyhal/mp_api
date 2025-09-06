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

// GET /provider-network/cleanup - Clean up duplicate expertise types for the user
router.get('/cleanup', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await cleanupDuplicateExpertiseTypes(userId);
        res.json(result);
    } catch (error) {
        console.error('Error cleaning up expertise duplicates:', error);
        res.status(500).json({ error: 'An error occurred while cleaning up duplicates.' });
    }
});

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

// Function to clean up duplicate expertise types for a user
export async function cleanupDuplicateExpertiseTypes(userId) {
    try {
        // Find and remove duplicates, keeping only the first occurrence of each expertise type
        const [duplicates] = await pool.execute(`
            SELECT expertise_type_id, COUNT(*) as count, MIN(id) as keep_id
            FROM user_expertise_types 
            WHERE user_id = ?
            GROUP BY expertise_type_id 
            HAVING COUNT(*) > 1
        `, [userId]);
        
        if (duplicates.length === 0) {
            return { success: true, message: 'No duplicates found' };
        }
        
        // Delete duplicate entries
        for (const dup of duplicates) {
            await pool.execute(`
                DELETE FROM user_expertise_types 
                WHERE user_id = ? AND expertise_type_id = ? AND id != ?
            `, [userId, dup.expertise_type_id, dup.keep_id]);
        }
        
        return { success: true, message: `Cleaned up ${duplicates.length} duplicate expertise type entries` };
    } catch (error) {
        console.error('Error cleaning up expertise duplicates:', error);
        return { success: false, message: error.message };
    }
}

// Function to assign expertise types to a user based on biomarker scores
export async function assignExpertiseTypesForUser(userId, userBiomarkers) {
    // userBiomarkers: { biomarker_id: value, ... }
    try {
        // Check if user already has expertise types assigned
        const [existingTypes] = await pool.execute(
            `SELECT expertise_type_id FROM user_expertise_types WHERE user_id = ?`,
            [userId]
        );
        
        if (existingTypes.length > 0) {
            console.log('User already has expertise types assigned, skipping assignment');
            return existingTypes.map(t => t.expertise_type_id);
        }

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
        
        console.log(`Assigned ${assignedTypes.size} expertise types to user ${userId}`);
        return Array.from(assignedTypes);
    } catch (error) {
        console.error('Error assigning expertise types:', error);
        return [];
    }
}
