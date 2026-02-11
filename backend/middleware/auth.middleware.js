/**
 * Authentication Middleware
 * JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        // Use 403 Forbidden to indicate the user is authenticated but not allowed due to status
        return res.status(403).json({
          success: false,
          message: `Your account is ${user.status}. Please contact support.`,
        });
      }

      // Check if account is locked
      if (user.isLocked && user.isLocked()) {
        return res.status(401).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - Don't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (err) {
        // Token invalid, but don't fail - just continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
const checkOwnership = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    // TODO: Implement ownership check logic
    // 1. Get resource from request
    // 2. Compare resource user ID with authenticated user ID
    // 3. Allow if owner or admin
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  checkOwnership,
};
