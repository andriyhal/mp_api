# User Profile Endpoints

## Overview

User profile endpoints handle user profile management including updating personal information and retrieving user data.

**Controller**: `controllers/userController.js`  
**Routes**: `routes/userRoutes.js`  
**Middleware**: `middleware/auth.js` (verifyToken)

---

## POST /edit-user

Update user profile information (sex and date of birth).

### Request

**Method**: `POST`  
**Path**: `/edit-user`  
**Authentication**: Required (JWT token)

**Headers**:

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body**:

```json
{
    "userId": "user@example.com",
    "sex": "Male",
    "dateOfBirth": "1990-05-15",
    "action": "update"
}
```

**Validation Rules**:

- `userId` (required): User's email address
- `sex` (required): Must be "Male", "Female", or "Other"
- `dateOfBirth` (required): Format YYYY-MM-DD
- `action` (optional): "add" or "update" (defaults to update)

### Response

**Success** (200 OK):

```json
{
    "message": "User updated successfully"
}
```

**Error Responses**:

**400 Bad Request** - Missing required fields:

```json
{
    "error": "userId is required"
}
```

```json
{
    "error": "sex and dateOfBirth are required"
}
```

**400 Bad Request** - Invalid sex value:

```json
{
    "error": "Invalid sex value. Must be Male, Female, or Other"
}
```

**400 Bad Request** - Invalid date format:

```json
{
    "error": "Invalid date format. Use YYYY-MM-DD"
}
```

**401 Unauthorized** - Missing or invalid token:

```json
{
    "error": "No token provided"
}
```

**500 Internal Server Error**:

```json
{
    "error": "An error occurred while updating user"
}
```

### Implementation Details

**Controller Function**: `editUser` in `userController.js`

**Business Logic**:

1. Validates userId is provided
2. Validates sex and dateOfBirth are provided
3. Validates sex is one of: "Male", "Female", "Other"
4. Validates dateOfBirth matches YYYY-MM-DD format using regex
5. If `action === "add"`:
    - Inserts new user record (for legacy support)
6. Otherwise:
    - Updates existing user record

**Database Operations**:

```sql
-- If action is "add"
INSERT INTO users (UserID, Sex, DateOfBirth)
VALUES (?, ?, ?)

-- Otherwise (update)
UPDATE users
SET Sex = ?, DateOfBirth = ?
WHERE UserID = ?
```

**Use Cases**:

- User completing profile after registration
- User updating personal information
- Admin updating user data

---

## GET /get-user-profile

Retrieve user profile information.

### Request

**Method**: `GET`  
**Path**: `/get-user-profile?userID=user@example.com`  
**Authentication**: Required (JWT token)

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:

- `userID` (required): User's email address

### Response

**Success** (200 OK):

```json
{
    "userId": "user@example.com",
    "dateOfBirth": "1990-05-15",
    "sex": "Male",
    "name": "John Doe"
}
```

**Error Responses**:

**400 Bad Request** - Missing userID:

```json
{
    "error": "Missing required parameter: userID"
}
```

**401 Unauthorized** - Missing or invalid token:

```json
{
    "error": "No token provided"
}
```

**404 Not Found** - User not found:

```json
{
    "error": "User not found"
}
```

**500 Internal Server Error**:

```json
{
    "error": "An error occurred while fetching user profile"
}
```

### Implementation Details

**Controller Function**: `getUserProfile` in `userController.js`

**Business Logic**:

1. Validates userID query parameter is provided
2. Queries users table for user data
3. Returns user profile with normalized field names (camelCase)
4. Returns 404 if user not found

**Database Operations**:

```sql
SELECT
  UserID as userId,
  DateOfBirth as dateOfBirth,
  Sex as sex,
  name
FROM users
WHERE UserID = ?
```

**Response Transformation**:

- Database column names are converted to camelCase
- All user data is returned in single object

---

## Authentication Middleware

All user profile endpoints require JWT token authentication.

### verifyToken Middleware

**File**: `middleware/auth.js`

**Functionality**:

1. Extracts token from `Authorization: Bearer <token>` header
2. Verifies token using `jwt.verify()` and JWT_SECRET
3. Attaches decoded user data to `req` object
4. Calls `next()` if valid, returns 401/403 if invalid

**Usage in Routes**:

```javascript
router.post("/edit-user", verifyToken, editUser);
router.get("/get-user-profile", verifyToken, getUserProfile);
```

---

## Environment Variables

Required in `.env`:

```env
JWT_SECRET=your_jwt_secret_key_here
```

---

## Related Files

- **Controller**: `mp_api/controllers/userController.js`
- **Routes**: `mp_api/routes/userRoutes.js`
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

---

## Testing Examples

### Update User Profile

```bash
curl -X POST http://localhost:4000/edit-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "userId": "test@example.com",
    "sex": "Male",
    "dateOfBirth": "1990-05-15",
    "action": "update"
  }'
```

### Get User Profile

```bash
curl -X GET "http://localhost:4000/get-user-profile?userID=test@example.com" \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## Migration Notes

### Previous Implementation

- Logic was directly in `server.js`
- No input validation
- Inconsistent error handling

### Current Implementation (Refactored)

- Logic moved to `controllers/userController.js`
- Comprehensive input validation
- Consistent error responses
- Better separation of concerns
- API endpoints remain unchanged (backward compatible)

---

## Security Considerations

1. **JWT Authentication**: All endpoints require valid JWT token
2. **Input Validation**: All inputs validated before processing
3. **SQL Injection Prevention**: Parameterized queries used
4. **Date Validation**: Regex validation for date format
5. **Enum Validation**: Sex field restricted to valid values
