/**
 * Password Validation Utility (Frontend)
 * Matches backend validation requirements
 */

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: number }
 */
export function validatePassword(password) {
  const errors = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      strength: 0
    };
  }

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  // Check for uppercase letter
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('One uppercase letter (A-Z)');
  }

  // Check for lowercase letter
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('One lowercase letter (a-z)');
  }

  // Check for number
  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('One number (0-9)');
  }

  // Check for special character
  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('One special character (!@#$%^&*...)');
  }

  const strength = getPasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Get password strength score (0-4)
 * @param {string} password - Password to evaluate
 * @returns {number} - Strength score (0=very weak, 4=very strong)
 */
export function getPasswordStrength(password) {
  if (!password) return 0;

  let score = 0;

  // Length score
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety score
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

  return Math.min(score, 4);
}

/**
 * Get password strength label and color
 * @param {number} score - Strength score (0-4)
 * @returns {Object} - { label: string, color: string }
 */
export function getPasswordStrengthInfo(score) {
  const info = [
    { label: 'Very Weak', color: '#ef4444' },  // red
    { label: 'Weak', color: '#f97316' },       // orange
    { label: 'Fair', color: '#eab308' },       // yellow
    { label: 'Strong', color: '#22c55e' },     // green
    { label: 'Very Strong', color: '#10b981' } // emerald
  ];
  
  return info[score] || info[0];
}

/**
 * Check individual requirements
 * @param {string} password - Password to check
 * @returns {Object} - Object with boolean values for each requirement
 */
export function checkRequirements(password) {
  return {
    hasMinLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)
  };
}

