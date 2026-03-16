export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 'Weak',
    score: 0,
    feedback: [],
    color: '#dc3545', // red
  };

  // Check minimum length
  if (password.length < 8) {
    result.feedback.push('Password must be at least 8 characters long');
    return result;
  }

  let score = 0;

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    result.feedback.push('Add at least one lowercase letter');
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    result.feedback.push('Add at least one uppercase letter');
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    result.feedback.push('Add at least one number');
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    result.feedback.push('Add at least one special character');
  }

  // Bonus points for length
  if (password.length >= 12) {
    score += 1;
  }

  result.score = score;
  result.isValid = score >= 4; // Require at least 4 criteria

  // Determine strength and color
  if (score <= 2) {
    result.strength = 'Weak';
    result.color = '#dc3545'; // red
  } else if (score <= 3) {
    result.strength = 'Fair';
    result.color = '#ffc107'; // yellow
  } else if (score <= 4) {
    result.strength = 'Strong';
    result.color = '#28a745'; // green
  } else {
    result.strength = 'Very Strong';
    result.color = '#007bff'; // blue
  }

  // Additional security checks
  if (password.toLowerCase().includes('password')) {
    result.feedback.push('Avoid using common words like "password"');
    result.score = Math.max(0, result.score - 1);
  }

  if (password.toLowerCase().includes('trustchain')) {
    result.feedback.push('Avoid using the app name in your password');
    result.score = Math.max(0, result.score - 1);
  }

  // Recalculate final strength
  if (result.score <= 2) {
    result.strength = 'Weak';
    result.color = '#dc3545';
  } else if (result.score <= 3) {
    result.strength = 'Fair';
    result.color = '#ffc107';
  } else if (result.score <= 4) {
    result.strength = 'Strong';
    result.color = '#28a745';
  } else {
    result.strength = 'Very Strong';
    result.color = '#007bff';
  }

  return result;
};

export const getPasswordStrengthClass = (strength) => {
  switch (strength) {
    case 'Weak':
      return 'password-strength-weak';
    case 'Fair':
      return 'password-strength-fair';
    case 'Strong':
      return 'password-strength-strong';
    case 'Very Strong':
      return 'password-strength-very-strong';
    default:
      return 'password-strength-weak';
  }
};
