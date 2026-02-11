/**
 * Referral Model
 * MongoDB schema for referral tracking
 */

const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema(
  {
    // Referrer (user who shared the code)
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Referee (user who used the code)
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Referral code used
    referralCode: {
      type: String,
      required: true,
      index: true,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'active', 'qualified', 'rewarded', 'expired', 'invalid'],
      default: 'pending',
      index: true,
    },

    // Qualification criteria
    qualification: {
      minDeposit: { type: Number, default: 500 },
      minBets: { type: Number, default: 5 },
      minTurnover: { type: Number, default: 1000 },
      qualificationPeriod: { type: Number, default: 30 }, // days
    },

    // Referee activity tracking
    refereeActivity: {
      totalDeposits: { type: Number, default: 0 },
      totalBets: { type: Number, default: 0 },
      totalTurnover: { type: Number, default: 0 },
      firstDepositAt: { type: Date },
      firstBetAt: { type: Date },
      lastActivityAt: { type: Date },
    },

    // Rewards
    referrerReward: {
      type: { type: String, enum: ['cash', 'bonus', 'free_bet'], default: 'cash' },
      amount: { type: Number, default: 0 },
      percentage: { type: Number }, // For percentage-based rewards
      status: {
        type: String,
        enum: ['pending', 'credited', 'failed'],
        default: 'pending',
      },
      creditedAt: { type: Date },
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    },

    refereeReward: {
      type: { type: String, enum: ['cash', 'bonus', 'free_bet'], default: 'bonus' },
      amount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['pending', 'credited', 'failed'],
        default: 'pending',
      },
      creditedAt: { type: Date },
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    },

    // Lifetime commission (ongoing earnings from referee)
    lifetimeCommission: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 0 }, // Percentage
      totalEarned: { type: Number, default: 0 },
      lastCalculatedAt: { type: Date },
    },

    // Tracking
    registeredAt: { type: Date, default: Date.now },
    qualifiedAt: { type: Date },
    expiresAt: { type: Date },

    // Source tracking
    source: {
      channel: { type: String }, // social, email, direct, etc.
      campaign: { type: String },
      medium: { type: String },
    },

    // Metadata
    metadata: {
      registrationIp: { type: String },
      device: { type: String },
      userAgent: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ReferralSchema.index({ referrer: 1, status: 1 });
ReferralSchema.index({ registeredAt: -1 });

// Virtual to check if qualified
ReferralSchema.virtual('isQualified').get(function () {
  const { refereeActivity, qualification } = this;
  return (
    refereeActivity.totalDeposits >= qualification.minDeposit &&
    refereeActivity.totalBets >= qualification.minBets &&
    refereeActivity.totalTurnover >= qualification.minTurnover
  );
});

// TODO: Implement qualification check
ReferralSchema.methods.checkQualification = async function () {
  // TODO: Implement referral qualification check logic
  // 1. Check if referee meets minimum criteria
  // 2. Update status if qualified
  // 3. Trigger reward distribution
  throw new Error('Not implemented');
};

// TODO: Implement reward distribution
ReferralSchema.methods.distributeRewards = async function () {
  // TODO: Implement reward distribution logic
  // 1. Calculate reward amounts
  // 2. Credit referrer reward
  // 3. Credit referee reward
  // 4. Update status
  throw new Error('Not implemented');
};

// TODO: Implement lifetime commission calculation
ReferralSchema.methods.calculateLifetimeCommission = async function (period) {
  // TODO: Implement lifetime commission calculation
  // 1. Get referee's betting activity for period
  // 2. Calculate commission based on rate
  // 3. Credit to referrer
  throw new Error('Not implemented');
};

module.exports = mongoose.model('Referral', ReferralSchema);
