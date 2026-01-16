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

/**
 * Settle market with winning runner
 * @param {String} winningRunnerId - ID of winning runner
 * @param {String} settledBy - Admin user ID who settled
 * @returns {Object} Settlement result
 */
MarketSchema.methods.settleMarket = async function (winningRunnerId, settledBy) {
  if (this.status === 'settled') {
    throw new Error('Market already settled');
  }

  if (!['open', 'suspended', 'closed'].includes(this.status)) {
    throw new Error(`Cannot settle market with status: ${this.status}`);
  }

  // Find and validate winning runner
  const winningRunner = this.runners.find(
    (r) => r.runnerId === winningRunnerId || r._id.toString() === winningRunnerId
  );

  if (!winningRunner) {
    throw new Error('Winning runner not found in this market');
  }

  // Update runner results
  this.runners.forEach((runner) => {
    if (runner.runnerId === winningRunnerId || runner._id.toString() === winningRunnerId) {
      runner.result = 'winner';
      runner.status = 'winner';
    } else {
      runner.result = 'loser';
      runner.status = 'loser';
    }
  });

  // Update market status
  this.status = 'settled';
  this.winningRunner = winningRunnerId;
  this.settledTime = new Date();
  this.settledBy = settledBy;

  await this.save();

  return {
    marketId: this._id,
    winningRunner: winningRunner.name,
    settledAt: this.settledTime,
  };
};

/**
 * Void market and refund all bets
 * @param {String} reason - Reason for voiding
 * @param {String} voidedBy - Admin user ID who voided
 * @returns {Object} Void result
 */
MarketSchema.methods.voidMarket = async function (reason, voidedBy) {
  if (this.status === 'void') {
    throw new Error('Market already void');
  }

  if (this.status === 'settled') {
    throw new Error('Cannot void a settled market');
  }

  // Update runner results
  this.runners.forEach((runner) => {
    runner.result = 'void';
    runner.status = 'removed';
  });

  // Update market status
  this.status = 'void';
  this.settlementNotes = reason;
  this.settledTime = new Date();
  this.settledBy = voidedBy;

  await this.save();

  return {
    marketId: this._id,
    reason,
    voidedAt: this.settledTime,
  };
};

/**
 * Update runner odds
 * @param {Array} runnerOdds - Array of {runnerId, backOdds, layOdds}
 * @returns {Object} Update result
 */
MarketSchema.methods.updateOdds = async function (runnerOdds) {
  if (!Array.isArray(runnerOdds)) {
    throw new Error('runnerOdds must be an array');
  }

  if (this.status !== 'open' && this.status !== 'suspended') {
    throw new Error(`Cannot update odds for market with status: ${this.status}`);
  }

  let updatedCount = 0;

  runnerOdds.forEach((oddsUpdate) => {
    const { runnerId, backOdds, layOdds, lastPriceTraded } = oddsUpdate;

    const runner = this.runners.find(
      (r) => r.runnerId === runnerId || r._id.toString() === runnerId
    );

    if (runner) {
      // Update back odds
      if (backOdds && Array.isArray(backOdds)) {
        runner.backOdds = backOdds
          .filter((odd) => odd.price && odd.size)
          .map((odd) => ({
            price: Number(odd.price),
            size: Number(odd.size),
          }))
          .slice(0, 3); // Keep top 3 prices
      }

      // Update lay odds
      if (layOdds && Array.isArray(layOdds)) {
        runner.layOdds = layOdds
          .filter((odd) => odd.price && odd.size)
          .map((odd) => ({
            price: Number(odd.price),
            size: Number(odd.size),
          }))
          .slice(0, 3); // Keep top 3 prices
      }

      // Update last price traded
      if (lastPriceTraded) {
        runner.lastPriceTraded = Number(lastPriceTraded);
      }

      updatedCount++;
    }
  });

  this.updatedAt = new Date();
  await this.save();

  return {
    marketId: this._id,
    updatedRunners: updatedCount,
    timestamp: this.updatedAt,
  };
};

module.exports = mongoose.model('Market', MarketSchema);

