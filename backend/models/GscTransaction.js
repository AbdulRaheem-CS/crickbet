/**
 * GSC Transaction Model
 * Logs all transactions between CrickBet and GSC+ platform
 * Critical for audit trail, dispute resolution, and idempotency
 */

const mongoose = require('mongoose');

const GscTransactionSchema = new mongoose.Schema(
  {
    // GSC+ transaction ID (from provider) - used for idempotency
    gscTransactionId: {
      type: String,
      required: true,
      index: true,
    },

    // Our internal user reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // Member account (GSC+ identifier = our username)
    memberAccount: {
      type: String,
      required: true,
      index: true,
    },

    // Transaction direction
    direction: {
      type: String,
      enum: ['withdraw', 'deposit', 'pushbetdata'],
      required: true,
      index: true,
    },

    // Transaction action type (BET, SETTLED, ROLLBACK, etc.)
    action: {
      type: String,
      required: true,
    },

    // Financial details
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
    },
    balanceAfter: {
      type: Number,
    },

    // Game/Bet details
    productCode: { type: Number },
    gameType: { type: String },
    gameCode: { type: String },
    wagerCode: { type: String },
    wagerStatus: { type: String },
    roundId: { type: String },
    channelCode: { type: String },
    wagerType: { type: String }, // NORMAL or FREEROUND

    // Bet financial details
    betAmount: { type: Number, default: 0 },
    validBetAmount: { type: Number, default: 0 },
    prizeAmount: { type: Number, default: 0 },
    tipAmount: { type: Number, default: 0 },
    settledAt: { type: Number }, // Timestamp

    // Currency
    currency: {
      type: String,
      default: 'USD',
    },

    // Processing status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'duplicate', 'rollback'],
      default: 'completed',
      index: true,
    },

    // Error info (if failed)
    errorCode: { type: Number },
    errorMessage: { type: String },

    // Our internal transaction reference (links to Transaction model)
    internalTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },

    // Provider payload
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Raw request data (for debugging)
    rawRequest: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
GscTransactionSchema.index({ gscTransactionId: 1, direction: 1 }, { unique: true });
GscTransactionSchema.index({ memberAccount: 1, createdAt: -1 });
GscTransactionSchema.index({ wagerCode: 1 });
GscTransactionSchema.index({ roundId: 1 });
GscTransactionSchema.index({ productCode: 1, createdAt: -1 });

/**
 * Check if a transaction already exists (idempotency)
 * @param {string} gscTransactionId - GSC+ transaction ID
 * @param {string} direction - withdraw or deposit
 * @returns {Object|null} Existing transaction or null
 */
GscTransactionSchema.statics.findDuplicate = async function (gscTransactionId, direction) {
  return this.findOne({ gscTransactionId, direction });
};

module.exports = mongoose.model('GscTransaction', GscTransactionSchema);
