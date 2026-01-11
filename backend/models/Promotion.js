/**
 * Promotion Model
 * MongoDB schema for promotions and bonuses
 */

const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    // Basic information
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    termsAndConditions: { type: String },

    // Promotion type
    type: {
      type: String,
      enum: [
        'welcome_bonus',
        'deposit_bonus',
        'free_bet',
        'cashback',
        'reload_bonus',
        'referral_bonus',
        'loyalty_bonus',
        'vip_bonus',
        'event_special',
        'tournament',
        'leaderboard',
      ],
      required: true,
      index: true,
    },

    // Applicable sections
    applicableTo: {
      type: String,
      enum: ['sports', 'casino', 'slots', 'all'],
      default: 'all',
    },

    // Promotion value
    value: {
      type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
      amount: { type: Number, required: true },
      maxBonus: { type: Number },
      minDeposit: { type: Number },
    },

    // Wagering requirements
    wagering: {
      multiplier: { type: Number, default: 1 },
      type: {
        type: String,
        enum: ['bonus', 'bonus_deposit', 'winnings'],
        default: 'bonus',
      },
      minOdds: { type: Number, default: 1.5 },
      maxStakePercentage: { type: Number, default: 100 },
      allowedGames: [{ type: String }],
      excludedGames: [{ type: String }],
      validDays: { type: Number, default: 30 },
    },

    // Eligibility
    eligibility: {
      newUsersOnly: { type: Boolean, default: false },
      kycRequired: { type: Boolean, default: false },
      minUserLevel: { type: String },
      excludedCountries: [{ type: String }],
      maxClaims: { type: Number }, // Total claims allowed
      maxClaimsPerUser: { type: Number, default: 1 },
    },

    // Timing
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },

    // Promo code
    promoCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    requiresCode: { type: Boolean, default: false },

    // Images
    images: {
      banner: { type: String },
      thumbnail: { type: String },
      mobileBanner: { type: String },
    },

    // Display settings
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },

    // Statistics
    stats: {
      totalClaims: { type: Number, default: 0 },
      totalBonusGiven: { type: Number, default: 0 },
      totalWagered: { type: Number, default: 0 },
    },

    // Claims tracking
    claims: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        claimedAt: { type: Date, default: Date.now },
        bonusAmount: { type: Number },
        status: {
          type: String,
          enum: ['active', 'wagering', 'completed', 'expired', 'forfeited'],
          default: 'active',
        },
        wageringProgress: { type: Number, default: 0 },
        wageringRequired: { type: Number },
        expiresAt: { type: Date },
      },
    ],

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
PromotionSchema.index({ type: 1, isActive: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });
PromotionSchema.index({ promoCode: 1 });

// Virtual to check if promotion is currently valid
PromotionSchema.virtual('isValid').get(function () {
  const now = new Date();
  return this.isActive && this.startDate <= now && this.endDate >= now;
});

// Generate slug before saving
PromotionSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// TODO: Implement claim promotion
PromotionSchema.methods.claim = async function (userId, depositAmount) {
  // TODO: Implement promotion claim logic
  // 1. Check eligibility
  // 2. Calculate bonus amount
  // 3. Credit bonus to user
  // 4. Track claim
  throw new Error('Not implemented');
};

// TODO: Implement wagering progress update
PromotionSchema.methods.updateWageringProgress = async function (userId, wagerAmount) {
  // TODO: Implement wagering progress update
  // 1. Find user's claim
  // 2. Update wagering progress
  // 3. Check if completed
  // 4. Release bonus if completed
  throw new Error('Not implemented');
};

// TODO: Implement bonus forfeiture
PromotionSchema.methods.forfeitBonus = async function (userId) {
  // TODO: Implement bonus forfeiture
  // 1. Find user's claim
  // 2. Remove unreleased bonus
  // 3. Update claim status
  throw new Error('Not implemented');
};

module.exports = mongoose.model('Promotion', PromotionSchema);
