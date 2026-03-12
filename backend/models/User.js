/**
 * User Model
 * MongoDB schema for user accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    // Basic Information
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },

    // Profile Information
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date },
    avatar: { type: String, default: null },

    // Account Status
    role: {
      type: String,
      enum: ['user', 'vip', 'affiliate', 'admin', 'superadmin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'pending'],
      default: 'active',
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    // KYC Status
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'verified', 'rejected'],
      default: 'not_submitted',
    },
    kycVerifiedAt: { type: Date },

    // Wallet Information
    wallet: {
      balance: { type: Number, default: 0, min: 0 }, // Available balance
      bonus: { type: Number, default: 0, min: 0 }, // Bonus balance
      exposure: { type: Number, default: 0, min: 0 }, // Locked funds for pending bets
      lockedFunds: { type: Number, default: 0, min: 0 }, // Total locked funds (exposure + other locks)
      currency: { type: String, default: 'INR' },
      lastTransactionAt: { type: Date }, // Last wallet activity
    },

    // Betting Limits
    bettingLimits: {
      dailyLimit: { type: Number, default: 100000 },
      weeklyLimit: { type: Number, default: 500000 },
      monthlyLimit: { type: Number, default: 2000000 },
      maxBetAmount: { type: Number, default: 50000 },
    },

    // Referral Information
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    referralEarnings: { type: Number, default: 0 },

    // Affiliate Information
    isAffiliate: { type: Boolean, default: false },
    affiliateCode: { type: String, unique: true, sparse: true },
    affiliateCommissionRate: { type: Number, default: 0 },

    // Security
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Tokens
    passwordResetToken: String,
    passwordResetExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // Activity Tracking
    lastLogin: { type: Date },
    lastLoginIp: { type: String },
    registrationIp: { type: String },
  // Last withdrawal timestamp
  lastWithdrawal: { type: Date },
  // When account was approved (for affiliate or special accounts)
  approvedAt: { type: Date },

    // Preferences
    preferences: {
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      oddsFormat: {
        type: String,
        enum: ['decimal', 'fractional', 'american'],
        default: 'decimal',
      },
    },

    // Responsible Gaming
    responsibleGaming: {
      selfExcluded: { type: Boolean, default: false },
      selfExcludedUntil: { type: Date },
      depositLimit: { type: Number },
      lossLimit: { type: Number },
      sessionTimeLimit: { type: Number }, // in minutes
      realityCheckInterval: { type: Number, default: 60 }, // in minutes
    },

    // Bank Accounts
    bankAccounts: [{
      accountHolderName: { type: String, required: true },
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      branchName: { type: String, required: true },
      accountType: { type: String, enum: ['savings', 'current'], default: 'savings' },
      isDefault: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
// Note: email, phone, referralCode, affiliateCode already have unique indexes from schema definition
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate referral code before saving
UserSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = this.generateReferralCode();
  }
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Match user entered password to hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate referral code
UserSchema.methods.generateReferralCode = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CB';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if account is locked
UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// TODO: Implement password reset token generation
UserSchema.methods.getResetPasswordToken = function () {
  // TODO: Generate reset token
  // TODO: Hash token and set to resetPasswordToken field
  // TODO: Set expire time
  return null;
};

// TODO: Implement email verification token generation
UserSchema.methods.getEmailVerificationToken = function () {
  // TODO: Generate verification token
  // TODO: Hash token and set to emailVerificationToken field
  // TODO: Set expire time
  return null;
};

module.exports = mongoose.model('User', UserSchema);
