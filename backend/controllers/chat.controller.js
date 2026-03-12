/**
 * Chat Controller
 * Handles live chat support API endpoints
 */

const { asyncHandler } = require('../middleware/error.middleware');
const ChatMessage = require('../models/ChatMessage');
const ChatConversation = require('../models/ChatConversation');

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * GET /api/chat/conversations
 * Get the current user's conversation (create if none)
 */
exports.getMyConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversationId = `chat_${userId}`;

  let conv = await ChatConversation.findOne({ conversationId });
  if (!conv) {
    conv = await ChatConversation.create({
      conversationId,
      user: userId,
    });
  }

  res.status(200).json({ success: true, data: conv });
});

/**
 * GET /api/chat/messages
 * Get messages for the current user's conversation
 */
exports.getMyMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversationId = `chat_${userId}`;
  const { page = 1, limit = 50 } = req.query;

  const messages = await ChatMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('sender', 'username email role');

  const total = await ChatMessage.countDocuments({ conversationId });

  // Mark all admin messages as read by user
  await ChatMessage.updateMany(
    { conversationId, senderRole: 'admin', readByUser: false },
    { readByUser: true }
  );
  await ChatConversation.findOneAndUpdate(
    { conversationId },
    { unreadByUser: 0 }
  );

  res.status(200).json({
    success: true,
    data: messages,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

/**
 * POST /api/chat/messages
 * Send a message as a user
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;
  const conversationId = `chat_${userId}`;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  // Ensure conversation exists
  let conv = await ChatConversation.findOne({ conversationId });
  if (!conv) {
    conv = await ChatConversation.create({
      conversationId,
      user: userId,
    });
  }

  const msg = await ChatMessage.create({
    conversationId,
    sender: userId,
    senderRole: 'user',
    message: message.trim(),
    readByUser: true,
  });

  // Update conversation
  await ChatConversation.findOneAndUpdate(
    { conversationId },
    {
      lastMessage: message.trim().slice(0, 100),
      lastMessageAt: new Date(),
      lastMessageBy: 'user',
      $inc: { unreadByAdmin: 1 },
    }
  );

  const populated = await ChatMessage.findById(msg._id).populate('sender', 'username email role');

  // Emit via socket to admin room
  try {
    const { getIO } = require('../sockets');
    const io = getIO();
    io.to('admin:chat').emit('chat:newMessage', {
      conversationId,
      message: populated,
    });
  } catch (e) {
    // Socket not initialized — ignore
  }

  res.status(201).json({ success: true, data: populated });
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * GET /api/admin/chat/conversations
 * Get all chat conversations for admin
 */
exports.getConversations = asyncHandler(async (req, res) => {
  const { status = 'active', page = 1, limit = 30 } = req.query;

  const query = {};
  if (status !== 'all') query.status = status;

  const conversations = await ChatConversation.find(query)
    .sort({ lastMessageAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('user', 'username email phone');

  const total = await ChatConversation.countDocuments(query);

  res.status(200).json({
    success: true,
    data: conversations,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/admin/chat/conversations/:conversationId/messages
 * Get messages for a specific conversation (admin)
 */
exports.getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const messages = await ChatMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('sender', 'username email role');

  const total = await ChatMessage.countDocuments({ conversationId });

  // Mark user messages as read by admin
  await ChatMessage.updateMany(
    { conversationId, senderRole: 'user', readByAdmin: false },
    { readByAdmin: true }
  );
  await ChatConversation.findOneAndUpdate(
    { conversationId },
    { unreadByAdmin: 0 }
  );

  res.status(200).json({
    success: true,
    data: messages,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

/**
 * POST /api/admin/chat/conversations/:conversationId/messages
 * Admin replies to a conversation
 */
exports.adminReply = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { message } = req.body;
  const adminId = req.user.id;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const conv = await ChatConversation.findOne({ conversationId });
  if (!conv) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }

  const msg = await ChatMessage.create({
    conversationId,
    sender: adminId,
    senderRole: 'admin',
    message: message.trim(),
    readByAdmin: true,
  });

  // Update conversation
  await ChatConversation.findOneAndUpdate(
    { conversationId },
    {
      lastMessage: message.trim().slice(0, 100),
      lastMessageAt: new Date(),
      lastMessageBy: 'admin',
      $inc: { unreadByUser: 1 },
    }
  );

  const populated = await ChatMessage.findById(msg._id).populate('sender', 'username email role');

  // Emit to user's socket room
  try {
    const { getIO } = require('../sockets');
    const io = getIO();
    const userId = conv.user.toString();
    io.to(`user:${userId}`).emit('chat:newMessage', {
      conversationId,
      message: populated,
    });
  } catch (e) {
    // Socket not initialized — ignore
  }

  res.status(201).json({ success: true, data: populated });
});

/**
 * GET /api/admin/chat/unread-count
 * Get total unread messages across all conversations
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const result = await ChatConversation.aggregate([
    { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } },
  ]);
  const count = result.length > 0 ? result[0].total : 0;
  res.status(200).json({ success: true, data: { count } });
});
