/**
 * Rate Limiting Middleware
 * Prevent abuse and DDoS attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user ? req.user._id.toString() : req.ip;
  },
});

/**
 * Auth endpoints rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Betting endpoints rate limiter
 */
const bettingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 bets per minute
  message: {
    success: false,
    message: 'Betting rate limit exceeded. Please slow down.',
    code: 'BETTING_RATE_LIMIT_EXCEEDED',
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
});

/**
 * Withdrawal endpoints rate limiter
 */
const withdrawalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 withdrawal requests per hour
  message: {
    success: false,
    message: 'Withdrawal rate limit exceeded. Please try again later.',
    code: 'WITHDRAWAL_RATE_LIMIT_EXCEEDED',
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after an hour.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * OTP request rate limiter
 */
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 OTP requests per 5 minutes
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait before requesting again.',
    code: 'OTP_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Casino game launch rate limiter
 */
const casinoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 game launches per minute
  message: {
    success: false,
    message: 'Too many game requests. Please slow down.',
    code: 'CASINO_RATE_LIMIT_EXCEEDED',
  },
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
});

/**
 * Dynamic rate limiter based on user level
 */
const dynamicLimiter = (baseLimit) => {
  return (req, res, next) => {
    // TODO: Implement dynamic rate limiting based on user level/VIP status
    // VIP users might have higher limits

    let limit = baseLimit;

    if (req.user) {
      switch (req.user.role) {
        case 'vip':
          limit = baseLimit * 2;
          break;
        case 'admin':
        case 'superadmin':
          limit = baseLimit * 10;
          break;
        default:
          limit = baseLimit;
      }
    }

    // Apply dynamic limit
    // This is a placeholder - actual implementation would use a proper limiter
    next();
  };
};

module.exports = generalLimiter;

module.exports.authLimiter = authLimiter;
module.exports.bettingLimiter = bettingLimiter;
module.exports.withdrawalLimiter = withdrawalLimiter;
module.exports.passwordResetLimiter = passwordResetLimiter;
module.exports.otpLimiter = otpLimiter;
module.exports.casinoLimiter = casinoLimiter;
module.exports.dynamicLimiter = dynamicLimiter;
