-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS health_database;

-- Use the database
USE health_database;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  UserID VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  Sex ENUM('Male', 'Female', 'Other') NOT NULL,
  DateOfBirth DATE NOT NULL,
  login_attempts INT DEFAULT 0,
  last_login_attempt TIMESTAMP NULL
);

-- Create login history table
CREATE TABLE IF NOT EXISTS login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  UserID VARCHAR(50) NOT NULL,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success BOOLEAN NOT NULL,
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Create health data table
CREATE TABLE IF NOT EXISTS health_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  UserID VARCHAR(50) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  waistCircumference DECIMAL(5,2) NOT NULL,
  bloodPressureSystolic INT NOT NULL,
  bloodPressureDiastolic INT NOT NULL,
  fastingBloodGlucose INT NOT NULL,
  hdlCholesterol INT NOT NULL,
  triglycerides INT NOT NULL,
  vitaminD2 DECIMAL(5,2) NOT NULL,
  vitaminD3 DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Create biomarkers table
CREATE TABLE IF NOT EXISTS biomarkers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  biomarker_id INT NOT NULL,
  range_from DECIMAL(10, 2) NOT NULL,
  range_to DECIMAL(10, 2) NOT NULL,
  type ENUM('supplement', 'activity', 'action', 'keto', 'paleo', 'carnivore') NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (biomarker_id) REFERENCES biomarkers(id)
);

-- Create data upload table
CREATE TABLE IF NOT EXISTS data_upload (
  id INT AUTO_INCREMENT PRIMARY KEY,
  UserID VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  data LONGTEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  ocr_text TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserID) REFERENCES users(UserID)
);

-- Insert initial biomarkers data
INSERT INTO biomarkers (name, description) VALUES
('height', 'The vertical measurement of an individual from feet to top of the head, typically measured in centimeters or inches.'),
('weight', 'The measure of body mass, typically in kilograms or pounds.'),
('waistCircumference', 'The measurement around the abdomen at the level of the belly button, often used as an indicator of abdominal fat.'),
('bloodPressureSystolic', 'The pressure in blood vessels when the heart beats, measured in mmHg.'),
('bloodPressureDiastolic', 'The pressure in blood vessels when the heart rests between beats, measured in mmHg.'),
('fastingBloodGlucose', 'The level of glucose in the blood after not eating for at least 8 hours, measured in mg/dL or mmol/L.'),
('hdlCholesterol', 'High-density lipoprotein cholesterol, often called "good" cholesterol, measured in mg/dL or mmol/L.'),
('triglycerides', 'A type of fat in the blood, measured in mg/dL or mmol/L.'),
('vitaminD2', 'A form of vitamin D that comes from plant sources and supplements, measured in ng/mL or nmol/L.'),
('vitaminD3', 'A form of vitamin D that is produced by the body when exposed to sunlight, measured in ng/mL or nmol/L.');

-- Insert initial recommendations data
INSERT INTO recommendations (biomarker_id, range_from, range_to, type, description) VALUES
-- Weight recommendations (assuming biomarker_id 2 for weight)
(2, 0, 18.5, 'activity', 'Increase calorie intake and consider strength training to build muscle mass.'),
(2, 18.5, 24.9, 'action', 'Maintain current diet and exercise routine.'),
(2, 25, 29.9, 'activity', 'Increase physical activity and consider reducing calorie intake.'),
(2, 30, 100, 'action', 'Consult with a healthcare professional about a weight loss plan.'),

-- Blood pressure recommendations (systolic, assuming biomarker_id 4)
(4, 0, 120, 'action', 'Maintain healthy lifestyle with regular exercise and balanced diet.'),
(4, 120, 129, 'activity', 'Increase physical activity and consider reducing sodium intake.'),
(4, 130, 139, 'action', 'Adopt DASH diet (Dietary Approaches to Stop Hypertension) and limit alcohol.'),
(4, 140, 180, 'supplement', 'Consult healthcare provider about supplements like CoQ10, magnesium, and potassium.'),
(4, 180, 300, 'action', 'Seek immediate medical attention.'),

-- Blood pressure recommendations (diastolic, assuming biomarker_id 5)
(5, 0, 80, 'action', 'Maintain healthy lifestyle with regular exercise and balanced diet.'),
(5, 80, 89, 'activity', 'Increase physical activity and consider reducing sodium intake.'),
(5, 90, 120, 'action', 'Adopt DASH diet and limit alcohol. Consult healthcare provider.'),
(5, 120, 200, 'action', 'Seek immediate medical attention.'),

-- Fasting blood glucose recommendations (assuming biomarker_id 6)
(6, 0, 99, 'action', 'Maintain current diet and exercise routine.'),
(6, 100, 125, 'activity', 'Increase physical activity and reduce simple carbohydrate intake.'),
(6, 126, 200, 'keto', 'Consider a ketogenic diet to help regulate blood glucose levels.'),
(6, 200, 500, 'action', 'Consult with a healthcare professional immediately.'),

-- HDL cholesterol recommendations (assuming biomarker_id 7)
(7, 0, 40, 'supplement', 'Consider taking omega-3 supplements to increase HDL levels.'),
(7, 40, 60, 'action', 'Maintain current diet and exercise routine.'),
(7, 60, 100, 'activity', 'Continue with current lifestyle as HDL levels are optimal.'),

-- Triglycerides recommendations (assuming biomarker_id 8)
(8, 0, 150, 'action', 'Maintain current diet and exercise routine.'),
(8, 150, 199, 'activity', 'Increase physical activity and reduce sugar intake.'),
(8, 200, 499, 'paleo', 'Consider a paleo diet to reduce triglyceride levels.'),
(8, 500, 1000, 'action', 'Consult with a healthcare professional about medication options.'),

-- Vitamin D2 recommendations (assuming biomarker_id 9)
(9, 0, 20, 'supplement', 'Consider vitamin D2 supplementation after consulting with a doctor.'),
(9, 20, 50, 'action', 'Maintain current supplementation if any.'),
(9, 50, 100, 'action', 'Maintain current levels but avoid excessive supplementation.'),

-- Vitamin D3 recommendations (assuming biomarker_id 10)
(10, 0, 20, 'supplement', 'Consider vitamin D3 supplementation and increased sun exposure.'),
(10, 20, 50, 'action', 'Maintain current sun exposure and supplementation if any.'),
(10, 50, 100, 'action', 'Maintain current levels but avoid excessive supplementation.');

-- Create an admin user (password: admin123)
-- Note: In production, use a secure password and bcrypt to hash it
INSERT INTO users (UserID, name, password, Sex, DateOfBirth) VALUES
('admin', 'Administrator', '$2b$10$rPQcnGNJ.Ua0nL4QQvRV7.jHwkRMCVKNXKNNK0vFmDGYPRTTXUMXe', 'Other', '1990-01-01');
