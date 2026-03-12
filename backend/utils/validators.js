/**
 * Validators
 * Input validation functions
 */

const { PATTERNS, LIMITS } = require('./constants');

/**
 * Validate email
 */
exports.validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!PATTERNS.EMAIL.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
};

/**
 * Validate phone number
 */
exports.validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  // Accept any numeric string (with optional leading +) of reasonable length
  if (!/^\+?\d{4,15}$/.test(phone)) {
    return { isValid: false, error: 'Invalid phone number' };
  }
  return { isValid: true };
};

/**
 * Validate PAN
 */
exports.validatePAN = (pan) => {
  if (!pan) {
    return { isValid: false, error: 'PAN is required' };
  }
  if (!PATTERNS.PAN.test(pan.toUpperCase())) {
    return { isValid: false, error: 'Invalid PAN format' };
  }
  return { isValid: true };
};

/**
 * Validate IFSC code
 */
exports.validateIFSC = (ifsc) => {
  if (!ifsc) {
    return { isValid: false, error: 'IFSC code is required' };
  }
  if (!PATTERNS.IFSC.test(ifsc.toUpperCase())) {
    return { isValid: false, error: 'Invalid IFSC code format' };
  }
  return { isValid: true };
};

/**
 * Validate amount
 */
exports.validateAmount = (amount, min, max) => {
  if (!amount || isNaN(amount)) {
    return { isValid: false, error: 'Valid amount is required' };
  }
  if (amount < min) {
    return { isValid: false, error: `Minimum amount is ₹${min}` };
  }
  if (amount > max) {
    return { isValid: false, error: `Maximum amount is ₹${max}` };
  }
  return { isValid: true };
};

/**
 * Validate deposit amount
 */
exports.validateDepositAmount = (amount) => {
  return exports.validateAmount(amount, LIMITS.MIN_DEPOSIT, LIMITS.MAX_DEPOSIT);
};

/**
 * Validate withdrawal amount
 */
exports.validateWithdrawalAmount = (amount) => {
  return exports.validateAmount(amount, LIMITS.MIN_WITHDRAWAL, LIMITS.MAX_WITHDRAWAL);
};

/**
 * Validate bet amount
 */
exports.validateBetAmount = (amount) => {
  return exports.validateAmount(amount, LIMITS.MIN_BET, LIMITS.MAX_BET);
};

/**
 * Validate odds
 */
exports.validateOdds = (odds) => {
  if (!odds || isNaN(odds)) {
    return { isValid: false, error: 'Valid odds is required' };
  }
  if (odds < LIMITS.MIN_ODDS || odds > LIMITS.MAX_ODDS) {
    return { isValid: false, error: `Odds must be between ${LIMITS.MIN_ODDS} and ${LIMITS.MAX_ODDS}` };
  }
  return { isValid: true };
};

/**
 * Validate password strength
 */
exports.validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

/**
 * Validate username
 */
exports.validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Username must not exceed 20 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { isValid: true };
};
