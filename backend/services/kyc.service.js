/**
 * KYC Service
 * Complete KYC verification system with document management
 * Phase 6: KYC System Implementation
 * 
 * Features:
 * - Document upload (Aadhaar, PAN, Passport, etc.)
 * - Multi-level verification workflow
 * - Status tracking and history
 * - Admin review and approval
 * - Document validation
 * - OCR integration ready
 */

const KYC = require('../models/KYC');
const User = require('../models/User');
const mongoose = require('mongoose');

class KYCService {
  /**
   * Submit KYC application
   * @param {String} userId - User ID
   * @param {Object} kycData - KYC submission data
   * @returns {Object} KYC submission
   */
  async submitKYC(userId, kycData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if user exists
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already verified
      if (user.kycVerified) {
        throw new Error('User is already KYC verified');
      }

      // Check for existing pending/approved submission
      const existingKYC = await KYC.findOne({
        userId,
        status: { $in: ['pending', 'approved'] },
      }).session(session);

      if (existingKYC) {
        throw new Error(`KYC ${existingKYC.status} submission already exists`);
      }

      // Validate required fields
      this._validateKYCData(kycData);

      // Create KYC submission
      const kyc = new KYC({
        userId,
        personalInfo: {
          fullName: kycData.fullName,
          dateOfBirth: kycData.dateOfBirth,
          gender: kycData.gender,
          nationality: kycData.nationality || 'Indian',
        },
        address: {
          street: kycData.street,
          city: kycData.city,
          state: kycData.state,
          postalCode: kycData.postalCode,
          country: kycData.country || 'India',
        },
        documents: kycData.documents || [],
        status: 'pending',
        submittedAt: new Date(),
      });

      await kyc.save({ session });

      // Update user KYC status
      user.kycStatus = 'pending';
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'KYC submitted successfully. Under review.',
        data: kyc,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Upload KYC document
   * @param {String} userId - User ID
   * @param {Object} documentData - Document information
   * @returns {Object} Updated KYC with document
   */
  async uploadDocument(userId, documentData) {
    const { type, number, file, expiryDate } = documentData;

    // Validate document type
    const validTypes = [
      'aadhaar',
      'pan',
      'passport',
      'driving_license',
      'voter_id',
      'bank_statement',
      'utility_bill',
    ];

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid document type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Find or create KYC record
    let kyc = await KYC.findOne({
      userId,
      status: { $in: ['draft', 'pending', 'rejected'] },
    });

    if (!kyc) {
      // Create new draft KYC
      kyc = new KYC({
        userId,
        status: 'draft',
        documents: [],
      });
    }

    // Check if document type already exists
    const existingDocIndex = kyc.documents.findIndex(
      (doc) => doc.type === type
    );

    const documentInfo = {
      type,
      number,
      documentUrl: file.path || file.url,
      fileName: file.originalname || file.name,
      uploadedAt: new Date(),
      verified: false,
    };

    if (expiryDate) {
      documentInfo.expiryDate = expiryDate;
    }

    if (existingDocIndex >= 0) {
      // Update existing document
      kyc.documents[existingDocIndex] = documentInfo;
    } else {
      // Add new document
      kyc.documents.push(documentInfo);
    }

    await kyc.save();

    return {
      success: true,
      message: `${type.toUpperCase()} document uploaded successfully`,
      data: kyc,
    };
  }

  /**
   * Get KYC status for user
   * @param {String} userId - User ID
   * @returns {Object} KYC status and details
   */
  async getKYCStatus(userId) {
    const kyc = await KYC.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const user = await User.findById(userId)
      .select('kycVerified kycStatus')
      .lean();

    if (!kyc) {
      return {
        status: 'not_submitted',
        kycVerified: false,
        message: 'No KYC submission found',
      };
    }

    return {
      status: kyc.status,
      kycVerified: user?.kycVerified || false,
      verificationLevel: kyc.verificationLevel || 0,
      submittedAt: kyc.submittedAt,
      verifiedAt: kyc.verifiedAt,
      rejectionReason: kyc.rejectionReason,
      documents: kyc.documents.map((doc) => ({
        type: doc.type,
        verified: doc.verified,
        uploadedAt: doc.uploadedAt,
      })),
      message: this._getStatusMessage(kyc.status),
    };
  }

  /**
   * Get KYC details
   * @param {String} userId - User ID
   * @returns {Object} Full KYC details
   */
  async getKYCDetails(userId) {
    const kyc = await KYC.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate('verifiedBy', 'username email')
      .lean();

    if (!kyc) {
      throw new Error('No KYC submission found');
    }

    return kyc;
  }

  /**
   * Update KYC information
   * @param {String} userId - User ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated KYC
   */
  async updateKYC(userId, updates) {
    const kyc = await KYC.findOne({
      userId,
      status: { $in: ['draft', 'rejected'] },
    });

    if (!kyc) {
      throw new Error('No editable KYC submission found');
    }

    // Update allowed fields
    if (updates.personalInfo) {
      kyc.personalInfo = { ...kyc.personalInfo, ...updates.personalInfo };
    }

    if (updates.address) {
      kyc.address = { ...kyc.address, ...updates.address };
    }

    if (updates.status === 'pending') {
      // Re-submit after editing
      kyc.status = 'pending';
      kyc.submittedAt = new Date();
    }

    await kyc.save();

    return {
      success: true,
      message: 'KYC updated successfully',
      data: kyc,
    };
  }

  /**
   * Approve KYC (Admin only)
   * @param {String} kycId - KYC submission ID
   * @param {String} adminId - Admin user ID
   * @param {Object} approvalData - Approval details
   * @returns {Object} Approved KYC
   */
  async approveKYC(kycId, adminId, approvalData = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const kyc = await KYC.findById(kycId).session(session);

      if (!kyc) {
        throw new Error('KYC submission not found');
      }

      if (kyc.status === 'approved') {
        throw new Error('KYC already approved');
      }

      // Update KYC status
      kyc.status = 'approved';
      kyc.verifiedBy = adminId;
      kyc.verifiedAt = new Date();
      kyc.verificationLevel = approvalData.verificationLevel || 1;
      kyc.adminNotes = approvalData.notes || '';

      // Mark all documents as verified
      kyc.documents.forEach((doc) => {
        doc.verified = true;
        doc.verifiedAt = new Date();
      });

      await kyc.save({ session });

      // Update user
      await User.findByIdAndUpdate(
        kyc.userId,
        {
          kycVerified: true,
          kycStatus: 'approved',
          kycLevel: kyc.verificationLevel,
          kycVerifiedAt: new Date(),
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'KYC approved successfully',
        data: kyc,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Reject KYC (Admin only)
   * @param {String} kycId - KYC submission ID
   * @param {String} adminId - Admin user ID
   * @param {String} reason - Rejection reason
   * @returns {Object} Rejected KYC
   */
  async rejectKYC(kycId, adminId, reason) {
    if (!reason) {
      throw new Error('Rejection reason is required');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const kyc = await KYC.findById(kycId).session(session);

      if (!kyc) {
        throw new Error('KYC submission not found');
      }

      // Update KYC status
      kyc.status = 'rejected';
      kyc.verifiedBy = adminId;
      kyc.verifiedAt = new Date();
      kyc.rejectionReason = reason;

      await kyc.save({ session });

      // Update user
      await User.findByIdAndUpdate(
        kyc.userId,
        {
          kycVerified: false,
          kycStatus: 'rejected',
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        message: 'KYC rejected',
        data: kyc,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Request additional documents
   * @param {String} kycId - KYC submission ID
   * @param {String} adminId - Admin user ID
   * @param {Array} requiredDocuments - List of required document types
   * @param {String} message - Message to user
   * @returns {Object} Updated KYC
   */
  async requestAdditionalDocuments(kycId, adminId, requiredDocuments, message) {
    const kyc = await KYC.findById(kycId);

    if (!kyc) {
      throw new Error('KYC submission not found');
    }

    kyc.status = 'documents_required';
    kyc.requiredDocuments = requiredDocuments;
    kyc.adminMessage = message;
    kyc.verifiedBy = adminId;
    kyc.verifiedAt = new Date();

    await kyc.save();

    return {
      success: true,
      message: 'Additional documents requested',
      data: kyc,
    };
  }

  /**
   * Verify specific document
   * @param {String} kycId - KYC submission ID
   * @param {String} documentType - Document type to verify
   * @param {Object} verificationData - Verification details
   * @returns {Object} Updated KYC
   */
  async verifyDocument(kycId, documentType, verificationData) {
    const kyc = await KYC.findById(kycId);

    if (!kyc) {
      throw new Error('KYC submission not found');
    }

    const documentIndex = kyc.documents.findIndex(
      (doc) => doc.type === documentType
    );

    if (documentIndex === -1) {
      throw new Error(`Document type ${documentType} not found`);
    }

    kyc.documents[documentIndex].verified = verificationData.verified;
    kyc.documents[documentIndex].verifiedAt = new Date();
    kyc.documents[documentIndex].verificationNotes = verificationData.notes || '';

    await kyc.save();

    // Check if all documents are verified
    const allVerified = kyc.documents.every((doc) => doc.verified);

    return {
      success: true,
      message: `Document ${documentType} verification updated`,
      data: kyc,
      allDocumentsVerified: allVerified,
    };
  }

  /**
   * Get pending KYC submissions (Admin)
   * @param {Object} filters - Query filters
   * @returns {Array} Pending KYC submissions
   */
  async getPendingKYC(filters = {}) {
    const { page = 1, limit = 20, status = 'pending' } = filters;

    const query = { status };
    const skip = (page - 1) * limit;

    const [kycs, total] = await Promise.all([
      KYC.find(query)
        .populate('userId', 'username email phone createdAt')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      KYC.countDocuments(query),
    ]);

    return {
      data: kycs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get KYC statistics (Admin)
   * @returns {Object} KYC statistics
   */
  async getKYCStatistics() {
    const [
      totalSubmissions,
      pendingCount,
      approvedCount,
      rejectedCount,
      documentsRequiredCount,
      recentSubmissions,
    ] = await Promise.all([
      KYC.countDocuments(),
      KYC.countDocuments({ status: 'pending' }),
      KYC.countDocuments({ status: 'approved' }),
      KYC.countDocuments({ status: 'rejected' }),
      KYC.countDocuments({ status: 'documents_required' }),
      KYC.find({ status: 'pending' })
        .populate('userId', 'username email')
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const verifiedUsers = await User.countDocuments({ kycVerified: true });
    const totalUsers = await User.countDocuments();

    return {
      total: totalSubmissions,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      documentsRequired: documentsRequiredCount,
      verifiedUsers,
      verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0,
      recentSubmissions,
    };
  }

  /**
   * Delete KYC document
   * @param {String} userId - User ID
   * @param {String} documentType - Document type to delete
   * @returns {Object} Updated KYC
   */
  async deleteDocument(userId, documentType) {
    const kyc = await KYC.findOne({
      userId,
      status: { $in: ['draft', 'rejected', 'documents_required'] },
    });

    if (!kyc) {
      throw new Error('No editable KYC submission found');
    }

    const documentIndex = kyc.documents.findIndex(
      (doc) => doc.type === documentType
    );

    if (documentIndex === -1) {
      throw new Error(`Document type ${documentType} not found`);
    }

    // Remove document from array
    kyc.documents.splice(documentIndex, 1);
    await kyc.save();

    return {
      success: true,
      message: `${documentType} document deleted successfully`,
      data: kyc,
    };
  }

  /**
   * Get KYC history for user
   * @param {String} userId - User ID
   * @returns {Array} KYC submission history
   */
  async getKYCHistory(userId) {
    const history = await KYC.find({ userId })
      .populate('verifiedBy', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    return history;
  }

  /**
   * Check if user can perform action based on KYC level
   * @param {String} userId - User ID
   * @param {String} action - Action to check (e.g., 'withdraw', 'deposit')
   * @returns {Object} Permission status
   */
  async checkKYCPermission(userId, action) {
    const user = await User.findById(userId).select('kycVerified kycLevel').lean();

    if (!user) {
      throw new Error('User not found');
    }

    const permissions = {
      deposit: 0, // Anyone can deposit
      bet: 0, // Anyone can bet
      withdraw_small: 1, // Level 1 required for withdrawals < 10000
      withdraw_large: 2, // Level 2 required for withdrawals >= 10000
      p2p_transfer: 1, // Level 1 required
    };

    const requiredLevel = permissions[action] || 0;
    const userLevel = user.kycLevel || 0;

    return {
      allowed: userLevel >= requiredLevel,
      currentLevel: userLevel,
      requiredLevel,
      message:
        userLevel >= requiredLevel
          ? 'Action allowed'
          : `KYC level ${requiredLevel} required. Current level: ${userLevel}`,
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Validate KYC submission data
   * @private
   */
  _validateKYCData(data) {
    const requiredFields = ['fullName', 'dateOfBirth', 'street', 'city', 'state', 'postalCode'];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate date of birth (must be 18+)
    const dob = new Date(data.dateOfBirth);
    const age = (new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000);
    if (age < 18) {
      throw new Error('User must be at least 18 years old');
    }

    return true;
  }

  /**
   * Get status message
   * @private
   */
  _getStatusMessage(status) {
    const messages = {
      draft: 'KYC draft saved. Please submit for verification.',
      pending: 'KYC submission under review. Please wait for admin approval.',
      approved: 'KYC verified successfully.',
      rejected: 'KYC submission rejected. Please review and resubmit.',
      documents_required: 'Additional documents required. Please upload requested documents.',
      not_submitted: 'No KYC submission found. Please submit your KYC.',
    };

    return messages[status] || 'Unknown status';
  }
}

module.exports = new KYCService();
