// API Examples for Metabolic Point Platform
// Copy these functions into your React project and adapt as needed

const API_BASE_URL = 'http://localhost:4000';

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');

// Generic API call wrapper
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Authentication
export const login = async (email, password) => {
  return await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const refreshToken = async () => {
  const token = getToken();
  const response = await apiCall('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  if (response.newToken) {
    localStorage.setItem('token', response.newToken);
  }
  return response;
};

// Enhanced Recommendations (NEW)
export const getRecommendations = async () => {
  return await apiCall('/recommendation');
};

// Sample Response:
/*
{
  "grouped": {
    "Supplements": [
      {
        "id": 1,
        "name": "Vitamin D3",
        "description": "Supports bone health and immune system",
        "price": 25.99,
        "image_url": "http://localhost:4000/images/vitamin_d3.jpg",
        "priority": 1
      }
    ],
    "Equipment": [
      {
        "id": 2,
        "name": "Resistance Bands",
        "description": "For strength training exercises",
        "price": 19.99,
        "image_url": "http://localhost:4000/images/resistance_bands.jpg",
        "priority": 2
      }
    ]
  },
  "isAuthenticated": true,
  "general_health_score": 77.5
}
*/

// Digital Journey (NEW)
export const getDigitalJourney = async () => {
  return await apiCall('/digital-journey');
};

// Sample Response:
/*
{
  "plan": {
    "user_plan_id": 1,
    "plan_name": "Metabolic Health Improvement Plan",
    "assigned_at": "2025-09-04T10:00:00.000Z"
  },
  "items": [
    {
      "scheduled_date": "2025-09-05",
      "name": "Introduction to Metabolic Health",
      "description": "Learn the basics of metabolic health",
      "type": "article",
      "image_url": "http://localhost:4000/images/metabolic_intro.jpg",
      "content_url": "https://example.com/metabolic-intro"
    },
    {
      "scheduled_date": "2025-09-06",
      "name": "Morning Walk Routine",
      "description": "30-minute walking exercise",
      "type": "exercise",
      "image_url": "http://localhost:4000/images/walking.jpg",
      "content_url": "https://example.com/walking-routine"
    }
  ]
}
*/

// Provider Network (NEW)
export const getProviderNetwork = async () => {
  return await apiCall('/provider-network');
};

// Sample Response:
/*
{
  "providers": [
    {
      "id": 1,
      "name": "Dr. Sarah Johnson",
      "specialty": "Endocrinologist",
      "expertise_type": "Metabolic Health Consultant",
      "expertise_category": "Medical",
      "contact_info": "sarah.johnson@example.com",
      "phone": "+1-555-0123",
      "image_url": "http://localhost:4000/images/dr_johnson.jpg"
    },
    {
      "id": 2,
      "name": "Mike Chen",
      "specialty": "Nutrition Specialist",
      "expertise_type": "Nutrition Specialist",
      "expertise_category": "Nutrition",
      "contact_info": "mike.chen@example.com",
      "phone": "+1-555-0456",
      "image_url": "http://localhost:4000/images/mike_chen.jpg"
    }
  ]
}
*/

// Health Data Management
export const submitHealthData = async (healthData) => {
  return await apiCall('/submit-health-data', {
    method: 'POST',
    body: JSON.stringify(healthData),
  });
};

export const getHealthData = async (userId) => {
  return await apiCall(`/get-health-data?userId=${userId}`);
};

export const getHealthHistory = async (userId, parameter) => {
  return await apiCall(`/get-health-history?userId=${userId}&parameter=${parameter}`);
};

export const calculateHealthScore = async (userId) => {
  return await apiCall(`/calc-health-score?userId=${userId}`);
};

// File Upload
export const uploadFile = async (file, userId) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('UserID', userId);

  const response = await fetch(`${API_BASE_URL}/import-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Get uploaded files
export const getDataFiles = async (userId) => {
  return await apiCall('/get-data-files', {
    method: 'POST',
    body: JSON.stringify({ UserID: userId }),
  });
};

// User Profile
export const getUserProfile = async (userId) => {
  return await apiCall(`/get-user-profile?userID=${userId}`);
};

export const registerUser = async (userData) => {
  return await apiCall('/register-user', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Average Health Metrics
export const getAverageHealthMetrics = async (age, sex) => {
  return await apiCall(`/average-health-metrics?age=${age}&sex=${sex}`);
};

// Legacy endpoints (deprecated - use /recommendation instead)
export const getRecommendationProducts = async (userId) => {
  return await apiCall(`/get-reco-products?userId=${userId}`);
};

export const getRecommendationActions = async (userId) => {
  return await apiCall(`/get-reco-actions?userId=${userId}`);
};
