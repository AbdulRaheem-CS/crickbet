/**
 * Bet Routes
 * Routes for betting operations
 */

const express = require('express');
const router = express.Router();
const betController = require('../controllers/bet.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireKYC } = require('../middleware/kyc.middleware');
const { bettingLimiter } = require('../middleware/rateLimit.middleware');

// @route   POST /api/bets/place
// @desc    Place a new bet
// @access  Private
router.post('/place', protect, requireKYC, bettingLimiter, betController.placeBet);

// @route   GET /api/bets
// @desc    Get user's bets
// @access  Private
router.get('/', protect, betController.getUserBets);

// @route   GET /api/bets/:id
// @desc    Get bet by ID
// @access  Private
router.get('/:id', protect, betController.getBetById);

// @route   GET /api/bets/open
// @desc    Get user's open bets
// @access  Private
router.get('/status/open', protect, betController.getOpenBets);

// @route   GET /api/bets/matched
// @desc    Get user's matched bets
// @access  Private
router.get('/status/matched', protect, betController.getMatchedBets);

// @route   GET /api/bets/settled
// @desc    Get user's settled bets
// @access  Private
router.get('/status/settled', protect, betController.getSettledBets);

// @route   POST /api/bets/:id/cancel
// @desc    Cancel an unmatched bet
// @access  Private
router.post('/:id/cancel', protect, betController.cancelBet);

// @route   POST /api/bets/:id/cashout
// @desc    Cash out a bet
// @access  Private
router.post('/:id/cashout', protect, betController.cashOutBet);

// @route   GET /api/bets/:id/cashout-value
// @desc    Get current cash out value
// @access  Private
router.get('/:id/cashout-value', protect, betController.getCashOutValue);

// @route   GET /api/bets/market/:marketId
// @desc    Get bets for a specific market
// @access  Private
router.get('/market/:marketId', protect, betController.getBetsByMarket);

// @route   GET /api/bets/stats
// @desc    Get user's betting statistics
// @access  Private
router.get('/stats/summary', protect, betController.getBettingStats);

module.exports = router;
