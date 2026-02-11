/**
 * Sports Routes
 * Routes for sports betting (additional endpoints)
 */

const express = require('express');
const router = express.Router();
const sportsController = require('../controllers/sports.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/sports
// @desc    Get all sports
// @access  Public
router.get('/', sportsController.getSports);

// @route   GET /api/sports/:sportId/competitions
// @desc    Get competitions by sport
// @access  Public
router.get('/:sportId/competitions', sportsController.getCompetitions);

// @route   GET /api/sports/:sportId/events
// @desc    Get events by sport
// @access  Public
router.get('/:sportId/events', optionalAuth, sportsController.getEventsBySport);

// @route   GET /api/sports/events/:eventId
// @desc    Get event details
// @access  Public
router.get('/events/:eventId', optionalAuth, sportsController.getEventDetails);

// @route   GET /api/sports/live
// @desc    Get live events
// @access  Public
router.get('/events/live/all', optionalAuth, sportsController.getLiveEvents);

// @route   GET /api/sports/highlights
// @desc    Get highlighted events
// @access  Public
router.get('/highlights/featured', sportsController.getHighlights);

module.exports = router;
