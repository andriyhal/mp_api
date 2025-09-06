# Client Integration Instructions for Metabolic Point Platform API

## Overview
This document provides instructions for integrating the Metabolic Point Platform API into your React client application. The API has been updated with new endpoints for enhanced recommendations, digital journey, and provider network features.

## Base URL
```
http://localhost:4000 (development)
https://your-production-url.com (production)
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Key Endpoints and Integration Guide

### 1. Authentication
#### Login
```javascript
// POST /auth/login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};
```

#### Refresh Token
```javascript
// POST /auth/refresh
const refreshToken = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });
  const data = await response.json();
  if (data.newToken) {
    localStorage.setItem('token', data.newToken);
  }
  return data;
};
```

### 2. Enhanced Recommendations (NEW)
#### Get Product Recommendations
```javascript
// GET /recommendation
const getRecommendations = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/recommendation', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

// Response format:
{
  "grouped": {
    "Supplements": [
      {
        "id": 1,
        "name": "Vitamin D3",
        "description": "Supports bone health",
        "price": 25.99,
        "image_url": "http://localhost:4000/images/vitamin_d3.jpg",
        "priority": 1
      }
    ]
  },
  "isAuthenticated": true,
  "general_health_score": 75.5
}
```

### 3. Digital Journey (NEW)
#### Get User's Digital Journey
```javascript
// GET /digital-journey
const getDigitalJourney = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/digital-journey', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

// Response format:
{
  "plan": {
    "user_plan_id": 1,
    "plan_name": "Weight Loss Plan",
    "assigned_at": "2025-09-04T00:00:00.000Z"
  },
  "items": [
    {
      "scheduled_date": "2025-09-05",
      "name": "Morning Yoga",
      "description": "Start your day with yoga",
      "type": "exercise",
      "image_url": "http://localhost:4000/images/yoga.jpg",
      "content_url": "https://example.com/yoga-video"
    }
  ]
}
```

### 4. Provider Network (NEW)
#### Get Recommended Providers
```javascript
// GET /provider-network
const getProviderNetwork = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/provider-network', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

// Response format:
{
  "providers": [
    {
      "id": 1,
      "name": "Dr. John Smith",
      "specialty": "Nutritionist",
      "expertise_type": "Diet Expert",
      "expertise_category": "Nutrition",
      "contact_info": "john@example.com",
      "image_url": "http://localhost:4000/images/dr_smith.jpg"
    }
  ]
}
```

### 5. Health Data Management
#### Submit Health Data
```javascript
// POST /submit-health-data
const submitHealthData = async (healthData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:4000/submit-health-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(healthData),
  });
  return await response.json();
};
```

#### Get Health Data
```javascript
// GET /get-health-data?userId=<userId>
const getHealthData = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:4000/get-health-data?userId=${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
};
```

### 6. File Upload
#### Upload Health Report
```javascript
// POST /import-file
const uploadFile = async (file, userId) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('UserID', userId);

  const response = await fetch('http://localhost:4000/import-file', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return await response.json();
};
```

## React Integration Examples

### Using React Hooks
```javascript
import { useState, useEffect } from 'react';

function RecommendationsComponent() {
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setRecommendations(data.grouped);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {Object.keys(recommendations).map(category => (
        <div key={category}>
          <h2>{category}</h2>
          {recommendations[category].map(product => (
            <div key={product.id}>
              <img src={product.image_url} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>${product.price}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Error Handling
```javascript
const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall();
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    // Handle error (show toast, redirect to login, etc.)
  }
};
```

## Migration Notes
- The old `/get-reco-products` and `/get-reco-actions` endpoints are deprecated. Use `/recommendation` instead.
- New endpoints (`/digital-journey`, `/provider-network`) are fully implemented and ready for integration.
- Ensure your React app handles CORS properly (the API allows localhost:3000 by default).

## Testing
Run the API tests to ensure everything is working:
```bash
node test/api_tests.js
```

## Support
If you encounter issues, check the server logs and ensure the API server is running on port 4000.
