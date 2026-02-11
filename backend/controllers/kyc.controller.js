/**
 * KYC Controller
 * Handles KYC verification requests
 * Phase 6: KYC System Implementation
 */

const { asyncHandler } = require("../middleware/error.middleware");
const kycService = require('../services/kyc.service');

module.exports = {
  /**
   * @route   GET /api/kyc/status
   * @desc    Get KYC status for current user
   * @access  Private
   */
  getKYCStatus: asyncHandler(async (req, res) => {
    const status = await kycService.getKYCStatus(req.user._id);
    res.status(200).json({ success: true, data: status });
  }),

  /**
   * @route   GET /api/kyc/details
   * @desc    Get full KYC details for current user
   * @access  Private
   */
  getKYCDetails: asyncHandler(async (req, res) => {
    const details = await kycService.getKYCDetails(req.user._id);
    res.status(200).json({ success: true, data: details });
  }),

  /**
   * @route   POST /api/kyc/submit
   * @desc    Submit KYC application
   * @access  Private
   */
  submitKYC: asyncHandler(async (req, res) => {
    const result = await kycService.submitKYC(req.user._id, req.body);
    res.status(201).json(result);
  }),

  /**
   * @route   PUT /api/kyc/update
   * @desc    Update KYC information
   * @access  Private
   */
  updateKYC: asyncHandler(async (req, res) => {
    const result = await kycService.updateKYC(req.user._id, req.body);
    res.status(200).json(result);
  }),

  /**
   * @route   POST /api/kyc/upload-document
   * @desc    Upload KYC document
   * @access  Private
   */
  uploadDocument: asyncHandler(async (req, res) => {
    const { type, number, expiryDate } = req.body;
    const file = req.file; // From multer middleware

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const result = await kycService.uploadDocument(req.user._id, {
      type,
      number,
      file,
      expiryDate,
    });

    res.status(200).json(result);
  }),

  /**
   * @route   DELETE /api/kyc/document/:type
   * @desc    Delete KYC document
   * @access  Private
   */
  deleteDocument: asyncHandler(async (req, res) => {
    const { type } = req.params;
    const result = await kycService.deleteDocument(req.user._id, type);
    res.status(200).json(result);
  }),

  /**
   * @route   GET /api/kyc/history
   * @desc    Get KYC submission history
   * @access  Private
   */
  getKYCHistory: asyncHandler(async (req, res) => {
    const history = await kycService.getKYCHistory(req.user._id);
    res.status(200).json({
      success: true,
      data: history,
    });
  }),

  /**
   * @route   GET /api/kyc/check-permission/:action
   * @desc    Check if user has permission for action based on KYC level
   * @access  Private
   */
  checkPermission: asyncHandler(async (req, res) => {
    const { action } = req.params;
    const permission = await kycService.checkKYCPermission(req.user._id, action);
    res.status(200).json({
      success: true,
      data: permission,
    });
  }),

  // ============================================
  // PLACEHOLDER METHODS (Future Integration)
  // ============================================

  verifyPAN: asyncHandler(async (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'PAN verification not yet integrated. Please use document upload.' 
    });
  }),

  verifyAadhaar: asyncHandler(async (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Aadhaar verification not yet integrated. Please use document upload.' 
    });
  }),

  verifyBankAccount: asyncHandler(async (req, res) => {
    res.status(200).json({ 
      success: true, 
      message: 'Bank verification not yet integrated. Please use document upload.' 
    });
  }),

  getDocuments: asyncHandler(async (req, res) => {
    const status = await kycService.getKYCStatus(req.user._id);
    res.status(200).json({ 
      success: true, 
      data: status.documents || [] 
    });
  }),
};

