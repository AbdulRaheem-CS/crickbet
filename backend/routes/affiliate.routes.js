/**
 * Affiliate Routes
 * Routes for affiliate program
 */

const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliate.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   POST /api/affiliate/apply
// @desc    Apply for affiliate program
// @access  Private
router.post('/apply', protect, affiliateController.applyForAffiliate);

// @route   GET /api/affiliate/dashboard
// @desc    Get affiliate dashboard data
// @access  Private
router.get('/dashboard', protect, affiliateController.getDashboard);

// @route   GET /api/affiliate/stats
// @desc    Get affiliate statistics
// @access  Private
router.get('/stats', protect, affiliateController.getStats);

// @route   GET /api/affiliate/earnings
// @desc    Get affiliate earnings
// @access  Private
router.get('/earnings', protect, affiliateController.getEarnings);

// @route   GET /api/affiliate/referred-users
// @desc    Get referred users
// @access  Private
router.get('/referred-users', protect, affiliateController.getReferredUsers);

// @route   POST /api/affiliate/create-tracking-link
// @desc    Create tracking link
// @access  Private
router.post('/create-tracking-link', protect, affiliateController.createTrackingLink);

// @route   GET /api/affiliate/tracking-links
// @desc    Get all tracking links
// @access  Private
router.get('/tracking-links', protect, affiliateController.getTrackingLinks);

// @route   GET /api/affiliate/marketing-materials
// @desc    Get marketing materials
// @access  Private
router.get('/marketing-materials', protect, affiliateController.getMarketingMaterials);

// @route   POST /api/affiliate/request-payout
// @desc    Request affiliate payout
// @access  Private
router.post('/request-payout', protect, affiliateController.requestPayout);

// @route   GET /api/affiliate/payouts
// @desc    Get payout history
// @access  Private
router.get('/payouts', protect, affiliateController.getPayouts);

// @route   PUT /api/affiliate/payment-info
// @desc    Update payment information
// @access  Private
router.put('/payment-info', protect, affiliateController.updatePaymentInfo);

module.exports = router;
