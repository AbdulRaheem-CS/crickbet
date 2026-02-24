/**
 * Wallet Routes
 * Routes for wallet and transaction management
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireKYC, checkWithdrawalLimit } = require('../middleware/kyc.middleware');
const { withdrawalLimiter } = require('../middleware/rateLimit.middleware');

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/balance', protect, walletController.getBalance);

// @route   GET /api/wallet/transactions
// @desc    Get transaction history
// @access  Private
router.get('/transactions', protect, walletController.getTransactions);

// @route   GET /api/wallet/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/transactions/:id', protect, walletController.getTransactionById);

// @route   POST /api/wallet/deposit
// @desc    Initiate deposit
// @access  Private
router.post('/deposit', protect, walletController.initiateDeposit);

// @route   POST /api/wallet/deposit/verify
// @desc    Verify deposit payment
// @access  Private
router.post('/deposit/verify', protect, walletController.verifyDeposit);

// @route   POST /api/wallet/withdrawal
// @desc    Request withdrawal
// @access  Private
router.post('/withdrawal', protect, withdrawalLimiter, checkWithdrawalLimit, walletController.requestWithdrawal);

// @route   GET /api/wallet/withdrawal/:id
// @desc    Get withdrawal status
// @access  Private
router.get('/withdrawal/:id', protect, walletController.getWithdrawalStatus);

// @route   POST /api/wallet/withdrawal/:id/cancel
// @desc    Cancel pending withdrawal
// @access  Private
router.post('/withdrawal/:id/cancel', protect, walletController.cancelWithdrawal);

// @route   GET /api/wallet/exposure
// @desc    Get current betting exposure
// @access  Private
router.get('/exposure', protect, walletController.getExposure);

// @route   GET /api/wallet/stats
// @desc    Get wallet statistics
// @access  Private
router.get('/stats', protect, walletController.getWalletStats);

// @route   GET /api/wallet/payment-methods
// @desc    Get available payment methods
// @access  Private
router.get('/payment-methods', protect, walletController.getPaymentMethods);

// @route   POST /api/wallet/webhook/payment
// @desc    Payment gateway webhook
// @access  Public (but verified)
router.post('/webhook/payment', walletController.paymentWebhook);

module.exports = router;
