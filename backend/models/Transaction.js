/**
 * Transaction Model
 * MongoDB schema for wallet transactions
 */

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Transaction type
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'bet_placed',
        'bet_won',
        'bet_lost',
        'bet_void',
        'bet_cashout',
        'commission',
        'bonus',
        'bonus_expired',
        'referral_bonus',
        'affiliate_commission',
        'adjustment',
        'transfer_in',
        'transfer_out',
        'casino_bet',
        'casino_win',
        'lottery_ticket',
        'lottery_win',
      ],
      required: true,
      index: true,
    },

    // Amount
    amount: {
      type: Number,
      required: true,
    },

    // Balance after transaction
    balanceAfter: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },

    // Bonus balance changes
    bonusAmount: { type: Number, default: 0 },
    bonusBalanceAfter: { type: Number, default: 0 },

    // Transaction status
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'],
      default: 'pending',
      index: true,
    },

    // Currency
    currency: {
      type: String,
      default: 'INR',
    },

    // Reference information
    reference: {
      type: { type: String }, // bet, payment, bonus, etc.
      id: { type: mongoose.Schema.Types.ObjectId },
      externalId: { type: String }, // Payment gateway transaction ID
    },

    // For deposits/withdrawals
    paymentDetails: {
      method: {
        type: String,
        enum: ['upi', 'bank_transfer', 'card', 'wallet', 'crypto', null],
      },
      gateway: { type: String },
      gatewayTransactionId: { type: String },
      upiId: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
    },

    // For bet-related transactions
    betDetails: {
      betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
      betRef: { type: String },
      marketId: { type: String },
      eventName: { type: String },
      selection: { type: String },
      odds: { type: Number },
      stake: { type: Number },
    },

    // For casino transactions
    casinoDetails: {
      gameId: { type: String },
      gameName: { type: String },
      roundId: { type: String },
      provider: { type: String },
    },

    // Description
    description: {
      type: String,
      required: true,
    },

    // Admin notes (for adjustments)
    adminNotes: { type: String },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Transaction reference number
    txnRef: {
      type: String,
      unique: true,
      required: true,
    },

    // IP and device info
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      device: { type: String },
    },

    // Timestamps for status changes
    completedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ txnRef: 1 });
TransactionSchema.index({ status: 1, type: 1 });
TransactionSchema.index({ 'reference.externalId': 1 });

// Generate transaction reference before saving
TransactionSchema.pre('save', function (next) {
  if (!this.txnRef) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.txnRef = `TXN-${timestamp}-${random}`;
  }
  next();
});

// Static method to generate transaction reference
TransactionSchema.statics.generateTxnRef = function () {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

// TODO: Implement complete transaction
TransactionSchema.methods.complete = async function () {
  // TODO: Implement transaction completion logic
  // 1. Update status to completed
  // 2. Update user wallet balance
  // 3. Set completedAt timestamp
  throw new Error('Not implemented');
};

// TODO: Implement fail transaction
TransactionSchema.methods.fail = async function (reason) {
  // TODO: Implement transaction failure logic
  // 1. Update status to failed
  // 2. Refund if necessary
  // 3. Set failedAt and failureReason
  throw new Error('Not implemented');
};

// TODO: Implement reverse transaction
TransactionSchema.methods.reverse = async function (reason, reversedBy) {
  // TODO: Implement transaction reversal logic
  // 1. Create reversal transaction
  // 2. Update original transaction status
  // 3. Update user wallet
  throw new Error('Not implemented');
};

module.exports = mongoose.model('Transaction', TransactionSchema);
