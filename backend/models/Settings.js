/**
 * Settings Model
 * MongoDB schema for platform settings
 */

const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    // Settings category
    category: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // General Platform Settings
    platform: {
      siteName: { type: String, default: 'CrickBet' },
      siteUrl: { type: String, default: 'https://crickbet.com' },
      supportEmail: { type: String, default: 'support@crickbet.com' },
      supportPhone: { type: String },
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String },
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR' },
      language: { type: String, default: 'en' },
    },

    // Betting Settings
    betting: {
      minBetAmount: { type: Number, default: 10 },
      maxBetAmount: { type: Number, default: 100000 },
      maxExposure: { type: Number, default: 500000 },
      commissionRate: { type: Number, default: 2 }, // Percentage
      betCancellationWindow: { type: Number, default: 5 }, // Minutes before match start
      liveInPlayEnabled: { type: Boolean, default: true },
      fancyBettingEnabled: { type: Boolean, default: true },
      autoCancelUnmatchedBets: { type: Boolean, default: true },
    },

    // Wallet Settings
    wallet: {
      minDeposit: { type: Number, default: 100 },
      maxDeposit: { type: Number, default: 100000 },
      minWithdrawal: { type: Number, default: 500 },
      maxWithdrawal: { type: Number, default: 50000 },
      withdrawalProcessingTime: { type: String, default: '24-48 hours' },
      dailyWithdrawalLimit: { type: Number, default: 200000 },
      monthlyWithdrawalLimit: { type: Number, default: 5000000 },
      withdrawalFee: { type: Number, default: 0 }, // Percentage
      kycRequiredForWithdrawal: { type: Boolean, default: true },
      autoApproveDeposits: { type: Boolean, default: false },
    },

    // KYC Settings
    kyc: {
      required: { type: Boolean, default: true },
      requiredForWithdrawal: { type: Boolean, default: true },
      withdrawalLimitWithoutKYC: { type: Number, default: 10000 },
      autoApproval: { type: Boolean, default: false },
      documentTypes: {
        type: [String],
        default: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'],
      },
      maxRetries: { type: Number, default: 3 },
    },

    // Bonus & Promotion Settings
    bonuses: {
      welcomeBonusEnabled: { type: Boolean, default: true },
      welcomeBonusAmount: { type: Number, default: 100 },
      welcomeBonusType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
      referralBonusEnabled: { type: Boolean, default: true },
      referralBonusAmount: { type: Number, default: 50 },
      maxBonusPerUser: { type: Number, default: 10000 },
      bonusWageringMultiplier: { type: Number, default: 5 },
    },

    // Security Settings
    security: {
      twoFactorAuthEnabled: { type: Boolean, default: false },
      twoFactorAuthRequired: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 3600 }, // Seconds
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDuration: { type: Number, default: 900 }, // Seconds (15 min)
      passwordMinLength: { type: Number, default: 8 },
      passwordRequireSpecialChar: { type: Boolean, default: true },
      ipWhitelistEnabled: { type: Boolean, default: false },
      ipWhitelist: [{ type: String }],
    },

    // Email Settings
    email: {
      enabled: { type: Boolean, default: true },
      welcomeEmailEnabled: { type: Boolean, default: true },
      depositEmailEnabled: { type: Boolean, default: true },
      withdrawalEmailEnabled: { type: Boolean, default: true },
      betConfirmationEnabled: { type: Boolean, default: false },
      promotionalEmailsEnabled: { type: Boolean, default: true },
    },

    // SMS Settings
    sms: {
      enabled: { type: Boolean, default: false },
      otpEnabled: { type: Boolean, default: false },
      depositSMSEnabled: { type: Boolean, default: false },
      withdrawalSMSEnabled: { type: Boolean, default: false },
    },

    // Affiliate Settings
    affiliate: {
      enabled: { type: Boolean, default: true },
      defaultCommissionRate: { type: Number, default: 20 }, // Percentage of net revenue
      minPayoutAmount: { type: Number, default: 1000 },
      payoutCycle: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'monthly' },
      cookieDuration: { type: Number, default: 30 }, // Days
      multiTierEnabled: { type: Boolean, default: true },
    },

    // Payment Gateways
    paymentGateways: {
      razorpay: {
        enabled: { type: Boolean, default: false },
        keyId: { type: String },
        keySecret: { type: String },
      },
      paytm: {
        enabled: { type: Boolean, default: false },
        merchantId: { type: String },
        merchantKey: { type: String },
      },
      upi: {
        enabled: { type: Boolean, default: true },
        vpa: { type: String },
      },
      bankTransfer: {
        enabled: { type: Boolean, default: true },
      },
      crypto: {
        enabled: { type: Boolean, default: false },
        wallets: [{ type: String }],
      },
    },

    // Limits & Restrictions
    limits: {
      maxActiveAccountsPerIP: { type: Number, default: 3 },
      maxActiveAccountsPerDevice: { type: Number, default: 2 },
      restrictedCountries: [{ type: String }],
      restrictedStates: [{ type: String }],
      minAge: { type: Number, default: 18 },
    },

    // Responsible Gaming
    responsibleGaming: {
      selfExclusionEnabled: { type: Boolean, default: true },
      depositLimitsEnabled: { type: Boolean, default: true },
      sessionReminderEnabled: { type: Boolean, default: true },
      sessionReminderInterval: { type: Number, default: 60 }, // Minutes
      realityCheckEnabled: { type: Boolean, default: false },
      coolingOffPeriod: { type: Number, default: 24 }, // Hours
    },

    // Scrolling Headlines / Announcements
    headlines: {
      type: [
        {
          text: { type: String, required: true },
          enabled: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      default: [
        {
          text: "Join KingBaji 🏏 Earn unlimited rebate commission from every refer up to 3 tier. Back & Lay, Premium Cricket Market, 20+ Sports",
          enabled: true,
          order: 0,
        },
        {
          text: "Weekly Leaderboard Rs.12,000 - Hit Big Multiplier on Aviator",
          enabled: true,
          order: 1,
        },
        {
          text: "New Games Added! Check out our latest casino games",
          enabled: true,
          order: 2,
        },
      ],
    },

    // Custom settings (for flexibility)
    custom: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Last updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Default settings
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ category: 'default' });
  if (!settings) {
    settings = await this.create({ category: 'default' });
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
