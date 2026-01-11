/**
 * Market Routes
 * Routes for sports betting markets
 */

const express = require('express');
const router = express.Router();
const marketController = require('../controllers/market.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/markets
// @desc    Get all active markets
// @access  Public
router.get('/', optionalAuth, marketController.getMarkets);

// @route   GET /api/markets/:id
// @desc    Get market by ID
// @access  Public
router.get('/:id', optionalAuth, marketController.getMarketById);

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

// @route   GET /api/markets/live
// @desc    Get live (in-play) markets
// @access  Public
router.get('/status/live', optionalAuth, marketController.getLiveMarkets);

// @route   GET /api/markets/upcoming
// @desc    Get upcoming markets
// @access  Public
router.get('/status/upcoming', optionalAuth, marketController.getUpcomingMarkets);

// @route   GET /api/markets/featured
// @desc    Get featured markets
// @access  Public
router.get('/featured/all', optionalAuth, marketController.getFeaturedMarkets);

// @route   GET /api/markets/hot
// @desc    Get hot/trending markets
// @access  Public
router.get('/trending/hot', optionalAuth, marketController.getHotMarkets);

// @route   GET /api/markets/:id/odds
// @desc    Get current odds for a market
// @access  Public
router.get('/:id/odds', marketController.getMarketOdds);

module.exports = router;
