# TrustChain - Fintech Escrow Platform

A secure escrow payment platform where buyers send money to the platform first, and the system holds it safely before releasing it to the seller.

## 🚀 V1 MVP Features

- **✅ User Registration** with email, phone, and password validation
- **✅ OTP Verification** for email verification (6-digit code, 5-minute expiry, no reuse)
- **✅ Secure Login** with JWT authentication and rate limiting (max 3 attempts)
- **✅ Automatic Wallet Creation** for each registered user
- **✅ User Dashboard APIs** for profile and wallet information
- **✅ Input Validation** for email format, phone numbers, and password strength
- **✅ Security Features** including bcrypt hashing, JWT tokens, and rate limiting

## 🛠 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers

## 📁 Project Structure

```
Trust_Chain/
├── controllers/          # API controllers
│   ├── authController.js
│   └── userController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── models/              # Database models
│   ├── database.js
│   ├── User.js
│   ├── OTP.js
│   └── Wallet.js
├── routes/              # API routes
│   ├── auth.js
│   ├── user.js
│   └── wallet.js
├── utils/               # Utility functions
│   ├── jwt.js
│   └── otp.js
├── database/            # Database schema
│   └── schema.sql
├── test/                # Test files
│   ├── validation-test.js
│   └── api-test.js
├── .env.example         # Environment variables template
├── POSTMAN_COLLECTION.json # Postman collection
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE trustchain;
```

Run the schema file:

```bash
psql -d trustchain -f database/schema.sql
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trustchain
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development

# OTP Configuration
OTP_EXPIRY_MINUTES=5
```

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 🧪 Testing

### Run Validation Tests

```bash
node test/validation-test.js
```

### Swagger UI Documentation

🎉 **NEW: Interactive API Documentation with Swagger UI!**

**Swagger UI URL:** `http://localhost:3000/api/docs`

#### Quick Testing with Swagger:

1. **Start Server:**
   ```bash
   npm run dev
   ```

2. **Open Swagger UI:**
   ```
   http://localhost:3000/api/docs
   ```

3. **Test Authentication Flow:**
   - Register user → Get OTP → Verify OTP → Login
   - Copy JWT token from login response
   - Click "Authorize" button in Swagger
   - Paste token: `Bearer YOUR_JWT_TOKEN`
   - Test protected endpoints

4. **Available Endpoints in Swagger:**
   - `POST /api/auth/register` - Register user
   - `POST /api/auth/verify-otp` - Verify OTP
   - `POST /api/auth/login` - Login
   - `GET /api/user/me` - User profile (JWT required)
   - `GET /api/wallet` - Wallet info (JWT required)
   - `GET /api/health` - Health check

📖 **Complete Swagger Guide:** See `SWAGGER_GUIDE.md` for detailed instructions

### API Endpoints Testing

Use the provided Postman collection or test with curl:

```bash
# Import the collection
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"+1234567890","password":"password123"}'
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user with validation

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Validation Rules:**
- Email: Valid email format
- Phone: 10+ digits, allows +, spaces, hyphens, parentheses
- Password: Minimum 8 characters

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "isVerified": false,
    "otp": "123456"
  }
}
```

#### POST /api/auth/verify-otp
Verify user email with OTP

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "isVerified": true
  }
}
```

#### POST /api/auth/login
Login user with rate limiting

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "phone": "+1234567890",
      "isVerified": true
    }
  }
}
```

### User Dashboard Endpoints

#### GET /api/user/me
Get current user profile (JWT required)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+1234567890",
    "isVerified": true,
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

#### GET /api/wallet
Get user wallet information (JWT required)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
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

### System Endpoints

#### GET /api/health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "message": "TrustChain API running",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt (10 salt rounds)
- **JWT Authentication**: Secure token-based authentication with configurable expiry
- **Rate Limiting**: Protection against brute force attacks (5 requests/15min for auth)
- **OTP Security**: 5-minute expiry, single-use OTPs, automatic cleanup
- **Input Validation**: Comprehensive validation for all user inputs
- **Failed Login Tracking**: Maximum 3 failed attempts before account lock
- **Security Headers**: Helmet middleware for additional security

## 🐛 Issues Fixed During Review

### Critical Issues Resolved:
1. **Database Schema**: Added `is_used` field to OTP table for preventing reuse
2. **Input Validation**: Added comprehensive validation for email, phone, and password
3. **Route Structure**: Fixed wallet endpoint to be `/api/wallet` instead of `/api/user/wallet`
4. **Health Check**: Moved health check to `/api/health` for consistency

### Security Improvements:
1. **OTP Reuse Prevention**: OTPs are marked as used after verification
2. **Enhanced Validation**: Email format, phone format, and password length validation
3. **Better Error Messages**: More specific error responses for different scenarios

## 📋 Testing with Postman

1. Import `POSTMAN_COLLECTION.json` into Postman
2. Set the `baseUrl` variable to `http://localhost:3000`
3. Follow this flow:
   - Register a new user
   - Copy the OTP from the response (dev mode only)
   - Verify the OTP
   - Login to get JWT token
   - Copy the JWT token to the `jwtToken` variable
   - Test protected endpoints

## 🚀 Development Notes

### OTP Implementation
- In development, OTP is printed to console for testing
- In production, integrate with email/SMS service
- OTP codes are 6 digits, expire after 5 minutes, and cannot be reused

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes per IP
- Login attempts: Maximum 3 failed attempts per user
- Automatic account lock after failed attempts

### Error Handling
- Global error handler middleware
- Consistent error response format
- Environment-specific error details

## 🔄 Next Steps (V2)

- Transaction management
- Escrow flow implementation
- Payment gateway integration
- User notifications
- Admin dashboard
- Audit logging
- Multi-factor authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
