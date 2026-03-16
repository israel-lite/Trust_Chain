/**
 * Simple validation test to check our input validation logic
 */

const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { generateToken, verifyToken } = require('../utils/jwt');

// Test OTP generation
console.log('🧪 Testing OTP generation...');
const otp1 = generateOTP();
const otp2 = generateOTP();
console.log(`✅ OTP 1: ${otp1} (6 digits: ${otp1.length === 6})`);
console.log(`✅ OTP 2: ${otp2} (different: ${otp1 !== otp2})`);

// Test OTP expiry
console.log('\n🧪 Testing OTP expiry...');
const expiry = getOTPExpiry();
const now = new Date();
const timeDiff = expiry - now;
console.log(`✅ Expiry in 5 minutes: ${Math.round(timeDiff / 60000)} minutes`);

// Test JWT token generation and verification
console.log('\n🧪 Testing JWT tokens...');
process.env.JWT_SECRET = 'test_secret_key';
const userId = 123;
const email = 'test@example.com';

const token = generateToken(userId, email);
console.log(`✅ Token generated: ${token.substring(0, 50)}...`);

try {
  const decoded = verifyToken(token);
  console.log(`✅ Token verified: userId=${decoded.userId}, email=${decoded.email}`);
} catch (error) {
  console.log(`❌ Token verification failed: ${error.message}`);
}

// Test email validation regex
console.log('\n🧪 Testing email validation...');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const testEmails = [
  'test@example.com',
  'user.name+tag@domain.co.uk',
  'invalid-email',
  'test@',
  '@domain.com',
  'test@domain'
];

testEmails.forEach(email => {
  const isValid = emailRegex.test(email);
  console.log(`${isValid ? '✅' : '❌'} ${email}: ${isValid}`);
});

// Test phone validation regex
console.log('\n🧪 Testing phone validation...');
const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
const testPhones = [
  '+1234567890',
  '123-456-7890',
  '(123) 456-7890',
  '1234567890',
  'invalid-phone',
  '123',
  '+1 234 567 890'
];

testPhones.forEach(phone => {
  const isValid = phoneRegex.test(phone) && phone.length >= 10;
  console.log(`${isValid ? '✅' : '❌'} ${phone}: ${isValid}`);
});

console.log('\n🎉 Validation tests completed!');
