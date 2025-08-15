# Phone Number Authentication API - Sample Payloads

This document provides sample request and response payloads for the phone number authentication API endpoints.

## 1. Send OTP

### Request
```json
POST /api/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "demoOTP": "123456"
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Please provide a valid 10-digit Indian phone number",
  "errors": [
    {
      "type": "field",
      "value": "12345",
      "msg": "Please provide a valid Indian phone number",
      "path": "phone",
      "location": "body"
    }
  ]
}
```

## 2. Verify OTP and Login/Register

### Request
```json
POST /api/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe"
}
```

### Success Response - New User (200)
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "676b123456789012345678ab",
      "phone": "+919876543210",
      "email": "user3210@traderdesk.ai",
      "name": "John Doe",
      "isActive": true,
      "loginMethod": "phone",
      "registrationDate": "2024-12-28T07:47:15.123Z",
      "brokerAccounts": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZiMTIzNDU2Nzg5MDEyMzQ1Njc4YWIiLCJpYXQiOjE3MzUzNzI0MzUsImV4cCI6MTczNTQ1ODgzNX0.example_token_signature",
    "expiresIn": "24h"
  }
}
```

### Success Response - Existing User (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "676b123456789012345678ab",
      "phone": "+919876543210",
      "email": "user3210@traderdesk.ai",
      "name": "John Doe",
      "isActive": true,
      "loginMethod": "phone",
      "registrationDate": "2024-12-28T07:47:15.123Z",
      "lastLogin": "2024-12-28T08:15:30.456Z",
      "brokerAccounts": [
        {
          "brokerName": "Dhan",
          "accountId": "CLIENT123",
          "isPrimary": true,
          "createdAt": "2024-12-28T07:50:00.000Z"
        }
      ]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZiMTIzNDU2Nzg5MDEyMzQ1Njc4YWIiLCJpYXQiOjE3MzUzNzI5MzAsImV4cCI6MTczNTQ1OTMzMH0.another_example_token_signature",
    "expiresIn": "24h"
  }
}
```

### Error Response - Invalid OTP (400)
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

### Error Response - OTP Expired (400)
```json
{
  "success": false,
  "message": "OTP has expired"
}
```

### Error Response - Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "type": "field",
      "value": "12",
      "msg": "OTP must be 6 digits",
      "path": "otp",
      "location": "body"
    }
  ]
}
```

## 3. Get User Profile

### Request
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZiMTIzNDU2Nzg5MDEyMzQ1Njc4YWIiLCJpYXQiOjE3MzUzNzI0MzUsImV4cCI6MTczNTQ1ODgzNX0.example_token_signature
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "676b123456789012345678ab",
      "phone": "+919876543210",
      "email": "user3210@traderdesk.ai",
      "name": "John Doe",
      "isActive": true,
      "loginMethod": "phone",
      "registrationDate": "2024-12-28T07:47:15.123Z",
      "lastLogin": "2024-12-28T08:15:30.456Z",
      "brokerAccounts": [
        {
          "brokerName": "Dhan",
          "accountId": "CLIENT123",
          "apiKey": "api_key_hidden",
          "accessToken": "token_hidden",
          "isPrimary": true,
          "createdAt": "2024-12-28T07:50:00.000Z"
        }
      ]
    }
  }
}
```

### Error Response - Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Error Response - Token Expired (401)
```json
{
  "success": false,
  "message": "Token expired"
}
```

## 4. Update User Profile

### Request
```json
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_token
Content-Type: application/json

{
  "name": "John Doe Updated",
  "email": "john.doe.updated@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "676b123456789012345678ab",
      "phone": "+919876543210",
      "email": "john.doe.updated@example.com",
      "name": "John Doe Updated",
      "isActive": true,
      "loginMethod": "phone",
      "registrationDate": "2024-12-28T07:47:15.123Z",
      "lastLogin": "2024-12-28T08:15:30.456Z",
      "brokerAccounts": []
    }
  }
}
```

### Error Response - Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

## 5. Refresh Token

### Request
```http
POST /api/auth/refresh-token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_token
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZiMTIzNDU2Nzg5MDEyMzQ1Njc4YWIiLCJpYXQiOjE3MzUzNzMwMDAsImV4cCI6MTczNTQ1OTQwMH0.new_token_signature",
    "expiresIn": "24h"
  }
}
```

## Frontend Integration Examples

### React/JavaScript Usage

```javascript
// Authentication service
class AuthService {
  constructor() {
    this.baseURL = '/api/auth';
    this.token = localStorage.getItem('authToken');
  }

  async sendOTP(phone) {
    const response = await fetch(`${this.baseURL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return response.json();
  }

  async verifyOTP(phone, otp, name) {
    const response = await fetch(`${this.baseURL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.token) {
      this.token = data.data.token;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  }

  async getProfile() {
    if (!this.token) throw new Error('No auth token');
    
    const response = await fetch(`${this.baseURL}/profile`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  async updateProfile(updates) {
    if (!this.token) throw new Error('No auth token');
    
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(updates)
    });
    return response.json();
  }

  async refreshToken() {
    if (!this.token) throw new Error('No auth token');
    
    const response = await fetch(`${this.baseURL}/refresh-token`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    const data = await response.json();
    
    if (data.success && data.data.token) {
      this.token = data.data.token;
      localStorage.setItem('authToken', this.token);
    }
    
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// Usage example
const auth = new AuthService();

// Send OTP
const result = await auth.sendOTP('9876543210');
console.log('OTP sent:', result);

// Verify OTP
const loginResult = await auth.verifyOTP('9876543210', '123456', 'John Doe');
console.log('Login result:', loginResult);

// Get profile
const profile = await auth.getProfile();
console.log('User profile:', profile);
```

## Error Handling Best Practices

```javascript
async function handleAuthRequest(requestFn) {
  try {
    const result = await requestFn();
    
    if (!result.success) {
      // Handle API errors
      console.error('API Error:', result.message);
      
      if (result.errors) {
        // Handle validation errors
        result.errors.forEach(error => {
          console.error(`${error.path}: ${error.msg}`);
        });
      }
      
      return { success: false, message: result.message };
    }
    
    return result;
    
  } catch (error) {
    // Handle network errors
    console.error('Network Error:', error.message);
    return { 
      success: false, 
      message: 'Network error. Please try again.' 
    };
  }
}

// Usage
const result = await handleAuthRequest(() => 
  auth.sendOTP('9876543210')
);
```

## Testing with Postman

### Collection Setup
1. Create a new Postman collection
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000`
3. Create environment variables for token storage

### Test Sequence
1. **Send OTP** → Copy `demoOTP` from response
2. **Verify OTP** → Copy `token` from response to environment variable
3. **Get Profile** → Use token from previous step
4. **Update Profile** → Use token from previous step
5. **Refresh Token** → Use token from previous step

This allows you to test the complete authentication flow in Postman.
