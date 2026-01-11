/**
 * Lottery Routes
 * Routes for lottery system
 */

const express = require('express');
const router = express.Router();
const lotteryController = require('../controllers/lottery.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/lottery/draws
// @desc    Get all lottery draws
// @access  Public
router.get('/draws', optionalAuth, lotteryController.getDraws);

// @route   GET /api/lottery/draws/:id
// @desc    Get draw by ID
// @access  Public
router.get('/draws/:id', optionalAuth, lotteryController.getDrawById);

// @route   GET /api/lottery/draws/active
// @desc    Get active draws
// @access  Public
router.get('/draws/status/active', optionalAuth, lotteryController.getActiveDraws);

// @route   GET /api/lottery/draws/upcoming
// @desc    Get upcoming draws
// @access  Public
router.get('/draws/status/upcoming', optionalAuth, lotteryController.getUpcomingDraws);

// @route   POST /api/lottery/buy-ticket
// @desc    Buy lottery ticket
// @access  Private
router.post('/buy-ticket', protect, lotteryController.buyTicket);

// @route   GET /api/lottery/my-tickets
// @desc    Get user's tickets
// @access  Private
router.get('/my-tickets', protect, lotteryController.getMyTickets);

// @route   GET /api/lottery/tickets/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/tickets/:id', protect, lotteryController.getTicketById);

// @route   GET /api/lottery/results
// @desc    Get lottery results
// @access  Public
router.get('/results', lotteryController.getResults);

// @route   GET /api/lottery/draws/:id/winners
// @desc    Get draw winners
// @access  Public
router.get('/draws/:id/winners', lotteryController.getDrawWinners);

module.exports = router;
