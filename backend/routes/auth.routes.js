/**
 * Authentication Routes
 * Routes for user registration, login, logout, password reset
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter, passwordResetLimiter, otpLimiter } = require('../middleware/rateLimit.middleware');
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, authController.login);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, authController.logout);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, authController.updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, authController.changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);

// @route   PUT /api/auth/reset-password/:resetToken
// @desc    Reset password
// @access  Public
router.put('/reset-password/:resetToken', authController.resetPassword);

// @route   POST /api/auth/verify-email
// @desc    Verify email
// @access  Public
router.post('/verify-email', authController.verifyEmail);

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', protect, otpLimiter, authController.resendVerification);

// @route   POST /api/auth/send-phone-otp
// @desc    Send phone verification OTP
// @access  Private
router.post('/send-phone-otp', protect, otpLimiter, authController.sendPhoneOTP);

// @route   POST /api/auth/verify-phone
// @desc    Verify phone number
// @access  Private
router.post('/verify-phone', protect, authController.verifyPhone);

// @route   POST /api/auth/enable-2fa
// @desc    Enable two-factor authentication
// @access  Private
router.post('/enable-2fa', protect, authController.enable2FA);

// @route   POST /api/auth/verify-2fa
// @desc    Verify 2FA code
// @access  Private
router.post('/verify-2fa', protect, authController.verify2FA);

// @route   POST /api/auth/disable-2fa
// @desc    Disable two-factor authentication
// @access  Private
router.post('/disable-2fa', protect, authController.disable2FA);

module.exports = router;
