/**
 * Commission Designation Model
 * Defines commission structure for affiliate players
 */

const mongoose = require('mongoose');

const commissionDesignationSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  commissionRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
commissionDesignationSchema.index({ affiliateId: 1, playerId: 1 }, { unique: true });
commissionDesignationSchema.index({ status: 1 });
commissionDesignationSchema.index({ currency: 1 });

const CommissionDesignation = mongoose.model('CommissionDesignation', commissionDesignationSchema);

module.exports = CommissionDesignation;
