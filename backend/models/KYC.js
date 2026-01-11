/**
 * KYC Model
 * MongoDB schema for Know Your Customer verification
 */

const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Personal Information
    personalInfo: {
      fullName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
      },
      nationality: { type: String },
      occupation: { type: String },
    },

    // Address Information
    address: {
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
    },

    // Identity Document
    identityDocument: {
      type: {
        type: String,
        enum: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'],
        required: true,
      },
      number: { type: String, required: true },
      frontImage: { type: String, required: true }, // S3 URL
      backImage: { type: String }, // S3 URL (may not be needed for all docs)
      issuedDate: { type: Date },
      expiryDate: { type: Date },
    },

    // Address Proof Document
    addressDocument: {
      type: {
        type: String,
        enum: ['aadhaar', 'utility_bill', 'bank_statement', 'passport', 'rent_agreement'],
      },
      number: { type: String },
      image: { type: String }, // S3 URL
      issuedDate: { type: Date },
    },

    // Selfie with ID
    selfieWithId: {
      image: { type: String }, // S3 URL
      uploadedAt: { type: Date },
    },

    // PAN Card (required for Indian regulations)
    panCard: {
      number: { type: String },
      image: { type: String }, // S3 URL
      name: { type: String }, // Name on PAN
    },

    // Bank Account Verification
    bankAccount: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolderName: { type: String },
      isVerified: { type: Boolean, default: false },
      verificationMethod: { type: String }, // penny_drop, bank_statement
    },

    // Verification Status
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'under_review', 'verified', 'rejected', 'resubmit_required'],
      default: 'not_submitted',
      index: true,
    },

    // Verification Level
    level: {
      type: String,
      enum: ['none', 'basic', 'intermediate', 'full'],
      default: 'none',
    },

    // Review Information
    review: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: { type: Date },
      notes: { type: String },
      rejectionReason: { type: String },
      rejectionCategory: {
        type: String,
        enum: ['document_unclear', 'document_expired', 'info_mismatch', 'fake_document', 'other'],
      },
    },

    // Submission History
    submissionHistory: [
      {
        submittedAt: { type: Date, default: Date.now },
        status: { type: String },
        notes: { type: String },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
      },
    ],

    // Risk Assessment
    riskAssessment: {
      score: { type: Number, default: 0 },
      level: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
      flags: [{ type: String }],
      lastAssessedAt: { type: Date },
    },

    // AML (Anti-Money Laundering) checks
    amlCheck: {
      status: {
        type: String,
        enum: ['pending', 'passed', 'flagged', 'failed'],
        default: 'pending',
      },
      checkedAt: { type: Date },
      provider: { type: String },
      referenceId: { type: String },
      notes: { type: String },
    },

    // Verification timestamps
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    expiresAt: { type: Date }, // KYC validity expiration

    // Document verification attempts
    verificationAttempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
KYCSchema.index({ status: 1 });
KYCSchema.index({ 'identityDocument.number': 1 });
KYCSchema.index({ 'panCard.number': 1 });
KYCSchema.index({ submittedAt: -1 });

// Virtual to check if KYC is complete
KYCSchema.virtual('isComplete').get(function () {
  return this.status === 'verified';
});

// Virtual to check if can resubmit
KYCSchema.virtual('canResubmit').get(function () {
  return (
    (this.status === 'rejected' || this.status === 'resubmit_required') &&
    this.verificationAttempts < this.maxAttempts
  );
});

// TODO: Implement KYC approval
KYCSchema.methods.approve = async function (reviewerId, notes) {
  // TODO: Implement KYC approval logic here
  // 1. Update status to verified
  // 2. Update user KYC status
  // 3. Set verification level
  // 4. Log approval in history
  throw new Error('Not implemented');
};

// TODO: Implement KYC rejection
KYCSchema.methods.reject = async function (reviewerId, reason, category) {
  // TODO: Implement KYC rejection logic here
  // 1. Update status to rejected
  // 2. Set rejection reason and category
  // 3. Update user KYC status
  // 4. Log rejection in history
  // 5. Send notification to user
  throw new Error('Not implemented');
};

// TODO: Implement document verification
KYCSchema.methods.verifyDocument = async function (documentType) {
  // TODO: Implement document verification logic
  // 1. Call external verification API
  // 2. Update document verification status
  // 3. Update overall KYC status
  throw new Error('Not implemented');
};

// TODO: Implement AML check
KYCSchema.methods.performAMLCheck = async function () {
  // TODO: Implement AML check logic
  // 1. Call AML provider API
  // 2. Update AML check status
  // 3. Update risk assessment
  throw new Error('Not implemented');
};

module.exports = mongoose.model('KYC', KYCSchema);
