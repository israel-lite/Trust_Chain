require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const database = require('./models/database');
const errorHandler = require('./middleware/errorHandler');
const { swaggerUi, specs } = require('./utils/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);

// Swagger UI documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TrustChain API Documentation'
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TrustChain API running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TrustChain API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      wallet: '/api/wallet',
      docs: '/api/docs',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use(errorHandler);

// Test database connection and start server
const startServer = async () => {
  try {
    console.log('🔍 Testing database connection...');
    await database.connect();
    
    // Test email service
    const emailService = require('./utils/email');
    const emailConnected = await emailService.testConnection();
    if (!emailConnected) {
      console.warn('⚠️  Email service not configured properly');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 TrustChain API server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log('✅ Production-ready system started');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('💡 Please check your database and email configuration');
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
startServer();
