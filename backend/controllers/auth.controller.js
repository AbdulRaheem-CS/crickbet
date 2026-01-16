/**
 * Authentication Controller
 * Handles user authentication operations
 */

const { asyncHandler } = require('../middleware/error.middleware');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, phone, referredBy } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username, email, and password',
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email or username already exists',
    });
  }

  // Generate referral code
  const referralCode = `${username.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`;

  // Create user
  const user = await User.create({
    username,
    email,
    password, // Will be hashed by pre-save hook in User model
    phone,
    referralCode,
    referredBy,
  });

  // Generate JWT token
  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
      },
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, emailOrPhone } = req.body;
  
  // Support both email and emailOrPhone field
  const loginIdentifier = email || emailOrPhone;

  // Validate input
  if (!loginIdentifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  // Find user by email or phone (if it's a 10-digit number)
  const isPhone = /^[0-9]{10}$/.test(loginIdentifier);
  const query = isPhone 
    ? { phone: loginIdentifier }
    : { email: loginIdentifier };

  // Find user and include password field
  const user = await User.findOne(query).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check if password matches
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Check account status
  if (user.status === 'suspended' || user.status === 'banned') {
    return res.status(403).json({
      success: false,
      message: `Your account has been ${user.status}. Please contact support.`,
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        wallet: user.wallet,
        isEmailVerified: user.isEmailVerified,
        kycStatus: user.kycStatus,
      },
      token,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // TODO: Implement logout logic
  // 1. Invalidate token (if using token blacklist)
  // 2. Clear cookies
  // 3. Log logout activity

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // TODO: Implement profile update logic
  // 1. Validate input data
  // 2. Update allowed fields
  // 3. Return updated user

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: null,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  // TODO: Implement password change logic
  // 1. Verify current password
  // 2. Validate new password
  // 3. Hash new password
  // 4. Update password
  // 5. Send notification email

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // TODO: Implement forgot password logic
  // 1. Find user by email
  // 2. Generate reset token
  // 3. Send reset email
  // 4. Set token expiry

  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
  });
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // TODO: Implement password reset logic
  // 1. Validate reset token
  // 2. Check token expiry
  // 3. Hash new password
  // 4. Update password
  // 5. Clear reset token

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // TODO: Implement email verification logic

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = asyncHandler(async (req, res, next) => {
  // TODO: Implement resend verification logic

  res.status(200).json({
    success: true,
    message: 'Verification email sent',
  });
});

// @desc    Send phone OTP
// @route   POST /api/auth/send-phone-otp
// @access  Private
exports.sendPhoneOTP = asyncHandler(async (req, res, next) => {
  // TODO: Implement send OTP logic

  res.status(200).json({
    success: true,
    message: 'OTP sent to your phone',
  });
});

// @desc    Verify phone
// @route   POST /api/auth/verify-phone
// @access  Private
exports.verifyPhone = asyncHandler(async (req, res, next) => {
  // TODO: Implement phone verification logic

  res.status(200).json({
    success: true,
    message: 'Phone verified successfully',
  });
});

// @desc    Enable 2FA
// @route   POST /api/auth/enable-2fa
// @access  Private
exports.enable2FA = asyncHandler(async (req, res, next) => {
  // TODO: Implement 2FA enable logic

  res.status(200).json({
    success: true,
    message: '2FA enabled successfully',
    data: null,
  });
});

// @desc    Verify 2FA
// @route   POST /api/auth/verify-2fa
// @access  Private
exports.verify2FA = asyncHandler(async (req, res, next) => {
  // TODO: Implement 2FA verification logic

  res.status(200).json({
    success: true,
    message: '2FA verified successfully',
  });
});

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private
exports.disable2FA = asyncHandler(async (req, res, next) => {
  // TODO: Implement 2FA disable logic

  res.status(200).json({
    success: true,
    message: '2FA disabled successfully',
  });
});
