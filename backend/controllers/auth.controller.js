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
  const { username, email, password, phone, referredBy, refCode } = req.body;

  // Also accept referral via query param e.g. /api/auth/register?ref=<affiliateId|refCode>
  const refQuery = req.query.ref;

  // Validate input — phone is required, email is optional
  if (!username || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username, password, and phone number',
    });
  }

  // Check if user already exists by username (globally unique)
  const existingByUsername = await User.findOne({ username });
  if (existingByUsername) {
    return res.status(400).json({ success: false, message: 'Username already taken' });
  }

  // Check phone uniqueness among non-affiliate (player) accounts only
  if (phone) {
    const existingByPhone = await User.findOne({ phone, role: { $ne: 'affiliate' } });
    if (existingByPhone) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
  }

  // Check email uniqueness if provided
  if (email) {
    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
  }

  // Generate referral code
  const referralCode = `${username.substring(0, 3).toUpperCase()}${Date.now().toString().slice(-6)}`;

  // Resolve referredBy: priority -> body.referredBy -> body.refCode -> query.ref
  let referredByFinal = referredBy || null;

  if (!referredByFinal && refCode) {
    // Try to resolve referral code to a user id
    const referringUser = await User.findOne({ referralCode: refCode }).select('_id');
    if (referringUser) referredByFinal = referringUser._id;
  }

  if (!referredByFinal && refQuery) {
    // refQuery may be an id or a referral code
    const maybeUserById = await User.findById(refQuery).select('_id').lean().catch(() => null);
    if (maybeUserById) {
      referredByFinal = maybeUserById._id;
    } else {
      const byCode = await User.findOne({ referralCode: refQuery }).select('_id');
      if (byCode) referredByFinal = byCode._id;
    }
  }

  // Create user
  const userData = {
    username,
    password, // Will be hashed by pre-save hook in User model
    phone,
    referralCode,
    referredBy: referredByFinal,
  };
  if (email) userData.email = email;
  
  const user = await User.create(userData);

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
      message: 'Please provide your credentials and password',
    });
  }

  // Find user by email, phone, or username
  const isPhone = /^[0-9]+$/.test(loginIdentifier);
  const isEmail = /\S+@\S+\.\S+/.test(loginIdentifier);
  let user = null;

  if (isPhone) {
    // Phone can match multiple users (player + affiliate), try each
    const candidates = await User.find({ phone: loginIdentifier }).select('+password');
    for (const candidate of candidates) {
      const match = await candidate.matchPassword(password);
      if (match) {
        user = candidate;
        break;
      }
    }
    if (!user && candidates.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } else {
    const query = isEmail ? { email: loginIdentifier } : { username: loginIdentifier };
    user = await User.findOne(query).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  }

  // Check account status
  if (user.status === 'suspended' || user.status === 'banned') {
    return res.status(403).json({
      success: false,
      message: `Your account has been ${user.status}. Please contact support.`,
    });
  }

  // If account is pending (for affiliate signups), prevent login
  if (user.status === 'pending') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval. Please wait for admin approval.',
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
        lastWithdrawal: user.lastWithdrawal,
        approvedAt: user.approvedAt,
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
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password',
    });
  }

  // Fetch user with password field (select: false by default)
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  // Update password — pre-save hook will hash it
  user.password = newPassword;
  await user.save();

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
