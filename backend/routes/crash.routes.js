/**
 * Crash Game Routes
 * Routes for crash betting game
 */

const express = require('express');
const router = express.Router();
const crashController = require('../controllers/crash.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/crash/current
// @desc    Get current crash game status
// @access  Public
router.get('/current', crashController.getCurrentGame);

// @route   POST /api/crash/bet
// @desc    Place bet on crash game
// @access  Private
router.post('/bet', protect, crashController.placeBet);

// @route   POST /api/crash/cashout
// @desc    Cash out from crash game
// @access  Private
router.post('/cashout', protect, crashController.cashOut);

// @route   GET /api/crash/history
// @desc    Get crash game history
// @access  Public
router.get('/history', crashController.getHistory);

// @route   GET /api/crash/my-bets
// @desc    Get user's crash bets
// @access  Private
router.get('/my-bets', protect, crashController.getMyBets);

module.exports = router;
