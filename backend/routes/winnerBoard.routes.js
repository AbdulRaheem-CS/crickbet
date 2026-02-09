const express = require('express');
const router = express.Router();
const { getWinnerBoard } = require('../controllers/winnerBoard.controller');

/**
 * @route   GET /api/winner-board
 * @desc    Get winner board data (leader board and first to reach)
 * @access  Public
 */
router.get('/', getWinnerBoard);

module.exports = router;
