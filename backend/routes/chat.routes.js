/**
 * Chat Routes
 * User-facing chat API (requires user auth)
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Get my conversation
router.get('/conversations', chatController.getMyConversation);

// Get my messages
router.get('/messages', chatController.getMyMessages);

// Send a message
router.post('/messages', chatController.sendMessage);

module.exports = router;
