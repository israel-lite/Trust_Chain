/**
 * Generate a 6-digit OTP code
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiration time (5 minutes from now)
 */
function getOTPExpiry() {
  const now = new Date();
  const expiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
  return expiry;
}

module.exports = {
  generateOTP,
  getOTPExpiry
};
