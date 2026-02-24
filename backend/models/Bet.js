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
      default: function () {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `BET-${timestamp}-${random}`;
      },
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

/**
 * Match this bet with a counter bet
 * @param {Object} counterBet - Counter bet to match with
 * @param {Number} matchAmount - Amount to match
 * @returns {Object} Match result
 */
BetSchema.methods.matchBet = async function (counterBet, matchAmount) {
  // Validate compatibility
  if (this.betType === counterBet.betType) {
    throw new Error('Cannot match bets of the same type');
  }

  if (this.selection.id !== counterBet.selection.id) {
    throw new Error('Bets must be on the same selection');
  }

  if (this.market.toString() !== counterBet.market.toString()) {
    throw new Error('Bets must be on the same market');
  }

  // Check odds compatibility
  if (this.betType === 'back' && this.odds < counterBet.odds) {
    throw new Error('Back bet odds must be >= lay bet odds');
  }

  if (this.betType === 'lay' && this.odds > counterBet.odds) {
    throw new Error('Lay bet odds must be <= back bet odds');
  }

  // Validate match amount
  const maxMatchAmount = Math.min(this.unmatchedAmount, counterBet.unmatchedAmount);
  if (matchAmount > maxMatchAmount) {
    throw new Error(`Match amount exceeds available: ${maxMatchAmount}`);
  }

  // Update matched amounts
  this.matchedAmount += matchAmount;
  this.unmatchedAmount -= matchAmount;
  this.matchedWith.push({
    betId: counterBet._id,
    amount: matchAmount,
    odds: counterBet.odds,
    matchedAt: new Date(),
  });

  // Update status
  if (this.unmatchedAmount === 0) {
    this.status = 'matched';
  } else {
    this.status = 'partially_matched';
  }

  return {
    matched: true,
    matchedAmount,
    remainingUnmatched: this.unmatchedAmount,
  };
};

/**
 * Settle this bet based on result
 * @param {String} result - 'won', 'lost', 'void', 'half_won', 'half_lost'
 * @param {String} settledBy - User ID who settled (admin)
 * @returns {Object} Settlement details
 */
BetSchema.methods.settle = async function (result, settledBy) {
  if (this.status === 'settled') {
    throw new Error('Bet already settled');
  }

  if (!['won', 'lost', 'void', 'half_won', 'half_lost'].includes(result)) {
    throw new Error('Invalid settlement result');
  }

  const matchedStake = this.matchedAmount;
  let profitLoss = 0;
  let commission = 0;

  switch (result) {
    case 'won':
      if (this.betType === 'back') {
        profitLoss = matchedStake * (this.odds - 1);
      } else {
        profitLoss = matchedStake;
      }
      commission = (profitLoss * this.commission.rate) / 100;
      profitLoss -= commission;
      break;

    case 'lost':
      if (this.betType === 'back') {
        profitLoss = -matchedStake;
      } else {
        profitLoss = -(matchedStake * (this.odds - 1));
      }
      break;

    case 'void':
      profitLoss = 0;
      break;

    case 'half_won':
      if (this.betType === 'back') {
        profitLoss = (matchedStake * (this.odds - 1)) / 2;
      } else {
        profitLoss = matchedStake / 2;
      }
      commission = (profitLoss * this.commission.rate) / 100;
      profitLoss -= commission;
      break;

    case 'half_lost':
      if (this.betType === 'back') {
        profitLoss = -matchedStake / 2;
      } else {
        profitLoss = -(matchedStake * (this.odds - 1)) / 2;
      }
      break;
  }

  this.status = 'settled';
  this.result = result;
  this.profitLoss = profitLoss;
  this.commission.amount = commission;
  this.settledAmount = matchedStake;
  this.settledAt = new Date();
  this.settledBy = settledBy;

  return {
    result,
    profitLoss,
    commission,
    settledAmount: matchedStake,
  };
};

/**
 * Calculate cash out value based on current odds
 * @param {Number} currentOdds - Current market odds for this selection
 * @returns {Object} Cash out offer
 */
BetSchema.methods.calculateCashOut = function (currentOdds) {
  if (!['matched', 'partially_matched'].includes(this.status)) {
    throw new Error('Cash out only available for matched bets');
  }

  if (this.matchedAmount === 0) {
    throw new Error('No matched amount to cash out');
  }

  const matchedStake = this.matchedAmount;
  let cashOutValue = 0;

  if (this.betType === 'back') {
    // Back bet cash out calculation
    const originalProfit = matchedStake * (this.odds - 1);
    const currentProfit = matchedStake * (currentOdds - 1);

    if (currentOdds > this.odds) {
      // Position improved - offer partial profit
      const improvement = currentProfit - originalProfit;
      cashOutValue = matchedStake + (improvement * 0.8);
    } else {
      // Position worsened - offer reduced amount
      cashOutValue = matchedStake * (currentOdds / this.odds) * 0.9;
    }
  } else {
    // Lay bet cash out calculation
    const originalLiability = matchedStake * (this.odds - 1);
    const currentLiability = matchedStake * (currentOdds - 1);

    if (currentOdds < this.odds) {
      // Position improved - offer partial profit
      const improvement = originalLiability - currentLiability;
      cashOutValue = originalLiability + (improvement * 0.8);
    } else {
      // Position worsened - offer reduced amount
      cashOutValue = originalLiability * (this.odds / currentOdds) * 0.9;
    }
  }

  // Apply 5% cash out commission
  const commission = cashOutValue * 0.05;
  cashOutValue -= commission;

  return {
    cashOutValue: Math.max(0, Math.round(cashOutValue * 100) / 100),
    commission: Math.round(commission * 100) / 100,
    originalStake: matchedStake,
    currentOdds,
    originalOdds: this.odds,
    profitLoss: Math.round((cashOutValue - matchedStake) * 100) / 100,
  };
};

module.exports = mongoose.model('Bet', BetSchema);

