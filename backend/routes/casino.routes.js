/**
 * Casino Routes
 * Routes for casino games
 */

const express = require('express');
const router = express.Router();
const casinoController = require('../controllers/casino.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { casinoLimiter } = require('../middleware/rateLimit.middleware');

// @route   GET /api/casino/games
// @desc    Get all casino games
// @access  Public
router.get('/games', optionalAuth, casinoController.getGames);

// @route   GET /api/casino/games/:id
// @desc    Get game by ID
// @access  Public
router.get('/games/:id', optionalAuth, casinoController.getGameById);

// @route   GET /api/casino/games/category/:category
// @desc    Get games by category
// @access  Public
router.get('/games/category/:category', optionalAuth, casinoController.getGamesByCategory);

// @route   GET /api/casino/games/provider/:provider
// @desc    Get games by provider
// @access  Public
router.get('/games/provider/:provider', optionalAuth, casinoController.getGamesByProvider);

// @route   POST /api/casino/games/:id/launch
// @desc    Launch casino game
// @access  Private
router.post('/games/:id/launch', protect, casinoLimiter, casinoController.launchGame);

// @route   POST /api/casino/games/:id/demo
// @desc    Launch game in demo mode
// @access  Public
router.post('/games/:id/demo', casinoController.launchDemo);

// @route   GET /api/casino/sessions
// @desc    Get user's casino sessions
// @access  Private
router.get('/sessions', protect, casinoController.getSessions);

// @route   GET /api/casino/sessions/:id
// @desc    Get session by ID
// @access  Private
router.get('/sessions/:id', protect, casinoController.getSessionById);

// @route   POST /api/casino/sessions/:id/end
// @desc    End casino session
// @access  Private
router.post('/sessions/:id/end', protect, casinoController.endSession);

// @route   GET /api/casino/popular
// @desc    Get popular games
// @access  Public
router.get('/popular', casinoController.getPopularGames);

// @route   GET /api/casino/featured
// @desc    Get featured games
// @access  Public
router.get('/featured', casinoController.getFeaturedGames);

// @route   GET /api/casino/new
// @desc    Get new games
// @access  Public
router.get('/new', casinoController.getNewGames);

module.exports = router;
