/**
 * Slots Routes
 * Routes for slot games
 */

const express = require('express');
const router = express.Router();
const slotsController = require('../controllers/slots.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/slots
// @desc    Get all slot games
// @access  Public
router.get('/', optionalAuth, slotsController.getSlots);

// @route   GET /api/slots/:id
// @desc    Get slot game by ID
// @access  Public
router.get('/:id', optionalAuth, slotsController.getSlotById);

// @route   POST /api/slots/:id/play
// @desc    Play slot game
// @access  Private
router.post('/:id/play', protect, slotsController.playSlot);

// @route   GET /api/slots/popular
// @desc    Get popular slots
// @access  Public
router.get('/featured/popular', slotsController.getPopularSlots);

// @route   GET /api/slots/jackpot
// @desc    Get jackpot slots
// @access  Public
router.get('/featured/jackpot', slotsController.getJackpotSlots);

module.exports = router;
