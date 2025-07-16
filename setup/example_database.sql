
-- --------------------------------------------------------

--
-- Table structure for table `biomarkers`
--

CREATE TABLE IF NOT EXISTS `biomarkers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `biomarkers`
--

INSERT INTO `biomarkers` (`id`, `name`, `description`) VALUES
(1, 'height', 'The vertical measurement of an individual from feet to top of the head, typically measured in centimeters or inches.'),
(2, 'weight', 'The measure of body mass, typically in kilograms or pounds.'),
(3, 'waistCircumference', 'The measurement around the abdomen at the level of the belly button, often used as an indicator of abdominal fat.'),
(4, 'bloodPressureSystolic', 'The pressure in blood vessels when the heart beats, measured in mmHg.'),
(5, 'bloodPressureDiastolic', 'The pressure in blood vessels when the heart rests between beats, measured in mmHg.'),
(6, 'fastingBloodGlucose', 'The level of glucose in the blood after not eating for at least 8 hours, measured in mg/dL or mmol/L.'),
(7, 'hdlCholesterol', 'High-density lipoprotein cholesterol, often called "good" cholesterol, measured in mg/dL or mmol/L.'),
(8, 'triglycerides', 'A type of fat in the blood, measured in mg/dL or mmol/L.'),
(9, 'vitaminD2', 'A form of vitamin D that comes from plant sources and supplements, measured in ng/mL or nmol/L.'),
(10, 'vitaminD3', 'A form of vitamin D that is produced by the body when exposed to sunlight, measured in ng/mL or nmol/L.');

-- --------------------------------------------------------

--
-- Table structure for table `data_upload`
--

CREATE TABLE IF NOT EXISTS `data_upload` (
  `id` int(11) NOT NULL,
  `UserID` varchar(50) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `data` longtext NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `file_type` varchar(10) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `ocr_text` text
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `data_upload`
--

INSERT INTO `data_upload` (`id`, `UserID`, `filename`, `data`, `uploaded_at`, `file_type`, `file_path`, `ocr_text`) VALUES
(1, 'tester@example.com', 'triglycerides - cholestrol.png', '{\n		"Collection Date": "June 24, 2023, 08:49 PM",\n		"Report Date": "June 24, 2023, 09:02 PM",\n		"Total Cholesterol": {\n			"Value": 156,\n			"Unit": "mg/dL",\n			"Reference Range": "0-200 mg/dL"\n		},\n		"Triglycerides level": {\n			"Value": 150,\n			"Unit": "mg/dL",\n			"Reference Range": "0-170 mg/dL"\n		},\n		"HDL Cholesterol": {\n			"Value": 45,\n			"Unit": "mg/dL",\n			"Reference Range": "40-70 mg/dL"\n		},\n		"LDL Cholesterol": {\n			"Value": 181.00,\n			"Unit": "mg/dL",\n			"Reference Range": "0-100 mg/dL"\n		},\n		"Blood Glucose": {\n			"Value": 180,\n			"Unit": "mg/dL",\n			"Reference Range": "60-80 mg/dL"\n		},\n		"Fasting Insulin": {\n			"Value": 18.79,\n			"Unit": "µU/mL",\n			"Reference Range": "<25"\n		}\n		}\n		', '2025-03-12 13:13:59', 'png', '/home/administrator/health-app-server/uploads/0075d8a6b95000ed756236c96fccfd10-triglycerides - cholestrol.png', '-— [4 Hello@flabs.in\nrlabs Q, +91 7253928905\n@ https://www.flabs.in/\nName © Mr Dummy Patient ID © PN2\nAge/Gender © 20/Male Report ID © RE1\nReferred By © Self Collection Date : 24/06/2023 08:49 PM\nPhone No. H Report Date : 24/06/2023 09:02 PM\nBIOCHEMISTRY\nLIPID PROFILE\nTEST DESCRIPTION RESULT REF. RANGE UNIT\nTotal Cholesterol 156 0-200 mg/dl\nTriglycerides level 150 0-170 mg/dl\nHDL Cholesterol 45 40-70 mg/dl\nLDL Cholesterol 81.00 0-100 mg/dl\nVLDL Cholesterol 30.00 6-38 mg/dl\nLDL/HDL RATIO 1.80 25-35\nTotal Cholesterol/HDL RATIO 3.47 35-5\nInterpretation:\nTotal cholesterol <200 mg/dL 200-239 mg/dL. 2240 mg/dL\nLDL cholesterol <100 mg/dL 130-159 mg/dL. 2160 mg/dL\nHDL cholesterol 260 mg/dL 40-59 mg/dL <40 mg/dL.\nTriglycerides <150 mg/dL 150-199 mg/dL. 2200 mg/dL\nDesirable levels of cholesterol and lighserides are associated with a lower risk of heart disease, while high levels increase\nthe risk. HDL cholesterol is often called "good" cholesterol, as it helps to remove excess cholesterol from the blood vessels.\nIn contrast, LDL cholesterol is often called "bad" cholesterol, as it contributes to the buildup of plaque in the arteries.\n');

-- --------------------------------------------------------

--
-- Table structure for table `health_data`
--

CREATE TABLE IF NOT EXISTS `health_data` (
  `id` int(11) NOT NULL,
  `UserID` varchar(50) NOT NULL,
  `Weight` decimal(5,2) NOT NULL,
  `BloodPressureSystolic` int(11) NOT NULL,
  `BloodPressureDiastolic` int(11) NOT NULL,
  `FastingBloodGlucose` int(11) NOT NULL,
  `HDLCholesterol` int(11) NOT NULL,
  `Triglycerides` int(11) NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `height` decimal(5,2) NOT NULL,
  `waistCircumference` decimal(5,2) NOT NULL,
  `vitaminD2` decimal(5,2) NOT NULL,
  `vitaminD3` decimal(5,2) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=208 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `health_data`
--

INSERT INTO `health_data` (`id`, `UserID`, `Weight`, `BloodPressureSystolic`, `BloodPressureDiastolic`, `FastingBloodGlucose`, `HDLCholesterol`, `Triglycerides`, `CreatedAt`, `height`, `waistCircumference`, `vitaminD2`, `vitaminD3`) VALUES
(64, 'user001', '80.50', 120, 80, 95, 45, 150, '2024-12-31 15:49:31', '175.50', '36.20', '45.00', '55.00'),
(65, 'user002', '65.00', 118, 75, 88, 55, 120, '2024-12-31 15:49:31', '162.00', '28.50', '50.00', '60.00'),
(66, 'user003', '95.00', 135, 88, 105, 38, 180, '2024-12-31 15:49:31', '180.00', '40.00', '40.00', '50.00'),
(67, 'user004', '70.50', 140, 90, 110, 50, 160, '2024-12-31 15:49:31', '168.50', '32.00', '55.00', '65.00'),
(68, 'user005', '75.00', 122, 78, 92, 48, 130, '2024-12-31 15:49:31', '178.00', '34.50', '48.00', '58.00'),
(69, 'user006', '64.50', 125, 82, 98, 52, 140, '2024-12-31 15:49:31', '165.50', '29.80', '52.00', '62.00'),
(70, 'user007', '88.50', 138, 88, 108, 40, 170, '2024-12-31 15:49:31', '182.00', '38.50', '42.00', '52.00'),
(71, 'user008', '72.50', 130, 85, 100, 54, 145, '2024-12-31 15:49:31', '170.00', '33.00', '58.00', '68.00'),
(72, 'user009', '79.50', 124, 79, 94, 47, 135, '2024-12-31 15:49:31', '176.50', '35.50', '46.00', '56.00'),
(73, 'user010', '68.00', 145, 92, 115, 49, 175, '2024-12-31 15:49:31', '163.00', '31.50', '54.00', '64.00'),
(74, 'user011', '84.00', 128, 82, 97, 44, 155, '2024-12-31 15:49:31', '179.00', '37.00', '44.00', '54.00'),
(75, 'user012', '66.00', 135, 87, 105, 53, 150, '2024-12-31 15:49:31', '166.50', '30.50', '56.00', '66.00'),
(76, 'user013', '90.50', 132, 86, 102, 42, 165, '2024-12-31 15:49:31', '181.00', '39.00', '43.00', '53.00'),
(77, 'user014', '59.00', 116, 74, 90, 58, 110, '2024-12-31 15:49:31', '160.00', '27.50', '60.00', '70.00'),
(78, 'user015', '86.50', 142, 90, 112, 39, 185, '2024-12-31 15:49:31', '177.50', '38.00', '41.00', '51.00'),
(79, 'user016', '70.50', 128, 84, 99, 51, 140, '2024-12-31 15:49:31', '169.00', '32.50', '53.00', '63.00'),
(80, 'user017', '77.00', 120, 78, 93, 46, 125, '2024-12-31 15:49:31', '174.00', '35.00', '47.00', '57.00'),
(81, 'user018', '67.50', 132, 86, 103, 52, 155, '2024-12-31 15:49:31', '167.50', '31.00', '55.00', '65.00'),
(82, 'user019', '93.00', 138, 89, 107, 41, 175, '2024-12-31 15:49:31', '183.00', '39.50', '42.00', '52.00'),
(83, 'user020', '63.50', 122, 80, 96, 56, 130, '2024-12-31 15:49:31', '164.00', '29.00', '59.00', '69.00'),
(84, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:04:43', '170.00', '32.00', '50.00', '50.00'),
(85, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:07:03', '170.00', '32.00', '50.00', '50.00'),
(86, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:07:49', '170.00', '32.00', '50.00', '50.00'),
(87, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:28:49', '170.00', '32.00', '50.00', '50.00'),
(88, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:29:09', '170.00', '32.00', '50.00', '50.00'),
(89, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:30:13', '170.00', '32.00', '50.00', '50.00'),
(90, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:31:12', '170.00', '32.00', '50.00', '50.00'),
(91, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:34:59', '170.00', '32.00', '50.00', '50.00'),
(92, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:37:07', '170.00', '32.00', '50.00', '50.00'),
(93, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:10', '170.00', '32.00', '50.00', '50.00'),
(94, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:13', '170.00', '32.00', '50.00', '50.00'),
(95, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:14', '170.00', '32.00', '50.00', '50.00'),
(96, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:15', '170.00', '32.00', '50.00', '50.00'),
(97, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:15', '170.00', '32.00', '50.00', '50.00'),
(98, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:16', '170.00', '32.00', '50.00', '50.00'),
(99, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:17', '170.00', '32.00', '50.00', '50.00'),
(100, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:40:18', '170.00', '32.00', '50.00', '50.00'),
(101, 'test', '70.00', 120, 80, 100, 50, 150, '2024-12-31 16:47:32', '170.00', '32.00', '50.00', '50.00'),
(102, 'test', '75.00', 140, 90, 100, 50, 150, '2025-01-02 13:20:44', '180.00', '32.00', '50.00', '50.00'),
(103, 'test@example.com', '70.00', 120, 80, 100, 50, 150, '2025-01-02 13:39:46', '170.00', '32.00', '50.00', '50.00'),
(104, 'test@example.com', '70.00', 120, 80, 100, 50, 150, '2025-01-03 13:41:16', '170.00', '32.00', '50.00', '50.00'),
(105, 'test@example.com', '75.00', 123, 83, 101, 50, 150, '2025-01-04 15:23:37', '170.00', '31.00', '50.00', '50.00'),
(106, 'test@example.com', '76.00', 123, 83, 101, 50, 150, '2025-01-05 15:25:43', '171.00', '32.00', '51.00', '51.00'),
(107, 'test@example.com', '70.00', 120, 80, 101, 50, 150, '2025-01-03 15:34:58', '170.00', '31.00', '50.00', '50.00'),
(108, 'test@example.com', '77.00', 123, 83, 101, 50, 150, '2025-01-03 15:38:51', '172.00', '33.00', '52.00', '52.00'),
(109, 'test@example.com', '77.00', 121, 83, 98, 48, 150, '2025-01-03 15:44:50', '172.00', '31.00', '50.00', '50.00'),
(110, 'test@example.com', '76.00', 123, 83, 101, 50, 150, '2025-01-03 18:32:33', '171.00', '32.00', '54.00', '54.00'),
(111, 'test@example.com', '76.00', 123, 83, 101, 50, 150, '2025-01-03 18:32:45', '171.00', '32.00', '54.00', '54.00'),
(112, 'test@example.com', '65.00', 140, 100, 100, 50, 150, '2025-01-06 23:52:58', '170.00', '32.00', '50.00', '50.00'),
(113, 'test@example.com', '75.00', 150, 90, 100, 100, 110, '2025-01-09 12:31:32', '170.00', '67.00', '100.00', '100.00'),
(114, 'test@example.com', '75.00', 150, 90, 100, 100, 110, '2025-01-09 12:41:33', '170.00', '67.00', '50.00', '50.00'),
(115, 'test@example.com', '70.00', 120, 78, 93, 46, 125, '2025-01-21 13:47:25', '170.00', '80.00', '47.00', '57.00'),
(116, 'tester@example.com', '84.00', 120, 80, 93, 48, 125, '2025-01-24 13:51:10', '170.00', '80.00', '50.00', '60.00'),
(117, 'tester@example.com', '75.00', 120, 80, 93, 50, 126, '2025-01-24 16:00:35', '170.00', '70.00', '43.00', '53.00'),
(118, 'test@example.com', '70.00', 120, 78, 93, 46, 125, '2025-01-29 10:58:46', '170.00', '80.00', '47.00', '57.00'),
(119, 'test@example.com', '70.00', 150, 78, 93, 46, 125, '2025-01-29 10:59:42', '170.00', '80.00', '47.00', '68.00'),
(120, 'test@example.com', '70.00', 120, 78, 93, 46, 125, '2025-01-29 11:00:00', '170.00', '80.00', '47.00', '57.00'),
(121, 'test@example.com', '70.00', 120, 78, 93, 46, 125, '2025-01-29 11:01:11', '170.00', '80.00', '47.00', '57.00'),
(122, 'test@example.com', '70.00', 80, 40, 55, 100, 200, '2025-02-04 13:12:49', '170.00', '80.00', '80.00', '80.00'),
(123, 'test@example.com', '70.00', 180, 110, 200, 20, 200, '2025-02-04 13:19:48', '170.00', '80.00', '80.00', '80.00'),
(124, 'test@example.com', '70.00', 180, 110, 200, 50, 200, '2025-02-05 12:42:40', '170.00', '80.00', '80.00', '80.00'),
(125, 'test@example.com', '70.00', 180, 110, 200, 100, 200, '2025-02-05 12:43:28', '170.00', '80.00', '80.00', '80.00'),
(126, 'tester@example.com', '75.00', 120, 80, 93, 50, 126, '2025-02-05 13:11:10', '170.00', '70.00', '20.00', '53.00'),
(127, 'tester@example.com', '75.00', 120, 80, 93, 50, 126, '2025-02-07 14:03:40', '170.00', '70.00', '20.00', '53.00'),
(128, 'tester@example.com', '81.00', 120, 78, 93, 46, 125, '2025-02-07 14:05:25', '161.00', '80.00', '47.00', '57.00'),
(129, 'tester@example.com', '70.00', 120, 80, 93, 50, 126, '2025-02-18 18:49:15', '170.00', '80.00', '27.67', '53.00'),
(130, 'tester@example.com', '70.00', 120, 80, 93, 50, 126, '2025-02-20 16:45:18', '170.00', '80.00', '27.67', '53.00'),
(131, 'tester@example.com', '70.00', 120, 80, 93, 50, 126, '2025-02-24 11:36:13', '170.00', '80.00', '27.67', '53.00'),
(132, 'tester@example.com', '70.00', 190, 80, 93, 50, 126, '2025-02-24 11:43:18', '170.00', '80.00', '27.67', '53.00'),
(133, 'tester@example.com', '70.00', 120, 80, 93, 50, 126, '2025-02-24 11:55:28', '170.00', '80.00', '27.67', '53.00'),
(134, 'tester@example.com', '70.00', 190, 80, 93, 50, 126, '2025-02-24 11:57:00', '170.00', '80.00', '27.67', '53.00'),
(135, 'tester@example.com', '70.00', 200, 100, 200, 50, 126, '2025-02-24 12:01:07', '170.00', '80.00', '27.67', '53.00'),
(136, 'test@example.com', '70.00', 142, 82, 104, 50, 126, '2025-02-24 13:45:44', '170.00', '80.00', '27.67', '53.00'),
(137, 'tester@example.com', '70.00', 142, 82, 104, 50, 126, '2025-02-24 13:59:01', '150.00', '80.00', '27.67', '53.00'),
(138, 'tester@example.com', '70.00', 142, 82, 0, 0, 0, '2025-02-24 23:44:34', '150.00', '80.00', '0.00', '0.00'),
(139, 'tester@example.com', '70.00', 142, 82, 9, 45, 150, '2025-02-24 23:48:08', '150.00', '80.00', '0.00', '0.00'),
(140, 'tester@example.com', '70.00', 142, 82, 9, 45, 150, '2025-02-24 23:59:21', '150.00', '80.00', '0.00', '0.00'),
(141, 'tester@example.com', '70.00', 142, 82, 9, 45, 150, '2025-02-24 23:59:51', '150.00', '80.00', '0.00', '0.00'),
(142, 'tester@example.com', '70.00', 142, 82, 9, 45, 150, '2025-02-25 00:04:44', '150.00', '80.00', '0.00', '0.00'),
(143, 'tester@example.com', '70.00', 142, 82, 9, 45, 150, '2025-02-25 00:19:58', '150.00', '80.00', '0.00', '0.00'),
(144, 'tester@example.com', '70.00', 142, 82, 80, 45, 150, '2025-02-25 00:21:56', '150.00', '80.00', '0.00', '0.00'),
(145, 'tester@example.com', '70.00', 142, 82, 80, 45, 150, '2025-02-25 00:24:43', '150.00', '80.00', '0.00', '0.00'),
(146, 'tester@example.com', '70.00', 142, 82, 80, 45, 151, '2025-02-25 12:01:59', '150.00', '80.00', '0.00', '0.00'),
(147, 'tester@example.com', '70.00', 142, 82, 71, 46, 129, '2025-02-25 12:02:21', '170.00', '80.00', '0.00', '0.00'),
(148, 'tester@example.com', '70.00', 142, 82, 80, 45, 150, '2025-02-25 12:03:53', '170.00', '80.00', '0.00', '0.00'),
(149, 'tester@example.com', '70.00', 141, 82, 72, 46, 130, '2025-02-25 12:42:59', '170.00', '80.00', '0.00', '0.00'),
(150, 'tester@example.com', '70.00', 141, 82, 80, 45, 150, '2025-02-27 14:03:48', '170.00', '80.00', '0.00', '0.00'),
(151, 'tester@example.com', '70.00', 141, 82, 80, 45, 150, '2025-02-27 14:04:59', '170.00', '80.00', '0.00', '0.00'),
(152, 'tester@example.com', '70.00', 141, 82, 80, 45, 150, '2025-02-28 14:47:19', '170.00', '80.00', '0.00', '0.00'),
(153, 'tester@example.com', '70.00', 141, 82, 80, 45, 150, '2025-03-06 16:53:47', '170.00', '80.00', '0.00', '0.00'),
(154, 'tester@example.com', '70.00', 141, 82, 80, 67, 0, '2025-03-06 17:26:50', '170.00', '80.00', '0.00', '0.00'),
(155, 'tester@example.com', '70.00', 141, 82, 0, 45, 150, '2025-03-11 16:31:09', '170.00', '80.00', '0.00', '0.00'),
(156, 'tester@example.com', '70.00', 141, 82, 0, 45, 150, '2025-03-11 16:33:27', '170.00', '80.00', '0.00', '0.00'),
(157, 'tester@example.com', '63.00', 0, 0, 0, 0, 0, '2025-03-11 16:48:03', '190.00', '152.00', '0.00', '0.00'),
(158, 'tester@example.com', '67.00', 0, 0, 0, 0, 0, '2025-03-11 16:49:58', '163.00', '90.00', '0.00', '0.00'),
(159, 'tester@example.com', '67.00', 0, 0, 180, 45, 150, '2025-03-11 16:50:33', '163.00', '90.00', '0.00', '0.00'),
(160, 'tester@example.com', '74.00', 0, 0, 0, 0, 0, '2025-03-11 16:55:25', '182.00', '89.00', '0.00', '0.00'),
(161, 'tester@example.com', '74.00', 0, 0, 180, 45, 150, '2025-03-11 16:56:03', '182.00', '89.00', '0.00', '0.00'),
(162, 'tester@example.com', '84.00', 0, 0, 0, 0, 0, '2025-03-11 17:03:14', '159.00', '100.00', '0.00', '0.00'),
(163, 'tester@example.com', '84.00', 0, 0, 180, 45, 150, '2025-03-11 17:03:35', '159.00', '100.00', '0.00', '0.00'),
(164, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-11 17:07:35', '170.00', '80.00', '0.00', '0.00'),
(165, 'tester@example.com', '70.00', 0, 0, 180, 45, 150, '2025-03-11 17:07:55', '170.00', '80.00', '0.00', '0.00'),
(166, 'tester@example.com', '79.00', 0, 0, 0, 0, 0, '2025-03-12 13:08:36', '182.00', '120.00', '0.00', '0.00'),
(167, 'tester@example.com', '79.00', 0, 0, 0, 0, 0, '2025-03-12 13:11:23', '182.00', '120.00', '0.00', '0.00'),
(168, 'tester@example.com', '79.00', 0, 0, 0, 0, 0, '2025-03-12 13:13:08', '182.00', '120.00', '0.00', '0.00'),
(169, 'tester@example.com', '79.00', 0, 0, 0, 0, 0, '2025-03-12 13:13:39', '182.00', '120.00', '0.00', '0.00'),
(170, 'tester@example.com', '79.00', 0, 0, 180, 45, 150, '2025-03-12 13:13:59', '182.00', '120.00', '0.00', '0.00'),
(171, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 13:17:41', '170.00', '80.00', '0.00', '0.00'),
(172, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 13:23:54', '170.00', '80.00', '0.00', '0.00'),
(173, 'tester@example.com', '70.00', 99, 57, 64, 36, 105, '2025-03-12 13:29:15', '170.00', '80.00', '0.00', '0.00'),
(174, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 14:24:07', '170.00', '80.00', '0.00', '0.00'),
(175, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 14:26:19', '170.00', '80.00', '0.00', '0.00'),
(176, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 16:08:19', '170.00', '80.00', '0.00', '0.00'),
(177, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 16:08:19', '170.00', '80.00', '0.00', '0.00'),
(178, 'tester@example.com', '70.00', 0, 0, 0, 0, 0, '2025-03-12 16:09:08', '170.00', '80.00', '0.00', '0.00'),
(179, 'tester@example.com', '70.00', 87, 50, 57, 32, 92, '2025-03-12 16:20:20', '170.00', '80.00', '0.00', '0.00'),
(180, 'tester@example.com', '70.00', 87, 50, 57, 44, 92, '2025-03-21 12:54:53', '170.00', '80.00', '0.00', '0.00'),
(181, 'tester@example.com', '70.00', 87, 50, 57, 32, 92, '2025-03-21 13:00:17', '170.00', '80.00', '0.00', '0.00'),
(182, 'tester@example.com', '70.00', 87, 50, 57, 32, 92, '2025-03-21 13:03:30', '170.00', '80.00', '0.00', '0.00'),
(183, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-21 13:42:26', '170.00', '80.00', '0.00', '0.00'),
(184, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-24 12:55:33', '170.00', '80.00', '0.00', '0.00'),
(185, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-24 13:14:58', '170.00', '80.00', '0.00', '0.00'),
(186, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-24 13:19:55', '170.00', '80.00', '0.00', '0.00'),
(187, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-24 13:22:02', '170.00', '80.00', '0.00', '0.00'),
(188, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-24 13:30:14', '170.00', '80.00', '0.00', '0.00'),
(189, 'tester@example.com', '70.00', 87, 50, 60, 50, 70, '2025-03-24 13:37:16', '170.00', '80.00', '0.00', '0.00'),
(190, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-24 13:51:08', '170.00', '80.00', '0.00', '0.00'),
(191, 'tester@example.com', '70.00', 87, 50, 92, 67, 53, '2025-03-26 17:46:49', '170.00', '80.00', '0.00', '0.00'),
(192, 'tester@example.com', '70.00', 87, 50, 61, 37, 87, '2025-03-27 14:00:46', '170.00', '80.00', '0.00', '0.00'),
(193, 'tester@example.com', '70.00', 87, 50, 61, 37, 87, '2025-03-27 14:05:31', '170.00', '80.00', '0.00', '0.00'),
(194, 'tester@example.com', '70.00', 87, 50, 61, 37, 87, '2025-03-27 14:13:04', '170.00', '80.00', '0.00', '0.00'),
(195, 'tester@example.com', '70.00', 87, 50, 61, 37, 87, '2025-03-27 15:02:58', '170.00', '80.00', '0.00', '0.00'),
(196, 'tester@example.com', '70.00', 150, 50, 61, 37, 87, '2025-03-27 15:57:16', '170.00', '80.00', '0.00', '0.00'),
(197, 'tester@example.com', '70.00', 150, 50, 61, 100, 87, '2025-03-27 16:07:57', '170.00', '80.00', '0.00', '0.00'),
(198, 'tester@example.com', '70.00', 150, 50, 61, 200, 87, '2025-03-27 16:11:22', '170.00', '80.00', '0.00', '0.00'),
(199, 'tester@example.com', '70.00', 90, 50, 61, 40, 87, '2025-03-28 14:35:10', '170.00', '80.00', '0.00', '0.00'),
(200, 'tester@example.com', '77.00', 89, 50, 64, 40, 89, '2025-03-31 11:36:51', '164.00', '89.00', '0.00', '0.00'),
(201, 'tester@example.com', '77.00', 89, 50, 64, 40, 90, '2025-03-31 12:27:09', '164.00', '89.00', '0.00', '0.00'),
(202, 'tester@example.com', '77.00', 89, 50, 64, 40, 91, '2025-03-31 12:27:45', '164.00', '89.00', '0.00', '0.00'),
(203, 'tester@example.com', '77.00', 89, 50, 64, 40, 92, '2025-03-31 12:32:12', '164.00', '89.00', '0.00', '0.00'),
(204, 'tester@example.com', '77.00', 89, 50, 92, 67, 53, '2025-03-31 12:33:59', '164.00', '89.00', '0.00', '0.00'),
(205, 'tester@example.com', '77.00', 89, 50, 92, 53, 53, '2025-04-01 11:12:31', '164.00', '89.00', '0.00', '0.00'),
(206, 'tester@example.com', '77.00', 89, 50, 92, 53, 53, '2025-04-02 11:09:13', '164.00', '70.00', '0.00', '0.00'),
(207, 'tester@example.com', '77.00', 89, 50, 92, 53, 53, '2025-04-02 11:15:34', '164.00', '90.00', '0.00', '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE IF NOT EXISTS `login_history` (
  `id` int(11) NOT NULL,
  `UserID` varchar(50) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success` tinyint(1) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `login_history`
--

INSERT INTO `login_history` (`id`, `UserID`, `login_time`, `success`) VALUES
(1, 'test@example.com', '2025-01-24 13:29:18', 0),
(2, 'test@example.com', '2025-01-24 13:30:41', 0),
(3, 'tester@example.com', '2025-01-24 13:30:52', 0),
(4, 'tester@example.com', '2025-01-24 13:30:54', 0),
(5, 'tester@example.com', '2025-01-24 13:30:56', 0);

-- --------------------------------------------------------

--
-- Table structure for table `recommendations`
--

CREATE TABLE IF NOT EXISTS `recommendations` (
  `id` int(11) NOT NULL,
  `biomarker_id` int(11) NOT NULL,
  `range_from` decimal(10,2) NOT NULL,
  `range_to` decimal(10,2) NOT NULL,
  `type` enum('supplement','activity','action','keto','paleo','carnivore') NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `recommendations`
--

INSERT INTO `recommendations` (`id`, `biomarker_id`, `range_from`, `range_to`, `type`, `description`) VALUES
(1, 8, '150.00', '300.00', 'supplement', 'Fish Oil (1000–2000 mg/day). Reduces triglycerides, improves heart health, and supports metabolic function.'),
(2, 7, '40.00', '300.00', 'supplement', 'Omega-3, Niacin, and antioxidants. Increases HDL and improves lipid balance.'),
(3, 1, '25.00', '29.90', 'activity', 'Increase physical activity and consider reducing calorie intake.'),
(4, 1, '30.00', '100.00', 'action', 'Consult with a healthcare professional about a weight loss plan.'),
(5, 2, '0.00', '120.00', 'supplement', 'Consider iron supplements after consulting with a doctor.'),
(6, 2, '120.00', '160.00', 'action', 'Maintain current diet and exercise routine.'),
(7, 2, '160.00', '300.00', 'activity', 'Increase cardiovascular exercise to lower blood pressure.'),
(8, 3, '0.40', '1.00', 'supplement', 'Consider taking omega-3 supplements to increase HDL levels.'),
(9, 3, '0.40', '1.00', 'action', 'Maintain current diet and exercise routine.'),
(10, 3, '0.40', '1.00', 'activity', 'Increase physical activity to optimize HDL levels.'),
(11, 8, '150.00', '300.00', 'activity', 'Limit alcohol, reduce saturated fats, and focus on aerobic exercise for cardiovascular health.'),
(12, 8, '150.00', '300.00', 'keto', 'Reduce refined carbs incorporate omega-3'),
(13, 8, '150.00', '300.00', 'paleo', 'Grass-fed meats, avoid seed oils'),
(14, 8, '150.00', '300.00', 'carnivore', 'High-fat intake with animal sources'),
(15, 7, '40.00', '300.00', 'activity', 'Increase physical activity, eat healthy fats, and reduce processed food intake.'),
(16, 7, '40.00', '300.00', 'keto', 'Reduce sugar, incorporate berberine'),
(17, 7, '40.00', '300.00', 'paleo', 'Low sugar, whole foods diet'),
(18, 7, '40.00', '300.00', 'carnivore', 'Eliminate processed foods completely'),
(19, 9, '30.00', '100.00', 'supplement', 'Vitamin D3 (5000–10,000 IU/day) + K2 (100–200 mcg/day). Supports calcium absorption, bone health, and immune function.'),
(20, 9, '30.00', '100.00', 'activity', 'Increase sunlight exposure, weight-bearing exercises, and stress reduction techniques like yoga or meditation.'),
(21, 9, '30.00', '100.00', 'keto', 'Supports fat-soluble absorption, pair with fatty meals'),
(22, 9, '30.00', '100.00', 'paleo', 'Promote through sunlight & fish consumption	'),
(23, 9, '30.00', '100.00', 'carnivore', 'Animal fats for D3 bioavailability');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `UserID` varchar(50) NOT NULL,
  `Sex` enum('Male','Female','Other') NOT NULL,
  `DateOfBirth` date NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `login_attempts` int(11) DEFAULT '0',
  `last_login_attempt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `Sex`, `DateOfBirth`, `password`, `name`, `login_attempts`, `last_login_attempt`) VALUES
('tester@example.com', 'Male', '1988-05-15', '', '', 0, '2025-01-24 11:25:32'),
('test@example.com', 'Male', '1988-05-15', '', '', 0, '2025-01-24 11:25:32'),
('user001', 'Male', '1988-05-15', '', '', 0, '2025-01-24 11:25:32'),
('user002', 'Female', '1995-09-22', '', '', 0, '2025-01-24 11:25:32'),
('user003', 'Male', '1981-11-30', '', '', 0, '2025-01-24 11:25:32'),
('user004', 'Female', '1968-03-10', '', '', 0, '2025-01-24 11:25:32'),
('user005', 'Male', '1993-07-05', '', '', 0, '2025-01-24 11:25:32'),
('user006', 'Female', '1984-12-18', '', '', 0, '2025-01-24 11:25:32'),
('user007', 'Male', '1973-02-25', '', '', 0, '2025-01-24 11:25:32'),
('user008', 'Female', '1978-08-07', '', '', 0, '2025-01-24 11:25:32'),
('user009', 'Male', '1990-04-12', '', '', 0, '2025-01-24 11:25:32'),
('user010', 'Female', '1963-10-01', '', '', 0, '2025-01-24 11:25:32'),
('user011', 'Male', '1986-06-20', '', '', 0, '2025-01-24 11:25:32'),
('user012', 'Female', '1971-01-15', '', '', 0, '2025-01-24 11:25:32'),
('user013', 'Male', '1975-09-08', '', '', 0, '2025-01-24 11:25:32'),
('user014', 'Female', '1992-11-27', '', '', 0, '2025-01-24 11:25:32'),
('user015', 'Male', '1965-04-03', '', '', 0, '2025-01-24 11:25:32'),
('user016', 'Female', '1980-07-19', '', '', 0, '2025-01-24 11:25:32'),
('user017', 'Male', '1994-02-14', '', '', 0, '2025-01-24 11:25:32'),
('user019', 'Male', '1969-08-22', '', '', 0, '2025-01-24 11:25:32'),
('user020', 'Female', '1987-03-30', '', '', 0, '2025-01-24 11:25:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `biomarkers`
--
ALTER TABLE `biomarkers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `data_upload`
--
ALTER TABLE `data_upload`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `health_data`
--
ALTER TABLE `health_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `biomarker_id` (`biomarker_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `biomarkers`
--
ALTER TABLE `biomarkers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `data_upload`
--
ALTER TABLE `data_upload`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `health_data`
--
ALTER TABLE `health_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=208;
--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=189;
--
-- AUTO_INCREMENT for table `recommendations`
--
ALTER TABLE `recommendations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=24;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `recommendations`
--
ALTER TABLE `recommendations`
  ADD CONSTRAINT `recommendations_ibfk_1` FOREIGN KEY (`biomarker_id`) REFERENCES `biomarkers` (`id`);
