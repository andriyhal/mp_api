# Authentication Endpoints

## Overview

Authentication endpoints handle user registration, login, and token refresh. All endpoints use JWT-based authentication with bcrypt password hashing.

**Controller**: `controllers/authController.js`  
**Routes**: `routes/authRoutes.js`  
**Middleware**: `middleware/auth.js` (verifyToken)

---

## POST /register-user

Register a new user account.

### Request

**Method**: `POST`  
**Path**: `/register-user`  
**Authentication**: None (public endpoint)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Validation Rules**:
- `email` (required): Valid email format
- `name` (required): User's full name
- `password` (required): Minimum 6 characters

### Response

**Success** (201 Created):
```json
{
  "message": "User registered successfully",
  "id": 42
}
```

**Error Responses**:

**400 Bad Request** - Missing or invalid fields:
```json
{
  "error": "All fields are required"
}
```
```json
{
  "error": "Invalid email format"
}
```
```json
{
  "error": "Password must be at least 6 characters long"
}
```

**409 Conflict** - Email already exists:
```json
{
  "error": "Email already exists"
}
```

**500 Internal Server Error**:
```json
{
  "error": "An error occurred while registering user"
}
```

### Implementation Details

**Controller Function**: `register` in `authController.js`

**Business Logic**:
1. Validates all required fields (email, name, password)
2. Validates email format using regex
3. Validates password length (minimum 6 characters)
4. Checks for duplicate email in database
5. Hashes password using bcrypt with 10 salt rounds
6. Inserts user with default values:
   - `DateOfBirth`: '1990-01-01' (placeholder)
   - `Sex`: 'Other' (to be updated later)

**Database Operations**:
```sql
-- Check duplicate
SELECT * FROM users WHERE UserID = ?

-- Insert user
INSERT INTO users (UserID, name, password, DateOfBirth, Sex) 
VALUES (?, ?, ?, '1990-01-01', 'Other')
```

---

## POST /auth/login

Authenticate user and generate JWT token.

### Request

**Method**: `POST`  
**Path**: `/auth/login`  
**Authentication**: None (public endpoint)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

**Validation Rules**:
- `email` (required): User's registered email
- `password` (required): User's password

### Response

**Success** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user@example.com",
    "email": "user@example.com",
    "name": "John Doe",
    "sex": "Male"
  }
}
```

**Error Responses**:

**400 Bad Request** - Missing fields:
```json
{
  "error": "Email and password are required"
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "error": "Invalid credentials"
}
```

**403 Forbidden** - Account locked:
```json
{
  "error": "Account is locked. Please try again later."
}
```

**500 Internal Server Error**:
```json
{
  "error": "An error occurred while authenticating"
}
```

### Implementation Details

**Controller Function**: `login` in `authController.js`

**Business Logic**:
1. Validates email and password are provided
2. Queries database for user by email (UserID = email)
3. Checks if account is locked (5 failed attempts within 15 minutes)
4. Compares password using `bcrypt.compare()`
5. On failure:
   - Increments `login_attempts` counter
   - Updates `last_login_attempt` timestamp
   - Logs failed attempt in `login_history` table
6. On success:
   - Resets `login_attempts` to 0
   - Logs successful attempt in `login_history` table
   - Generates JWT token with 1-hour expiration
   - Returns token and user data

**JWT Token Payload**:
```javascript
{
  id: user.UserID,
  email: user.UserID,
  expiresIn: "1h"
}
```

**Database Operations**:
```sql
-- Find user
SELECT * FROM users WHERE UserID = ?

-- On failed login
UPDATE users 
SET login_attempts = login_attempts + 1, 
    last_login_attempt = CURRENT_TIMESTAMP 
WHERE UserID = ?

INSERT INTO login_history (UserID, success) VALUES (?, false)

-- On successful login
UPDATE users 
SET login_attempts = 0, 
    last_login_attempt = CURRENT_TIMESTAMP 
WHERE UserID = ?

INSERT INTO login_history (UserID, success) VALUES (?, true)
```

**Security Features**:
- Account lockout after 5 failed attempts for 15 minutes
- Password hashing with bcrypt
- Login history tracking
- JWT token expiration (1 hour)

---

## POST /auth/refresh

Refresh expired or expiring JWT token.

### Request

**Method**: `POST`  
**Path**: `/auth/refresh`  
**Authentication**: None (accepts expired tokens)

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules**:
- `token` (required): Valid or expired JWT token

### Response

**Success** (200 OK):
```json
{
  "newToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

**400 Bad Request** - Missing token:
```json
{
  "error": "Token is required"
}
```

**401 Unauthorized** - Invalid token:
```json
{
  "error": "Invalid or expired token"
}
```

### Implementation Details

**Controller Function**: `refresh` in `authController.js`

**Business Logic**:
1. Validates token is provided in request body
2. Verifies token using `jwt.verify()` with `ignoreExpiration: true`
3. Extracts user payload (id, email) from token
4. Generates new token with same payload and fresh 1-hour expiration
5. Returns new token

**JWT Token**:
- Uses same payload as original token
- New expiration: 1 hour from refresh time
- Signed with same JWT_SECRET

**Use Case**:
- Allows users to stay logged in without re-entering credentials
- Frontend can refresh token before it expires
- Maintains session continuity

---

## Environment Variables

Required in `.env`:

```env
JWT_SECRET=your_jwt_secret_key_here
```

---

## Related Files

- **Controller**: `mp_api/controllers/authController.js`
- **Routes**: `mp_api/routes/authRoutes.js`
- **Middleware**: `mp_api/middleware/auth.js`
- **Database Config**: `mp_api/config/db.js`

---

## Database Schema

### users table
```sql
UserID VARCHAR(255) PRIMARY KEY,  -- Email address
name VARCHAR(255),
password VARCHAR(255),             -- bcrypt hashed
DateOfBirth DATE,
Sex ENUM('Male', 'Female', 'Other'),
login_attempts INT DEFAULT 0,
last_login_attempt TIMESTAMP NULL
```

### login_history table
```sql
id INT AUTO_INCREMENT PRIMARY KEY,
UserID VARCHAR(255),
success BOOLEAN,
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## Testing Examples

### Register New User
```bash
curl -X POST http://localhost:4000/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```
