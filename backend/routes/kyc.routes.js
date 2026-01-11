/**
 * KYC Routes
 * Routes for KYC verification
 */

const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kyc.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/kyc/status
// @desc    Get KYC status
// @access  Private
router.get('/status', protect, kycController.getKYCStatus);

// @route   POST /api/kyc/submit
// @desc    Submit KYC documents
// @access  Private
router.post('/submit', protect, kycController.submitKYC);

// @route   PUT /api/kyc/update
// @desc    Update KYC information
// @access  Private
router.put('/update', protect, kycController.updateKYC);

// @route   POST /api/kyc/upload-document
// @desc    Upload KYC document
// @access  Private
router.post('/upload-document', protect, kycController.uploadDocument);

// @route   POST /api/kyc/verify-pan
// @desc    Verify PAN card
// @access  Private
router.post('/verify-pan', protect, kycController.verifyPAN);

// @route   POST /api/kyc/verify-aadhaar
// @desc    Verify Aadhaar card
// @access  Private
router.post('/verify-aadhaar', protect, kycController.verifyAadhaar);

// @route   POST /api/kyc/verify-bank
// @desc    Verify bank account
// @access  Private
router.post('/verify-bank', protect, kycController.verifyBankAccount);

// @route   GET /api/kyc/documents
// @desc    Get uploaded documents
// @access  Private
router.get('/documents', protect, kycController.getDocuments);

module.exports = router;
