/**
 * Lottery Model
 * MongoDB schema for lottery system
 */

const mongoose = require('mongoose');

// Lottery Draw Schema
const LotteryDrawSchema = new mongoose.Schema(
  {
    // Draw identification
    drawId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },

    // Lottery type
    type: {
      type: String,
      enum: ['daily', 'weekly', 'special', 'jackpot', 'instant'],
      required: true,
      index: true,
    },

    // Ticket pricing
    ticketPrice: {
      type: Number,
      required: true,
    },
    maxTicketsPerUser: { type: Number, default: 100 },
    totalTickets: { type: Number },

    // Prize structure
    prizes: [
      {
        rank: { type: Number, required: true },
        name: { type: String },
        amount: { type: Number },
        type: { type: String, enum: ['cash', 'bonus', 'free_ticket'], default: 'cash' },
        winners: { type: Number, default: 1 },
      },
    ],
    jackpotAmount: { type: Number, default: 0 },
    guaranteedPrize: { type: Number },

    // Draw timing
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    drawTime: { type: Date, required: true },

    // Status
    status: {
      type: String,
      enum: ['upcoming', 'open', 'closed', 'drawing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },

    // Draw results
    winningNumbers: [{ type: Number }],
    winners: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'LotteryTicket' },
        rank: { type: Number },
        prize: { type: Number },
        matchedNumbers: [{ type: Number }],
      },
    ],

    // Statistics
    stats: {
      totalTicketsSold: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalPrizePool: { type: Number, default: 0 },
      uniqueParticipants: { type: Number, default: 0 },
    },

    // Display
    images: {
      banner: { type: String },
      thumbnail: { type: String },
    },
    description: { type: String },

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

// Lottery Ticket Schema
const LotteryTicketSchema = new mongoose.Schema(
  {
    // Ticket identification
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Draw reference
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LotteryDraw',
      required: true,
      index: true,
    },
    drawId: { type: String, required: true },

    // Ticket numbers
    numbers: [{ type: Number, required: true }],
    isQuickPick: { type: Boolean, default: false },

    // Ticket status
    status: {
      type: String,
      enum: ['active', 'drawn', 'winner', 'loser', 'cancelled', 'refunded'],
      default: 'active',
    },

    // Purchase details
    purchasePrice: { type: Number, required: true },
    purchasedAt: { type: Date, default: Date.now },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },

    // Result
    result: {
      matchedNumbers: [{ type: Number }],
      rank: { type: Number },
      prize: { type: Number, default: 0 },
      prizeType: { type: String },
      paidAt: { type: Date },
    },

    // Device info
    purchaseInfo: {
      ip: { type: String },
      userAgent: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LotteryDrawSchema.index({ status: 1, drawTime: 1 });
LotteryDrawSchema.index({ type: 1, status: 1 });

LotteryTicketSchema.index({ user: 1, draw: 1 });
LotteryTicketSchema.index({ draw: 1, status: 1 });
LotteryTicketSchema.index({ purchasedAt: -1 });

// Generate draw ID before saving
LotteryDrawSchema.pre('save', function (next) {
  if (!this.drawId) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.drawId = `DRAW-${date}-${random}`;
  }
  next();
});

// Generate ticket ID before saving
LotteryTicketSchema.pre('save', function (next) {
  if (!this.ticketId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketId = `TKT-${timestamp}-${random}`;
  }
  next();
});

// TODO: Implement draw execution
LotteryDrawSchema.methods.executeDraw = async function () {
  // TODO: Implement lottery draw logic
  // 1. Generate random winning numbers
  // 2. Find matching tickets
  // 3. Calculate prizes
  // 4. Update winners
  // 5. Distribute prizes
  throw new Error('Not implemented');
};

// TODO: Implement quick pick number generation
LotteryTicketSchema.statics.generateQuickPick = function (count, max) {
  // TODO: Implement quick pick logic
  // Generate random non-repeating numbers
  throw new Error('Not implemented');
};

// TODO: Implement ticket validation
LotteryTicketSchema.methods.checkWinning = function (winningNumbers) {
  // TODO: Implement winning check logic
  // 1. Compare ticket numbers with winning numbers
  // 2. Calculate matched count
  // 3. Determine prize rank
  throw new Error('Not implemented');
};

const LotteryDraw = mongoose.model('LotteryDraw', LotteryDrawSchema);
const LotteryTicket = mongoose.model('LotteryTicket', LotteryTicketSchema);

module.exports = { LotteryDraw, LotteryTicket };
