/**
 * Market Model
 * MongoDB schema for betting markets
 */

const mongoose = require('mongoose');

const RunnerSchema = new mongoose.Schema({
  runnerId: { type: String, required: true },
  name: { type: String, required: true },
  sortPriority: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'suspended', 'removed', 'winner', 'loser'],
    default: 'active',
  },
  // Back odds (betting for)
  backOdds: [
    {
      price: { type: Number },
      size: { type: Number },
    },
  ],
  // Lay odds (betting against)
  layOdds: [
    {
      price: { type: Number },
      size: { type: Number },
    },
  ],
  lastPriceTraded: { type: Number },
  totalMatched: { type: Number, default: 0 },
  result: {
    type: String,
    enum: ['winner', 'loser', 'void', 'placed', null],
    default: null,
  },
});

const MarketSchema = new mongoose.Schema(
  {
    // External market ID from odds provider
    marketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Event information
    event: {
      eventId: { type: String, required: true, index: true },
      name: { type: String, required: true },
      sportId: { type: String, required: true },
      sportName: { type: String, required: true },
      competitionId: { type: String },
      competitionName: { type: String },
      countryCode: { type: String },
      venue: { type: String },
      startTime: { type: Date, required: true, index: true },
      isInPlay: { type: Boolean, default: false },
    },

    // Market details
    marketName: {
      type: String,
      required: true,
    },
    marketType: {
      type: String,
      enum: ['match_odds', 'bookmaker', 'fancy', 'session', 'completed_runs', 'tied_match', 'toss', 'other'],
      required: true,
    },

    // Runners/Selections
    runners: [RunnerSchema],

    // Market status
    status: {
      type: String,
      enum: ['open', 'suspended', 'closed', 'settled', 'void'],
      default: 'open',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inPlay: {
      type: Boolean,
      default: false,
    },
    isBettingEnabled: {
      type: Boolean,
      default: true,
    },

    // Market settings
    settings: {
      minStake: { type: Number, default: 100 },
      maxStake: { type: Number, default: 100000 },
      maxProfit: { type: Number, default: 500000 },
      commission: { type: Number, default: 2 }, // Percentage
      delay: { type: Number, default: 0 }, // Bet delay in seconds
    },

    // Market timing
    marketStartTime: { type: Date },
    inPlayTime: { type: Date },
    suspendedTime: { type: Date },
    settledTime: { type: Date },

    // Statistics
    stats: {
      totalMatched: { type: Number, default: 0 },
      totalBets: { type: Number, default: 0 },
      totalUsers: { type: Number, default: 0 },
    },

    // Settlement
    winningRunner: { type: String },
    settlementNotes: { type: String },
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Display settings
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },

    // Provider information
    provider: {
      name: { type: String },
      marketId: { type: String },
    },

    // Additional metadata
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
MarketSchema.index({ 'event.sportId': 1, status: 1 });
MarketSchema.index({ 'event.competitionId': 1 });
MarketSchema.index({ status: 1, 'event.startTime': 1 });
MarketSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for checking if market is live
MarketSchema.virtual('isLive').get(function () {
  return this.status === 'open' && this.inPlay;
});

// TODO: Implement market settlement
MarketSchema.methods.settleMarket = async function (winningRunnerId, settledBy) {
  // TODO: Implement market settlement logic here
  // 1. Validate winning runner
  // 2. Update runner statuses
  // 3. Settle all bets on this market
  // 4. Update market status
  throw new Error('Not implemented');
};

// TODO: Implement void market
MarketSchema.methods.voidMarket = async function (reason, voidedBy) {
  // TODO: Implement market void logic here
  // 1. Void all bets
  // 2. Refund stakes
  // 3. Update market status
  throw new Error('Not implemented');
};

// TODO: Implement odds update
MarketSchema.methods.updateOdds = async function (runnerOdds) {
  // TODO: Implement odds update logic here
  // 1. Validate odds data
  // 2. Update runner odds
  // 3. Emit socket event for live updates
  throw new Error('Not implemented');
};

module.exports = mongoose.model('Market', MarketSchema);
