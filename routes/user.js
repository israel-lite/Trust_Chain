const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

/**
 * @route   GET /api/user/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', UserController.getProfile);

module.exports = router;
