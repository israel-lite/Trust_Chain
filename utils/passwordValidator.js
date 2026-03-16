class PasswordValidator {
  static validate(password) {
    const result = {
      isValid: false,
      strength: 'Weak',
      score: 0,
      feedback: []
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
    result.isValid = score >= 4; // Require at least 4 criteria (length + 3 character types)

    // Determine strength
    if (score <= 2) {
      result.strength = 'Weak';
    } else if (score <= 3) {
      result.strength = 'Fair';
    } else if (score <= 4) {
      result.strength = 'Strong';
    } else {
      result.strength = 'Very Strong';
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
    } else if (result.score <= 3) {
      result.strength = 'Fair';
    } else if (result.score <= 4) {
      result.strength = 'Strong';
    } else {
      result.strength = 'Very Strong';
    }

    return result;
  }

  static getStrengthColor(strength) {
    switch (strength) {
      case 'Weak':
        return '#dc3545'; // Red
      case 'Fair':
        return '#ffc107'; // Yellow
      case 'Strong':
        return '#28a745'; // Green
      case 'Very Strong':
        return '#007bff'; // Blue
      default:
        return '#6c757d'; // Gray
    }
  }
}

module.exports = PasswordValidator;
