# 📖 TrustChain API Swagger UI Guide

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

## 🔐 JWT Authentication Setup

1. **Register a user:**
   - Go to `POST /api/auth/register`
   - Fill in email, phone, and password
   - Execute the request
   - Copy the OTP from the response (development mode only)

2. **Verify OTP:**
   - Go to `POST /api/auth/verify-otp`
   - Enter email and OTP
   - Execute the request

3. **Login:**
   - Go to `POST /api/auth/login`
   - Enter email and password
   - Execute the request
   - Copy the JWT token from the response

4. **Authorize in Swagger:**
   - Click the **"Authorize"** button (top right)
   - Paste your JWT token: `Bearer YOUR_JWT_TOKEN`
   - Click **"Authorize"**

## 📋 Available Endpoints

### Authentication (No JWT Required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/login` - Login user

### User Profile (JWT Required)
- `GET /api/user/me` - Get user profile

### Wallet (JWT Required)
- `GET /api/wallet` - Get wallet information

### System (No JWT Required)
- `GET /api/health` - Health check

## 🧪 Complete Testing Flow

### Step 1: Register User
```json
{
  "email": "test@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

### Step 2: Verify OTP
```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

### Step 3: Login
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Step 4: Access Protected Endpoints
After authorizing with your JWT token, you can access:
- `GET /api/user/me` - View your profile
- `GET /api/wallet` - View your wallet

## 🎯 Example Request Bodies

### Registration Request
```json
{
  "email": "john.doe@example.com",
  "phone": "+15551234567",
  "password": "securePassword123"
}
```

### OTP Verification Request
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

### Login Request
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

## 🔍 Response Examples

### Registration Response (201)
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "isVerified": false,
    "otp": "123456"
  }
}
```

### Login Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "phone": "+15551234567",
      "isVerified": true
    }
  }
}
```

### User Profile Response (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "phone": "+15551234567",
    "isVerified": true,
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### Wallet Response (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "balance": 0.00,
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Email, phone, and password are required"
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token required"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

## 🛡️ Security Features

- **Password Hashing**: All passwords hashed with bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 5 requests per 15 minutes for auth endpoints
- **OTP Security**: 5-minute expiry, single-use OTPs
- **Input Validation**: Comprehensive validation for all inputs

## 🎨 Swagger UI Features

- **Interactive API Documentation**: Try endpoints directly from browser
- **Request/Response Schemas**: View expected data structures
- **Authentication Support**: Built-in JWT Bearer token authentication
- **Error Documentation**: All possible error responses documented
- **Example Values**: Pre-filled request examples for easy testing

## 🔧 Troubleshooting

### Common Issues

1. **"Access token required" error:**
   - Make sure you clicked "Authorize" and pasted your JWT token
   - Check that the token includes "Bearer " prefix

2. **"Invalid or expired token" error:**
   - Your JWT token may have expired
   - Login again to get a fresh token

3. **"Invalid, expired, or already used OTP" error:**
   - OTP codes expire after 5 minutes
   - Each OTP can only be used once
   - Check console for the latest OTP (development mode)

4. **"Account locked" error:**
   - Too many failed login attempts (max 3)
   - Wait for admin to unlock or create new account

## 📞 Support

For any issues with the API or Swagger UI:
1. Check the server console for error messages
2. Verify your database connection
3. Ensure all environment variables are set correctly
4. Review this guide for proper testing procedures
