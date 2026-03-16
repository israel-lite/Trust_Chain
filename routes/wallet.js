const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to wallet routes
router.use(authenticateToken);

/**
 * @route   GET /api/wallet
 * @desc    Get user wallet information
 * @access  Private
 */
router.get('/', UserController.getWallet);

module.exports = router;
