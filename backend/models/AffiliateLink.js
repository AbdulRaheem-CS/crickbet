/**
 * Affiliate Link Model
 * Manages affiliate marketing tracking links
 */

const mongoose = require('mongoose');

const affiliateLinkSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  keywords: {
    type: String,
    default: ''
  },
  page: {
    type: String,
    required: true
  },
  trackingCode: {
    type: String,
    required: true,
    unique: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for faster queries
affiliateLinkSchema.index({ affiliateId: 1, domain: 1 });
affiliateLinkSchema.index({ status: 1 });
affiliateLinkSchema.index({ trackingCode: 1 }, { unique: true });

const AffiliateLink = mongoose.model('AffiliateLink', affiliateLinkSchema);

module.exports = AffiliateLink;
