/**
 * Payment Routes
 * Routes for payment gateway integration and webhooks
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', paymentController.getPaymentMethods);

// ============================================
// WEBHOOK ROUTES (No authentication)
// ============================================

// @route   POST /api/payment/webhook/razorpay
// @desc    Razorpay webhook handler
// @access  Public (verified by signature)
router.post('/webhook/razorpay', paymentController.webhookRazorpay);

// @route   POST /api/payment/webhook/paytm
// @desc    Paytm webhook handler
// @access  Public (verified by checksum)
router.post('/webhook/paytm', paymentController.webhookPaytm);

// @route   POST /api/payment/webhook/phonepe
// @desc    PhonePe webhook handler
// @access  Public (verified by signature)
router.post('/webhook/phonepe', paymentController.webhookPhonePe);

// @route   POST /api/payment/webhook/easypaisa
// @desc    EasyPaisa webhook handler
// @access  Public (verified by hash)
router.post('/webhook/easypaisa', paymentController.webhookEasyPaisa);

// @route   POST /api/payment/webhook/jazzcash
// @desc    JazzCash webhook handler
// @access  Public (verified by hash)
router.post('/webhook/jazzcash', paymentController.webhookJazzCash);

// ============================================
// PROTECTED USER ROUTES
// ============================================

// @route   POST /api/payment/deposit
// @desc    Initiate deposit
// @access  Private
router.post('/deposit', protect, paymentController.initiateDeposit);

// @route   POST /api/payment/verify/razorpay
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify/razorpay', protect, paymentController.verifyRazorpay);

// @route   POST /api/payment/withdrawal
// @desc    Request withdrawal
// @access  Private
router.post('/withdrawal', protect, paymentController.requestWithdrawal);

// @route   GET /api/payment/status/:transactionId
// @desc    Get payment status
// @access  Private
router.get('/status/:transactionId', protect, paymentController.getPaymentStatus);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   POST /api/payment/verify/manual
// @desc    Manually verify deposit (Admin)
// @access  Private (Admin)
router.post('/verify/manual', protect, requireAdmin, paymentController.verifyManualDeposit);

// @route   GET /api/payment/test/:gateway
// @desc    Test payment gateway configuration (Admin)
// @access  Private (Admin)
router.get('/test/:gateway', protect, requireAdmin, paymentController.testGateway);

module.exports = router;
