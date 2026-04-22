/**
 * Affiliate Model
 * MongoDB schema for affiliate program
 */

const mongoose = require('mongoose');

const AffiliateSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Affiliate code
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Affiliate tier/level
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze',
    },

    // Commission rates (percentage)
    commissionRates: {
      sports: { type: Number, default: 25 },
      casino: { type: Number, default: 30 },
      slots: { type: Number, default: 35 },
      lottery: { type: Number, default: 20 },
    },

    // Affiliate status
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'terminated'],
      default: 'pending',
      index: true,
    },

    // Personal/Business information
    profile: {
      companyName: { type: String },
      website: { type: String },
      trafficSources: [{ type: String }],
      marketingMethods: [{ type: String }],
      targetMarkets: [{ type: String }],
      monthlyVisitors: { type: Number },
    },

    // Alternative contact (Telegram / WhatsApp)
    others: {
      type: {
        type: String,
        enum: ['telegram', 'whatsapp'],
      },
      value: { type: String, trim: true }, // username for telegram, phone for whatsapp
    },

    // Payment information
    paymentInfo: {
      method: {
        type: String,
        enum: ['bank_transfer', 'upi', 'paypal', 'crypto'],
        default: 'bank_transfer',
      },
      bankAccount: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        accountHolderName: { type: String },
      },
      upiId: { type: String },
      paypalEmail: { type: String },
      cryptoWallet: {
        address: { type: String },
        network: { type: String },
      },
      minPayout: { type: Number, default: 5000 },
      payoutFrequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'monthly',
      },
    },

    // Statistics
    stats: {
      totalClicks: { type: Number, default: 0 },
      totalSignups: { type: Number, default: 0 },
      totalDepositors: { type: Number, default: 0 },
      totalDeposits: { type: Number, default: 0 },
      totalWagered: { type: Number, default: 0 },
      totalCommission: { type: Number, default: 0 },
      totalPaidOut: { type: Number, default: 0 },
      pendingCommission: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },

    // Monthly stats tracking
    monthlyStats: [
      {
        month: { type: String }, // YYYY-MM format
        clicks: { type: Number, default: 0 },
        signups: { type: Number, default: 0 },
        depositors: { type: Number, default: 0 },
        deposits: { type: Number, default: 0 },
        wagered: { type: Number, default: 0 },
        commission: { type: Number, default: 0 },
        paidOut: { type: Number, default: 0 },
      },
    ],

    // Sub-affiliates (for multi-level)
    subAffiliates: {
      enabled: { type: Boolean, default: false },
      commissionRate: { type: Number, default: 5 }, // % of sub-affiliate earnings
      count: { type: Number, default: 0 },
    },

    // Marketing materials
    marketingMaterials: [
      {
        type: { type: String, enum: ['banner', 'link', 'landing_page'] },
        name: { type: String },
        url: { type: String },
        size: { type: String },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
      },
    ],

    // Tracking links
    trackingLinks: [
      {
        name: { type: String },
        code: { type: String },
        url: { type: String },
        campaign: { type: String },
        clicks: { type: Number, default: 0 },
        signups: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Referred users
    referredUsers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        registeredAt: { type: Date },
        firstDepositAt: { type: Date },
        totalDeposits: { type: Number, default: 0 },
        totalWagered: { type: Number, default: 0 },
        commissionGenerated: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['registered', 'depositor', 'active', 'churned'],
          default: 'registered',
        },
      },
    ],

    // Contract details
    contract: {
      startDate: { type: Date },
      endDate: { type: Date },
      terms: { type: String },
      specialConditions: { type: String },
    },

    // Application details
    application: {
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String },
      rejectionReason: { type: String },
    },

    // Account manager
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AffiliateSchema.index({ affiliateCode: 1 });
AffiliateSchema.index({ status: 1, tier: 1 });
AffiliateSchema.index({ 'stats.totalCommission': -1 });

// Generate affiliate code before saving
AffiliateSchema.pre('save', function (next) {
  if (!this.affiliateCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'AFF';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.affiliateCode = code;
  }
  next();
});

// TODO: Implement commission calculation
AffiliateSchema.methods.calculateCommission = async function (period) {
  // TODO: Implement commission calculation logic
  // 1. Get all referred users' activity for period
  // 2. Calculate commission based on rates and tier
  // 3. Update pending commission
  throw new Error('Not implemented');
};

// TODO: Implement payout processing
AffiliateSchema.methods.processPayout = async function (amount) {
  // TODO: Implement payout processing logic
  // 1. Validate minimum payout amount
  // 2. Create payout transaction
  // 3. Update stats
  throw new Error('Not implemented');
};

// TODO: Implement tier upgrade check
AffiliateSchema.methods.checkTierUpgrade = async function () {
  // TODO: Implement tier upgrade logic
  // 1. Check performance metrics
  // 2. Upgrade tier if criteria met
  // 3. Update commission rates
  throw new Error('Not implemented');
};

// TODO: Implement tracking link creation
AffiliateSchema.methods.createTrackingLink = async function (name, campaign) {
  // TODO: Implement tracking link creation
  // 1. Generate unique tracking code
  // 2. Create tracking URL
  // 3. Add to tracking links array
  throw new Error('Not implemented');
};

module.exports = mongoose.model('Affiliate', AffiliateSchema);
