/**
 * Referral Routes
 * Routes for referral system
 */

const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/referral/code
// @desc    Get user's referral code
// @access  Private
router.get('/code', protect, referralController.getReferralCode);

// @route   GET /api/referral/stats
// @desc    Get referral statistics
// @access  Private
router.get('/stats', protect, referralController.getReferralStats);

// @route   GET /api/referral/earnings
// @desc    Get referral earnings
// @access  Private
router.get('/earnings', protect, referralController.getReferralEarnings);

// @route   GET /api/referral/referred-users
// @desc    Get list of referred users
// @access  Private
router.get('/referred-users', protect, referralController.getReferredUsers);

// @route   POST /api/referral/claim-reward
// @desc    Claim referral reward
// @access  Private
router.post('/claim-reward', protect, referralController.claimReward);

// @route   POST /api/referral/validate-code
// @desc    Validate referral code
// @access  Public
router.post('/validate-code', referralController.validateReferralCode);

module.exports = router;
