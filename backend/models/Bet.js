/**
 * Bet Model
 * MongoDB schema for betting records (Back/Lay bets)
 */

const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema(
  {
    // User who placed the bet
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Market information
    market: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
      index: true,
    },

    // Event information (denormalized for quick access)
    event: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      sportId: { type: String, required: true },
      sportName: { type: String },
      competitionName: { type: String },
      startTime: { type: Date },
    },

    // Selection information
    selection: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      runnerId: { type: String },
    },

    // Bet type: Back (betting for) or Lay (betting against)
    betType: {
      type: String,
      enum: ['back', 'lay'],
      required: true,
    },

    // Odds at which bet was placed
    odds: {
      type: Number,
      required: true,
      min: [1.01, 'Odds must be at least 1.01'],
    },

    // Stake amount
    stake: {
      type: Number,
      required: true,
      min: [1, 'Minimum stake is 1'],
    },

    // Potential profit/liability
    potentialProfit: {
      type: Number,
      required: true,
    },

    // Liability (for lay bets)
    liability: {
      type: Number,
      default: 0,
    },

    // Bet status
    status: {
      type: String,
      enum: ['pending', 'unmatched', 'partially_matched', 'matched', 'settled', 'void', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Matched amount (for partial matching)
    matchedAmount: {
      type: Number,
      default: 0,
    },
    unmatchedAmount: {
      type: Number,
      default: function () {
        return this.stake;
      },
    },

    // Settlement information
    result: {
      type: String,
      enum: ['won', 'lost', 'void', 'half_won', 'half_lost', null],
      default: null,
    },
    settledAmount: {
      type: Number,
      default: 0,
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    settledAt: {
      type: Date,
    },
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Matched bets (counter-party bets)
    matchedWith: [
      {
        betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
        amount: { type: Number },
        odds: { type: Number },
        matchedAt: { type: Date, default: Date.now },
      },
    ],

    // Commission
    commission: {
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },

    // IP and device info for security
    placedFrom: {
      ip: { type: String },
      userAgent: { type: String },
      device: { type: String },
    },

    // Bet reference number
    betRef: {
      type: String,
      unique: true,
      required: true,
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Is this a cash out bet?
    isCashOut: {
      type: Boolean,
      default: false,
    },
    cashOutAmount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes
BetSchema.index({ user: 1, status: 1 });
BetSchema.index({ market: 1, status: 1 });
BetSchema.index({ 'event.id': 1 });
BetSchema.index({ createdAt: -1 });
BetSchema.index({ betRef: 1 });

// Generate bet reference before saving
BetSchema.pre('save', function (next) {
  if (!this.betRef) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.betRef = `BET-${timestamp}-${random}`;
  }
  next();
});

// Calculate potential profit/liability before saving
BetSchema.pre('save', function (next) {
  if (this.betType === 'back') {
    this.potentialProfit = this.stake * (this.odds - 1);
    this.liability = this.stake;
  } else {
    // Lay bet
    this.potentialProfit = this.stake;
    this.liability = this.stake * (this.odds - 1);
  }
  next();
});

// Static method to generate bet reference
BetSchema.statics.generateBetRef = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BET-${timestamp}-${random}`;
};

// TODO: Implement bet matching logic
BetSchema.methods.matchBet = async function (counterBet) {
  // TODO: Implement betting matching logic here
  // 1. Check if odds are compatible
  // 2. Calculate matched amount
  // 3. Update both bets' matched amounts
  // 4. Create matched bet records
  // 5. Update user exposures
  throw new Error('Not implemented');
};

// TODO: Implement bet settlement
BetSchema.methods.settle = async function (result, settledBy) {
  // TODO: Implement bet settlement logic here
  // 1. Validate result
  // 2. Calculate profit/loss
  // 3. Update user wallet
  // 4. Update bet status
  throw new Error('Not implemented');
};

// TODO: Implement cash out calculation
BetSchema.methods.calculateCashOut = function (currentOdds) {
  // TODO: Implement cash out value calculation
  // Based on current odds vs original odds
  throw new Error('Not implemented');
};

module.exports = mongoose.model('Bet', BetSchema);
