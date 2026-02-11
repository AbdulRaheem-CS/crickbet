/**
 * GSC Session Model
 * Tracks active game sessions for players
 */

const mongoose = require('mongoose');

const GscSessionSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Member account (username)
    memberAccount: {
      type: String,
      required: true,
    },

    // Game info
    productCode: { type: Number, required: true },
    gameCode: { type: String },
    gameType: { type: String, required: true },
    gameName: { type: String },

    // Game launch URL
    gameUrl: { type: String },

    // Session status
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'error'],
      default: 'active',
      index: true,
    },

    // Platform
    platform: {
      type: String,
      enum: ['WEB', 'DESKTOP', 'MOBILE'],
      default: 'WEB',
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
    balanceStart: { type: Number },
    balanceEnd: { type: Number },

    // Device info
    ip: { type: String },
    userAgent: { type: String },

    // Timing
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for finding active sessions
GscSessionSchema.index({ user: 1, status: 1 });
GscSessionSchema.index({ memberAccount: 1, status: 1 });
GscSessionSchema.index({ startedAt: -1 });

module.exports = mongoose.model('GscSession', GscSessionSchema);
