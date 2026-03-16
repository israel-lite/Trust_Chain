/**
 * Test Swagger configuration without database
 */

const { swaggerUi, specs } = require('../utils/swagger');

console.log('🧪 Testing Swagger Configuration...');

// Test if specs are generated correctly
if (specs && typeof specs === 'object') {
  console.log('✅ Swagger specs generated successfully');
  
  // Check for key components
  if (specs.paths) {
    console.log('✅ API paths found in specs');
  } else {
    console.log('❌ No API paths found in specs');
  }
  
  if (specs.components && specs.components.securitySchemes) {
    console.log('✅ Security schemes found in specs');
  } else {
    console.log('❌ No security schemes found in specs');
  }
  
  if (specs.components && specs.components.schemas) {
    console.log('✅ Schemas found in specs');
    console.log(`📋 Available schemas: ${Object.keys(specs.components.schemas).join(', ')}`);
  } else {
    console.log('❌ No schemas found in specs');
  }
} else {
  console.log('❌ Failed to generate Swagger specs');
}

// Test swaggerUi
if (swaggerUi && swaggerUi.serve && swaggerUi.setup) {
  console.log('✅ Swagger UI middleware loaded successfully');
} else {
  console.log('❌ Failed to load Swagger UI middleware');
}

console.log('\n🎉 Swagger configuration test completed!');
