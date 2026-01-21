# File Parsing Documentation

## Purpose

System for parsing uploaded medical documents and extracting structured health biomarker data.

---

## Processing Pipeline

1. File Upload → Validation (type, size)
2. Save to Disk (unique filename)
3. Text Extraction (OCR/PDF parsing)
4. AI Structured Data Extraction (OpenAI GPT-4)
5. Save to Database (data_upload, health_data)
6. Calculate Biomarker Scores
7. Assign Digital Journey Plan
8. Assign Expertise Types

---

## Supported File Formats

| Format | Extensions              | Processing Method | Max Size |
| ------ | ----------------------- | ----------------- | -------- |
| PDF    | `.pdf`                  | pdf-parse         | 20 MB    |
| Images | `.jpg`, `.jpeg`, `.png` | Tesseract OCR     | 20 MB    |
| Excel  | `.xlsx`, `.xls`         | In development    | 20 MB    |
| CSV    | `.csv`                  | In development    | 20 MB    |

---

## System Architecture

```
Controller Layer
    ├── OCR Service (Tesseract)
    ├── PDF Parser (pdf-parse)
    └── AI Extraction Service (OpenAI GPT-4)
            ↓
    Database Layer (data_upload, health_data)
```

**Layers:**

- **Controller:** Handles file upload, orchestrates processing flow
- **Services:** OCR processing, AI extraction logic
- **Routes:** Endpoint definitions and authentication
- **Middleware:** File upload handling, JWT validation
- **Config:** OpenAI and database configuration

---

## File Validation Rules

### Type Validation

- Check file magic bytes using `file-type-from-buffer`
- Allowed extensions: `csv, xlsx, xls, pdf, jpg, jpeg, png`
- Return `400` error for invalid types

### Size Validation

- Maximum size: 20 MB (20 _ 1024 _ 1024 bytes)
- Return `400` error if exceeded

---

## Text Extraction Methods

### PDF Files

- **Library:** `pdf-parse`
- **Process:** Read buffer → Parse PDF → Extract text
- **Output:** Raw text string

### Image Files (JPG, JPEG, PNG)

- **Library:** `tesseract.js`
- **Language:** English (`eng`)
- **Process:** Create worker → Recognize → Terminate worker
- **Output:** Recognized text string

### PDF to Image Conversion (Optional)

- **Library:** `gm` (GraphicsMagick)
- **Settings:** 300 DPI density, A4 size (2480x3508), 100% quality
- **Use Case:** When PDF text extraction fails

---

## AI Data Extraction

### Configuration

- **Model:** OpenAI GPT-4o
- **Environment Variable:** `ENABLE_OPENAI_DATA_EXTRACTION=true`
- **Fallback:** Dummy template data if disabled

### Extraction Process

1. Send OCR text to OpenAI with system prompt
2. Prompt defines JSON structure for biomarkers
3. Parse response (clean markdown blocks, escaped quotes)
4. Merge with template to ensure all fields present
5. Return structured JSON

### Expected Biomarker Structure

```json
{
  "Collection Date": "DD/MM/YYYY HH:MM AM/PM",
  "Report Date": "DD/MM/YYYY HH:MM AM/PM",
  "Total Cholesterol": { "Value": number, "Unit": "mg/dL", "Reference Range": "0-200 mg/dL" },
  "Triglycerides level": { "Value": number, "Unit": "mg/dL", "Reference Range": "0-170 mg/dL" },
  "HDL Cholesterol": { "Value": number, "Unit": "mg/dL", "Reference Range": "40-70 mg/dL" },
  "LDL Cholesterol": { "Value": number, "Unit": "mg/dL", "Reference Range": "0-100 mg/dL" },
  "Blood Glucose": { "Value": number, "Unit": "mg/dL", "Reference Range": "60-80 mg/dL" },
  "Fasting Insulin": { "Value": number, "Unit": "µU/mL", "Reference Range": "<25" }
}
```

### Data Template

- Function `getHealthDataTemplate()` provides default structure
- All missing biomarkers default to Value: 0
- Ensures consistent data shape for downstream processing

---

## Database Storage

### Tables

#### data_upload

Stores file metadata and extracted data:

- `UserID` - Foreign key to users table
- `filename` - Original filename
- `data` - TEXT field with JSON extracted data
- `file_type` - File extension (pdf, jpg, png)
- `file_path` - Path to saved file on disk
- `ocr_text` - Raw OCR/PDF extracted text
- `uploaded_at` - Timestamp

#### health_data

Stores normalized biomarker values:

- `UserID` - Foreign key to users table
- `fastingBloodGlucose` - DECIMAL(5,2)
- `hdlCholesterol` - DECIMAL(5,2)
- `triglycerides` - DECIMAL(5,2)
- `height` - DECIMAL(5,2)
- `weight` - DECIMAL(5,2)
- `waistCircumference` - DECIMAL(5,2)
- `bloodPressureSystolic` - INT
- `bloodPressureDiastolic` - INT
- `CreatedAt` - Timestamp

### Storage Process

1. Insert into `data_upload` with file metadata and JSON results
2. Retrieve previous `health_data` for user (to fill missing fields)
3. Parse AI JSON response and merge with template
4. Extract biomarker values from JSON structure
5. Insert into `health_data` with both new and carried-forward values

---

## API Endpoints

### POST /import-file

**Authentication:** Required (JWT Bearer token)

**Request:**

- Content-Type: `multipart/form-data`
- Body: `file` (binary), `UserID` (string)

**Response (Success - 201):**

```json
{
  "message": "File uploaded successfully",
  "id": number,
  "filePath": string,
  "ocrText": string,
  "generalHealthScore": number,
  "biomarkerScores": {
    "3": number,  // waistCircumference
    "4": number,  // bloodPressureSystolic
    "5": number,  // bloodPressureDiastolic
    "6": number,  // fastingBloodGlucose
    "7": number,  // hdlCholesterol
    "8": number   // triglycerides
  }
}
```

**Error Responses:**

- `400` - No file uploaded / UserID missing / Invalid file type / File too large
- `429` - OpenAI quota exceeded
- `500` - Server error

### POST /get-data-files

**Request:**

```json
{
  "UserID": number
}
```

**Response:**

```json
[
  {
    "id": number,
    "fileName": string,
    "fileType": string,
    "uploadDate": ISO8601 timestamp
  }
]
```

---

## Error Handling

| Code | Type               | Description                    |
| ---- | ------------------ | ------------------------------ |
| 400  | No file uploaded   | File missing in request        |
| 400  | UserID required    | UserID missing in body         |
| 400  | Invalid file type  | Unsupported format             |
| 400  | File too large     | Exceeds 20 MB                  |
| 429  | Insufficient quota | OpenAI API rate limit exceeded |
| 500  | Server error       | Internal processing error      |

---

## Post-Processing

After successful file parsing, system automatically:

1. **Calculate biomarker scores** (see SCORING_LOGIC.md)
2. **Assign digital journey plan** based on scores
3. **Assign expertise types** based on low-scoring biomarkers
4. **Generate personalized recommendations** (see RECOMMENDATIONS.md)

---

## Performance Considerations

### Known Limitations

- Synchronous processing (blocks until complete)
- Single OCR language support (English)
- No batch file processing
- Local disk storage only

### Future Optimizations

- Image preprocessing (grayscale, contrast, denoise)
- Async processing with job queues
- Multi-language OCR support
- Cloud storage integration
