/**
 * Casino Model
 * MongoDB schema for casino games and sessions
 */

const mongoose = require('mongoose');

// Casino Game Schema
const CasinoGameSchema = new mongoose.Schema(
  {
    // Game identification
    gameId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },

    // Provider information
    provider: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },

    // Game category
    category: {
      type: String,
      enum: ['slots', 'table', 'live', 'crash', 'fishing', 'arcade', 'lottery', 'other'],
      required: true,
      index: true,
    },
    subCategory: { type: String },
    tags: [{ type: String }],

    // Game details
    description: { type: String },
    thumbnail: { type: String },
    banner: { type: String },
    images: [{ type: String }],

    // Game settings
    settings: {
      minBet: { type: Number, default: 10 },
      maxBet: { type: Number, default: 100000 },
      rtp: { type: Number }, // Return to Player percentage
      volatility: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
      paylines: { type: Number },
      reels: { type: Number },
    },

    // Features
    features: {
      hasDemo: { type: Boolean, default: false },
      hasFreeSpins: { type: Boolean, default: false },
      hasJackpot: { type: Boolean, default: false },
      hasAutoplay: { type: Boolean, default: false },
      isMobile: { type: Boolean, default: true },
      isLive: { type: Boolean, default: false },
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
      index: true,
    },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },

    // Display
    displayOrder: { type: Number, default: 0 },

    // Statistics
    stats: {
      totalPlays: { type: Number, default: 0 },
      totalWagered: { type: Number, default: 0 },
      totalWon: { type: Number, default: 0 },
      uniquePlayers: { type: Number, default: 0 },
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Casino Session Schema
const CasinoSessionSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Game reference
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CasinoGame',
      required: true,
    },
    gameId: { type: String, required: true },
    gameName: { type: String, required: true },

    // Session identification
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Provider session
    providerSessionId: { type: String },
    provider: { type: String },

    // Session status
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'error'],
      default: 'active',
    },

    // Session stats
    stats: {
      totalBets: { type: Number, default: 0 },
      totalWagered: { type: Number, default: 0 },
      totalWon: { type: Number, default: 0 },
      netResult: { type: Number, default: 0 },
      rounds: { type: Number, default: 0 },
    },

    // Balance tracking
    balanceStart: { type: Number, required: true },
    balanceEnd: { type: Number },

    // Timing
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    endedAt: { type: Date },

    // Device info
    deviceInfo: {
      ip: { type: String },
      userAgent: { type: String },
      device: { type: String },
    },

    // Game rounds
    rounds: [
      {
        roundId: { type: String },
        betAmount: { type: Number },
        winAmount: { type: Number },
        result: { type: String },
        playedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
CasinoGameSchema.index({ category: 1, status: 1 });
CasinoGameSchema.index({ 'provider.id': 1 });
CasinoGameSchema.index({ isPopular: 1, displayOrder: 1 });
CasinoGameSchema.index({ name: 'text', tags: 'text' });

CasinoSessionSchema.index({ user: 1, status: 1 });
CasinoSessionSchema.index({ startedAt: -1 });

// Generate session ID before saving
CasinoSessionSchema.pre('save', function (next) {
  if (!this.sessionId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.sessionId = `CS-${timestamp}-${random}`;
  }
  next();
});

// TODO: Implement game launch
CasinoGameSchema.methods.launchGame = async function (userId, isDemo = false) {
  // TODO: Implement game launch logic
  // 1. Call provider API to get game URL
  // 2. Create session record
  // 3. Return game URL
  throw new Error('Not implemented');
};

// TODO: Implement session end
CasinoSessionSchema.methods.endSession = async function () {
  // TODO: Implement session end logic
  // 1. Calculate final stats
  // 2. Update user wallet
  // 3. Update game stats
  throw new Error('Not implemented');
};

const CasinoGame = mongoose.model('CasinoGame', CasinoGameSchema);
const CasinoSession = mongoose.model('CasinoSession', CasinoSessionSchema);

module.exports = { CasinoGame, CasinoSession };
