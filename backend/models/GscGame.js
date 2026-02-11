/**
 * GSC Game Model
 * Stores synced game catalog from GSC+ platform
 */

const mongoose = require('mongoose');

const GscGameSchema = new mongoose.Schema(
  {
    // GSC+ game identification
    gameCode: {
      type: String,
      required: true,
      index: true,
    },
    gameName: {
      type: String,
      required: true,
    },

    // Product/Provider info
    productId: {
      type: Number,
      required: true,
    },
    productCode: {
      type: Number,
      required: true,
      index: true,
    },
    productName: {
      type: String,
    },

    // Game type (SLOT, LIVE_CASINO, etc.)
    gameType: {
      type: String,
      required: true,
      index: true,
    },

    // Internal category mapping
    category: {
      type: String,
      enum: ['slots', 'live', 'table', 'crash', 'fishing', 'arcade', 'lottery', 'sports', 'other'],
      default: 'other',
      index: true,
    },

    // Image URLs
    imageUrl: { type: String },

    // Localized names
    langName: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Localized icons
    langIcon: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Supported currency
    supportCurrency: {
      type: String,
      required: true,
    },

    // Status from GSC+
    gscStatus: {
      type: String,
      enum: ['ACTIVATED', 'DEACTIVATED', 'MAINTAINED'],
      default: 'ACTIVATED',
    },

    // Our internal status
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
      index: true,
    },

    // Free round support
    allowFreeRound: {
      type: Boolean,
      default: false,
    },

    // Display properties
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },

    // Statistics
    stats: {
      totalPlays: { type: Number, default: 0 },
      totalWagered: { type: Number, default: 0 },
      totalWon: { type: Number, default: 0 },
      uniquePlayers: { type: Number, default: 0 },
    },

    // GSC+ metadata
    gscCreatedAt: { type: Number }, // Unix timestamp from GSC+
  },
  {
    timestamps: true,
  }
);

// Compound index for unique game per currency
GscGameSchema.index({ gameCode: 1, productCode: 1, supportCurrency: 1 }, { unique: true });

// Text search index
GscGameSchema.index({ gameName: 'text', gameCode: 'text' });

// Map GSC status to internal status
GscGameSchema.pre('save', function (next) {
  if (this.isModified('gscStatus')) {
    switch (this.gscStatus) {
      case 'ACTIVATED':
        this.status = 'active';
        break;
      case 'DEACTIVATED':
        this.status = 'inactive';
        break;
      case 'MAINTAINED':
        this.status = 'maintenance';
        break;
    }
  }
  next();
});

module.exports = mongoose.model('GscGame', GscGameSchema);
