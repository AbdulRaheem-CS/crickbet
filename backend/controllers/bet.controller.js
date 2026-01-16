const { asyncHandler } = require("../middleware/error.middleware");
const bettingService = require("../services/betting.service");
const Bet = require("../models/Bet");

module.exports = {
  /**
   * Place a new bet
   * POST /api/bets/place
   */
  placeBet: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { marketId, selectionId, betType, odds, stake } = req.body;

    // Validation
    if (!marketId || !selectionId || !betType || !odds || !stake) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: marketId, selectionId, betType, odds, stake'
      });
    }

    // Place bet
    const bet = await bettingService.placeBet(userId, {
      marketId,
      selectionId,
      betType,
      odds: parseFloat(odds),
      stake: parseFloat(stake),
      placedFrom: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        device: req.body.device || 'web'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      data: {
        bet,
        matchStatus: {
          status: bet.status,
          matched: bet.matchedAmount,
          unmatched: bet.unmatchedAmount
        }
      }
    });
  }),

  /**
   * Get user's bets with filters
   * GET /api/bets/my-bets
   */
  getUserBets: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { status, marketId, page = 1, limit = 20 } = req.query;

    const result = await bettingService.getUserBets(userId, {
      status: status ? status.split(',') : null,
      marketId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * Get bet by ID
   * GET /api/bets/:id
   */
  getBetById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const bet = await Bet.findOne({ _id: id, user: userId })
      .populate('market', 'marketName event status')
      .lean();

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Bet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bet
    });
  }),

  /**
   * Get open bets (unmatched + partially matched)
   * GET /api/bets/open
   */
  getOpenBets: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const result = await bettingService.getUserBets(userId, {
      status: ['unmatched', 'partially_matched'],
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * Get matched bets
   * GET /api/bets/matched
   */
  getMatchedBets: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const result = await bettingService.getUserBets(userId, {
      status: 'matched',
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * Get settled bets
   * GET /api/bets/settled
   */
  getSettledBets: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const result = await bettingService.getUserBets(userId, {
      status: 'settled',
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * Cancel a bet
   * POST /api/bets/:id/cancel
   */
  cancelBet: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const cancelledBet = await bettingService.cancelBet(id, userId);

    res.status(200).json({
      success: true,
      message: 'Bet cancelled successfully',
      data: cancelledBet
    });
  }),

  /**
   * Cash out a bet
   * POST /api/bets/:id/cashout
   */
  cashOutBet: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const result = await bettingService.cashOutBet(id, userId);

    res.status(200).json({
      success: true,
      message: 'Cash out successful',
      data: result
    });
  }),

  /**
   * Get cash out value
   * GET /api/bets/:id/cashout/calculate
   */
  getCashOutValue: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { currentOdds } = req.query;

    if (!currentOdds) {
      return res.status(400).json({
        success: false,
        message: 'Current odds required'
      });
    }

    const cashOutOffer = await bettingService.calculateCashOut(
      id,
      parseFloat(currentOdds)
    );

    res.status(200).json({
      success: true,
      data: cashOutOffer
    });
  }),

  /**
   * Get bets by market
   * GET /api/bets/market/:marketId
   */
  getBetsByMarket: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { marketId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await bettingService.getUserBets(userId, {
      marketId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * Get betting statistics
   * GET /api/bets/stats
   */
  getBettingStats: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const stats = await bettingService.getUserBettingStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  }),

  /**
   * Get market exposure
   * GET /api/bets/exposure/:marketId
   */
  getMarketExposure: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { marketId } = req.params;

    const exposure = await bettingService.getUserMarketExposure(userId, marketId);

    res.status(200).json({
      success: true,
      data: exposure
    });
  }),
};
