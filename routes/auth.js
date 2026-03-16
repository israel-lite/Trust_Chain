const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Register route
router.post('/register', AuthController.register);

// Verify OTP route
router.post('/verify-otp', AuthController.verifyOTP);

// Login route
router.post('/login', AuthController.login);

// Forgot password route
router.post('/forgot-password', AuthController.forgotPassword);

// Reset password route
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
