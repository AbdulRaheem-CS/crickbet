/**
 * KYC Middleware
 * Verify KYC status before allowing certain operations
 */

/**
 * Require KYC verification
 */
const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.kycStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required to perform this action',
      kycStatus: req.user.kycStatus,
      code: 'KYC_REQUIRED',
    });
  }

  next();
};

/**
 * Require specific KYC level
 */
const requireKYCLevel = (minLevel) => {
  const levels = ['none', 'basic', 'intermediate', 'full'];

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // TODO: Implement KYC level check
    // 1. Get user's KYC document
    // 2. Compare KYC level with minimum required
    // 3. Allow or deny based on level

    // Placeholder implementation
    const userLevel = 'none'; // TODO: Get from KYC document
    const userLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(minLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({
        success: false,
        message: `KYC level '${minLevel}' required. Current level: '${userLevel}'`,
        currentLevel: userLevel,
        requiredLevel: minLevel,
        code: 'KYC_LEVEL_INSUFFICIENT',
      });
    }

    next();
  };
};

/**
 * Check withdrawal limits based on KYC
 */
const checkWithdrawalLimit = async (req, res, next) => {
  // TODO: Implement withdrawal limit check based on KYC level
  // 1. Get user's KYC level
  // 2. Get withdrawal limits for that level
  // 3. Check if requested amount exceeds limit
  // 4. Check daily/weekly/monthly limits

  next();
};

/**
 * Soft KYC check - warn but don't block
 */
const softKYCCheck = (req, res, next) => {
  if (req.user && req.user.kycStatus !== 'verified') {
    req.kycWarning = true;
    req.kycStatus = req.user.kycStatus;
  }
  next();
};

module.exports = {
  requireKYC,
  requireKYCLevel,
  checkWithdrawalLimit,
  softKYCCheck,
};
