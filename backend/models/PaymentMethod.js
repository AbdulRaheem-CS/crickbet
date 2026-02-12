/**
 * Payment Method Model
 * MongoDB schema for payment methods configuration
 */

const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema(
  {
    // Unique identifier
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    // Display name
    name: {
      type: String,
      required: true,
    },

    // Icon identifier
    icon: {
      type: String,
      required: true,
      enum: ['upi', 'bank', 'card', 'wallet', 'jazzcash', 'easypaisa'],
    },

    // Method type (for backend processing)
    type: {
      type: String,
      required: true,
      enum: ['upi', 'bank_transfer', 'card', 'wallet', 'jazzcash', 'easypaisa'],
    },

    // Enable/Disable status
    enabled: {
      type: Boolean,
      default: true,
    },

    // Transaction limits
    minAmount: {
      type: Number,
      required: true,
      default: 100,
    },

    maxAmount: {
      type: Number,
      required: true,
      default: 100000,
    },

    // Processing details
    processingTime: {
      type: String,
      default: 'Instant',
    },

    // Gateway configuration
    gateway: {
      provider: { type: String }, // razorpay, paytm, custom, etc.
      apiKey: { type: String },
      merchantId: { type: String },
      webhookUrl: { type: String },
      config: { type: mongoose.Schema.Types.Mixed }, // Additional config
    },

    // Display order
    order: {
      type: Number,
      default: 0,
    },

    // Description for users
    description: {
      type: String,
    },

    // Country/Region specific
    regions: [{ type: String }], // ['PK', 'IN', 'BD']

    // Fee structure
    fees: {
      percentage: { type: Number, default: 0 },
      fixed: { type: Number, default: 0 },
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Last updated by admin
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaymentMethodSchema.index({ enabled: 1, order: 1 });
PaymentMethodSchema.index({ regions: 1 });

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);
