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
    if (!token) return res.status(403).json({ error: "No token provided" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.userId = decoded.id;
        next();
    });
};

// GET /digital-journey/cleanup - Clean up duplicate items for the user
router.get('/cleanup', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await cleanupDuplicatePlanItems(userId);
        res.json(result);
    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
        res.status(500).json({ error: 'An error occurred while cleaning up duplicates.' });
    }
});

// GET /digital-journey - Get user's assigned plan (digital items ordered by scheduled_date)
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        // Get user's assigned plan
        const [userPlans] = await pool.execute(
            `SELECT udp.id as user_plan_id, dp.name as plan_name, udp.assigned_at
             FROM user_digital_plans udp
             JOIN digital_plans dp ON udp.plan_id = dp.id
             WHERE udp.user_id = ?
             ORDER BY udp.assigned_at DESC LIMIT 1`,
            [userId]
        );
        if (userPlans.length === 0) {
            return res.json({ message: 'No digital journey plan assigned.' });
        }
        const userPlan = userPlans[0];
        // Get digital items for this plan, ordered by scheduled_date
        const [items] = await pool.execute(
            `SELECT udi.scheduled_date, di.name, di.description, di.type, di.image_url, di.content_url
             FROM user_digital_plan_items udi
             JOIN digital_items di ON udi.item_id = di.id
             WHERE udi.user_plan_id = ?
             ORDER BY udi.scheduled_date ASC`,
            [userPlan.user_plan_id]
        );
        // Set image_url to FQDN
        const baseUrl = req.protocol + '://' + req.get('host');
        items.forEach(item => {
            item.image_url = item.image_url ? `${baseUrl}/images/${item.image_url}` : null;
        });
        res.json({ plan: userPlan, items });
    } catch (error) {
        console.error('Error fetching digital journey:', error);
        res.status(500).json({ error: 'An error occurred while fetching digital journey.' });
    }
});

export default router;

// Function to clean up duplicate items in user digital plan items
export async function cleanupDuplicatePlanItems(userId) {
    try {
        // Get user's plan
        const [userPlans] = await pool.execute(
            `SELECT id as user_plan_id FROM user_digital_plans WHERE user_id = ?`,
            [userId]
        );
        
        if (userPlans.length === 0) {
            return { success: false, message: 'No plan found for user' };
        }
        
        const userPlanId = userPlans[0].user_plan_id;
        
        // Find and remove duplicates, keeping only the first occurrence of each item
        const [duplicates] = await pool.execute(`
            SELECT item_id, scheduled_date, COUNT(*) as count, MIN(id) as keep_id
            FROM user_digital_plan_items 
            WHERE user_plan_id = ?
            GROUP BY item_id, scheduled_date 
            HAVING COUNT(*) > 1
        `, [userPlanId]);
        
        if (duplicates.length === 0) {
            return { success: true, message: 'No duplicates found' };
        }
        
        // Delete duplicate entries
        for (const dup of duplicates) {
            await pool.execute(`
                DELETE FROM user_digital_plan_items 
                WHERE user_plan_id = ? AND item_id = ? AND scheduled_date = ? AND id != ?
            `, [userPlanId, dup.item_id, dup.scheduled_date, dup.keep_id]);
        }
        
        return { success: true, message: `Cleaned up ${duplicates.length} duplicate item groups` };
    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
        return { success: false, message: error.message };
    }
}

// Function to assign a digital plan to a user based on biomarker scores
export async function assignDigitalPlanForUser(userId, userBiomarkers) {
    // userBiomarkers: { biomarker_id: value, ... }
    try {
        // Check if user already has a plan assigned
        const [existingPlans] = await pool.execute(
            `SELECT id FROM user_digital_plans WHERE user_id = ?`,
            [userId]
        );
        
        if (existingPlans.length > 0) {
            console.log('User already has a digital plan assigned, skipping assignment');
            return existingPlans[0].id;
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
            console.log('No suitable plan found for user scores');
            return null;
        }
        
        // Assign plan to user
        const [result] = await pool.execute(
            `INSERT INTO user_digital_plans (user_id, plan_id) VALUES (?, ?)`,
            [userId, selectedPlanId]
        );
        const userPlanId = result.insertId;
        
        // Get plan items and schedule them (T+day_offset from today)
        const [planItems] = await pool.execute(
            `SELECT item_id, day_offset FROM digital_plan_items WHERE plan_id = ?`,
            [selectedPlanId]
        );
        
        const today = new Date();
        for (const item of planItems) {
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + item.day_offset);
            await pool.execute(
                `INSERT INTO user_digital_plan_items (user_plan_id, item_id, scheduled_date) VALUES (?, ?, ?)`,
                [userPlanId, item.item_id, scheduledDate.toISOString().slice(0, 10)]
            );
        }
        
        console.log(`Assigned digital plan ${selectedPlanId} to user ${userId} with ${planItems.length} items`);
        return userPlanId;
    } catch (error) {
        console.error('Error assigning digital plan:', error);
        return null;
    }
}
