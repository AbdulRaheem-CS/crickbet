/**
 * ChatConversation Model
 * Tracks each user's chat thread with support
 */

const mongoose = require('mongoose');

const ChatConversationSchema = new mongoose.Schema(
  {
    // conversationId = `chat_<userId>` for simplicity
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // The user who started the chat
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Last message preview
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageBy: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Unread counts
    unreadByAdmin: {
      type: Number,
      default: 0,
    },
    unreadByUser: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);
