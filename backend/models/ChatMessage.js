/**
 * ChatMessage Model
 * MongoDB schema for live chat support messages
 */

const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    // The conversation/ticket this message belongs to
    conversationId: {
      type: String,
      required: true,
      index: true,
    },

    // Sender info
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },

    // Message content
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Read status
    readByAdmin: {
      type: Boolean,
      default: false,
    },
    readByUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast conversation lookups
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
