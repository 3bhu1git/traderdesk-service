# Phone Number Authentication API

This document describes the phone number-based authentication system for the TraderDesk application.

## Overview

The authentication system uses phone numbers and OTP (One-Time Password) verification to authenticate users. It supports both new user registration and existing user login through the same flow.

## Features

- 📱 Phone number-based authentication
- 🔐 OTP verification (6-digit codes)
- 🔑 JWT token-based sessions
- 👤 Automatic user creation on first login
- 🔄 Token refresh functionality
- 📝 User profile management
- ✅ Input validation and error handling

## API Endpoints

### 1. Send OTP

**POST** `/api/auth/send-otp`

Send a 6-digit OTP to the provided phone number.

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "demoOTP": "123456"
}
```

**Validation:**
- Phone number must be 10 digits
- Must be a valid Indian phone number (starting with 6-9)

---

### 2. Verify OTP and Login

**POST** `/api/auth/verify-otp`

Verify the OTP and either login existing user or create new user.

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_1234567890_3210",
      "phone": "+919876543210",
      "email": "user3210@traderdesk.ai",
      "name": "John Doe",
      "isActive": true,
      "loginMethod": "phone",
      "registrationDate": "2024-01-01T00:00:00.000Z",
      "brokerAccounts": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Validation:**
- Phone number must be 10 digits
- OTP must be 6 digits
- Name is optional (auto-generated if not provided)

---

### 3. Get User Profile

**GET** `/api/auth/profile`

Get the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1234567890_3210",
      "phone": "+919876543210",
      "email": "user3210@traderdesk.ai",
      "name": "John Doe",
      "isActive": true,
      "loginMethod": "phone",
      "registrationDate": "2024-01-01T00:00:00.000Z",
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "brokerAccounts": []
    }
  }
}
```

---

### 4. Update User Profile

**PUT** `/api/auth/profile`

Update the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      // Updated user object
    }
  }
}
```

---

### 5. Refresh Token

**POST** `/api/auth/refresh-token`

Refresh the JWT access token.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (invalid token format)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

## Authentication Flow

### New User Registration
1. User enters phone number
2. System sends OTP
3. User enters OTP and optional name
4. System creates new user account
5. System returns JWT token

### Existing User Login
1. User enters phone number
2. System sends OTP
3. User enters OTP
4. System updates last login timestamp
5. System returns JWT token

## Security Features

- **JWT Tokens**: 24-hour expiration
- **OTP Expiry**: 5-minute validity
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Applied through middleware
- **Secure Storage**: Passwords are hashed with bcrypt

## Demo/Testing Features

- **Demo OTP**: `123456` is always accepted for testing
- **OTP in Response**: OTP is included in development responses
- **Auto-generated Data**: Emails and user IDs are auto-generated

## Usage Examples

### Frontend Integration (JavaScript)

```javascript
// Send OTP
const sendOTP = async (phone) => {
  const response = await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  return response.json();
};

// Verify OTP and Login
const verifyOTP = async (phone, otp, name) => {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, name })
  });
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage
    localStorage.setItem('authToken', data.data.token);
  }
  
  return data;
};

// Get Profile
const getProfile = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('/api/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### cURL Examples

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456","name":"Test User"}'

# Get Profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer your-jwt-token"
```

## Database Schema

The User model includes the following fields:

```javascript
{
  email: String,        // Auto-generated or user-provided
  phone: String,        // +91XXXXXXXXXX format
  password: String,     // Hashed (temporary for phone auth)
  name: String,         // User's full name
  isActive: Boolean,    // Account status
  loginMethod: String,  // 'phone', 'google', 'email'
  registrationDate: Date,
  lastLogin: Date,
  brokerAccounts: [BrokerAccountSchema]
}
```

## Environment Variables

Required environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/traderdesk
NODE_ENV=development
```

## Testing

Run the test file to verify the API:

```bash
node test-auth-api.js
```

This will test all authentication endpoints and display the results.

## Integration with Existing System

The authentication system integrates seamlessly with the existing TraderDesk application:

- **User Model**: Extended with authentication fields
- **Middleware**: JWT authentication middleware for protected routes
- **Swagger**: Full API documentation included
- **Error Handling**: Consistent with existing error patterns
- **Logging**: Integrated with existing Winston logger

## Next Steps

1. **SMS Integration**: Replace console logging with actual SMS service
2. **Rate Limiting**: Implement OTP request rate limiting
3. **Session Management**: Add session invalidation
4. **Multi-factor Auth**: Add additional security layers
5. **Social Login**: Extend to support Google/Facebook login
