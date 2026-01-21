# Document Management Endpoints

Complete documentation for file upload and document management API endpoints.

---

## POST /import-file

**Purpose**: Upload and process health documents (PDF, images) with OCR and AI extraction

**Authentication**: Required (JWT token)

**Content-Type**: `multipart/form-data`

**Related Files**:

- Controller: `controllers/dataIngestionController.js` - `importFile()`
- Services: `services/ocrService.js`, `services/aiExtractionService.js`
- Routes: `routes/dataIngestion.js`

**Request Body** (form-data):

- `file` - File to upload (PDF, JPG, JPEG, PNG)
- `UserID` - User ID uploading the file

**File Constraints**:

- **Max Size**: 20MB
- **Allowed Types**: PDF, JPG, JPEG, PNG, CSV, XLSX, XLS
- **Storage**: File system (uploads folder)

**Response** (201 Created):

```json
{
    "message": "File uploaded successfully",
    "id": 42,
    "filePath": "/path/to/uploads/abc123-blood_test.pdf",
    "ocrText": "{\"Blood Glucose\":{\"Value\":95,\"Unit\":\"mg/dL\"}}",
    "generalHealthScore": 84.0,
    "biomarkerScores": [
        {
            "biomarker_name": "Fasting Blood Glucose",
            "score": 80,
            "status": "Good"
        }
    ]
}
```

**Business Logic**:

1. **File Validation**:
    - Check file exists and size ≤ 20MB
    - Validate MIME type against allowed types
    - Return 400 if invalid

2. **File Storage**:
    - Generate unique filename with crypto.randomBytes()
    - Save to uploads folder on disk
    - Store file metadata in database

3. **Text Extraction**:
    - **PDF**: Extract text with pdf-parse library
    - **Images**: Perform OCR with Tesseract.js

4. **AI Data Extraction** (if `ENABLE_OPENAI_DATA_EXTRACTION=true`):
    - Send OCR text to OpenAI GPT-4
    - Extract structured biomarker data (glucose, cholesterol, triglycerides)
    - Parse JSON response and combine with template
    - **Fallback**: Return dummy data if OpenAI disabled

5. **Data Storage**:
    - Insert file metadata into `data_upload` table
    - Retrieve user's previous health data (height, weight, etc.)
    - Insert extracted biomarkers into `health_data` table

6. **Score Calculation**:
    - Calculate biomarker scores using `calculateAndStoreUserScores()`
    - Update `user_scores` and `users.general_health_score`

7. **Automatic Assignments**:
    - Assign digital journey plan based on scores
    - Assign provider expertise types based on scores
    - Don't fail upload if assignments fail

**Error Responses**:

- `400 Bad Request` - No file, invalid type, or file too large
- `401 Unauthorized` - Invalid or missing token
- `429 Too Many Requests` - OpenAI quota exceeded
- `500 Internal Server Error` - Processing error (OCR, AI, database)

**cURL Example**:

```bash
curl -X POST http://localhost:4000/import-file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@blood_test.pdf" \
  -F "UserID=1"
```

**Dependencies**:

- `tesseract.js` - OCR for images
- `pdf-parse` - PDF text extraction
- `openai` - AI-powered data extraction
- `file-type` - File type detection
- `crypto` - Generate unique filenames

---

## POST /get-data-files

**Purpose**: List all documents uploaded by user

**Authentication**: Required (JWT token)

**Related Files**:

- Controller: `controllers/dataIngestionController.js` - `getDataFiles()`
- Routes: `routes/dataIngestion.js`

**Request Body**:

```json
{
    "UserID": 1
}
```

**Response** (200 OK):

```json
[
    {
        "id": 42,
        "fileName": "blood_test_results.pdf",
        "fileType": "pdf",
        "uploadDate": "2025-01-20T14:30:00.000Z"
    },
    {
        "id": 38,
        "fileName": "health_report.jpg",
        "fileType": "jpg",
        "uploadDate": "2025-01-15T09:15:00.000Z"
    }
]
```

**Business Logic**:

- Query `data_upload` table for user's files
- Order by upload date descending (newest first)
- Return metadata only (not file contents)
- Transforms database columns: `filename AS fileName`, `file_type as fileType`, `uploaded_at as uploadDate`

**Error Responses**:

- `400 Bad Request` - Missing UserID
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Database error

**cURL Example**:

```bash
curl -X POST http://localhost:4000/get-data-files \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"UserID": 1}'
```

---

## Architecture

### Service Layer Pattern

```
Route (dataIngestion.js)
  ↓
Controller (dataIngestionController.js)
  ↓
Services:
  ├─> ocrService.js (Text extraction)
  ├─> aiExtractionService.js (OpenAI data extraction)
  └─> Database (pool.execute)
```

### OCR Service (`services/ocrService.js`)

**Functions**:

- `performOCR(filePath)` - Extract text from images using Tesseract.js
- `convertPDFtoJPG(pdfPath, outputPath)` - Convert PDF to JPG with GraphicsMagick (not currently used)

**Dependencies**: `tesseract.js`, `gm` (GraphicsMagick)

### AI Extraction Service (`services/aiExtractionService.js`)

**Functions**:

- `extractHealthDataWithAI(ocrText)` - Extract biomarkers from text using OpenAI
- `parseAIResponse(jsonString)` - Clean and parse JSON from OpenAI response
- `getHealthDataTemplate()` - Get default biomarker template
- `getExtractionPrompt()` - Get OpenAI system prompt
- `getDummyHealthData()` - Get dummy data when OpenAI disabled

**Biomarkers Extracted**:

- Collection Date
- Report Date
- Total Cholesterol
- Triglycerides level
- HDL Cholesterol
- LDL Cholesterol
- VLDL Cholesterol
- LDL/HDL RATIO
- Total Cholesterol/HDL RATIO
- Blood Glucose (Fasting)
- Fasting Insulin

**OpenAI Configuration**:

- Model: `gpt-4o`
- Enabled via: `ENABLE_OPENAI_DATA_EXTRACTION=true`

---

## Database Tables

### `data_upload`

Stores file metadata and extracted data.

**Columns**:

- `id` (INT, PK, AUTO_INCREMENT)
- `UserID` (INT, FK → users.UserID)
- `filename` (VARCHAR) - Original filename
- `data` (TEXT) - Extracted JSON data
- `file_type` (VARCHAR) - File extension (pdf, jpg, png)
- `file_path` (VARCHAR) - Path on disk
- `ocr_text` (TEXT) - Raw OCR text
- `uploaded_at` (TIMESTAMP) - Upload timestamp

---

## Environment Variables

```env
# OpenAI Configuration
OPENAI_API_X_API_KEY=sk-your-key
ENABLE_OPENAI_DATA_EXTRACTION=true  # Enable AI extraction

# Server Configuration
PORT=4000
```

---

## Related Documentation

- **[API_ENDPOINTS.md](../API_ENDPOINTS.md)** - Quick reference for all endpoints
- **[HEALTH_DATA_ENDPOINTS.md](./HEALTH_DATA_ENDPOINTS.md)** - Health data submission
- **[SCORING_ENDPOINTS.md](./SCORING_ENDPOINTS.md)** - Score calculation
- **[DATABASE_OPERATIONS.md](../DATABASE_OPERATIONS.md)** - Database schema
