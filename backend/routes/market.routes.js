/**
 * Market Routes
 * Routes for sports betting markets
 */

const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// @route   POST /api/markets
// @desc    Create new market
// @access  Private (Admin only)
router.post('/', protect, requireAdmin, marketController.createMarket);

// @route   PUT /api/markets/:id
// @desc    Update market
// @access  Private (Admin only)
router.put('/:id', protect, requireAdmin, marketController.updateMarket);

// @route   POST /api/markets/:id/runners
// @desc    Add runner to market
// @access  Private (Admin only)
router.post('/:id/runners', protect, requireAdmin, marketController.addRunner);

// @route   DELETE /api/markets/:id/runners/:runnerId
// @desc    Remove/suspend runner
// @access  Private (Admin only)
router.delete('/:id/runners/:runnerId', protect, requireAdmin, marketController.removeRunner);

// @route   PUT /api/markets/:id/odds
// @desc    Update market odds
// @access  Private (Admin/System)
router.put('/:id/odds', protect, requireAdmin, marketController.updateOdds);

// @route   POST /api/markets/odds/bulk
// @desc    Bulk update odds for multiple markets
// @access  Private (Admin/System)
router.post('/odds/bulk', protect, requireAdmin, marketController.bulkUpdateOdds);

// @route   PATCH /api/markets/:id/status
// @desc    Update market status
// @access  Private (Admin only)
router.patch('/:id/status', protect, requireAdmin, marketController.updateMarketStatus);

// @route   POST /api/markets/:id/settle
// @desc    Settle market with winner
// @access  Private (Admin only)
router.post('/:id/settle', protect, requireAdmin, marketController.settleMarket);

// @route   POST /api/markets/:id/void
// @desc    Void market
// @access  Private (Admin only)
router.post('/:id/void', protect, requireAdmin, marketController.voidMarket);

// @route   DELETE /api/markets/:id
// @desc    Delete market (use with caution)
// @access  Private (Admin only)
router.delete('/:id', protect, requireAdmin, marketController.deleteMarket);

// ============================================
// PUBLIC ROUTES
// ============================================

// @route   GET /api/markets/live
// @desc    Get live (in-play) markets
// @access  Public
router.get('/live', optionalAuth, marketController.getLiveMarkets);

// @route   GET /api/markets/upcoming
// @desc    Get upcoming markets
// @access  Public
router.get('/upcoming', optionalAuth, marketController.getUpcomingMarkets);

// @route   GET /api/markets/featured
// @desc    Get featured markets
// @access  Public
router.get('/featured', optionalAuth, marketController.getFeaturedMarkets);

// @route   GET /api/markets/hot
// @desc    Get hot/trending markets
// @access  Public
router.get('/hot', optionalAuth, marketController.getHotMarkets);

// @route   GET /api/markets/sport/:sportId
// @desc    Get markets by sport
// @access  Public
router.get('/sport/:sportId', optionalAuth, marketController.getMarketsBySport);

// @route   GET /api/markets/event/:eventId
// @desc    Get markets for a specific event
// @access  Public
router.get('/event/:eventId', optionalAuth, marketController.getMarketsByEvent);

// @route   GET /api/markets/competition/:competitionId
// @desc    Get markets by competition
// @access  Public
router.get('/competition/:competitionId', optionalAuth, marketController.getMarketsByCompetition);

// @route   GET /api/markets/:id/odds
// @desc    Get current odds for a market
// @access  Public
router.get('/:id/odds', optionalAuth, marketController.getMarketOdds);

// @route   GET /api/markets/:id/stats
// @desc    Get market statistics
// @access  Public
router.get('/:id/stats', optionalAuth, marketController.getMarketStats);

// @route   GET /api/markets/:id
// @desc    Get market by ID
// @access  Public
router.get('/:id', optionalAuth, marketController.getMarketById);

// @route   GET /api/markets
// @desc    Get all active markets
// @access  Public
router.get('/', optionalAuth, marketController.getMarkets);

module.exports = router;
