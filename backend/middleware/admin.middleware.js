/**
 * Admin Middleware
 * Access control for admin operations
 */

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const adminRoles = ['admin', 'superadmin'];

  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_ACCESS_REQUIRED',
    });
  }

  next();
};

/**
 * Require super admin role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
      code: 'SUPERADMIN_ACCESS_REQUIRED',
    });
  }

  next();
};

/**
 * Check admin permissions
 */
const checkPermission = (permission) => {
  return async (req, res, next) => {
    // TODO: Implement granular permission checking
    // 1. Get admin's permissions from database
    // 2. Check if they have the required permission
    // 3. Allow or deny access

    // Placeholder - super admins have all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    // TODO: Check specific permission
    // const hasPermission = await checkAdminPermission(req.user._id, permission);

    next();
  };
};

/**
 * Log admin action
 */
const logAdminAction = (action) => {
  return async (req, res, next) => {
    // Store action details for logging after response
    req.adminAction = {
      action,
      adminId: req.user._id,
      adminName: req.user.username,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestBody: req.body,
      params: req.params,
    };

    // Log after response is sent
    res.on('finish', () => {
      // TODO: Implement admin action logging
      // 1. Save to admin audit log collection
      // 2. Include response status and any relevant data
      console.log('Admin Action:', {
        ...req.adminAction,
        responseStatus: res.statusCode,
      });
    });

    next();
  };
};

/**
 * Restrict access to specific IPs for admin routes
 */
const restrictAdminIP = (req, res, next) => {
  // TODO: Implement IP restriction for admin routes
  // 1. Get allowed IPs from config
  // 2. Check if request IP is in allowed list
  // 3. Block if not allowed

  const allowedIPs = process.env.ADMIN_ALLOWED_IPS
    ? process.env.ADMIN_ALLOWED_IPS.split(',')
    : [];

  // If no IPs configured, allow all (for development)
  if (allowedIPs.length === 0) {
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress;

  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP address',
      code: 'IP_RESTRICTED',
    });
  }

  next();
};

module.exports = {
  requireAdmin,
  requireSuperAdmin,
  checkPermission,
  logAdminAction,
  restrictAdminIP,
};
