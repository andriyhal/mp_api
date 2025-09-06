# LLM Instructions: React Client Integration for Metabolic Point Platform

## Project Overview
You are tasked with implementing client-side changes for the Metabolic Point Platform, a React-based web application that integrates with a Node.js/Express API. The API has been updated with new endpoints for enhanced recommendations, digital journey, and provider network features.

## Current Project State
- **Client**: React application (separate GitHub repository)
- **API**: Node.js/Express server with MySQL database
- **Status**: API is fully implemented and tested; client needs integration
- **Environment**: Development (localhost:3000 for client, localhost:4000 for API)

## Technical Requirements
- **React Version**: Latest stable (18+ recommended)
- **State Management**: Context API or Redux (your choice)
- **HTTP Client**: Axios or Fetch API
- **Authentication**: JWT token-based
- **Styling**: CSS modules, styled-components, or Tailwind CSS
- **Testing**: Jest + React Testing Library

## API Integration Details

### Base Configuration
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
```

### Authentication Flow
1. User logs in via `/auth/login`
2. Store JWT token in localStorage
3. Include token in Authorization header for protected routes
4. Handle token refresh via `/auth/refresh`
5. Redirect to login on 401 errors

## Core Implementation Tasks

### 1. Authentication System
**Files to Create/Modify:**
- `src/contexts/AuthContext.js` - Authentication context
- `src/hooks/useAuth.js` - Custom auth hook
- `src/components/LoginForm.js` - Login component
- `src/components/PrivateRoute.js` - Route protection

**Key Features:**
- Login/logout functionality
- Token persistence
- Automatic token refresh
- Protected route wrapper
- Loading states during auth checks

### 2. Enhanced Recommendations Dashboard
**Files to Create:**
- `src/pages/Recommendations.js` - Main recommendations page
- `src/components/ProductCard.js` - Product display component
- `src/components/CategorySection.js` - Category grouping component

**API Integration:**
```javascript
// GET /recommendation
const fetchRecommendations = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/recommendation`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

**Features to Implement:**
- Group products by category
- Display priority-ordered items
- Show general health score for authenticated users
- Handle both authenticated and unauthenticated states
- Responsive grid layout
- Add to cart/buy now functionality

### 3. Digital Journey Timeline
**Files to Create:**
- `src/pages/DigitalJourney.js` - Journey overview page
- `src/components/JourneyItem.js` - Individual journey item
- `src/components/JourneyTimeline.js` - Timeline visualization

**API Integration:**
```javascript
// GET /digital-journey
const fetchDigitalJourney = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/digital-journey`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

**Features to Implement:**
- Display assigned plan information
- Timeline view of scheduled items
- Mark items as completed
- Filter by date/status
- Content preview (images, descriptions)
- External link handling

### 4. Provider Network Directory
**Files to Create:**
- `src/pages/ProviderNetwork.js` - Provider listing page
- `src/components/ProviderCard.js` - Provider information card
- `src/components/ProviderFilters.js` - Category/expertise filters

**API Integration:**
```javascript
// GET /provider-network
const fetchProviderNetwork = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/provider-network`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

**Features to Implement:**
- List recommended providers
- Filter by expertise category (Medical, Nutrition, Fitness)
- Contact information display
- Provider profile images
- Search functionality
- Sort by relevance/rating

### 5. Health Data Management
**Files to Create/Modify:**
- `src/pages/HealthDashboard.js` - Health data overview
- `src/components/HealthDataForm.js` - Data input form
- `src/components/HealthChart.js` - Data visualization
- `src/components/FileUpload.js` - Document upload component

**API Integration:**
```javascript
// POST /submit-health-data
const submitHealthData = async (healthData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/submit-health-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(healthData)
  });
  return await response.json();
};

// POST /import-file
const uploadFile = async (file, userId) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('UserID', userId);

  const response = await fetch(`${API_BASE_URL}/import-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return await response.json();
};
```

**Features to Implement:**
- Health data input forms
- File upload with progress indication
- Data visualization (charts/graphs)
- Health score display
- Historical data tracking

## File Structure Recommendations

```
src/
├── components/
│   ├── common/
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── LoadingSpinner.js
│   │   └── ErrorMessage.js
│   ├── auth/
│   │   ├── LoginForm.js
│   │   └── PrivateRoute.js
│   ├── recommendations/
│   │   ├── ProductCard.js
│   │   └── CategorySection.js
│   ├── journey/
│   │   ├── JourneyItem.js
│   │   └── JourneyTimeline.js
│   ├── providers/
│   │   ├── ProviderCard.js
│   │   └── ProviderFilters.js
│   └── health/
│       ├── HealthDataForm.js
│       ├── HealthChart.js
│       └── FileUpload.js
├── contexts/
│   └── AuthContext.js
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
├── pages/
│   ├── Dashboard.js
│   ├── Recommendations.js
│   ├── DigitalJourney.js
│   ├── ProviderNetwork.js
│   └── HealthDashboard.js
├── services/
│   └── api.js
├── utils/
│   ├── constants.js
│   └── helpers.js
└── App.js
```

## Implementation Guidelines

### 1. Error Handling
- Implement global error boundary
- Handle API errors gracefully
- Show user-friendly error messages
- Log errors for debugging

### 2. Loading States
- Show loading indicators during API calls
- Implement skeleton screens for better UX
- Handle slow network connections

### 3. Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Optimized images

### 4. Performance Optimization
- Implement code splitting
- Lazy load components
- Optimize images
- Use React.memo for expensive components

### 5. Accessibility
- Semantic HTML
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Testing Requirements

### Unit Tests
```javascript
// Example test for API service
import { fetchRecommendations } from '../services/api';

describe('API Services', () => {
  test('fetchRecommendations returns data', async () => {
    const mockData = { grouped: {}, isAuthenticated: false };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    );

    const result = await fetchRecommendations();
    expect(result).toEqual(mockData);
  });
});
```

### Integration Tests
- Test complete user flows
- Mock API responses
- Test error scenarios
- Verify state management

### E2E Tests
- Use Cypress or Playwright
- Test critical user journeys
- Verify API integration
- Test authentication flows

## Deployment Considerations

### Environment Variables
```javascript
// .env.development
REACT_APP_API_BASE_URL=http://localhost:4000

// .env.production
REACT_APP_API_BASE_URL=https://api.metabolicpoint.com
```

### Build Optimization
- Code splitting by route
- Asset optimization
- Service worker for caching
- CDN integration

## Success Criteria

### Functional Requirements
- [ ] User can log in and access protected routes
- [ ] Recommendations display correctly with categories
- [ ] Digital journey shows personalized content
- [ ] Provider network lists relevant professionals
- [ ] Health data can be submitted and viewed
- [ ] File uploads work with progress indication

### Non-Functional Requirements
- [ ] Fast loading times (< 3 seconds)
- [ ] Responsive on all device sizes
- [ ] Accessible (WCAG 2.1 AA compliance)
- [ ] Error-free console logs
- [ ] Comprehensive test coverage (> 80%)

## Communication Protocol

### Daily Standups
- Report progress on assigned tasks
- Highlight any blockers or issues
- Request clarification when needed

### Code Review Process
- Create feature branches
- Submit pull requests with descriptions
- Address review feedback promptly
- Ensure tests pass before merging

### Documentation Updates
- Update component documentation
- Maintain API integration docs
- Document any architectural decisions

## Final Deliverables
1. Fully functional React client
2. Comprehensive test suite
3. Updated documentation
4. Deployment-ready build
5. Performance optimization report

Remember to communicate any challenges or questions throughout the development process. The API is fully tested and ready for integration.
