/**
 * Input Sanitization Utility
 * Prevents XSS and other injection attacks
 */

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;

  // Convert to lowercase and trim
  email = email.toLowerCase().trim();

  // Remove any characters that aren't valid in email addresses
  email = email.replace(/[^a-z0-9@._+-]/g, '');

  return email;
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @param {Array} excludeFields - Fields to exclude from sanitization (e.g., passwords)
 * @returns {Object} - Sanitized object
 */
function sanitizeObject(obj, excludeFields = ['password', 'password_hash']) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Skip excluded fields
      if (excludeFields.includes(key)) {
        sanitized[key] = obj[key];
        continue;
      }

      // Recursively sanitize objects and arrays
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = sanitizeObject(obj[key], excludeFields);
      }
      // Sanitize strings
      else if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      }
      // Keep other types as-is
      else {
        sanitized[key] = obj[key];
      }
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize SQL input (basic protection)
 * Note: This is a basic check. Always use parameterized queries!
 * @param {string} input - Input to check
 * @returns {boolean} - True if input appears safe
 */
function isSafeSQLInput(input) {
  if (typeof input !== 'string') return true;

  // Check for common SQL injection patterns
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\;|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(UNION.*SELECT)/i
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize filename to prevent directory traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
  if (typeof filename !== 'string') return '';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\.+/g, '.')
    .replace(/^\.+/, '')
    .substring(0, 255);
}

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizeObject,
  isSafeSQLInput,
  sanitizeFilename
};

