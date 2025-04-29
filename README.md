# Metabolic Point Platform

A comprehensive health tracking and management SaaS application that allows users to monitor their health metrics, upload health data files, and receive personalized insights.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


## Features

- **User Authentication**: Sign up, log in, and password recovery functionality
- **User Onboarding**: Multi-step onboarding process to collect initial health information
- **Dashboard**: Central hub with collapsible sidebar for navigation
- **Profile Management**: View and edit user profile information
- **Health Data Submission**: Form to submit detailed health metrics
- **File Management**: View uploaded data files with timestamps

## Technologies Used

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Lucide React icons
- **Form Handling**: React Hook Form, Zod validation


## Getting Started

### Prerequisites

- Node.js 22.x or later
- npm 

### Installation

1. Clone the repository:

2. Install dependencies:

```shellscript
npm install

```


3. Create a `.env.local` file in the root directory with the following variables:

```plaintext
NEXT_PUBLIC_API_ROOT=https://api.example.com
NEXT_PUBLIC_LOGIN_AUTOCOMPLETE_USER=tester@example.com
NEXT_PUBLIC_LOGIN_AUTOCOMPLETE_PASSWORD=password
NEXT_PUBLIC_DISABLE_SIGNUP=false
# Add any other environment variables here
```


4. Start the development server:

```shellscript
npm run dev
# or
yarn dev
```


5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.



## Usage

### Authentication Flow

1. New users start at the landing page and click "Sign up"
2. After signing up, they are directed to the onboarding process
3. Existing users can log in from the landing page
4. After authentication, users are directed to the dashboard


### Dashboard Navigation

The dashboard includes a collapsible sidebar with the following options:

- dashboard - Dashboard
- journey - My Health Journey
- network - Provider Network
- marketplace - Marketplace
- orders - My Orders
- profile - View Profile
- notifications - Notifications
- security - Password and Security
- documents - My Documents
- healthData - Submit Health Data


### Health Data Submission

Users can submit detailed health metrics including:

- Height and weight
- Waist circumference
- Blood pressure (systolic and diastolic)
- Fasting blood glucose
- HDL cholesterol and triglycerides







