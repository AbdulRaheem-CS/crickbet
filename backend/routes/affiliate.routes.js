/**
 * Affiliate Routes
 * Routes for affiliate program
 */

const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliate.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   POST /api/affiliate/apply
// @desc    Apply for affiliate program
// @access  Private
router.post('/apply', protect, affiliateController.applyForAffiliate);

// Public affiliate registration (creates user with pending status)
router.post('/register', affiliateController.registerAffiliate);

// Admin approve route
router.put('/approve/:userId', protect, authorize('admin'), affiliateController.approveAffiliate);

// @route   GET /api/affiliate/dashboard
// @desc    Get affiliate dashboard data
// @access  Private
router.get('/dashboard', protect, affiliateController.getDashboard);

// @route   GET /api/affiliate/profile
// @desc    Get affiliate profile with potential earnings
// @access  Private
router.get('/profile', protect, affiliateController.getProfile);

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

// @route   GET /api/affiliate/bank-accounts
// @desc    Get all bank accounts
// @access  Private
router.get('/bank-accounts', protect, affiliateController.getBankAccounts);

// @route   POST /api/affiliate/bank-accounts
// @desc    Add new bank account
// @access  Private
router.post('/bank-accounts', protect, affiliateController.addBankAccount);

// @route   DELETE /api/affiliate/bank-accounts/:id
// @desc    Delete bank account
// @access  Private
router.delete('/bank-accounts/:id', protect, affiliateController.deleteBankAccount);

// @route   PUT /api/affiliate/bank-accounts/:id/set-default
// @desc    Set bank account as default
// @access  Private
router.put('/bank-accounts/:id/set-default', protect, affiliateController.setDefaultBankAccount);

// @route   GET /api/affiliate/hierarchy
// @desc    Get affiliate hierarchy (upline and downline)
// @access  Private
router.get('/hierarchy', protect, affiliateController.getHierarchy);

// @route   GET /api/affiliate/links-short
// @desc    Get short affiliate links (signup & referral) for header display
// @access  Private
router.get('/links-short', protect, affiliateController.getShortLinks);

// @route   GET /api/affiliate/kyc
// @desc    Get affiliate KYC status and documents
// @access  Private
router.get('/kyc', protect, affiliateController.getKYC);

// @route   POST /api/affiliate/kyc/identity
// @desc    Submit identity KYC documents
// @access  Private
router.post('/kyc/identity', protect, affiliateController.submitIdentityKYC);

// @route   POST /api/affiliate/kyc/address
// @desc    Submit address KYC documents
// @access  Private
router.post('/kyc/address', protect, affiliateController.submitAddressKYC);

// @route   GET /api/affiliate/commission-designations
// @desc    Get all commission designations with filters
// @access  Private
router.get('/commission-designations', protect, affiliateController.getCommissionDesignations);

// @route   POST /api/affiliate/commission-designations
// @desc    Create new commission designation
// @access  Private
router.post('/commission-designations', protect, affiliateController.createCommissionDesignation);

// @route   PUT /api/affiliate/commission-designations/:id
// @desc    Update commission designation
// @access  Private
router.put('/commission-designations/:id', protect, affiliateController.updateCommissionDesignation);

// @route   DELETE /api/affiliate/commission-designations/:id
// @desc    Delete commission designation
// @access  Private
router.delete('/commission-designations/:id', protect, affiliateController.deleteCommissionDesignation);

// @route   GET /api/affiliate/links
// @desc    Get all affiliate marketing links
// @access  Private
router.get('/links', protect, affiliateController.getAffiliateLinks);

// @route   POST /api/affiliate/links
// @desc    Create new affiliate marketing link
// @access  Private
router.post('/links', protect, affiliateController.createAffiliateLink);

// @route   PUT /api/affiliate/links/:id
// @desc    Update affiliate marketing link
// @access  Private
router.put('/links/:id', protect, affiliateController.updateAffiliateLink);

// @route   DELETE /api/affiliate/links/:id
// @desc    Delete affiliate marketing link
// @access  Private
router.delete('/links/:id', protect, affiliateController.deleteAffiliateLink);

// @route   GET /api/affiliate/links/:id/stats
// @desc    Get link statistics
// @access  Private
router.get('/links/:id/stats', protect, affiliateController.getAffiliateLinkStats);

// @route   GET /api/affiliate/member-search
// @desc    Search affiliate members/referrals with advanced filters
// @access  Private
router.get('/member-search', protect, affiliateController.searchMembers);

// @route   GET /api/affiliate/registrations-ftds
// @desc    Get registrations and First Time Deposits report
// @access  Private
router.get('/registrations-ftds', protect, affiliateController.getRegistrationsFTDs);

// @route   GET /api/affiliate/performance
// @desc    Get performance metrics for players or downline
// @access  Private
router.get('/performance', protect, affiliateController.getPerformance);

// @route   GET /api/affiliate/commissions
// @desc    Get commission records for affiliate
// @access  Private
router.get('/commissions', protect, affiliateController.getCommissions);

module.exports = router;
