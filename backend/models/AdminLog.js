/**
 * AdminLog Model
 * MongoDB schema for admin action logs
 */

const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
  {
    // Admin who performed the action
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    adminRole: {
      type: String,
      enum: ['admin', 'super_admin'],
      required: true,
    },

    // Action details
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        'update_user',
        'change_user_status',
        'delete_user',
        'approve_kyc',
        'reject_kyc',
        'void_bet',
        'create_market',
        'update_market',
        'settle_market',
        'void_market',
        'update_transaction_status',
        'approve_withdrawal',
        'reject_withdrawal',
        'create_promotion',
        'update_promotion',
        'delete_promotion',
        'update_settings',
        'other',
      ],
    },
    description: {
      type: String,
      required: true,
    },

    // Target resource
    resourceType: {
      type: String,
      enum: ['user', 'kyc', 'bet', 'market', 'transaction', 'withdrawal', 'promotion', 'settings', 'other'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    // IP and request info
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },

    // Status
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AdminLogSchema.index({ createdAt: -1 });
AdminLogSchema.index({ adminId: 1, createdAt: -1 });
AdminLogSchema.index({ action: 1, createdAt: -1 });
AdminLogSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('AdminLog', AdminLogSchema);
