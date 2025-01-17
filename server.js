import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createWorker } from 'tesseract.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI API
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_X_API_KEY // This is also the default, can be omitted
});

// Create uploads folder if it doesn't exist
const uploadsFolder = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

// Set up multer for file uploads
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
	  fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
	},
  });


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

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

// Endpoint to get user profile
app.get('/get-user-profile', async (req, res) => {
	try {
		const { userID } = req.query;
		
		// Validate input
		if (!userID) {
			return res.status(400).json({ error: 'Missing required parameters: userID' });
		}
		
		
		
		
		const [results] = await pool.execute(
			`SELECT 
			UserID as userId ,DateOfBirth as dateOfBirth, Sex as sex
			FROM users u
			WHERE 
			u.UserID = ?`,
			[userID]
		);
		
		res.json(results[0]);
		} catch (error) {
		console.error('Error fetching profile:', error);
		res.status(500).json({ error: 'An error occurred while fetching profile' });
	}
});

// Endpoint to get user health data
app.get('/get-health-data', async (req, res) => {
	try {
		const { userId } = req.query;
		
		// Validate input
		if (!userId) {
			return res.status(400).json({ error: 'Missing required parameters: userId' });
		}
		
		
		
		
		const [results] = await pool.execute(
			`SELECT 
			 
			Weight as weight, 
			BloodPressureSystolic as bloodPressureSystolic, 
			BloodPressureDiastolic as bloodPressureDiastolic, 
			FastingBloodGlucose as fastingBloodGlucose, 
			HDLCholesterol as hdlCholesterol, 
			Triglycerides as triglycerides, 
			CreatedAt as lastUpdate, 
			height, 
			waistCircumference, 
			vitaminD2, 
			vitaminD3
			FROM health_data hd
			WHERE 
			UserID = ? ORDER BY CreatedAt Desc limit 1`,
			[userId]
		);
		
		
		res.json(results[0]);
		} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data' });
	}
});

// Endpoint to get user health data history
app.get('/get-health-history', async (req, res) => {
	try {
		const { userId , parameter } = req.query;
		
		// Validate input
		if (!userId || !parameter ) {
			return res.status(400).json({ error: 'Missing required parameters: userId or parameter' });
		}
		
		
		
		
		const [results] = await pool.execute(
			`SELECT 
			UserID, 
			Weight as weight, 
			BloodPressureSystolic as bloodPressureSystolic, 
			BloodPressureDiastolic as bloodPressureDiastolic, 
			FastingBloodGlucose as fastingBloodGlucose, 
			HDLCholesterol as hdlCholesterol, 
			Triglycerides as triglycerides, 
			CreatedAt as date, 
			height, 
			waistCircumference, 
			vitaminD2, 
			vitaminD3
			FROM health_data hd
			WHERE 
			UserID = ? `,
			[userId]
		);
		
		
		res.json(results);
		} catch (error) {
		console.error('Error fetching history data:', error);
		res.status(500).json({ error: 'An error occurred while fetching history data' });
	}
});

// Route to handle health score submission
app.get('/calc-health-score', async (req, res) => {
	try {
		const { userId  } = req.query;
		
		// Validate input
		if (!userId  ) {
			return res.status(400).json({ error: 'Missing required parameters: userId' });
		}
		
		
		//const userId = 'test@example.com';
		
		const [results] = await pool.execute(
			`SELECT 
			UserID, 
			Weight as weight, 
			BloodPressureSystolic as bloodPressureSystolic, 
			BloodPressureDiastolic as bloodPressureDiastolic, 
			FastingBloodGlucose as fastingBloodGlucose, 
			HDLCholesterol as hdlCholesterol, 
			Triglycerides as triglycerides, 
			CreatedAt as lastUpdate, 
			height, 
			waistCircumference, 
			vitaminD2, 
			vitaminD3
			FROM health_data hd
			WHERE 
			UserID = ? ORDER BY CreatedAt Desc limit 1`,
			[userId]
		);
		
		//console.log(results);
		
		if(0){ // 0 to skip chatgpt call
			
			const messages = 'Give me a json response in the format {score: <50> , description: <description> , lastUpdate: <lastUpdate>} in percentage based on the following parameters:  ' + JSON.stringify(results);
			
			
			
			// Call OpenAI API
			const chatCompletion = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [{"role": "user", "content": messages}],
			});
			//console.log(chatCompletion.choices[0].message);
			
			// Send OpenAI's response back to the client
			res.json(chatCompletion.choices[0].message.content)
			}else{
			res.json(' { "score": 40,  "description": "Fair - You need more activity and sleep.  this is dummy data",  "lastUpdate": "2025-01-05T15:25:43.000Z"}')
		}
		
		
		
		
		} catch (error) {
		console.error('Error calculating health score:', error);
		res.status(500).json({ error: 'An error occurred while calculating health score' });
	}
});

// Function to perform OCR on an image
async function performOCR(filePath) {
	const worker = await createWorker("eng");

	
	const { data: { text } } = await worker.recognize(filePath);
	await worker.terminate();
	return text;
  }
  
app.post('/import-file', upload.single('file'), async (req, res) => {
	try {
	  if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	  }
  
	  const { originalname, buffer } = req.file;
	  const { UserID } = req.body;
  
	  if (!UserID) {
		return res.status(400).json({ error: 'UserID is required' });
	  }
  
	  const fileType = await fileTypeFromBuffer(buffer);
	  if (!fileType || !['csv', 'xlsx', 'xls', 'pdf', 'jpg', 'jpeg', 'png'].includes(fileType.ext)) {
		return res.status(400).json({ error: 'Invalid file type. Only CSV, Excel, PDF, JPG, and PNG files are allowed.' });
	  }
  
	  // Generate a unique filename
	  const uniqueFilename = `${crypto.randomBytes(16).toString('hex')}-${originalname}`;
	  const filePath = path.join(uploadsFolder, uniqueFilename);
  
	  // Save file to uploads folder
	  fs.writeFileSync(filePath, buffer);
  
	  const base64Data = buffer.toString('base64');
  
	  let ocrText = null;
	  if (['jpg', 'jpeg', 'png'].includes(fileType.ext)) {
		ocrText = await performOCR(filePath);
	  }
  
	  const [result] = await pool.execute(
		`INSERT INTO data_upload (UserID, filename, data, file_type, file_path, ocr_text) VALUES (?, ?, ?, ?, ?, ?)`,
		[UserID, originalname, base64Data, fileType.ext, filePath, ocrText]
	  );
  
	  res.status(201).json({ 
		message: 'File uploaded successfully', 
		id: result.insertId, 
		filePath,
		ocrText: ocrText ? ocrText.substring(0, 100) + '...' : null // Send a preview of OCR text
	  });
	} catch (error) {
	  console.error('Error uploading file:', error);
	  res.status(500).json({ error: 'An error occurred while uploading the file' });
	}
  });

// Serve HTML form
app.get('/', (req, res) => {
	res.sendFile(new URL('./index.html', import.meta.url).pathname);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

