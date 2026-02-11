/**
 * Odds Feed Routes
 * Routes for managing odds feeds (Admin only)
 */

const express = require('express');
const router = express.Router();
const oddsFeedController = require('../controllers/odds-feed.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// All routes require admin authentication
router.use(protect, requireAdmin);

// @route   POST /api/odds-feed/manual
// @desc    Manual odds update
// @access  Private (Admin only)
router.post('/manual', oddsFeedController.manualUpdate);

// @route   POST /api/odds-feed/simulated/:marketId
// @desc    Update from simulated feed
// @access  Private (Admin only)
router.post('/simulated/:marketId', oddsFeedController.simulatedUpdate);

// @route   POST /api/odds-feed/start/:marketId
// @desc    Start automated feed for a market
// @access  Private (Admin only)
router.post('/start/:marketId', oddsFeedController.startFeed);

// @route   POST /api/odds-feed/stop/:marketId
// @desc    Stop automated feed for a market
// @access  Private (Admin only)
router.post('/stop/:marketId', oddsFeedController.stopFeed);

// @route   POST /api/odds-feed/start-all
// @desc    Start feeds for all open markets
// @access  Private (Admin only)
router.post('/start-all', oddsFeedController.startAllFeeds);

// @route   POST /api/odds-feed/stop-all
// @desc    Stop all active feeds
// @access  Private (Admin only)
router.post('/stop-all', oddsFeedController.stopAllFeeds);

// @route   GET /api/odds-feed/status
// @desc    Get feed status
// @access  Private (Admin only)
router.get('/status', oddsFeedController.getFeedStatus);

// @route   GET /api/odds-feed/test/betfair
// @desc    Test Betfair API connection
// @access  Private (Admin only)
router.get('/test/betfair', oddsFeedController.testBetfair);

// @route   GET /api/odds-feed/test/oddsapi
// @desc    Test OddsAPI connection
// @access  Private (Admin only)
router.get('/test/oddsapi', oddsFeedController.testOddsAPI);

module.exports = router;
