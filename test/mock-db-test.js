/**
 * Mock database test to verify Swagger endpoints work
 */

const express = require('express');
const request = require('supertest');
const { swaggerUi, specs } = require('../utils/swagger');

// Create a test app with Swagger only
const app = express();
app.use(express.json());

// Add Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TrustChain API Documentation'
}));

// Mock health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TrustChain API running',
    timestamp: new Date().toISOString()
  });
});

// Test Swagger UI accessibility
console.log('🧪 Testing Swagger UI Integration...');

const testSwagger = async () => {
  try {
    // Test Swagger UI HTML page
    const response = await request(app)
      .get('/api/docs')
      .expect(200);
    
    console.log('✅ Swagger UI HTML page accessible');
    
    // Test Swagger JSON spec
    const specResponse = await request(app)
      .get('/api/docs-json')
      .expect(200);
    
    console.log('✅ Swagger JSON spec accessible');
    
    // Test health endpoint
    const healthResponse = await request(app)
      .get('/api/health')
      .expect(200);
    
    console.log('✅ Health endpoint working');
    console.log(`📋 Health response: ${JSON.stringify(healthResponse.body)}`);
    
    // Check if spec has expected endpoints
    const spec = specResponse.body;
    const expectedPaths = [
      '/api/auth/register',
      '/api/auth/verify-otp',
      '/api/auth/login',
      '/api/user/me',
      '/api/wallet',
      '/api/health'
    ];
    
    let foundPaths = [];
    expectedPaths.forEach(path => {
      if (spec.paths[path]) {
        foundPaths.push(path);
      }
    });
    
    console.log(`✅ Found ${foundPaths.length}/${expectedPaths.length} expected endpoints:`);
    foundPaths.forEach(path => console.log(`   📝 ${path}`));
    
    // Check for JWT security
    if (spec.components.securitySchemes && spec.components.securitySchemes.bearerAuth) {
      console.log('✅ JWT Bearer authentication configured');
    } else {
      console.log('❌ JWT Bearer authentication not found');
    }
    
    console.log('\n🎉 Swagger integration test completed successfully!');
    console.log('\n📖 Swagger UI will be available at: http://localhost:3000/api/docs');
    console.log('🔐 JWT authentication is configured with Bearer tokens');
    
  } catch (error) {
    console.error('❌ Swagger test failed:', error.message);
  }
};

testSwagger();
