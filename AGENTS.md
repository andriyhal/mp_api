# Agent Technical Context - MP API

## Repository Overview

This is the backend API server for the MP (Medical Platform) application, providing data services and business logic for health scoring, provider networks, and user recommendations.

## Technology Stack

-   **Backend**: Node.js, Express.js 4.21.2
-   **Database**: MySQL 3.12.0 (with SQL schema files)
-   **Package Manager**: npm
-   **Data Processing**: Python scripts for CSV transformation
-   **File Processing**: PDF parsing and OCR capabilities
-   **Authentication**: JWT with bcrypt password hashing

## Key Libraries & Dependencies

### Core Framework & Server

-   **express** (4.21.2) - Web application framework
-   **cors** (2.8.5) - Cross-origin resource sharing
-   **body-parser** (1.20.3) - Request body parsing middleware
-   **dotenv** (16.4.7) - Environment variables management

### Database & Authentication

-   **mysql2** (3.12.0) - MySQL database driver with Promise support
-   **jsonwebtoken** (9.0.2) - JWT token generation and verification
-   **bcrypt** (5.1.1) - Password hashing and verification

### File Processing & OCR

-   **multer** (1.4.5-lts.1) - File upload handling
-   **file-type** (20.0.0) - File type detection
-   **pdf-parse** (1.1.1) - PDF text extraction
-   **tesseract.js** (6.0.0) - OCR text recognition
-   **sharp** (0.33.5) - Image processing
-   **gm** (1.25.0) - GraphicsMagick image manipulation

### AI & External APIs

-   **openai** (4.77.0) - OpenAI API integration
-   **axios** (1.8.1) - HTTP client for API requests
-   **node-fetch** (3.3.2) - Fetch API implementation

### Development & Utilities

-   **patch-package** (8.0.0) - Package patching
-   **form-data** (4.0.4) - Form data handling

## Project Structure

-   `server.js` - Main Express server entry point
-   `routes/` - API route handlers
    -   `digitalJourney.js` - Digital health journey endpoints
    -   `providerNetwork.js` - Healthcare provider network APIs
    -   `recommendation.js` - Health recommendation engine
    -   `userScores.js` - User health scoring system
-   `data/` - Database setup and migration files
    -   `setup/` - Initial schema and seed data
    -   `migration/` - Database migration scripts
-   `client-integration/` - API integration examples and documentation
-   `test/` - API tests and test data

## Key Features

-   Health scoring system (user biomarkers and metrics calculation)
-   Provider network management
-   Health journey tracking
-   AI-powered recommendation engine
-   CSV data transformation utilities (`transform_csv.py`)
-   OCR and PDF processing for health documents
-   JWT-based authentication and user management

## Database Schema

-   Expertise types with categories
-   Products with detailed descriptions
-   Providers with pricing information
-   User health data and scores

## API Endpoints

Key route categories:

-   `/digital-journey` - Health journey tracking
-   `/provider-network` - Provider management
-   `/recommendations` - Health recommendations
-   `/user-scores` - Health scoring system

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
node server.js

# Run API tests
npm test
```

## Testing

-   API integration tests in `test/api_tests.js`
-   Test data located in `test/testdata/`
-   Example API calls in `client-integration/api_examples.js`

## Code Conventions

-   Use ES6 module imports (`import/export` syntax)
-   Use named exports for route handlers and utility functions
-   Async/await for database operations and API calls
-   Express.js middleware pattern for route handling
-   Proper error handling with try/catch blocks
-   JWT token validation middleware for protected routes
-   Parameterized queries for SQL operations to prevent injection
-   Environment variables for all configuration values
-   Consistent API response format (JSON with status codes)
-   File upload validation and sanitization
-   Database connection pooling for performance
-   Modular route organization in separate files
-   Comprehensive error logging and monitoring
