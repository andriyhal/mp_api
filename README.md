# Metabolic Point API

A comprehensive API for managing health data, biomarkers, and recommendations with authentication, file uploads, and OCR capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [File Upload and OCR](#file-upload-and-ocr)
- [License](#license)

## Overview

This Health Data Management API provides a comprehensive solution for tracking, storing, and analyzing health metrics. It includes features for user authentication, health data submission, biomarker tracking, personalized recommendations, and document management with OCR capabilities.

## Features

- **User Authentication**: Secure registration and login with JWT token-based authentication
- **Health Data Management**: Store and retrieve detailed health metrics
- **Biomarkers**: Standard definitions and descriptions for various health metrics
- **Personalized Recommendations**: Diet, supplement, and activity recommendations based on biomarker values
- **File Management**: Upload, store, and retrieve health-related documents
- **OCR Processing**: Extract text from images and PDF documents
- **Security**: Account lockout after failed login attempts and protected endpoints

## Technologies Used

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens) and bcrypt for password hashing
- **File Processing**: Multer, pdf-parse, Tesseract.js (OCR)
- **Other Libraries**: CORS, dotenv, sharp

## Prerequisites

- Node.js (v22+)
- Mysql server (v5.6.26+) or MariaDB server (v10.6.21)


## Installation

1. Clone the repository


2. Install dependencies:

```shellscript
npm install
```


3.  Create a `.env` file in the root directory with the following variables:

```plaintext
NEXT_PUBLIC_API_ROOT=http://localhost:4000
NEXT_PUBLIC_LOGIN_AUTOCOMPLETE_USER=
NEXT_PUBLIC_LOGIN_AUTOCOMPLETE_PASSWORD=
NEXT_PUBLIC_DISABLE_SIGNUP=false
# Add any other environment variables here
```


4. Edit the `.env` file with your MySQL credentials and other settings.


## Database Setup

1. Make sure your MySQL server is running.
2. Run the database setup script:

**For Unix/Linux/Mac**:

```shellscript
node setup_database.js
```

3. Import example data from example_database.sql (optional)

This will:

1. Create the database specified in your `.env` file
2. Create all necessary tables
3. Populate standard biomarkers data
4. Add initial recommendations
5. Create an admin user (username: `admin`, password: `admin123`)


# Database Configuration

DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=health_database

# Server Configuration

PORT=4000

# JWT Configuration

JWT_SECRET=your_jwt_secret_key
```

Replace the values with your actual configuration.

## Running the Application

Start the server:

```shellscript
node server.js
```


The server will start on the port specified in your `.env` file (default: 4000).


## Authentication

This API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register a user or log in to get a JWT token
2. Include the token in the Authorization header of subsequent requests:

```plaintext
Authorization: Bearer YOUR_JWT_TOKEN
```

Security features:

- Passwords are hashed using bcrypt
- Account lockout after 5 failed login attempts
- Login history is recorded


## File Upload and OCR

The API supports uploading various file types (CSV, Excel, PDF, JPG, PNG) with special processing:

- Images (JPG, PNG) are processed with Tesseract.js for OCR (Optical Character Recognition)
- PDFs are parsed with PDF-Parser.js
- OCR text is stored and made available through the API