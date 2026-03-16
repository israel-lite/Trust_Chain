const bcrypt = require('bcrypt');
const User = require('../models/User');
const OTP = require('../models/OTP');
const Wallet = require('../models/Wallet');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const emailService = require('../utils/email');
const PasswordValidator = require('../utils/passwordValidator');

class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/RegisterResponse'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       409:
   *         description: Email already registered
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async register(req, res) {
    try {
      const { email, phone, password } = req.body;

      // Validate input
      if (!email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email, phone, and password are required'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Phone validation
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }

      // Password validation with strength feedback
      const passwordValidation = PasswordValidator.validate(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.feedback.join(', '),
          passwordStrength: passwordValidation.strength,
          passwordScore: passwordValidation.score
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const password_hash = await User.hashPassword(password);

      // Create user
      const user = await User.create({
        email,
        phone,
        password_hash
      });

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // Store OTP
      await OTP.create(user.id, email, otp, expiresAt);

      // Send OTP email
      try {
        await emailService.sendOTP(email, otp, 'verification');
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          userId: user.id,
          email: user.email,
          isVerified: false
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/verify-otp:
   *   post:
   *     summary: Verify user email with OTP
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/OTPRequest'
   *     responses:
   *       200:
   *         description: Email verified successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Email verified successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: integer
   *                       example: 1
   *                     email:
   *                       type: string
   *                       example: user@example.com
   *                     isVerified:
   *                       type: boolean
   *                       example: true
   *       400:
   *         description: Invalid, expired, or already used OTP
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      // Validate input
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }

      // Verify OTP
      const otpRecord = await OTP.verify(email, otp);
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid, expired, or already used OTP'
        });
      }

      // Mark OTP as used
      await OTP.markAsUsed(otpRecord.id);

      // Verify user email
      const verifiedUser = await User.verifyEmail(email);
      if (!verifiedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create wallet for new user
      const existingWallet = await Wallet.findByUserId(verifiedUser.id);
      if (!existingWallet) {
        await Wallet.create(verifiedUser.id);
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          userId: verifiedUser.id,
          email: verifiedUser.email,
          isVerified: true
        }
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Bad request - missing fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       401:
   *         description: Invalid credentials or account locked
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       403:
   *         description: Email not verified
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       429:
   *         description: Account locked due to too many failed attempts
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if email is verified
      if (!user.is_verified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }

      // Check failed attempts
      if (user.failed_login_attempts >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Account locked due to too many failed attempts. Please reset your password.'
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        // Increment failed attempts
        const newAttempts = user.failed_login_attempts + 1;
        await User.updateFailedAttempts(email, newAttempts);

        if (newAttempts >= 3) {
          return res.status(429).json({
            success: false,
            message: 'Account locked due to too many failed attempts. Please reset your password.'
          });
        }

        return res.status(401).json({
          success: false,
          message: `Invalid credentials. ${3 - newAttempts} attempts remaining.`
        });
      }

      // Reset failed attempts on successful login
      await User.resetFailedAttempts(email);

      // Generate JWT token
      const { generateToken } = require('../utils/jwt');
      const token = generateToken(user.id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            isVerified: user.is_verified
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Request password reset OTP
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User email address
   *                 example: user@example.com
   *     responses:
   *       200:
   *         description: Password reset OTP sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Password reset OTP sent to your email
   *       400:
   *         description: Bad request - missing email
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // Mark any existing OTPs for this email as used
      await OTP.markAllAsUsedForEmail(email);

      // Store new OTP
      await OTP.create(user.id, email, otp, expiresAt);

      // Send OTP email
      try {
        await emailService.sendOTP(email, otp, 'reset');
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     summary: Reset password with OTP
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - otp
   *               - newPassword
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User email address
   *                 example: user@example.com
   *               otp:
   *                 type: string
   *                 pattern: '^[0-9]{6}$'
   *                 description: 6-digit OTP code
   *                 example: '123456'
   *               newPassword:
   *                 type: string
   *                 minLength: 8
   *                 description: New password (minimum 8 characters)
   *                 example: 'newPassword123!'
   *     responses:
   *       200:
   *         description: Password reset successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Password reset successfully
   *       400:
   *         description: Bad request - validation error or invalid OTP
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      // Validate input
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, and new password are required'
        });
      }

      // Validate new password
      const passwordValidation = PasswordValidator.validate(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.feedback.join(', '),
          passwordStrength: passwordValidation.strength,
          passwordScore: passwordValidation.score
        });
      }

      // Verify OTP
      const otpRecord = await OTP.verify(email, otp);
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid, expired, or already used OTP'
        });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Hash new password
      const password_hash = await User.hashPassword(newPassword);

      // Update password and reset failed attempts
      await User.updatePassword(email, password_hash);

      // Mark OTP as used
      await OTP.markAsUsed(otpRecord.id);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = AuthController;
