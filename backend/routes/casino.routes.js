/**
 * Casino Routes
 * Routes for casino games - connected to GSC+ platform
 */

const express = require('express');
const router = express.Router();
const casinoController = require('../controllers/casino.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { casinoLimiter } = require('../middleware/rateLimit.middleware');

// ============================================================
// Public Game Routes
// ============================================================

// @route   GET /api/casino/games
// @desc    Get all casino games (paginated, filterable)
// @access  Public
router.get('/games', optionalAuth, casinoController.getGames);

// @route   GET /api/casino/categories
// @desc    Get all game categories with counts
// @access  Public
router.get('/categories', casinoController.getCategories);

// @route   GET /api/casino/providers
// @desc    Get all available game providers
// @access  Public
router.get('/providers', casinoController.getProviders);

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

// @route   GET /api/casino/games/category/:category
// @desc    Get games by category
// @access  Public
router.get('/games/category/:category', optionalAuth, casinoController.getGamesByCategory);

// @route   GET /api/casino/games/provider/:provider
// @desc    Get games by provider
// @access  Public
router.get('/games/provider/:provider', optionalAuth, casinoController.getGamesByProvider);

// @route   GET /api/casino/games/:id
// @desc    Get game by ID
// @access  Public
router.get('/games/:id', optionalAuth, casinoController.getGameById);

// ============================================================
// Player Game Routes (Authenticated)
// ============================================================

// @route   POST /api/casino/games/:id/launch
// @desc    Launch casino game (real money)
// @access  Private
router.post('/games/:id/launch', protect, casinoLimiter, casinoController.launchGame);

// @route   POST /api/casino/games/:id/demo
// @desc    Launch game in demo mode
// @access  Public
router.post('/games/:id/demo', casinoController.launchDemo);

// @route   POST /api/casino/super-lobby
// @desc    Launch GSC+ Super Lobby
// @access  Private
router.post('/super-lobby', protect, casinoController.launchSuperLobby);

// ============================================================
// Session Routes (Authenticated)
// ============================================================

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

// ============================================================
// Admin Routes
// ============================================================

// @route   POST /api/casino/sync-games
// @desc    Sync all games from GSC+ platform
// @access  Admin
router.post('/sync-games', protect, requireAdmin, casinoController.syncGames);

// @route   GET /api/casino/wallet-balance
// @desc    Get GSC+ operator wallet balance
// @access  Admin
router.get('/wallet-balance', protect, requireAdmin, casinoController.getGscWalletBalance);

// @route   GET /api/casino/products
// @desc    Get available GSC+ products/providers
// @access  Admin
router.get('/products', protect, requireAdmin, casinoController.getProducts);

module.exports = router;
