/**
 * Middleware Index
 * Export all middleware modules
 */

const { protect, optionalAuth, authorize, checkOwnership } = require('./auth.middleware');
const { requireKYC, requireKYCLevel, checkWithdrawalLimit, softKYCCheck } = require('./kyc.middleware');
const rateLimiter = require('./rateLimit.middleware');
const errorHandler = require('./error.middleware');
const { requireAdmin, requireSuperAdmin, checkPermission, logAdminAction, restrictAdminIP } = require('./admin.middleware');
const { handleValidation, sanitizeBody } = require('./validation.middleware');

module.exports = {
  // Authentication
  protect,
  optionalAuth,
  authorize,
  checkOwnership,

  // KYC
  requireKYC,
  requireKYCLevel,
  checkWithdrawalLimit,
  softKYCCheck,

  // Rate Limiting
  rateLimiter,
  authLimiter: rateLimiter.authLimiter,
  bettingLimiter: rateLimiter.bettingLimiter,
  withdrawalLimiter: rateLimiter.withdrawalLimiter,

  // Error Handling
  errorHandler,
  AppError: errorHandler.AppError,
  asyncHandler: errorHandler.asyncHandler,
  notFound: errorHandler.notFound,

  // Admin
  requireAdmin,
  requireSuperAdmin,
  checkPermission,
  logAdminAction,
  restrictAdminIP,

  // Validation
  handleValidation,
  sanitizeBody,
};
