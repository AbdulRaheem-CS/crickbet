/**
 * Utility Functions
 * Common helper functions
 */

const crypto = require('crypto');

/**
 * Generate random string
 */
exports.generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate OTP
 */
exports.generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Hash string using SHA256
 */
exports.hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate HMAC signature
 */
exports.generateHMAC = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verify HMAC signature
 */
exports.verifyHMAC = (data, signature, secret) => {
  const expectedSignature = exports.generateHMAC(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

/**
 * Paginate query results
 */
exports.paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Calculate percentage
 */
exports.calculatePercentage = (part, whole) => {
  if (whole === 0) return 0;
  return ((part / whole) * 100).toFixed(2);
};

/**
 * Sleep/delay function
 */
exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Sanitize user input
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate email
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian)
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Mask sensitive data
 */
exports.maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return `${name.substring(0, 2)}***@${domain}`;
};

exports.maskPhone = (phone) => {
  return `******${phone.substring(6)}`;
};

exports.maskPAN = (pan) => {
  return `${pan.substring(0, 2)}****${pan.substring(6)}`;
};

/**
 * Generate slug from string
 */
exports.generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Get client IP address
 */
exports.getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
};

/**
 * Calculate time difference
 */
exports.getTimeDifference = (date1, date2 = new Date()) => {
  const diff = Math.abs(date2 - date1);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};
