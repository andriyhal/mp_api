# API Endpoints Documentation

This directory contains detailed documentation for all API endpoints in the MP API server.

## Structure

Each endpoint category has its own dedicated documentation file with:

- Request/response examples
- Validation rules
- Implementation details
- Database operations
- Error handling
- Testing examples

## Available Documentation

### Authentication & User Management

- **[AUTH_ENDPOINTS.md](./AUTH_ENDPOINTS.md)** - Authentication endpoints
    - `POST /register-user` - Register new user
    - `POST /auth/login` - User login
    - `POST /auth/refresh` - Refresh JWT token

- **[USER_ENDPOINTS.md](./USER_ENDPOINTS.md)** - User profile management
    - `POST /edit-user` - Update user profile
    - `GET /get-user-profile` - Get user profile

### Health Data & Scoring

- **[HEALTH_DATA_ENDPOINTS.md](./HEALTH_DATA_ENDPOINTS.md)** - Health measurements and history
    - `POST /submit-health-data` - Submit health data
    - `GET /get-health-data` - Get latest health data
    - `GET /get-health-history` - Get health history
    - `GET /average-health-metrics` - Get average metrics

- **[SCORING_ENDPOINTS.md](./SCORING_ENDPOINTS.md)** - Health score calculation
    - `GET /user-scores` - Get calculated health scores
    - `POST /user-scores` - Calculate and store scores

### Recommendations & Matching

- **[RECOMMENDATIONS_ENDPOINTS.md](./RECOMMENDATIONS_ENDPOINTS.md)** - Product recommendations
    - `GET /recommendation` - Get personalized recommendations

- **[DIGITAL_JOURNEY_ENDPOINTS.md](./DIGITAL_JOURNEY_ENDPOINTS.md)** - Digital health plans
    - `GET /digital-journey` - Get user's digital health plan

- **[PROVIDER_NETWORK_ENDPOINTS.md](./PROVIDER_NETWORK_ENDPOINTS.md)** - Healthcare provider matching
    - `GET /provider-network` - Get matched healthcare providers

### Document Management

- **[DOCUMENT_ENDPOINTS.md](./DOCUMENT_ENDPOINTS.md)** - File upload and OCR processing
    - `POST /import-file` - Upload and process health documents
    - `POST /get-data-files` - Get list of uploaded files

## Documentation Standards

Each endpoint documentation includes:

### 1. Overview

- Purpose and description
- Related controller and routes files
- Required middleware

### 2. Request Details

- HTTP method and path
- Authentication requirements
- Headers
- Request body/parameters
- Validation rules

### 3. Response Format

- Success response with example
- All possible error responses
- Status codes

### 4. Implementation Details

- Controller function reference
- Business logic flow
- Database operations (SQL)
- Security considerations

### 5. Testing Examples

- cURL commands
- Sample requests

## Quick Reference

### Authentication Flow

```
1. POST /register-user      → Create account
2. POST /auth/login         → Get JWT token
3. Use token in all requests → Authorization: Bearer <token>
4. POST /auth/refresh       → Refresh expired token
```

### Protected Endpoints

All endpoints except authentication endpoints require JWT token:

```
Authorization: Bearer <jwt_token>
```

### Base URL

```
Development: http://localhost:4000
```

## Related Documentation

- **[../API_ENDPOINTS.md](../API_ENDPOINTS.md)** - Quick reference table for all endpoints
- **[../DATABASE_OPERATIONS.md](../DATABASE_OPERATIONS.md)** - Database patterns and operations
- **[../dashboards/SCORING_LOGIC.md](../dashboards/SCORING_LOGIC.md)** - Health scoring algorithms
- **[../../docs/API_CONTRACTS.md](../../docs/API_CONTRACTS.md)** - TypeScript interfaces for all endpoints

## Refactoring Notes

Navigation Tips

1. **Quick Lookup**: Start with [../API_ENDPOINTS.md](../API_ENDPOINTS.md) for endpoint paths
2. **Detailed Info**: Open specific endpoint file for examples and logic
3. **Database**: See [../DATABASE_OPERATIONS.md](../DATABASE_OPERATIONS.md) for schema
4. **Algorithms**: Check [../dashboards/SCORING_LOGIC.md](../dashboards/SCORING_LOGIC.md) for calculation
