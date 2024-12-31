import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Route to handle user registration
app.post('/register-user', async (req, res) => {
  try {
    const { UserID, Sex, DateOfBirth } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO users (UserID, Sex, DateOfBirth) VALUES (?, ?, ?)`,
      [UserID, Sex, DateOfBirth]
    );

    res.status(201).json({ message: 'User registered successfully', id: result.insertId });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'An error occurred while registering user' });
  }
});

app.post('/edit-user', async (req, res) => {
  try {
    const { userId, sex, dateOfBirth , action} = req.body;

    if(action == 'add'){
		const [result] = await pool.execute(
		  `INSERT INTO users (UserID, Sex, DateOfBirth) VALUES (?, ?, ?)`,
		  [userId, sex, dateOfBirth ]
		);
	}else{
	
		const [result] = await pool.execute(
		  `UPDATE users SET Sex = ?, DateOfBirth = ? WHERE UserID = ?`,
		  [sex, dateOfBirth, userId]
		);
	}
	

    res.status(201).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'An error occurred while updating user' });
  }
});

// Route to handle health data submission
app.post('/submit-health-data', async (req, res) => {
  try {
    const {
      UserID,
      height,
      weight,
      waistCircumference,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      fastingBloodGlucose,
      hdlCholesterol,
      triglycerides,
      vitaminD2,
      vitaminD3
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO health_data 
      (UserID, height, weight, waistCircumference, bloodPressureSystolic, 
      bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides, vitaminD2, vitaminD3) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [UserID, height, weight, waistCircumference, bloodPressureSystolic,
      bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides, vitaminD2, vitaminD3]
    );

    res.status(201).json({ message: 'Health data submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Error submitting health data:', error);
    res.status(500).json({ error: 'An error occurred while submitting health data' });
  }
});

// Endpoint to get average health metrics
app.get('/average-health-metrics', async (req, res) => {
  try {
    const { age, sex, weight } = req.query;

    // Validate input
    if (!age || !sex || !weight) {
      return res.status(400).json({ error: 'Missing required parameters: age, sex, and weight' });
    }

    // Convert age and weight to numbers and apply some basic validation
    const ageNum = parseInt(age , 10);
    const weightNum = parseFloat(weight );

    if (isNaN(ageNum) || isNaN(weightNum) || ageNum <= 0 || weightNum <= 0) {
      return res.status(400).json({ error: 'Invalid age or weight' });
    }

    // Define age and weight ranges
    const ageRange = 5; // ±5 years
    const weightRange = 10; // ±10 lbs

    const [results] = await pool.execute(
      `SELECT 
        AVG(hd.bloodPressureSystolic) as avgSystolic,
        AVG(hd.bloodPressureDiastolic) as avgDiastolic,
        AVG(hd.fastingBloodGlucose) as avgGlucose,
        AVG(hd.hdlCholesterol) as avgHDL,
        AVG(hd.triglycerides) as avgTriglycerides,
        AVG(hd.vitaminD2) as avgVitaminD2,
        AVG(hd.vitaminD3) as avgVitaminD3
      FROM health_data hd
      JOIN users u ON hd.UserID = u.UserID
      WHERE 
        u.Sex = ? AND
        TIMESTAMPDIFF(YEAR, u.DateOfBirth, CURDATE()) BETWEEN ? AND ? AND
        hd.weight BETWEEN ? AND ?`,
      [sex, ageNum - ageRange, ageNum + ageRange, weightNum - weightRange, weightNum + weightRange]
    );

    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching average health metrics:', error);
    res.status(500).json({ error: 'An error occurred while fetching average health metrics' });
  }
});

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(new URL('./index.html', import.meta.url).pathname);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

