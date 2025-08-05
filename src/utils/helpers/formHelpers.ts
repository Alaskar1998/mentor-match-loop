/**
 * @file formHelpers.ts
 * @description Utility functions for common form operations
 */

/**
 * @function debounce
 * @description Debounces a function call to prevent excessive executions
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * @function validateEmailFormat
 * @description Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} True if email format is valid
 */
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @function validatePasswordStrength
 * @description Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} Object with isValid boolean and strength level
 */
export const validatePasswordStrength = (password: string) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  return {
    isValid: password.length >= minLength,
    strength: strength as 1 | 2 | 3 | 4 | 5,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  };
};

/**
 * @function formatPhoneNumber
 * @description Formats phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // Return original if can't format
};

/**
 * @function sanitizeInput
 * @description Sanitizes user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

/**
 * @function generateFormId
 * @description Generates a unique form ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique form ID
 */
export const generateFormId = (prefix: string = 'form'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
