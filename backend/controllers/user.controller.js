/**
 * User Controller
 * Handles user profile and settings operations
 */

const { asyncHandler } = require('../middleware/error.middleware');
const User = require('../models/User');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'dateOfBirth', 'email'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = asyncHandler(async (req, res, next) => {
  // TODO: Implement user stats calculation
  // 1. Get total bets
  // 2. Get total wagered
  // 3. Get total won
  // 4. Get win rate
  // 5. Get favorite sports/games

  res.status(200).json({
    success: true,
    data: {
      totalBets: 0,
      totalWagered: 0,
      totalWon: 0,
      winRate: 0,
    },
  });
});

// @desc    Get user activity log
// @route   GET /api/users/activity
// @access  Private
exports.getActivity = asyncHandler(async (req, res, next) => {
  // TODO: Implement activity log retrieval

  res.status(200).json({
    success: true,
    data: [],
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  // TODO: Implement preferences update

  res.status(200).json({
    success: true,
    message: 'Preferences updated successfully',
  });
});

// @desc    Update responsible gaming settings
// @route   PUT /api/users/responsible-gaming
// @access  Private
exports.updateResponsibleGaming = asyncHandler(async (req, res, next) => {
  // TODO: Implement responsible gaming settings update

  res.status(200).json({
    success: true,
    message: 'Responsible gaming settings updated',
  });
});

// @desc    Self-exclude from betting
// @route   POST /api/users/self-exclude
// @access  Private
exports.selfExclude = asyncHandler(async (req, res, next) => {
  // TODO: Implement self-exclusion logic

  res.status(200).json({
    success: true,
    message: 'Self-exclusion activated',
  });
});

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  // TODO: Implement avatar upload logic

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: null,
  });
});

// =============================================
// Player KYC Methods (Phone OTP Verification)
// =============================================

// @desc    Get player KYC status
// @route   GET /api/users/kyc-status
// @access  Private
exports.getPlayerKYCStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const fullName = (user.firstName && user.lastName)
    ? `${user.firstName} ${user.lastName}`
    : null;

  res.status(200).json({
    success: true,
    data: {
      fullName,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      phone: user.phone || null,
      email: user.email || null,
      dateOfBirth: user.dateOfBirth || null,
      isPhoneVerified: user.isPhoneVerified || false,
      isEmailVerified: user.isEmailVerified || false,
      kycStatus: user.kycStatus || 'not_submitted',
      kycVerifiedAt: user.kycVerifiedAt || null,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
      // KYC is complete when full name is set AND phone is verified
      isKYCComplete: !!(fullName && user.isPhoneVerified),
    },
  });
});

// @desc    Update player's full name
// @route   POST /api/users/update-fullname
// @access  Private
exports.updateFullName = asyncHandler(async (req, res, next) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'First name and last name are required',
    });
  }

  // Check if name was already set and confirmed (prevent changes after KYC)
  const user = await User.findById(req.user.id);
  if (user.kycStatus === 'verified' && user.firstName && user.lastName) {
    return res.status(400).json({
      success: false,
      message: 'Name cannot be changed after KYC verification. Please contact customer service.',
    });
  }

  user.firstName = firstName.trim();
  user.lastName = lastName.trim();
  await user.save();

  // Check if KYC is now complete
  const isKYCComplete = !!(user.firstName && user.lastName && user.isPhoneVerified);
  if (isKYCComplete && user.kycStatus !== 'verified') {
    user.kycStatus = 'verified';
    user.kycVerifiedAt = new Date();
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Full name updated successfully',
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      isKYCComplete,
    },
  });
});

// @desc    Send OTP to player's phone
// @route   POST /api/users/send-phone-otp
// @access  Private
exports.sendPhoneOTP = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.isPhoneVerified) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is already verified',
    });
  }

  if (!user.phone) {
    return res.status(400).json({
      success: false,
      message: 'No phone number found on account. Please update your profile first.',
    });
  }

  // Rate limit: 1 OTP per 60 seconds
  const existing = otpStore.get(user.id.toString());
  if (existing && Date.now() - existing.createdAt < 60000) {
    const wait = Math.ceil((60000 - (Date.now() - existing.createdAt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Please wait ${wait} seconds before requesting a new OTP`,
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with expiry (5 minutes)
  otpStore.set(user.id.toString(), {
    otp,
    phone: user.phone,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });

  // In production, send OTP via SMS gateway (Twilio, etc.)
  // For now, log it to console for testing
  console.log(`[OTP] Phone verification OTP for ${user.phone}: ${otp}`);

  // Mask phone number for response
  const maskedPhone = user.phone.replace(/(\d{3})\d{4,}(\d{3})/, '$1****$2');

  res.status(200).json({
    success: true,
    message: `OTP sent to ${maskedPhone}`,
    data: {
      phone: maskedPhone,
      expiresIn: 300, // 5 minutes
      // REMOVE IN PRODUCTION - only for testing
      _devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    },
  });
});

// @desc    Verify phone OTP
// @route   POST /api/users/verify-phone-otp
// @access  Private
exports.verifyPhoneOTP = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: 'OTP is required',
    });
  }

  const userId = req.user.id.toString();
  const stored = otpStore.get(userId);

  if (!stored) {
    return res.status(400).json({
      success: false,
      message: 'No OTP request found. Please request a new OTP.',
    });
  }

  // Check expiry
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(userId);
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new one.',
    });
  }

  // Check attempts (max 5)
  if (stored.attempts >= 5) {
    otpStore.delete(userId);
    return res.status(400).json({
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.',
    });
  }

  // Verify OTP
  stored.attempts += 1;
  if (stored.otp !== otp.toString()) {
    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${5 - stored.attempts} attempts remaining.`,
    });
  }

  // OTP verified — mark phone as verified
  otpStore.delete(userId);

  const user = await User.findById(req.user.id);
  user.isPhoneVerified = true;
  
  // Check if KYC is now complete (full name + phone verified)
  const isKYCComplete = !!(user.firstName && user.lastName && user.isPhoneVerified);
  if (isKYCComplete && user.kycStatus !== 'verified') {
    user.kycStatus = 'verified';
    user.kycVerifiedAt = new Date();
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Phone number verified successfully',
    data: {
      isPhoneVerified: true,
      isKYCComplete,
    },
  });
});
