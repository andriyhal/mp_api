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
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

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

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]

  if (!token) {
    return res.status(403).json({ error: "No token provided" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    req.userId = decoded.id
    next()
  })
}

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
app.post("/register-user", async (req, res) => {
	try {
	  const { email, name, password } = req.body

	  //{"name":"Tester","email":"test@example.com","password":"password","confirmPassword":"password"}
  
	  if (!email || !name || !password ) {
		return res.status(400).json({ error: "All fields are required" })
	  }
  
	  // Check for duplicate email
	  const [duplicateCheck] = await pool.execute(
		`SELECT * FROM users WHERE UserID = ?`,
		[email],
	  );
  
	  if (duplicateCheck.length > 0) {
		return res.status(409).json({ error: "Email already exists" });
	  }
  
	  const hashedPassword = await bcrypt.hash(password, 10)
  
	  const [result] = await pool.execute(
		`INSERT INTO users (UserID, name, password) VALUES (?, ?, ?)`,
		[email, name, hashedPassword],
	  )
  
	  res.status(201).json({ message: "User registered successfully", id: result.insertId })
	} catch (error) {
	  console.error("Error registering user:", error)
	  res.status(500).json({ error: "An error occurred while registering user" })
	}
  })

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
app.post('/submit-health-data' , verifyToken, async (req, res) => {
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
app.get('/average-health-metrics', verifyToken , async (req, res) => {
	try {
		var { age, sex, weight } = req.query;
		
		
		
		// Validate input
		if (!age || !sex || !weight) {

			const decodedToken = jwt.verify(req.headers['authorization'].split(' ')[1], process.env.JWT_SECRET);
			const userId = decodedToken.email;

			if (!age || !sex) {
				const [userResults] = await pool.execute(
					`SELECT DateOfBirth, Sex FROM users WHERE UserID = ?`,
					[userId]
				);
				if (userResults.length > 0) {
					const user = userResults[0];
					if (!age) {
						age = new Date().getFullYear() - new Date(user.DateOfBirth).getFullYear();
					}
					if (!sex) {
						sex = user.Sex;
					}
				}
			}
			if (!weight) {
				const [weightResults] = await pool.execute(
					`SELECT weight FROM health_data WHERE UserID = ? ORDER BY CreatedAt DESC LIMIT 1`,
					[userId]
				);
				if (weightResults.length > 0) {
					weight = weightResults[0].weight;
				}
			}
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
			AVG(hd.bloodPressureSystolic)  	as bloodPressureSystolic,
			AVG(hd.bloodPressureDiastolic) 	as bloodPressureDiastolic,
			AVG(hd.fastingBloodGlucose) 	as fastingBloodGlucose, 
			AVG(hd.hdlCholesterol) 			as hdlCholesterol,  
			AVG(hd.triglycerides) 			as triglycerides,       
			AVG(hd.vitaminD2) 				as vitaminD2,        
			AVG(hd.vitaminD3) 				as vitaminD3            
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
app.get('/get-user-profile', verifyToken, async (req, res) => {
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
app.get('/get-health-data', verifyToken, async (req, res) => {
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
		
		if (results.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" })
		}
		
		res.json(results[0]);
		} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data' });
	}
});

// Endpoint to get user health data history
app.get('/get-health-history', verifyToken, async (req, res) => {
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
app.get('/calc-health-score', verifyToken, async (req, res) => {
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

		
		const heightInMeters = Number(results[0].height) / 100;
		const calculatedBMI = (Number(results[0].weight) / (heightInMeters * heightInMeters)).toFixed(1);
		
		
		
		//console.log(results);
		
		if(0){ // 0 to skip chatgpt call
			
			const messages = `Give me a json response in the format {score: <50>, description: <description>, lastUpdate: <lastUpdate>, bmi: ${calculatedBMI} } in percentage based on the following parameters: ` + JSON.stringify(results);
			
			
			// Call OpenAI API
			const chatCompletion = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: [{"role": "user", "content": messages}],
			});
			//console.log(chatCompletion.choices[0].message);
			
			// Send OpenAI's response back to the client
			res.json(chatCompletion.choices[0].message.content)
		}else{
			//calculate score from excel formula
			
const scoreTables = {
	'Height (cm)': [
	  { range: [150, 200], score: 100 }, // Normal height range
	  { range: '<150', score: 70 },
	  { range: '>200', score: 80 }
	],
	'Weight (kg)': [
	  { range: [50, 90], score: 100 },
	  { range: [91, 120], score: 70 },
	  { range: '>120', score: 40 }
	],
	'Waist Circumference (inches)': [  //Waist Height Ratio
	  { range: [0.4, 0.49], score: 90 },
	  { range: [0.5, 0.54], score: 80 },
	  { range: [0.55, 0.59], score: 50 },
	  { range: [0.6, 0.69], score:  20},
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
	'HDL Cholesterol (mg/dL)': [
	  { range: [50, 59], score: 90 },
	  { range: [40, 49], score: 80 },
	  { range: [30, 39], score: 60 },
	  { range: '>60', score: 100 },
	  { range: '<30', score: 40  }
	],
	'Triglycerides (mg/dL)': [
	  { range: [80, 99], score: 90 },
	  { range: [100, 149], score: 80 },
	  { range: [150, 199], score: 60 },
	  { range: [200, 299], score: 40 },
	  { range: '<80', score: 100 },
	  { range: '>300', score: 20 }
	],
	'25-Hydroxyvitamin D2 (nmol/L)': [
	  { range: [50, 150], score: 100 },
	  { range: '<50', score: 20 },
	  { range: '>150', score: 20 }
	],
	'25-Hydroxyvitamin D3 (nmol/L)': [
	  { range: [50, 150], score: 100 },
	  { range: '<50', score: 20 },
	  { range: '>150', score: 20 }
	]
  };
  
  const parameters = [
	{ value: 'height', label: 'Height (cm)' },
	{ value: 'weight', label: 'Weight (kg)' },
	{ value: 'waistCircumference', label: 'Waist Circumference (inches)' },
	{ value: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)' },
	{ value: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)' },
	{ value: 'fastingBloodGlucose', label: 'Fasting Blood Glucose (mg/dL)' },
	{ value: 'hdlCholesterol', label: 'HDL Cholesterol (mg/dL)' },
	{ value: 'triglycerides', label: 'Triglycerides (mg/dL)' },
	{ value: 'vitaminD2', label: '25-Hydroxyvitamin D2 (nmol/L)' },
	{ value: 'vitaminD3', label: '25-Hydroxyvitamin D3 (nmol/L)' }
  ];
  
  
  
  function calcScore(value, table) {
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
	return 0; // Return 0 if no range matched
  }
  
  function calculateTotalScore(parameterValues) {
	let totalScore = 0;
  
	for (const parameter of parameters) {
	  const label = parameter.label;
	  const value = parameterValues[label]; // Get the value for this parameter
	  const table = scoreTables[label]; // Get the corresponding score table
  
	  if (value !== undefined && table) {
		totalScore += calcScore(value, table);
	  }
	}
  
	return totalScore/parameters.length;
  }

  const parameterValues = {
	'Height (cm)':                    Number(results[0].height),
	'Weight (kg)':                    results[0].weight,
	'Waist Circumference (inches)':   results[0].waistCircumference/Number(results[0].height),
	'Blood Pressure (Systolic)':      results[0].bloodPressureSystolic,
	'Blood Pressure (Diastolic)':     results[0].bloodPressureDiastolic,
	'Fasting Blood Glucose (mg/dL)':  results[0].fastingBloodGlucose,
	'HDL Cholesterol (mg/dL)':        results[0].hdlCholesterol,
	'Triglycerides (mg/dL)':          results[0].triglycerides,
	'25-Hydroxyvitamin D2 (nmol/L)':  results[0].vitaminD2,
	'25-Hydroxyvitamin D3 (nmol/L)':  results[0].vitaminD3
  };
  
  const totalScore = calculateTotalScore(parameterValues);

			//return dummy data
			res.json(` { "score": ${totalScore},  "description": "Fair - You need more activity and sleep.  this is dummy data",  "lastUpdate": "2025-01-05T15:25:43.000Z" , "bmi": "${calculatedBMI}" , 
				 "activity_recommendations": [
    {
      "name": "Morning Yoga",
      "description": "Start your day with 20-30 minutes of yoga to improve flexibility, reduce stress, and enhance mindfulness.",
      "frequency": "Daily"
    },
    {
      "name": "Strength Training",
      "description": "Engage in resistance exercises to build muscle and improve bone density. Focus on compound movements like squats, deadlifts, and bench presses.",
      "frequency": "2-3 times per week"
    },
    {
      "name": "Outdoor Walking or Hiking",
      "description": "Spend time outdoors walking or hiking to boost cardiovascular health, mood, and Vitamin D levels.",
      "frequency": "3-5 times per week"
    }
  ],
  "health_supplements": [
    {
      "name": "Vitamin D3",
      "benefits": "Supports bone health, immune system, and mood regulation.",
      "recommended_dosage": "1000-2000 IU daily or as recommended by a healthcare professional"
    },
    {
      "name": "Omega-3 Fatty Acids (Fish Oil)",
      "benefits": "Improves heart health, brain function, and reduces inflammation.",
      "recommended_dosage": "1000-2000 mg of EPA and DHA daily"
    },
    {
      "name": "Magnesium",
      "benefits": "Promotes muscle recovery, improves sleep quality, and supports energy production.",
      "recommended_dosage": "300-400 mg daily, preferably in citrate or glycinate form"
    }
  ]}`)
		}
		//console.log(calculatedBMI,results[0].height,results[0].weight)
		
		
		
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
  
app.post('/import-file', verifyToken, upload.single('file'), async (req, res) => {
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
		return res.status(400).json({ error: 'Invalid file type. Only CSV, Excel, PDF, JPG and PNG files are allowed.' });
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
	  
	  //perform data extraction using ai - TODO
	  
	  let json_results = `{
  "Collection Date": "June 24, 2023, 08:49 PM",
  "Report Date": "June 24, 2023, 09:02 PM",
  "Total Cholesterol": {
    "Value": 156,
    "Unit": "mg/dL",
    "Reference Range": "0-200 mg/dL"
  },
  "Triglycerides": {
    "Value": 150,
    "Unit": "mg/dL",
    "Reference Range": "0-170 mg/dL"
  },
  "HDL Cholesterol": {
    "Value": 45,
    "Unit": "mg/dL",
    "Reference Range": "40-70 mg/dL"
  },
  "LDL Cholesterol": {
    "Value": 81.00,
    "Unit": "mg/dL",
    "Reference Range": "0-100 mg/dL"
  },
  "VLDL Cholesterol": {
    "Value": 30.00,
    "Unit": "mg/dL",
    "Reference Range": "6-38 mg/dL"
  }
}
`;
  
	  res.status(201).json({ 
		message: 'File uploaded successfully', 
		id: result.insertId, 
		filePath,
		//ocrText: ocrText ? ocrText.substring(0, 100) + '...' : null // Send a preview of OCR text
		ocrText: json_results ? json_results : null //return results
	  });
	} catch (error) {
	  console.error('Error uploading file:', error);
	  res.status(500).json({ error: 'An error occurred while uploading the file' });
	}
  });

// Endpoint to get all uploaded files for a given UserID (now using POST)
app.post('/get-data-files', verifyToken, async (req, res) => {
	try {
	  const { UserID } = req.body;
  
	  if (!UserID) {
		return res.status(400).json({ error: 'UserID is required' });
	  }
  
	  const [results] = await pool.execute(
		`SELECT id, filename AS fileName, file_type as fileType, uploaded_at as uploadDate 
		 FROM data_upload 
		 WHERE UserID = ? 
		 ORDER BY uploaded_at DESC`,
		[UserID]
	  );
  
	  res.json(results);
	} catch (error) {
	  console.error('Error fetching data files:', error);
	  res.status(500).json({ error: 'An error occurred while fetching data files' });
	}
  });

  // Login handler
app.post('/auth/login', async (req, res) => {
	try {
		const { email, password } = req.body;
	
		if (!email || !password) {
		  return res.status(401).json({ error: 'email and password is required' });
		}

		const UserID = email;
	
		const [results] = await pool.execute(
		  `SELECT 
			*
			FROM users u
			WHERE 
			u.UserID = ?`,
			[UserID]
		);

		if (results.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" })
		  }
	
		//res.json(results);
		console.log(results[0].UserID)

		

		// Validate user credentials (e.g., check against the database)
		// use the following data for testing
		
		//const user = {id : results[0].userId , password : 'pass' , name : 'John Doe' , email : email};

		const user = results[0]

		  // Check if account is locked
		  if (user.login_attempts >= 5 && user.last_login_attempt > Date.now() - 15 * 60 * 1000) {
			return res.status(403).json({ error: "Account is locked. Please try again later." })
		  }

	
	  
		  const isPasswordValid = await bcrypt.compare(password, user.password)
	  
		  if (!isPasswordValid) {
			// Increment login attempts
			await pool.execute(
			  "UPDATE users SET login_attempts = login_attempts + 1, last_login_attempt = CURRENT_TIMESTAMP WHERE UserID = ?",
			  [UserID],
			)
	  
			// Log failed login attempt
			await pool.execute("INSERT INTO login_history (UserID, success) VALUES (?, ?)", [UserID, false])
	  
			return res.status(401).json({ error: "Invalid credentials" })
		  }
	  
		  // Reset login attempts on successful login
		  await pool.execute("UPDATE users SET login_attempts = 0, last_login_attempt = CURRENT_TIMESTAMP WHERE UserID = ?", [
			UserID,
		  ])
	  
		  // Log successful login attempt
		  await pool.execute("INSERT INTO login_history (UserID, success) VALUES (?, ?)", [UserID, true])
	  
	
		// Generate a token
		const token = jwt.sign({ id: user.UserID, email: user.UserID }, process.env.JWT_SECRET, {
		expiresIn: '1h', // Token expiration
		});
	
		res.json({
		token,
		user: { id: user.UserID, email: user.UserID, name: user.name },
		});

	  } catch (error) {
		console.error('Error authentication:', error);
		res.status(500).json({ error: 'An error occurred while authenticating' });
	  }
	
  
	
  });

  app.post('/auth/refresh', (req, res) => {
	const { token } = req.body;
  
	try {
	  // Verify the current token
	  const payload = jwt.verify(token, process.env.JWT_SECRET);
  
	  // Generate a new token
	  const newToken = jwt.sign({ id: payload.id, email: payload.email }, process.env.JWT_SECRET, {
		expiresIn: '1h',
	  });
  
	  res.json({ newToken });
	} catch (error) {
	  res.status(401).json({ message: 'Invalid or expired token' });
	}
  });

  // Route to handle health score submission
app.get('/get-reco-actions', verifyToken, async (req, res) => {
	try {
		const { userId  } = req.query;
		
		// Validate input
		if (!userId  ) {
			return res.status(400).json({ error: 'Missing required parameters: userId' });
		}
		
		
		//const userId = 'test@example.com';
		
		const [health_data] = await pool.execute(
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

		const [results] = await pool.execute(
			`SELECT r.*, b.name as biomarker_name 
			 FROM recommendations r 
			 JOIN biomarkers b ON r.biomarker_id = b.id`
		);

		const recommendations = results.map(result => {
			const healthData = health_data[0];
			const numericHealthData = {
				weight: parseFloat(healthData.weight),
				bloodPressureSystolic: parseFloat(healthData.bloodPressureSystolic),
				bloodPressureDiastolic: parseFloat(healthData.bloodPressureDiastolic),
				fastingBloodGlucose: parseFloat(healthData.fastingBloodGlucose),
				hdlCholesterol: parseFloat(healthData.hdlCholesterol),
				triglycerides: parseFloat(healthData.triglycerides),
				height: parseFloat(healthData.height),
				waistCircumference: parseFloat(healthData.waistCircumference),
				vitaminD2: parseFloat(healthData.vitaminD2),
				vitaminD3: parseFloat(healthData.vitaminD3),
			};

			if (result.biomarker_name === 'weight' && numericHealthData.weight >= result.range_from && numericHealthData.weight <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'bloodPressureSystolic' && numericHealthData.bloodPressureSystolic >= result.range_from && numericHealthData.bloodPressureSystolic <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'bloodPressureDiastolic' && numericHealthData.bloodPressureDiastolic >= result.range_from && numericHealthData.bloodPressureDiastolic <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'fastingBloodGlucose' && numericHealthData.fastingBloodGlucose >= result.range_from && numericHealthData.fastingBloodGlucose <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'hdlCholesterol' && numericHealthData.hdlCholesterol >= result.range_from && numericHealthData.hdlCholesterol <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'triglycerides' && numericHealthData.triglycerides >= result.range_from && numericHealthData.triglycerides <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'height' && numericHealthData.height >= result.range_from && numericHealthData.height <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'waistCircumference' && numericHealthData.waistCircumference >= result.range_from && numericHealthData.waistCircumference <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'vitaminD2' && numericHealthData.vitaminD2 >= result.range_from && numericHealthData.vitaminD2 <= result.range_to) {
				return result;
			} else if (result.biomarker_name === 'vitaminD3' && numericHealthData.vitaminD3 >= result.range_from && numericHealthData.vitaminD3 <= result.range_to) {
				return result;
			}
			return null;
		}).filter(Boolean);

		

		const mytemp = recommendations.map(result => ({
			title: `Your ${result.biomarker_name} is between ${result.range_from} - ${result.range_to}`,
			description: `${result.description}`,
			linkText: "Go",
			icon: result.type === 'supplement' ? "PillIcon" : result.type === 'paleo' ? "LeafIcon" : result.type === 'carnivore' ? "MeatIcon" : result.type === 'activity' ? "TargetIcon" : "PlayIcon",
			iconColor: result.type === 'supplement' ? "blue" : result.type === 'paleo' ? "green" : result.type === 'carnivore' ? "red" : result.type === 'activity' ? "orange" : "purple"
		}));

		console.log(mytemp, health_data[0] )

		//res.json({temp});
		res.json(mytemp);
	} catch (error) {
	  res.status(401).json({ message: 'Error getting recommendations' });
	}
  });

// Serve HTML form
app.get('/', (req, res) => {
	res.sendFile(new URL('./index.html', import.meta.url).pathname);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

