-- Seed data for biomarker_scores table
-- Scores are from 1 to 100, where 100 is best health

-- bloodPressureSystolic (biomarker_id 4)
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
(4, 0, 89, 70), -- Low BP
(4, 90, 120, 100), -- Normal
(4, 121, 130, 90), -- Elevated
(4, 131, 140, 80), -- Hypertension Stage 1
(4, 141, 160, 60), -- Hypertension Stage 2
(4, 161, 300, 40); -- Hypertensive Crisis

-- bloodPressureDiastolic (biomarker_id 5)
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
(5, 0, 59, 70), -- Low BP
(5, 60, 80, 100), -- Normal
(5, 81, 85, 90), -- Elevated
(5, 86, 90, 80), -- Hypertension Stage 1
(5, 91, 100, 60), -- Hypertension Stage 2
(5, 101, 200, 40); -- Hypertensive Crisis

-- hdlCholesterol (biomarker_id 7)
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
(7, 0, 29, 40), -- Very Low
(7, 30, 39, 60), -- Low
(7, 40, 49, 80), -- Borderline Low (Men)
(7, 45, 54, 80), -- Borderline Low (Women)
(7, 50, 59, 90), -- Near Optimal (Men)
(7, 55, 59, 90), -- Near Optimal (Women)
(7, 60, 300, 100); -- Optimal

-- triglycerides (biomarker_id 8)
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
(8, 0, 79, 100), -- Optimal
(8, 80, 99, 90), -- Near Optimal
(8, 100, 149, 80), -- Slightly Elevated
(8, 150, 199, 60), -- Moderately Elevated
(8, 200, 299, 40), -- High
(8, 300, 1000, 20); -- Very High

-- fastingBloodGlucose (biomarker_id 6)
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
(6, 0, 84, 100), -- Optimal
(6, 85, 89, 90), -- Near Optimal
(6, 90, 99, 80), -- Borderline Elevated
(6, 100, 109, 60), -- Pre-Diabetes (Early Risk)
(6, 110, 125, 40), -- Pre-Diabetes (High Risk)
(6, 126, 500, 20); -- Diabetes

-- waistCircumference (biomarker_id 3) - Using WHtR ranges (ratio)
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
(3, 0, 0.40, 100),
(3, 0.41, 0.49, 85), -- Average of 80-90
(3, 0.50, 0.54, 70), -- Average of 60-79
(3, 0.55, 0.59, 50), -- Average of 40-59
(3, 0.60, 0.69, 25), -- Average of 10-39
(3, 0.70, 2.00, 0);
-- Comprehensive Seed Data for Metabolic Point Platform
-- This file contains seed data for biomarkers, digital journeys, marketplace products, and provider networks

-- Insert biomarkers data
INSERT INTO biomarkers (id, name, description) VALUES
(1, 'waistCircumference', 'The measurement around the abdomen at the level of the belly button, often used as an indicator of abdominal fat.'),
(2, 'bloodPressureSystolic', 'The pressure in blood vessels when the heart beats, measured in mmHg.'),
(3, 'bloodPressureDiastolic', 'The pressure in blood vessels when the heart rests between beats, measured in mmHg.'),
(4, 'fastingBloodGlucose', 'The level of glucose in the blood after not eating for at least 8 hours, measured in mg/dL or mmol/L.'),
(5, 'hdlCholesterol', 'High-density lipoprotein cholesterol, often called "good" cholesterol, measured in mg/dL or mmol/L.'),
(6, 'triglycerides', 'A type of fat in the blood, measured in mg/dL or mmol/L.'),
(7, 'height', 'The vertical measurement of an individual from feet to top of the head, typically measured in centimeters or inches.'),
(8, 'weight', 'The measure of body mass, typically in kilograms or pounds.'),
(9, 'vitaminD2', 'A form of vitamin D that comes from plant sources and supplements, measured in ng/mL or nmol/L.'),
(10, 'vitaminD3', 'A form of vitamin D that is produced by the body when exposed to sunlight, measured in ng/mL or nmol/L.');

-- Insert biomarker scores data
INSERT INTO biomarker_scores (biomarker_id, range_from, range_to, score) VALUES
-- Waist Height Ratio (WHtR)
(1, 0.40, 0.49, 90),
(1, 0.50, 0.54, 80),
(1, 0.55, 0.59, 50),
(1, 0.60, 0.69, 20),
(1, NULL, 0.39, 100),
(1, 0.70, NULL, 0),

-- Blood Pressure Systolic
(2, 90, 120, 100),
(2, 121, 130, 90),
(2, 131, 140, 80),
(2, 141, 160, 60),
(2, NULL, 89, 70),
(2, 161, NULL, 40),

-- Blood Pressure Diastolic
(3, 60, 80, 100),
(3, 81, 85, 90),
(3, 86, 90, 80),
(3, 91, 100, 60),
(3, NULL, 59, 70),
(3, 101, NULL, 40),

-- Fasting Blood Glucose
(4, 85, 89, 90),
(4, 90, 99, 80),
(4, 100, 109, 60),
(4, 110, 125, 40),
(4, NULL, 84, 100),
(4, 126, NULL, 20),

-- HDL Cholesterol (Male)
(5, 50, 59, 90),
(5, 40, 49, 80),
(5, 30, 39, 60),
(5, NULL, 29, 40),
(5, 60, NULL, 100),

-- HDL Cholesterol (Female)
(6, 55, 59, 90),
(6, 45, 54, 80),
(6, 30, 44, 60),
(6, NULL, 29, 40),
(6, 60, NULL, 100),

-- Triglycerides
(7, 80, 99, 90),
(7, 100, 149, 80),
(7, 150, 199, 60),
(7, 200, 299, 40),
(7, NULL, 79, 100),
(7, 300, NULL, 20);

-- Insert digital journey plans
INSERT INTO digital_plans (name, description, duration_weeks, difficulty_level) VALUES
('Metabolic Health Foundation', 'Build a strong foundation for metabolic health with basic lifestyle changes', 8, 'Beginner'),
('Advanced Metabolic Optimization', 'Take your metabolic health to the next level with advanced strategies', 12, 'Advanced'),
('Metabolic Recovery Program', 'Recover from metabolic imbalances and restore optimal health', 10, 'Intermediate'),
('Long-term Metabolic Maintenance', 'Maintain optimal metabolic health for life', 16, 'Intermediate');

-- Insert digital plan items
INSERT INTO digital_plan_items (plan_id, week_number, title, description, content_type, content_url, is_completed) VALUES
-- Plan 1: Metabolic Health Foundation
(1, 1, 'Understanding Your Metabolism', 'Learn the basics of metabolic health and how biomarkers affect your body', 'video', '/content/metabolism-basics.mp4', 0),
(1, 1, 'Daily Movement Routine', 'Simple exercises to boost your metabolism throughout the day', 'exercise', '/content/daily-movement.pdf', 0),
(1, 2, 'Nutrition Fundamentals', 'Essential nutrients for metabolic health', 'article', '/content/nutrition-fundamentals.html', 0),
(1, 2, 'Meal Planning Basics', 'How to plan meals that support metabolic health', 'guide', '/content/meal-planning.pdf', 0),
(1, 3, 'Sleep and Recovery', 'The role of sleep in metabolic health', 'video', '/content/sleep-recovery.mp4', 0),
(1, 3, 'Stress Management', 'Techniques to reduce stress and support metabolism', 'meditation', '/content/stress-management.mp3', 0),
(1, 4, 'Hydration Habits', 'Importance of proper hydration for metabolic function', 'article', '/content/hydration-habits.html', 0),
(1, 4, 'Intermittent Fasting Introduction', 'Basic principles of intermittent fasting', 'guide', '/content/if-introduction.pdf', 0),
(1, 5, 'Blood Sugar Monitoring', 'How to monitor and understand your blood sugar levels', 'video', '/content/blood-sugar-monitoring.mp4', 0),
(1, 5, 'Carbohydrate Awareness', 'Understanding carbs and their impact on metabolism', 'article', '/content/carb-awareness.html', 0),
(1, 6, 'Protein Optimization', 'The role of protein in metabolic health', 'guide', '/content/protein-optimization.pdf', 0),
(1, 6, 'Healthy Fat Sources', 'Incorporating healthy fats into your diet', 'article', '/content/healthy-fats.html', 0),
(1, 7, 'Exercise Progression', 'Building on your exercise routine', 'video', '/content/exercise-progression.mp4', 0),
(1, 7, 'Mindful Eating', 'Developing healthy eating habits', 'meditation', '/content/mindful-eating.mp3', 0),

-- Plan 2: Advanced Metabolic Optimization
(2, 1, 'Advanced Biomarker Analysis', 'Deep dive into your metabolic biomarkers', 'video', '/content/advanced-biomarkers.mp4', 0),
(2, 2, 'Hormonal Balance', 'Understanding hormones and metabolic health', 'article', '/content/hormonal-balance.html', 0),
(2, 3, 'Advanced Nutrition Strategies', 'Cutting-edge nutrition for optimal metabolism', 'guide', '/content/advanced-nutrition.pdf', 0),
(2, 4, 'High-Intensity Training', 'Advanced exercise techniques', 'video', '/content/hit-training.mp4', 0),
(2, 5, 'Supplementation Protocols', 'Advanced supplementation strategies', 'article', '/content/supplementation-protocols.html', 0),
(2, 6, 'Metabolic Testing', 'Advanced metabolic assessment techniques', 'guide', '/content/metabolic-testing.pdf', 0),
(2, 7, 'Recovery Optimization', 'Advanced recovery strategies', 'video', '/content/recovery-optimization.mp4', 0),
(2, 8, 'Long-term Metabolic Planning', 'Planning for sustained metabolic health', 'article', '/content/long-term-planning.html', 0),

-- Plan 3: Metabolic Recovery Program
(3, 1, 'Metabolic Assessment', 'Comprehensive metabolic health evaluation', 'video', '/content/metabolic-assessment.mp4', 0),
(3, 2, 'Inflammation Reduction', 'Strategies to reduce systemic inflammation', 'article', '/content/inflammation-reduction.html', 0),
(3, 3, 'Gut Health Restoration', 'Restoring gut microbiome for metabolic health', 'guide', '/content/gut-health.pdf', 0),
(3, 4, 'Insulin Sensitivity', 'Improving insulin sensitivity and glucose metabolism', 'video', '/content/insulin-sensitivity.mp4', 0),
(3, 5, 'Detoxification Support', 'Supporting natural detoxification processes', 'article', '/content/detox-support.html', 0),
(3, 6, 'Hormone Optimization', 'Balancing hormones for metabolic recovery', 'guide', '/content/hormone-optimization.pdf', 0),
(3, 7, 'Energy Metabolism', 'Optimizing cellular energy production', 'video', '/content/energy-metabolism.mp4', 0),
(3, 8, 'Recovery Monitoring', 'Tracking progress and adjusting recovery strategies', 'article', '/content/recovery-monitoring.html', 0),

-- Plan 4: Long-term Metabolic Maintenance
(4, 1, 'Maintenance Mindset', 'Developing habits for long-term metabolic health', 'video', '/content/maintenance-mindset.mp4', 0),
(4, 2, 'Seasonal Nutrition', 'Adapting nutrition to seasonal changes', 'article', '/content/seasonal-nutrition.html', 0),
(4, 3, 'Aging and Metabolism', 'Maintaining metabolic health as you age', 'guide', '/content/aging-metabolism.pdf', 0),
(4, 4, 'Stress Resilience', 'Building resilience to stress', 'video', '/content/stress-resilience.mp4', 0),
(4, 5, 'Community Support', 'Building a support network for metabolic health', 'article', '/content/community-support.html', 0),
(4, 6, 'Advanced Monitoring', 'Long-term health monitoring strategies', 'guide', '/content/advanced-monitoring.pdf', 0),
(4, 7, 'Lifestyle Integration', 'Integrating metabolic health into daily life', 'video', '/content/lifestyle-integration.mp4', 0),
(4, 8, 'Future Planning', 'Planning for continued metabolic health', 'article', '/content/future-planning.html', 0);

-- Insert biomarker-plan score mappings
INSERT INTO biomarker_plan_score (biomarker_id, plan_id, min_score, max_score) VALUES
-- WHtR mappings
(1, 1, 0, 49), (1, 2, 50, 79), (1, 3, 80, 89), (1, 4, 90, 100),
-- Blood Pressure Systolic mappings
(2, 1, 0, 59), (2, 2, 60, 79), (2, 3, 80, 89), (2, 4, 90, 100),
-- Blood Pressure Diastolic mappings
(3, 1, 0, 59), (3, 2, 60, 79), (3, 3, 80, 89), (3, 4, 90, 100),
-- Fasting Blood Glucose mappings
(4, 1, 0, 39), (4, 2, 40, 59), (4, 3, 60, 79), (4, 4, 80, 100),
-- HDL Cholesterol mappings
(5, 1, 0, 59), (5, 2, 60, 79), (5, 3, 80, 89), (5, 4, 90, 100),
(6, 1, 0, 59), (6, 2, 60, 79), (6, 3, 80, 89), (6, 4, 90, 100),
-- Triglycerides mappings
(7, 1, 0, 39), (7, 2, 40, 59), (7, 3, 60, 79), (7, 4, 80, 100);

-- Insert marketplace products
INSERT INTO products (name, description, category, price, image_url, is_active) VALUES
('Berberine Supplement', 'Natural compound that helps regulate blood sugar levels and supports metabolic health', 'supplement', 29.99, '/images/berberine.jpg', 1),
('Omega-3 Fish Oil', 'High-quality fish oil supplement rich in EPA and DHA for heart and metabolic health', 'supplement', 24.99, '/images/omega3.jpg', 1),
('Magnesium Glycinate', 'Highly absorbable magnesium supplement for muscle recovery and metabolic support', 'supplement', 19.99, '/images/magnesium.jpg', 1),
('Vitamin D3 + K2', 'Essential vitamins for bone health, immune function, and metabolic regulation', 'supplement', 22.99, '/images/vitamin_d3_k2.jpg', 1),
('Probiotic Complex', 'Comprehensive probiotic formula for gut health and metabolic balance', 'supplement', 34.99, '/images/probiotics.jpg', 1),
('CoQ10 Ubiquinol', 'Powerful antioxidant for energy production and heart health', 'supplement', 39.99, '/images/coq10.jpg', 1),
('Green Tea Extract', 'Natural antioxidant and metabolic booster with EGCG', 'supplement', 18.99, '/images/green_tea.jpg', 1),
('Chromium Picolinate', 'Essential mineral for blood sugar regulation and insulin sensitivity', 'supplement', 14.99, '/images/chromium.jpg', 1),
('Avocado Oil', 'Healthy monounsaturated fat source for cooking and metabolic health', 'food', 12.99, '/images/avocados.jpg', 1),
('Grass-Fed Beef', 'High-quality protein source with healthy fats for metabolic health', 'food', 15.99, '/images/ground_beef.jpg', 1),
('Organic Eggs', 'Nutrient-dense food rich in choline and healthy fats', 'food', 8.99, '/images/eggs.jpg', 1),
('Lamb Steak', 'Lean protein with healthy fats and essential nutrients', 'food', 22.99, '/images/lamb_steak.jpg', 1),
('Resistance Bands Set', 'Complete set of resistance bands for home workouts and metabolic health', 'equipment', 49.99, '/images/resistance_bands.jpg', 1),
('Blood Glucose Monitor', 'Accurate home blood glucose monitoring device', 'device', 79.99, '/images/glucose_monitor.jpg', 1),
('Digital Scale', 'Precise body weight and composition monitoring scale', 'device', 89.99, '/images/digital_scale.jpg', 1),
('Waist Measurement Tape', 'Professional waist circumference measurement tool', 'device', 9.99, '/images/waist_tape.jpg', 1),
('Metabolic Health Assessment Kit', 'Comprehensive at-home metabolic health testing kit', 'service', 149.99, '/images/assessment_kit.jpg', 1),
('Personal Metabolic Coach', 'One-on-one coaching sessions with certified metabolic health specialists', 'service', 199.99, '/images/coaching.jpg', 1),
('Nutrition Consultation', 'Personalized nutrition planning with registered dietitian', 'service', 99.99, '/images/nutrition_consult.jpg', 1),
('Exercise Physiology Assessment', 'Comprehensive exercise physiology evaluation and recommendations', 'service', 129.99, '/images/exercise_assessment.jpg', 1),
('Metabolic Health Monitoring App', 'Advanced mobile app for tracking metabolic biomarkers and health metrics', 'software', 4.99, '/images/monitoring_app.jpg', 1),
('Nutrition Tracking Software', 'Comprehensive food and nutrition tracking platform', 'software', 9.99, '/images/nutrition_software.jpg', 1);

-- Insert product-biomarker score mappings
INSERT INTO product_biomarker_score (product_id, biomarker_id, min_score, max_score) VALUES
-- Berberine for blood glucose
(1, 4, 0, 79),
-- Omega-3 for triglycerides and HDL
(2, 7, 0, 79), (2, 5, 0, 79), (2, 6, 0, 79),
-- Magnesium for blood pressure and glucose
(3, 2, 0, 79), (3, 3, 0, 79), (3, 4, 0, 79),
-- Vitamin D3+K2 for general metabolic health
(4, 1, 0, 100), (4, 2, 0, 100), (4, 3, 0, 100), (4, 4, 0, 100),
-- Probiotics for gut health and metabolism
(5, 1, 0, 100), (5, 4, 0, 100), (5, 7, 0, 100),
-- CoQ10 for energy and heart health
(6, 2, 0, 89), (6, 3, 0, 89),
-- Green tea extract for metabolism
(7, 1, 0, 100), (7, 4, 0, 100),
-- Chromium for blood sugar
(8, 4, 0, 79),
-- Avocado oil for HDL and triglycerides
(9, 5, 0, 79), (9, 6, 0, 79), (9, 7, 0, 79),
-- Grass-fed beef for general health
(10, 1, 0, 100), (10, 2, 0, 100), (10, 3, 0, 100),
-- Organic eggs for HDL
(11, 5, 0, 79), (11, 6, 0, 79),
-- Lamb steak for general health
(12, 1, 0, 100), (12, 2, 0, 100), (12, 3, 0, 100),
-- Resistance bands for WHtR
(13, 1, 0, 89),
-- Blood glucose monitor for glucose management
(14, 4, 0, 100),
-- Digital scale for weight monitoring
(15, 1, 0, 100),
-- Waist tape for WHtR monitoring
(16, 1, 0, 100),
-- Assessment kit for comprehensive monitoring
(17, 1, 0, 100), (17, 2, 0, 100), (17, 3, 0, 100), (17, 4, 0, 100), (17, 5, 0, 100), (17, 6, 0, 100), (17, 7, 0, 100),
-- Personal coach for all biomarkers
(18, 1, 0, 100), (18, 2, 0, 100), (18, 3, 0, 100), (18, 4, 0, 100), (18, 5, 0, 100), (18, 6, 0, 100), (18, 7, 0, 100),
-- Nutrition consultation for all biomarkers
(19, 1, 0, 100), (19, 2, 0, 100), (19, 3, 0, 100), (19, 4, 0, 100), (19, 5, 0, 100), (19, 6, 0, 100), (19, 7, 0, 100),
-- Exercise assessment for WHtR and blood pressure
(20, 1, 0, 89), (20, 2, 0, 89), (20, 3, 0, 89),
-- Monitoring app for all biomarkers
(21, 1, 0, 100), (21, 2, 0, 100), (21, 3, 0, 100), (21, 4, 0, 100), (21, 5, 0, 100), (21, 6, 0, 100), (21, 7, 0, 100),
-- Nutrition software for all biomarkers
(22, 1, 0, 100), (22, 2, 0, 100), (22, 3, 0, 100), (22, 4, 0, 100), (22, 5, 0, 100), (22, 6, 0, 100), (22, 7, 0, 100);

-- Insert expertise types
INSERT INTO expertise_types (name, description) VALUES
('Metabolic Health Specialist', 'Expert in metabolic disorders, insulin resistance, and blood sugar management'),
('Cardiovascular Health Expert', 'Specialist in heart health, blood pressure, and cholesterol management'),
('Nutrition and Dietetics', 'Registered dietitian specializing in metabolic health nutrition'),
('Exercise Physiology', 'Expert in exercise prescription for metabolic health conditions'),
('Endocrinology', 'Specialist in hormonal imbalances and metabolic disorders');

-- Insert providers
INSERT INTO providers (name, specialty, experience_years, education, certifications, image_url, bio, contact_email, contact_phone, is_active) VALUES
('Dr. Sarah Johnson', 'Metabolic Health Specialist', 12, 'MD from Johns Hopkins University, Fellowship in Metabolic Medicine', 'Board Certified in Internal Medicine, Certified Metabolic Health Specialist', '/images/provider_sarah.jpg', 'Dr. Johnson specializes in comprehensive metabolic health management, with particular expertise in insulin resistance, prediabetes, and metabolic syndrome. She has helped hundreds of patients optimize their metabolic health through personalized treatment plans.', 'sarah.johnson@metabolicpoint.com', '+1-555-0101', 1),
('Dr. Michael Chen', 'Cardiovascular Health Expert', 15, 'MD from Harvard Medical School, Cardiology Fellowship at Mayo Clinic', 'Board Certified Cardiologist, Advanced Heart Failure Specialist', '/images/provider_michael.jpg', 'Dr. Chen is a leading cardiologist with extensive experience in preventive cardiology and metabolic cardiovascular disease. He focuses on the intersection of metabolic health and heart disease prevention.', 'michael.chen@metabolicpoint.com', '+1-555-0102', 1),
('Dr. Emily Rodriguez', 'Nutrition and Dietetics', 8, 'PhD in Nutrition Science, Registered Dietitian', 'Registered Dietitian Nutritionist, Certified Diabetes Educator', '/images/provider_emily.jpg', 'Dr. Rodriguez combines her research background with clinical practice to provide evidence-based nutritional guidance for metabolic health. She specializes in personalized nutrition plans for diabetes, prediabetes, and metabolic syndrome.', 'emily.rodriguez@metabolicpoint.com', '+1-555-0103', 1),
('Dr. James Wilson', 'Exercise Physiology', 10, 'PhD in Exercise Physiology, Certified Strength and Conditioning Specialist', 'ACSM Exercise Physiologist, NSCA Certified Strength Coach', '/images/provider_james.jpg', 'Dr. Wilson is an exercise physiologist who develops customized exercise programs for individuals with metabolic health challenges. His programs focus on improving insulin sensitivity, cardiovascular fitness, and body composition.', 'james.wilson@metabolicpoint.com', '+1-555-0104', 1),
('Dr. Lisa Thompson', 'Endocrinology', 14, 'MD from University of Pennsylvania, Endocrinology Fellowship', 'Board Certified Endocrinologist, Certified Diabetes Specialist', '/images/provider_lisa.jpg', 'Dr. Thompson specializes in endocrine disorders affecting metabolic health, including thyroid disorders, adrenal dysfunction, and hormonal imbalances that impact metabolism and weight.', 'lisa.thompson@metabolicpoint.com', '+1-555-0105', 1),
('Dr. Robert Kim', 'Metabolic Health Specialist', 9, 'MD from Stanford University, Metabolic Medicine Fellowship', 'Board Certified in Internal Medicine, Metabolic Health Specialist', '/images/provider_robert.jpg', 'Dr. Kim focuses on integrative approaches to metabolic health, combining conventional medicine with lifestyle interventions. He has particular expertise in managing complex metabolic cases.', 'robert.kim@metabolicpoint.com', '+1-555-0106', 1),
('Dr. Amanda Foster', 'Cardiovascular Health Expert', 11, 'MD from Duke University, Preventive Cardiology Fellowship', 'Board Certified Cardiologist, Lipid Specialist', '/images/provider_amanda.jpg', 'Dr. Foster specializes in lipid disorders and preventive cardiology, with a focus on how metabolic health impacts cardiovascular risk. She provides comprehensive cholesterol and triglyceride management.', 'amanda.foster@metabolicpoint.com', '+1-555-0107', 1),
('Dr. David Park', 'Nutrition and Dietetics', 7, 'MS in Nutrition, Registered Dietitian', 'Registered Dietitian Nutritionist, Sports Dietitian Certification', '/images/provider_david.jpg', 'David is a registered dietitian with expertise in sports nutrition and metabolic health. He works with athletes and individuals with metabolic conditions to optimize nutrition for performance and health.', 'david.park@metabolicpoint.com', '+1-555-0108', 1),
('Dr. Jennifer Liu', 'Exercise Physiology', 6, 'PhD in Kinesiology, Exercise Physiologist', 'ACSM Clinical Exercise Physiologist, Certified Personal Trainer', '/images/provider_jennifer.jpg', 'Dr. Liu specializes in clinical exercise physiology, working with patients who have chronic metabolic conditions. She designs safe, effective exercise programs that improve metabolic health outcomes.', 'jennifer.liu@metabolicpoint.com', '+1-555-0109', 1);

-- Insert biomarker-expertise score mappings
INSERT INTO biomarker_expertise_score (biomarker_id, expertise_type_id, min_score, max_score) VALUES
-- Metabolic Health Specialist for all biomarkers
(1, 1, 0, 100), (2, 1, 0, 100), (3, 1, 0, 100), (4, 1, 0, 100), (5, 1, 0, 100), (6, 1, 0, 100), (7, 1, 0, 100),
-- Cardiovascular Health Expert for blood pressure, HDL, triglycerides
(2, 2, 0, 100), (3, 2, 0, 100), (5, 2, 0, 100), (6, 2, 0, 100), (7, 2, 0, 100),
-- Nutrition and Dietetics for all biomarkers
(1, 3, 0, 100), (2, 3, 0, 100), (3, 3, 0, 100), (4, 3, 0, 100), (5, 3, 0, 100), (6, 3, 0, 100), (7, 3, 0, 100),
-- Exercise Physiology for WHtR, blood pressure
(1, 4, 0, 100), (2, 4, 0, 100), (3, 4, 0, 100),
-- Endocrinology for blood glucose, HDL, triglycerides
(4, 5, 0, 100), (5, 5, 0, 100), (6, 5, 0, 100), (7, 5, 0, 100);
-- Biomarker-based plan and expertise type seed for digital journey and provider network

-- Digital journey: assign plan 1 for users with high blood pressure systolic (example: 140-200)
INSERT INTO biomarker_plan (biomarker_id, range_from, range_to, plan_id) VALUES
(4, 140, 200, 1), -- bloodPressureSystolic
(5, 90, 120, 1),  -- bloodPressureDiastolic
(6, 110, 200, 1), -- fastingBloodGlucose
(7, 30, 40, 1),   -- hdlCholesterol (low HDL)
(8, 150, 500, 1); -- triglycerides (high)

-- Provider network: assign expertise types for biomarker ranges
-- Physician for high blood pressure or high glucose
INSERT INTO biomarker_expertise (biomarker_id, range_from, range_to, expertise_type_id) VALUES
(4, 140, 200, 1), -- bloodPressureSystolic -> Physician
(5, 90, 120, 1),  -- bloodPressureDiastolic -> Physician
(6, 110, 200, 1), -- fastingBloodGlucose -> Physician
-- Diet Expert for high triglycerides or low HDL
(7, 30, 40, 2),   -- hdlCholesterol (low) -> Diet Expert
(8, 150, 500, 2); -- triglycerides (high) -> Diet Expert
-- Seed for digital items
INSERT INTO digital_items (name, description, type, image_url, content_url) VALUES
('Morning Yoga', 'Start your day with 20 minutes of yoga.', 'sport', 'yoga.jpg', 'https://example.com/yoga'),
('Breathing Exercise', '5-minute guided breathing for stress relief.', 'stress', 'breathing.jpg', 'https://example.com/breathing'),
('Intermittent Fasting', 'Change your eating window to 8 hours.', 'nutrition', 'fasting.jpg', 'https://example.com/fasting');

-- Seed for digital plans
INSERT INTO digital_plans (name, description) VALUES
('Starter Wellness Plan', 'A basic plan for new users.');

-- Seed for digital plan items
INSERT INTO digital_plan_items (plan_id, item_id, day_offset) VALUES
(1, 1, 1), -- Yoga on T+1
(1, 2, 2), -- Breathing on T+2
(1, 3, 3); -- Fasting on T+3

-- Seed for expertise types
INSERT INTO expertise_types (id, name, description) VALUES
(1, 'Physician', 'Medical doctor'),
(2, 'Diet Expert', 'Nutrition and diet specialist'),
(3, 'Nutrition Specialist', 'Expert in dietary planning and nutritional guidance for metabolic health'),
(4, 'Exercise Physiologist', 'Specialist in exercise prescription and physical activity optimization'),
(5, 'Metabolic Health Consultant', 'Comprehensive advisor for metabolic disorders and lifestyle management');

-- Seed for providers
INSERT INTO providers (name, title, image_url, booking_url, expertise_type_id) VALUES
('Dr. Alice Smith', 'MD', 'alice.jpg', 'https://example.com/book/alice', 1),
('Bob Dietman', 'RD', 'bob.jpg', 'https://example.com/book/bob', 2);
-- Seed data for Digital Journey

-- Digital Plans
INSERT INTO digital_plans (name, description) VALUES
('Basic Lifestyle Plan', 'Fundamental lifestyle changes for metabolic health improvement'),
('Intermediate Metabolic Plan', 'Enhanced metabolic optimization with structured interventions'),
('Advanced Health Optimization Plan', 'Comprehensive health optimization with advanced tracking'),
('Expert Medical Management Plan', 'Professional medical oversight with integrated technology');

-- Digital Items
INSERT INTO digital_items (name, description, type, image_url, content_url) VALUES
-- Basic items
('Reduce Added Sugars', 'Eliminate refined sugars and carbohydrates from your diet', 'nutrition', 'reduce_sugars.jpg', 'https://example.com/reduce-sugars'),
('Increase Fiber Intake', 'Add more vegetables and legumes to your meals', 'nutrition', 'increase_fiber.jpg', 'https://example.com/fiber-intake'),
('Light Activity Walking', 'Start with daily walking routine', 'sport', 'light_walking.jpg', 'https://example.com/walking'),
('Stress Management', 'Learn basic stress reduction techniques', 'stress', 'stress_management.jpg', 'https://example.com/stress-mgmt'),

-- Intermediate items (includes basic + these)
('Low-Glycemic Eating', 'Adopt low-glycemic, keto or carnivore-style eating', 'nutrition', 'low_glycemic.jpg', 'https://example.com/low-glycemic'),
('Intermittent Fasting', 'Implement time-restricted eating patterns', 'nutrition', 'intermittent_fasting.jpg', 'https://example.com/if'),
('Resistance Training', 'Begin structured strength training', 'sport', 'resistance_training.jpg', 'https://example.com/resistance'),

-- Advanced items (includes intermediate + these)
('Eliminate Processed Foods', 'Remove all processed and packaged foods', 'nutrition', 'no_processed.jpg', 'https://example.com/no-processed'),
('Carb Glucose Tracking', 'Monitor carbohydrate and glucose levels', 'nutrition', 'carb_tracking.jpg', 'https://example.com/carb-tracking'),
('Time-Restricted Eating', 'Advanced intermittent fasting protocols', 'nutrition', 'time_restricted.jpg', 'https://example.com/time-restricted'),

-- Expert items (includes advanced + these)
('Medical Oversight', 'Work with healthcare professionals', 'other', 'medical_oversight.jpg', 'https://example.com/medical'),
('Structured Meal Planning', 'Detailed meal planning with professional guidance', 'nutrition', 'meal_planning.jpg', 'https://example.com/meal-planning'),
('CGM Integration', 'Continuous glucose monitoring integration', 'other', 'cgm_integration.jpg', 'https://example.com/cgm'),
('Medical Coaching', 'One-on-one coaching with medical experts', 'other', 'medical_coaching.jpg', 'https://example.com/coaching');

-- Digital Plan Items with day offsets
-- Basic Plan (ID 1)
INSERT INTO digital_plan_items (plan_id, item_id, day_offset) VALUES
(1, 1, 1),  -- Reduce sugars day 1
(1, 2, 3),  -- Increase fiber day 3
(1, 3, 7),  -- Light walking day 7
(1, 4, 14); -- Stress management day 14

-- Intermediate Plan (ID 2) - includes basic + new
INSERT INTO digital_plan_items (plan_id, item_id, day_offset) VALUES
(1, 1, 1), (1, 2, 3), (1, 3, 7), (1, 4, 14), -- Basic items
(2, 5, 21), -- Low-glycemic day 21
(2, 6, 28), -- Intermittent fasting day 28
(2, 7, 35); -- Resistance training day 35

-- Advanced Plan (ID 3) - includes intermediate + new
INSERT INTO digital_plan_items (plan_id, item_id, day_offset) VALUES
(1, 1, 1), (1, 2, 3), (1, 3, 7), (1, 4, 14), -- Basic
(2, 5, 21), (2, 6, 28), (2, 7, 35), -- Intermediate
(3, 8, 42), -- No processed day 42
(3, 9, 49), -- Carb tracking day 49
(3, 10, 56); -- Time-restricted day 56

-- Expert Plan (ID 4) - includes advanced + new
INSERT INTO digital_plan_items (plan_id, item_id, day_offset) VALUES
(1, 1, 1), (1, 2, 3), (1, 3, 7), (1, 4, 14), -- Basic
(2, 5, 21), (2, 6, 28), (2, 7, 35), -- Intermediate
(3, 8, 42), (3, 9, 49), (3, 10, 56), -- Advanced
(4, 11, 63), -- Medical oversight day 63
(4, 12, 70), -- Meal planning day 70
(4, 13, 77), -- CGM integration day 77
(4, 14, 84); -- Medical coaching day 84

-- Biomarker Plan Score mappings
-- Map biomarker scores to appropriate plans
-- Higher scores (better health) -> Basic plans
-- Lower scores (worse health) -> Advanced/Expert plans

-- waistCircumference (ID 3)
INSERT INTO biomarker_plan_score (biomarker_id, score, plan_id) VALUES
(3, 100, 1), -- Optimal: Basic
(3, 85, 1),  -- Good: Basic
(3, 70, 2),  -- Fair: Intermediate
(3, 50, 3),  -- Poor: Advanced
(3, 25, 4);  -- Critical: Expert

-- bloodPressureSystolic (ID 4)
INSERT INTO biomarker_plan_score (biomarker_id, score, plan_id) VALUES
(4, 100, 1), -- Normal: Basic
(4, 90, 2),  -- Elevated: Intermediate
(4, 80, 2),  -- Stage 1: Intermediate
(4, 60, 3),  -- Stage 2: Advanced
(4, 40, 4);  -- Crisis: Expert

-- bloodPressureDiastolic (ID 5)
INSERT INTO biomarker_plan_score (biomarker_id, score, plan_id) VALUES
(5, 100, 1), -- Normal: Basic
(5, 90, 2),  -- Elevated: Intermediate
(5, 80, 2),  -- Stage 1: Intermediate
(5, 60, 3),  -- Stage 2: Advanced
(5, 40, 4);  -- Crisis: Expert

-- fastingBloodGlucose (ID 6)
INSERT INTO biomarker_plan_score (biomarker_id, score, plan_id) VALUES
(6, 100, 1), -- Optimal: Basic
(6, 90, 1),  -- Near Optimal: Basic
(6, 80, 2),  -- Borderline: Intermediate
(6, 60, 3),  -- Pre-Diabetes: Advanced
(6, 40, 4),  -- Pre-Diabetes High: Expert
(6, 20, 4);  -- Diabetes: Expert

-- hdlCholesterol (ID 7)
INSERT INTO biomarker_plan_score (biomarker_id, score, plan_id) VALUES
(7, 100, 1), -- Optimal: Basic
(7, 90, 1),  -- Near Optimal: Basic
(7, 80, 2),  -- Borderline: Intermediate
(7, 60, 3),  -- Low: Advanced
(7, 40, 4);  -- Very Low: Expert

-- triglycerides (ID 8)
INSERT INTO biomarker_plan_score (biomarker_id, score, plan_id) VALUES
(8, 100, 1), -- Optimal: Basic
(8, 90, 1),  -- Near Optimal: Basic
(8, 80, 2),  -- Slightly Elevated: Intermediate
(8, 60, 3),  -- Moderately Elevated: Advanced
(8, 40, 4),  -- High: Expert
(8, 20, 4);  -- Very High: Expert
-- Seed product_biomarker associations for marketplace products and biomarker ranges
-- Example: recommend Magnesium for low hdlCholesterol, Ceylon Cinnamon for high fastingBloodGlucose, etc.

-- Magnesium (id: 3) for low hdlCholesterol (biomarker_id: 7, < 40)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(3, 7, NULL, 40, 1);

-- Ceylon Cinnamon (id: 4) for high fastingBloodGlucose (biomarker_id: 6, > 110)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(4, 6, 110, NULL, 1);

-- Berberine (id: 5) for high fastingBloodGlucose (biomarker_id: 6, > 110)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(5, 6, 110, NULL, 1);

-- Alpha-Lipoic Acid (id: 6) for high triglycerides (biomarker_id: 8, > 150)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(6, 8, 150, NULL, 1);

-- Chromium Picolinate (id: 7) for high fastingBloodGlucose (biomarker_id: 6, > 110)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(7, 6, 110, NULL, 1);

-- Avocados (id: 8) for low hdlCholesterol (biomarker_id: 7, < 40)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(8, 7, NULL, 40, 2);

-- Grass-fed Ground Beef (id: 9) for low hdlCholesterol (biomarker_id: 7, < 40)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(9, 7, NULL, 40, 2);

-- Smart Water Bottle (id: 14) for high bloodPressureSystolic (biomarker_id: 4, > 140)
INSERT INTO product_biomarker (product_id, biomarker_id, range_from, range_to, priority) VALUES
(14, 4, 140, NULL, 2);
-- Seed data for Marketplace Products

INSERT INTO products (id, name, description, type, category, price, image_url, url, is_active, created_at) VALUES
(1,'Resistance Training','A comprehensive digital guide to resistance training for all levels. Includes video tutorials and workout plans.','digital','Digital Products',19.99,'resistance_training.jpg',null,1,'2025-08-18 08:13:30'),
(2,'Medical Coaching','Personalized medical coaching sessions with certified professionals. Delivered online.','digital','Digital Products',49.99,'medical_coaching.jpg',null,1,'2025-08-18 08:13:30'),
(3,'Magnesium (200–400 mg/day)','Essential mineral for muscle and nerve function. Supports energy production and bone health.','supplement','Supplements',15.99,'magnesium.jpg',null,1,'2025-08-18 08:13:30'),
(4,'Ceylon Cinnamon','High-quality Ceylon cinnamon to support healthy blood sugar levels.','supplement','Supplements',12.99,'ceylon_cinnamon.jpg',null,1,'2025-08-18 08:13:30'),
(5,'Berberine (500 mg 2–3x/day)','Plant compound shown to support healthy blood sugar and cholesterol.','supplement','Supplements',24.99,'berberine.jpg',null,1,'2025-08-18 08:13:30'),
(6,'Alpha-Lipoic Acid (300–600 mg/day)','Antioxidant that helps with energy metabolism and nerve health.','supplement','Supplements',18.99,'alpha_lipoic_acid.jpg',null,0,'2025-08-18 08:13:30'),
(7,'Chromium Picolinate (200–1000 mcg/day)','Supports healthy blood sugar and metabolism.','supplement','Supplements',13.99,'chromium_picolinate.jpg',null,0,'2025-08-18 08:13:30'),
(8,'Avocados','Nutrient-dense fruit rich in healthy fats, fiber, and vitamins.','food','Foods',2.99,'avocados.jpg',null,1,'2025-08-18 08:13:30'),
(9,'Grass-fed Ground Beef','High-quality protein source from grass-fed cattle.','food','Foods',8.99,'ground_beef.jpg',null,1,'2025-08-18 08:13:30'),
(10,'Grass-fed Butter','Rich, creamy butter from grass-fed cows.','food','Foods',5.99,'butter.jpg',null,0,'2025-08-18 08:13:30'),
(11,'Pasture-raised Eggs','Eggs from hens raised on pasture for superior nutrition.','food','Foods',4.99,'eggs.jpg',null,1,'2025-08-18 08:13:30'),
(12,'Grass-fed Lamb or Steak','Tender cuts of lamb or steak from grass-fed animals.','food','Foods',14.99,'lamb_steak.jpg',null,0,'2025-08-18 08:13:30'),
(13,'Smart Water Bottle','Tracks your hydration and reminds you to drink water throughout the day.','device','Devices',29.99,'smart_water_bottle.jpg',null,1,'2025-08-18 08:13:30'),
(14,'Resistance Bands','Set of resistance bands for strength training at home or on the go.','device','Devices',16.99,'resistance_bands.jpg',null,1,'2025-08-18 08:13:30'),
(15,'Magnesium Supplement','High-quality magnesium supplement for metabolic health (200-400 mg/day)','supplement','Supplements',24.99,'magnesium.jpg',null,1,'2025-09-01 21:41:13'),
(16,'Ceylon Cinnamon','Pure Ceylon cinnamon for blood sugar support','supplement','Supplements',19.99,'ceylon_cinnamon.jpg',null,1,'2025-09-01 21:41:13'),
(17,'Myo-Inositol','Myo-inositol supplement for hormonal balance','supplement','Supplements',29.99,'myo_inositol.jpg',null,1,'2025-09-01 21:41:13'),
(18,'Berberine','Natural berberine extract for blood sugar management (500 mg)','supplement','Supplements',34.99,'berberine.jpg',null,1,'2025-09-01 21:41:13'),
(19,'Alpha-Lipoic Acid','ALA supplement for antioxidant support (300-600 mg)','supplement','Supplements',26.99,'ala.jpg',null,1,'2025-09-01 21:41:13'),
(20,'Chromium Picolinate','Chromium supplement for glucose metabolism (200-1000 mcg)','supplement','Supplements',18.99,'chromium.jpg',null,1,'2025-09-01 21:41:13'),
(21,'NAC Supplement','N-Acetyl Cysteine for liver and metabolic support','supplement','Supplements',39.99,'nac.jpg',null,1,'2025-09-01 21:41:13'),
(22,'Resveratrol','High-quality resveratrol for cellular health','supplement','Supplements',44.99,'resveratrol.jpg',null,1,'2025-09-01 21:41:13'),
(23,'Organic Leafy Greens Mix','Fresh spinach, kale, and mixed greens','food','Foods',8.99,'leafy_greens.jpg',null,1,'2025-09-01 21:41:14'),
(24,'Avocados','Fresh organic avocados (pack of 6)','food','Foods',12.99,'avocados.jpg',null,1,'2025-09-01 21:41:14'),
(25,'Grass-Fed Ground Beef','Premium grass-fed ground beef (1 lb)','food','Foods',15.99,'ground_beef.jpg',null,1,'2025-09-01 21:41:14'),
(26,'Grass-Fed Butter','Organic grass-fed butter (8 oz)','food','Foods',9.99,'butter.jpg',null,1,'2025-09-01 21:41:14'),
(27,'Pasture-Raised Eggs','Free-range pasture-raised eggs (dozen)','food','Foods',7.99,'eggs.jpg',null,1,'2025-09-01 21:41:14'),
(28,'Wild-Caught Salmon','Fresh wild-caught salmon fillet (6 oz)','food','Foods',18.99,'salmon.jpg',null,1,'2025-09-01 21:41:14'),
(29,'Grass-Fed Lamb Steak','Premium grass-fed lamb steak (8 oz)','food','Foods',22.99,'lamb_steak.jpg',null,1,'2025-09-01 21:41:14'),
(30,'Extra Virgin Olive Oil','Cold-pressed extra virgin olive oil (16 oz)','food','Foods',14.99,'olive_oil.jpg',null,1,'2025-09-01 21:41:14'),
(31,'Organic Sauerkraut','Raw fermented sauerkraut (16 oz)','food','Foods',6.99,'sauerkraut.jpg',null,1,'2025-09-01 21:41:14'),
(32,'Grass-Fed Liver','Organic grass-fed beef liver (1 lb)','food','Foods',16.99,'liver.jpg',null,1,'2025-09-01 21:41:14'),
(33,'Bone Broth','Organic grass-fed bone broth (32 oz)','food','Foods',11.99,'bone_broth.jpg',null,1,'2025-09-01 21:41:14'),
(34,'Organic Zucchini','Fresh organic zucchini (2 lbs)','food','Foods',5.99,'zucchini.jpg',null,1,'2025-09-01 21:41:14'),
(35,'MCT Oil','Pure MCT oil for ketogenic diets (16 oz)','food','Foods',24.99,'mct_oil.jpg',null,1,'2025-09-01 21:41:14'),
(36,'Keto Meal Kit','Grass-fed focused keto meal kit (serves 2)','food','Foods',49.99,'keto_meal_kit.jpg',null,1,'2025-09-01 21:41:14'),
(37,'Collagen Protein','Grass-fed collagen protein powder (16 oz)','food','Foods',32.99,'collagen.jpg',null,1,'2025-09-01 21:41:14'),
(38,'Sugar-Free Electrolytes','Electrolyte supplement for keto diets','food','Foods',19.99,'electrolytes.jpg',null,1,'2025-09-01 21:41:14'),
(39,'Fitness Tracker','Advanced fitness tracker with heart rate monitoring','device','Devices',149.99,'fitness_tracker.jpg',null,1,'2025-09-01 21:41:15'),
(40,'Smart Scale','Digital smart scale with body composition analysis','device','Devices',89.99,'smart_scale.jpg',null,1,'2025-09-01 21:41:15'),
(41,'Basic Glucometer','Blood glucose monitoring system','device','Devices',49.99,'glucometer.jpg',null,1,'2025-09-01 21:41:15'),
(42,'FreeStyle Libre CGM','Continuous glucose monitoring system','device','Devices',299.99,'freestyle_libre.jpg',null,1,'2025-09-01 21:41:15'),
(43,'Resistance Bands Set','Professional resistance bands for strength training','device','Devices',39.99,'resistance_bands.jpg',null,1,'2025-09-01 21:41:15'),
(44,'HIIT Training App','Digital HIIT workout application','device','Devices',9.99,'hiit_app.jpg','https://example.com/hiit-app',1,'2025-09-01 21:41:15'),
(45,'Dexcom G7 CGM','Advanced continuous glucose monitoring system','device','Devices',399.99,'dexcom_g7.jpg',null,1,'2025-09-01 21:41:15'),
(46,'Insulin Pen','Smart insulin delivery pen system','device','Devices',199.99,'insulin_pen.jpg',null,1,'2025-09-01 21:41:15');

-- Product Biomarker Score mappings
-- Map products to biomarkers with appropriate scores
-- Higher scores (better health) -> Basic products
-- Lower scores (worse health) -> Advanced/Expert products

-- Magnesium (product_id 3) - Basic supplement
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(3, 3, 100, 1), (3, 3, 85, 1), (3, 3, 70, 2), -- WHtR
(3, 4, 100, 1), (3, 4, 90, 1), (3, 4, 80, 2), -- BP Systolic
(3, 5, 100, 1), (3, 5, 90, 1), (3, 5, 80, 2), -- BP Diastolic
(3, 6, 100, 1), (3, 6, 90, 1), (3, 6, 80, 2), -- Glucose
(3, 7, 100, 1), (3, 7, 90, 1), (3, 7, 80, 2), -- HDL
(3, 8, 100, 1), (3, 8, 90, 1), (3, 8, 80, 2); -- Triglycerides

-- Berberine (product_id 5) - Intermediate supplement
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(5, 6, 60, 1), (5, 6, 40, 1), (5, 6, 20, 1); -- Glucose (pre-diabetes/diabetes)

-- Avocados (product_id 8) - Basic food
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(8, 3, 100, 1), (8, 3, 85, 1), (8, 3, 70, 2), -- WHtR
(8, 7, 100, 1), (8, 7, 90, 1), (8, 7, 80, 2), -- HDL
(8, 8, 100, 1), (8, 8, 90, 1), (8, 8, 80, 2); -- Triglycerides

-- Fitness Tracker (product_id 39) - Basic device
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(39, 3, 100, 1), (39, 3, 85, 1), (39, 3, 70, 2), -- WHtR
(39, 4, 100, 1), (39, 4, 90, 1), (39, 4, 80, 2), -- BP Systolic
(39, 5, 100, 1), (39, 5, 90, 1), (39, 5, 80, 2); -- BP Diastolic

-- FreeStyle Libre CGM (product_id 42) - Advanced device
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(42, 6, 60, 1), (42, 6, 40, 1), (42, 6, 20, 1); -- Glucose (pre-diabetes/diabetes)

-- Dexcom G7 CGM (product_id 45) - Expert device
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(45, 6, 20, 1); -- Glucose (diabetes)

-- Add more mappings for key products
-- Grass-fed ground beef (product_id 9)
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(9, 7, 100, 1), (9, 7, 90, 1), (9, 7, 80, 2), -- HDL
(9, 8, 100, 1), (9, 8, 90, 1), (9, 8, 80, 2); -- Triglycerides

-- Wild-caught salmon (product_id 28)
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(28, 7, 100, 1), (28, 7, 90, 1), (28, 7, 80, 2), -- HDL
(28, 8, 100, 1), (28, 8, 90, 1), (28, 8, 80, 2); -- Triglycerides

-- Keto meal kit (product_id 36)
INSERT INTO product_biomarker_score (product_id, biomarker_id, score, priority) VALUES
(36, 6, 60, 1), (36, 6, 40, 1), (36, 6, 20, 1), -- Glucose
(36, 8, 60, 1), (36, 8, 40, 1), (36, 8, 20, 1); -- Triglycerides
-- Seed data for Provider Network

-- Expertise Types
INSERT INTO expertise_types (name, description) VALUES
('Nutrition Specialist', 'Expert in dietary planning and nutritional guidance for metabolic health'),
('Exercise Physiologist', 'Specialist in exercise prescription and physical activity optimization'),
('Metabolic Health Consultant', 'Comprehensive advisor for metabolic disorders and lifestyle management');

-- Providers
INSERT INTO providers (name, title, image_url, booking_url, expertise_type_id) VALUES
('Dr. Sarah Johnson', 'Registered Dietitian', 'nutrition_specialist_1.jpg', 'https://example.com/book/sarah', 1),
('Dr. Michael Chen', 'Clinical Nutritionist', 'nutrition_specialist_2.jpg', 'https://example.com/book/michael', 1),
('Dr. Emily Rodriguez', 'Sports Nutritionist', 'nutrition_specialist_3.jpg', 'https://example.com/book/emily', 1),
('Dr. James Wilson', 'Exercise Physiologist', 'exercise_physiologist_1.jpg', 'https://example.com/book/james', 2),
('Dr. Lisa Thompson', 'Certified Exercise Specialist', 'exercise_physiologist_2.jpg', 'https://example.com/book/lisa', 2),
('Dr. Robert Kim', 'Performance Coach', 'exercise_physiologist_3.jpg', 'https://example.com/book/robert', 2),
('Dr. Maria Garcia', 'Metabolic Health Specialist', 'metabolic_consultant_1.jpg', 'https://example.com/book/maria', 3),
('Dr. David Lee', 'Endocrinology Consultant', 'metabolic_consultant_2.jpg', 'https://example.com/book/david', 3),
('Dr. Jennifer Brown', 'Lifestyle Medicine Physician', 'metabolic_consultant_3.jpg', 'https://example.com/book/jennifer', 3);

-- Biomarker Expertise Score mappings
-- For each biomarker, map different scores to expertise types
-- Score 100 = optimal, 80-90 = good, 60-70 = fair, 40-50 = poor, 20-30 = critical

-- waistCircumference (ID 3) - WHtR
INSERT INTO biomarker_expertise_score (biomarker_id, score, expertise_type_id) VALUES
(3, 100, 1), -- Optimal: Nutrition
(3, 85, 1),  -- Good: Nutrition
(3, 70, 2),  -- Fair: Exercise
(3, 50, 3),  -- Poor: Metabolic
(3, 25, 3);  -- Critical: Metabolic

-- bloodPressureSystolic (ID 4)
INSERT INTO biomarker_expertise_score (biomarker_id, score, expertise_type_id) VALUES
(4, 100, 1), -- Normal: Nutrition
(4, 90, 2),  -- Elevated: Exercise
(4, 80, 2),  -- Stage 1: Exercise
(4, 60, 3),  -- Stage 2: Metabolic
(4, 40, 3);  -- Crisis: Metabolic

-- bloodPressureDiastolic (ID 5)
INSERT INTO biomarker_expertise_score (biomarker_id, score, expertise_type_id) VALUES
(5, 100, 1), -- Normal: Nutrition
(5, 90, 2),  -- Elevated: Exercise
(5, 80, 2),  -- Stage 1: Exercise
(5, 60, 3),  -- Stage 2: Metabolic
(5, 40, 3);  -- Crisis: Metabolic

-- fastingBloodGlucose (ID 6)
INSERT INTO biomarker_expertise_score (biomarker_id, score, expertise_type_id) VALUES
(6, 100, 1), -- Optimal: Nutrition
(6, 90, 1),  -- Near Optimal: Nutrition
(6, 80, 2),  -- Borderline: Exercise
(6, 60, 3),  -- Pre-Diabetes: Metabolic
(6, 40, 3),  -- Pre-Diabetes High: Metabolic
(6, 20, 3);  -- Diabetes: Metabolic

-- hdlCholesterol (ID 7)
INSERT INTO biomarker_expertise_score (biomarker_id, score, expertise_type_id) VALUES
(7, 100, 1), -- Optimal: Nutrition
(7, 90, 1),  -- Near Optimal: Nutrition
(7, 80, 2),  -- Borderline: Exercise
(7, 60, 3),  -- Low: Metabolic
(7, 40, 3);  -- Very Low: Metabolic

-- triglycerides (ID 8)
INSERT INTO biomarker_expertise_score (biomarker_id, score, expertise_type_id) VALUES
(8, 100, 1), -- Optimal: Nutrition
(8, 90, 1),  -- Near Optimal: Nutrition
(8, 80, 2),  -- Slightly Elevated: Exercise
(8, 60, 3),  -- Moderately Elevated: Metabolic
(8, 40, 3),  -- High: Metabolic
(8, 20, 3);  -- Very High: Metabolic
