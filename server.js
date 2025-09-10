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
import gm from "gm";
import pdfParse from "pdf-parse";

dotenv.config();

// ...existing code...

// Import recommendation route
import recommendationRouter from './routes/recommendation.js';
import digitalJourneyRouter, { assignDigitalPlanForUser } from './routes/digitalJourney.js';
import providerNetworkRouter, { assignExpertiseTypesForUser } from './routes/providerNetwork.js';
import userScoresRouter, { calculateAndStoreUserScores } from './routes/userScores.js';

const app = express();
const port = process.env.PORT || 3000;

// Serve static images for products (must be after app is initialized)
app.use('/images', express.static(path.join(process.cwd(), 'images')));

// enabling CORS for some specific origins only.
let corsOptions = {
	origin: ['http://localhost:3000', 'https://metabolicpoint.insolutionsoftware.co.uk'],
}


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
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Mount the recommendation API
app.use('/recommendation', recommendationRouter);

// Mount digital journey and provider network APIs
app.use('/digital-journey', digitalJourneyRouter);
app.use('/provider-network', providerNetworkRouter);

// Mount user scores API
app.use('/user-scores', userScoresRouter);

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
	queueLimit: 0,
	ssl: {
		rejectUnauthorized: false
	}
});

// Route to handle user registration
app.post("/register-user", async (req, res) => {
	try {
		const { email, name, password } = req.body

		//{"name":"Tester","email":"test@example.com","password":"password","confirmPassword":"password"}

		if (!email || !name || !password) {
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
			`INSERT INTO users (UserID, name, password, DateOfBirth, Sex) VALUES (?, ?, ?, '1990-01-01', 'Other')`,
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
		const { userId, sex, dateOfBirth, action } = req.body;

		if (action == 'add') {
			const [result] = await pool.execute(
				`INSERT INTO users (UserID, Sex, DateOfBirth) VALUES (?, ?, ?)`,
				[userId, sex, dateOfBirth]
			);
		} else {

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
app.post('/submit-health-data', verifyToken, async (req, res) => {
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
			// vitaminD2,
			// vitaminD3
		} = req.body;

		const [result] = await pool.execute(
			`INSERT INTO health_data 
			(UserID, height, weight, waistCircumference, bloodPressureSystolic, 
			bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[UserID, height, weight, waistCircumference, bloodPressureSystolic,
				bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides]
		);

		res.status(201).json({ message: 'Health data submitted successfully', id: result.insertId });
	} catch (error) {
		console.error('Error submitting health data:', error);
		res.status(500).json({ error: 'An error occurred while submitting health data' });
	}
});

// Endpoint to get average health metrics
app.get('/average-health-metrics', verifyToken, async (req, res) => {
	try {
		var { age, sex } = req.query;

		// Validate input
		if (!age || !sex ) {

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
		}



		// Convert age and weight to numbers and apply some basic validation
		const ageNum = parseInt(age, 10);

		if (isNaN(ageNum) || ageNum <= 0) {
			return res.status(400).json({ error: 'Invalid age' });
		}

		const [results] = await pool.execute(
			`
			SELECT
				weight					as weight,
				height					as height,
				waist					as waistCircumference,
				BP_Systolic 			as bloodPressureSystolic,
				BP_Diastolic			as bloodPressureDiastolic,
				Fasting_Blood_Glucose 	as fastingBloodGlucose,
				HDL_Cholesterol			as hdlCholesterol,
				Triglycerides			as triglycerides
			FROM average_health_data
			WHERE 	
					sex = ? AND
					age_from <= ? AND
					age_to >= ?
			`,
			[(sex == 'male' ? 0:1) ,ageNum,ageNum]
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
		const { userId, waistHeightRatio } = req.query;

		// Validate input
		if (!userId) {
			return res.status(400).json({ error: 'Missing required parameters: userId' });
		}

		//console.log(waistHeightRatio)

		let query = waistHeightRatio === '0' ?
			`SELECT 
			height, 
			Weight as weight, 
			waistCircumference,
			BloodPressureSystolic as bloodPressureSystolic, 
			BloodPressureDiastolic as bloodPressureDiastolic, 
			FastingBloodGlucose as fastingBloodGlucose, 
			HDLCholesterol as hdlCholesterol, 
			Triglycerides as triglycerides, 
			CreatedAt as lastUpdate
		
			FROM health_data hd
			WHERE 
			UserID = ? ORDER BY CreatedAt DESC LIMIT 1`
			:
			`SELECT 
			height, 
			Weight as weight, 
			ROUND(waistCircumference/height,2)  as waistCircumference,
			BloodPressureSystolic as bloodPressureSystolic, 
			BloodPressureDiastolic as bloodPressureDiastolic, 
			FastingBloodGlucose as fastingBloodGlucose, 
			HDLCholesterol as hdlCholesterol, 
			Triglycerides as triglycerides, 
			CreatedAt as lastUpdate
		
			FROM health_data hd
			WHERE 
			UserID = ? ORDER BY CreatedAt DESC LIMIT 1`;

		const [results] = await pool.execute(query, [userId]);

		if (results.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		//waistCircumference is recalculated to waistHeightRatio

		res.json(results[0]);
	} catch (error) {
		console.error('Error fetching data:', error);
		res.status(500).json({ error: 'An error occurred while fetching data' });
	}
});

// Endpoint to get user health data history
app.get('/get-health-history', verifyToken, async (req, res) => {
	try {
		const { userId, parameter } = req.query;

		// Validate input
		if (!userId || !parameter) {
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
			ROUND(waistCircumference/height,2)  as waistCircumference,
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
		const { userId } = req.query;

		// Validate input
		if (!userId) {
			return res.status(400).json({ error: 'Missing required parameters: userId' });
		}


		//const userId = 'test@example.com';
		const [results0] = await pool.execute(
			`SELECT 
			UserID as userId ,DateOfBirth as dateOfBirth, Sex as sex
			FROM users u
			WHERE 
			u.UserID = ?`,
			[userId]
		);

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



		//console.log(process.env.ENABLE_OPENAI_SCORE);

		if (process.env.ENABLE_OPENAI_SCORE == 'true') { // 0 to skip chatgpt call

			const messages = `Give me a json response in the format {score: <50>, description: <description>, lastUpdate: <lastUpdate>, bmi: ${calculatedBMI} } in percentage based on the following parameters: ` + JSON.stringify(results);


			// Call OpenAI API
			const chatCompletion = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [{ "role": "user", "content": messages }],
			});
			//console.log(chatCompletion.choices[0].message);

			// Send OpenAI's response back to the client
			res.json(chatCompletion.choices[0].message.content)
		} else {
			// Use the shared score calculation function
			const healthDataForScoring = {
				UserID: userId,
				fastingBloodGlucose: results[0].fastingBloodGlucose,
				hdlCholesterol: results[0].hdlCholesterol,
				triglycerides: results[0].triglycerides,
				height: results[0].height,
				weight: results[0].weight,
				waistCircumference: results[0].waistCircumference,
				bloodPressureSystolic: results[0].bloodPressureSystolic,
				bloodPressureDiastolic: results[0].bloodPressureDiastolic
			};

			const scoreResult = await calculateAndStoreUserScores(userId, healthDataForScoring);

			let totalScore = scoreResult.parameterScores;
			totalScore.lastUpdate = results[0].lastUpdate;
			totalScore.bmi = calculatedBMI;

			//return dummy data
			// console.log(totalScore)
			res.json(totalScore)

			// 			//return dummy data
			// 			res.json(` { "score": ${totalScore},  "description": "Fair - You need more activity and sleep.  this is dummy data",  "lastUpdate": "2025-01-05T15:25:43.000Z" , "bmi": "${calculatedBMI}" , 
			// 				 "activity_recommendations": [
			//     {
			//       "name": "Morning Yoga",
			//       "description": "Start your day with 20-30 minutes of yoga to improve flexibility, reduce stress, and enhance mindfulness.",
			//       "frequency": "Daily"
			//     },
			//     {
			//       "name": "Strength Training",
			//       "description": "Engage in resistance exercises to build muscle and improve bone density. Focus on compound movements like squats, deadlifts, and bench presses.",
			//       "frequency": "2-3 times per week"
			//     },
			//     {
			//       "name": "Outdoor Walking or Hiking",
			//       "description": "Spend time outdoors walking or hiking to boost cardiovascular health, mood, and Vitamin D levels.",
			//       "frequency": "3-5 times per week"
			//     }
			//   ],
			//   "health_supplements": [
			//     {
			//       "name": "Vitamin D3",
			//       "benefits": "Supports bone health, immune system, and mood regulation.",
			//       "recommended_dosage": "1000-2000 IU daily or as recommended by a healthcare professional"
			//     },
			//     {
			//       "name": "Omega-3 Fatty Acids (Fish Oil)",
			//       "benefits": "Improves heart health, brain function, and reduces inflammation.",
			//       "recommended_dosage": "1000-2000 mg of EPA and DHA daily"
			//     },
			//     {
			//       "name": "Magnesium",
			//       "benefits": "Promotes muscle recovery, improves sleep quality, and supports energy production.",
			//       "recommended_dosage": "300-400 mg daily, preferably in citrate or glycinate form"
			//     }
			//   ]}`)

		} // end else for if ENABLE_OPENAI_SCORE
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

// Function to convert PDF to JPG using GraphicsMagick
function convertPDFtoJPG(pdfPath, outputPath) {
	return new Promise((resolve, reject) => {
		gm(pdfPath + "[0]")
			.density(300, 300)
			.quality(100)
			.resize(2480, 3508)
			.write(outputPath, (err) => {
				if (err) {
					reject(err)
				} else {
					resolve(outputPath)
				}
			})
	})
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
		let processedFilePath = filePath;



		if (fileType.ext === "pdf") {
			// // Convert PDF to JPG
			// const jpgOutputPath = path.join(uploadsFolder, `${path.parse(uniqueFilename).name}.jpg`)
			// processedFilePath = await convertPDFtoJPG(filePath, jpgOutputPath)

			// Extract text from PDF locally
			const dataBuffer = fs.readFileSync(filePath);

			const pdfData = await pdfParse(dataBuffer);
			ocrText = pdfData.text;


		}

		if (["jpg", "jpeg", "png"].includes(fileType.ext)) {
			ocrText = await performOCR(processedFilePath)
		}

		//console.log(ocrText)

		//perform data extraction using ai - 
		let json_results;

		if (process.env.ENABLE_OPENAI_DATA_EXTRACTION == 'true') {
			console.log('ENABLE_OPENAI_DATA_EXTRACTION')
			//using assistant
			try {

				if (req.file.size > 20 * 1024 * 1024) {
					return res.status(400).json({ error: "File too large. Maximum size is 20MB." });
				}


				//  const extractedText = ocrText.substring(0, 2500)
				const extractedText = ocrText


				// Use GPT-4 Turbo for text-based PDFs
				const extractResponse = await openai.chat.completions.create({
					model: "gpt-4o", //gpt-3.5-turbo gpt-4o
					messages: [
						{
							role: "system", content: `extract the relevant data from the content and the following a json string with the correct values where "Fasting Blood Glucose" equals "Blood Glucose".  If no data is found return 0 for that parameter.  Return a properly formated JSON string that can be parsed in a format like '{
  "Collection Date": "24/06/2023 08:49 PM",
  "Report Date": "24/06/2023 09:02 PM",
  "Total Cholesterol":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "Triglycerides level":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "HDL Cholesterol":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "LDL Cholesterol":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "VLDL Cholesterol":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "LDL/HDL RATIO":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "Total Cholesterol/HDL RATIO":  {
    "Value": 8.79,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  },
  "Blood Glucose": {
			"Value": 80,
			"Unit": "mg/dL",
			"Reference Range": "60-80 mg/dL"
		},
"Fasting Insulin": {
    "Value": 0,
    "Unit": "µU/mL",
    "Reference Range": "<25"
  }
}'  ` },
						{ role: "user", content: extractedText }
					],
				})


				//console.log('open ai',extractResponse)
				if (extractResponse.code === 'insufficient_quota') {
					return res.status(429).json({ error: "Insufficient quota. Please try again later." });
				}




				//res.json({ extracted_info: extractResponse.choices[0].message.content });

				json_results = extractResponse.choices[0].message.content
				//console.log(json_results)

			} catch (error) {

				console.error('OpenAI API Error:', error);

				// Handle insufficient quota error
				if (error.status === 429) {
					return res.status(429).json({ error: 'Insufficient quota. Please check your OpenAI account limits.' });
				}

				// General error response
				return res.status(500).json({ error: 'Something went wrong. Please try again later.' });


			}


			//using only text
			// 		const messages = `return a JSON file like {
			//   "Collection Date": "24/06/2023 08:49 PM",
			//   "Report Date": "24/06/2023 09:02 PM",
			//   "Total Cholesterol":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "Triglycerides level":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "HDL Cholesterol":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "LDL Cholesterol":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "VLDL Cholesterol":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "LDL/HDL RATIO":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "Total Cholesterol/HDL RATIO":  {
			//     "Value": 8.79,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   },
			//   "Fasting Blood Glucose": {
			// 			"Value": 80,
			// 			"Unit": "mg/dL",
			// 			"Reference Range": "60-80 mg/dL"
			// 		},
			// "Fasting Insulin": {
			//     "Value": 0,
			//     "Unit": "µU/mL",
			//     "Reference Range": "<25"
			//   }
			// } from the following free text : ` + ocrText;


			// 			// Call OpenAI API
			// 			const chatCompletion = await openai.chat.completions.create({
			// 				model: "gpt-3.5-turbo",
			// 				messages: [{"role": "user", "content": messages}],
			// 			});

			// 			json_results = chatCompletion.choices[0].message.content;

		} else {
			console.log('dummy data')
			json_results = `{
		"Collection Date": "June 24, 2023, 08:49 PM",
		"Report Date": "June 24, 2023, 09:02 PM",
		"Total Cholesterol": {
			"Value": 156,
			"Unit": "mg/dL",
			"Reference Range": "0-200 mg/dL"
		},
		"Triglycerides level": {
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
			"Value": 181.00,
			"Unit": "mg/dL",
			"Reference Range": "0-100 mg/dL"
		},
		"Blood Glucose": {
			"Value": 180,
			"Unit": "mg/dL",
			"Reference Range": "60-80 mg/dL"
		},
		"Fasting Insulin": {
			"Value": 18.79,
			"Unit": "µU/mL",
			"Reference Range": "<25"
		}
		}
		`;
		}

		const [result] = await pool.execute(
			// `INSERT INTO data_upload (UserID, filename, data, file_type, file_path, ocr_text) VALUES (?, ?, ?, ?, ?, ?)`,
			// [UserID, originalname, base64Data, fileType.ext, filePath, ocrText]

			`INSERT INTO data_upload (UserID, filename, data, file_type, file_path, ocr_text) VALUES (?, ?, ?, ?, ?, ?)`,
			[UserID, originalname, json_results, fileType.ext, filePath, ocrText]
		);


		//get users prev data 
		const [results2] = await pool.execute(
			`SELECT 
		Weight as weight, 
		BloodPressureSystolic as bloodPressureSystolic, 
		BloodPressureDiastolic as bloodPressureDiastolic, 
		height, 
		waistCircumference
		FROM health_data hd
		WHERE 
		UserID = ? ORDER BY CreatedAt Desc limit 1`,
			[UserID]
		);

		//insert data ocr data into db
		//   const [result2] = await pool.execute(
		// 	`INSERT INTO health_data 
		// 	(UserID, height, weight, waistCircumference, bloodPressureSystolic, 
		// 	bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides, vitaminD2, vitaminD3) 
		// 	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		// 	[UserID, height, weight, waistCircumference, bloodPressureSystolic,
		// 	bloodPressureDiastolic, fastingBloodGlucose, hdlCholesterol, triglycerides, vitaminD2, vitaminD3]
		// ); 

		//const jsonData = JSON.parse(json_results);
		var rawJson = json_results
  						.replace(/^'+|'+$/g, '')            // remove outer single quotes
  						.replace(/^```json|```$/g, '')      // remove markdown code block
  						.replace(/\\n/g, '')                // remove \n line breaks
  						.replace(/\\"/g, '"');  

		const jsonData = JSON.parse(rawJson);  //remove any post and pre text from {...} openAI adding ```json ..... ```

		const json_results_template = {
			"Collection Date": "",
			"Report Date": "",
			"Total Cholesterol": {
				"Value": 0,
				"Unit": "mg/dL",
				"Reference Range": "0-200 mg/dL"
			},
			"Triglycerides level": {
				"Value": 0,
				"Unit": "mg/dL",
				"Reference Range": "0-170 mg/dL"
			},
			"HDL Cholesterol": {
				"Value": 0,
				"Unit": "mg/dL",
				"Reference Range": "40-70 mg/dL"
			},
			"LDL Cholesterol": {
				"Value": 0,
				"Unit": "mg/dL",
				"Reference Range": "0-100 mg/dL"
			},
			"Blood Glucose": {
				"Value": 0,
				"Unit": "mg/dL",
				"Reference Range": "60-80 mg/dL"
			},
			"Fasting Insulin": {
				"Value": 0,
				"Unit": "µU/mL",
				"Reference Range": "<25"
			}
		}
			;

		const combinedData = { ...json_results_template, ...jsonData };

		// Insert data into health_data table
		const [result3] = await pool.execute(
			`INSERT INTO health_data 
		(UserID, fastingBloodGlucose, hdlCholesterol, triglycerides, height, weight, waistCircumference, bloodPressureSystolic, bloodPressureDiastolic) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[UserID, combinedData["Blood Glucose"].Value, combinedData["HDL Cholesterol"].Value, combinedData["Triglycerides level"].Value, results2[0].height, results2[0].weight, results2[0].waistCircumference, results2[0].bloodPressureSystolic, results2[0].bloodPressureDiastolic]
		);

		// Calculate and store biomarker scores after inserting health data
		const healthDataForScoring = {
			UserID,
			fastingBloodGlucose: combinedData["Blood Glucose"].Value,
			hdlCholesterol: combinedData["HDL Cholesterol"].Value,
			triglycerides: combinedData["Triglycerides level"].Value,
			height: results2[0].height,
			weight: results2[0].weight,
			waistCircumference: results2[0].waistCircumference,
			bloodPressureSystolic: results2[0].bloodPressureSystolic,
			bloodPressureDiastolic: results2[0].bloodPressureDiastolic
		};

		// Use the shared score calculation function
		const scoreResult = await calculateAndStoreUserScores(UserID, healthDataForScoring, combinedData);

		// Automatically assign digital journey plan based on biomarker scores
		console.log('Assigning digital journey plan for user:', UserID, 'with scores:', scoreResult.biomarkerScores);
		try {
			const planId = await assignDigitalPlanForUser(UserID, scoreResult.biomarkerScores);
			console.log('Digital journey plan assigned:', planId);
		} catch (error) {
			console.error('Error assigning digital journey plan:', error);
			// Don't fail the file upload if digital journey assignment fails
		}

		// Automatically assign expertise types based on biomarker scores
		console.log('Assigning expertise types for user:', UserID, 'with scores:', scoreResult.biomarkerScores);
		try {
			const expertiseTypes = await assignExpertiseTypesForUser(UserID, scoreResult.biomarkerScores);
			console.log('Expertise types assigned:', expertiseTypes);
		} catch (error) {
			console.error('Error assigning expertise types:', error);
			// Don't fail the file upload if expertise assignment fails
		}

		res.status(201).json({
			message: 'File uploaded successfully',
			id: result.insertId,
			filePath,
			//ocrText: ocrText ? ocrText.substring(0, 100) + '...' : null // Send a preview of OCR text
			ocrText: JSON.stringify(combinedData),
			generalHealthScore: scoreResult.centralHealthScore,
			biomarkerScores: scoreResult.biomarkerScores
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
			user: { id: user.UserID, email: user.UserID, name: user.name, sex: user.Sex },
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
		const { userId } = req.query;

		// Validate input
		if (!userId) {
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
			ROUND(waistCircumference/height,2)  as waistCircumference,
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
			 JOIN biomarkers b ON r.biomarker_id = b.id WHERE r.type != 'supplement'`
		);

		let recommendations;

		if (userId != 'all') {

			recommendations = results.map(result => {
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

		} else {
			recommendations = results;
		}


		const mytemp = recommendations.map(result => ({
			title: userId !== 'all' ? `Your ${result.biomarker_name === 'waistCircumference' ? 'Waist Height Ratio' : result.biomarker_name} is between ${result.range_from} - ${result.range_to}` : `${result.biomarker_name}`,
			description: `${result.description}`,
			linkText: "Go",
			icon: result.type === 'supplement' ? "PillIcon" : result.type === 'paleo' ? "LeafIcon" : result.type === 'carnivore' ? "MeatIcon" : result.type === 'activity' ? "TargetIcon" : "PlayIcon",
			iconColor: result.type === 'supplement' ? "blue" : result.type === 'paleo' ? "green" : result.type === 'carnivore' ? "red" : result.type === 'activity' ? "orange" : "purple"
		}));


		//console.log(mytemp, health_data[0] )

		//res.json({temp});
		res.json(mytemp);
	} catch (error) {
		res.status(401).json({ message: 'Error getting recommendations' });
	}
});

// Route to handle health score submission
app.get('/get-reco-products', verifyToken, async (req, res) => {
	try {
		const { userId } = req.query;

		// Validate input
		if (!userId) {
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
			 JOIN biomarkers b ON r.biomarker_id = b.id WHERE r.type = 'supplement'`
		);

		let recommendations;

		if (userId != 'all') {
			recommendations = results.map(result => {
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

		} else {
			recommendations = results;
		}

		const mytemp = recommendations.map(result => ({
			title: `${result.biomarker_name}`,
			description: `${result.description}`,
			price: "$25",
			image: "/images/demo_product.png",
			buttonText: "Buy",
		}));



		//console.log(mytemp, health_data[0] )

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

