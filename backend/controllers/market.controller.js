const { asyncHandler } = require("../middleware/error.middleware");
const marketService = require("../services/market.service");

module.exports = {
  /**
   * Create new market (Admin only)
   * POST /api/markets
   */
  createMarket: asyncHandler(async (req, res) => {
    const market = await marketService.createMarket(req.body);

    res.status(201).json({
      success: true,
      message: 'Market created successfully',
      data: market,
    });
  }),

  /**
   * Update market (Admin only)
   * PUT /api/markets/:id
   */
  updateMarket: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const market = await marketService.updateMarket(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Market updated successfully',
      data: market,
    });
  }),

  /**
   * Add runner to market (Admin only)
   * POST /api/markets/:id/runners
   */
  addRunner: asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const market = await marketService.addRunner(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Runner added successfully',
      data: market,
    });
  }),

  /**
   * Remove/suspend runner (Admin only)
   * DELETE /api/markets/:id/runners/:runnerId
   */
  removeRunner: asyncHandler(async (req, res) => {
    const { id, runnerId } = req.params;
    const { permanent = false } = req.query;
    
    const market = await marketService.removeRunner(id, runnerId, permanent === 'true');

    res.status(200).json({
      success: true,
      message: permanent === 'true' ? 'Runner removed' : 'Runner suspended',
      data: market,
    });
  }),

  /**
   * Update market odds (Admin/System)
   * PUT /api/markets/:id/odds
   */
  updateOdds: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { runners } = req.body;

    if (!runners || !Array.isArray(runners)) {
      return res.status(400).json({
        success: false,
        message: 'runners array is required',
      });
    }

    const result = await marketService.updateOdds(id, runners);

    res.status(200).json({
      success: true,
      message: 'Odds updated successfully',
      data: result,
    });
  }),

  /**
   * Bulk update odds for multiple markets (Admin/System)
   * POST /api/markets/odds/bulk
   */
  bulkUpdateOdds: asyncHandler(async (req, res) => {
    const { markets } = req.body;

    if (!markets || !Array.isArray(markets)) {
      return res.status(400).json({
        success: false,
        message: 'markets array is required',
      });
    }

    const result = await marketService.bulkUpdateOdds(markets);

    res.status(200).json({
      success: true,
      message: `Updated ${result.success} markets, ${result.failed} failed`,
      data: result,
    });
  }),

  /**
   * Update market status (Admin only)
   * PATCH /api/markets/:id/status
   */
  updateMarketStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required',
      });
    }

    const market = await marketService.updateMarketStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Market status updated to ${status}`,
      data: market,
    });
  }),

  /**
   * Get all markets with filters
   * GET /api/markets
   */
  getMarkets: asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, ...filters } = req.query;

    const result = await marketService.getMarkets(filters, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data: result.markets,
      pagination: result.pagination,
    });
  }),

  /**
   * Get market by ID
   * GET /api/markets/:id
   */
  getMarketById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { includeStats = false } = req.query;

    const market = await marketService.getMarketById(id, includeStats === 'true');

    res.status(200).json({
      success: true,
      data: market,
    });
  }),

  /**
   * Get markets by sport
   * GET /api/markets/sport/:sportId
   */
  getMarketsBySport: asyncHandler(async (req, res) => {
    const { sportId } = req.params;
    const { page, limit, status, inPlay } = req.query;

    const result = await marketService.getMarkets(
      { sportId, status, inPlay },
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result.markets,
      pagination: result.pagination,
    });
  }),

  /**
   * Get markets by event
   * GET /api/markets/event/:eventId
   */
  getMarketsByEvent: asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    const markets = await marketService.getMarketsByEvent(eventId);

    res.status(200).json({
      success: true,
      data: markets,
    });
  }),

  /**
   * Get markets by competition
   * GET /api/markets/competition/:competitionId
   */
  getMarketsByCompetition: asyncHandler(async (req, res) => {
    const { competitionId } = req.params;
    const { page, limit } = req.query;

    const result = await marketService.getMarkets(
      { competitionId },
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result.markets,
      pagination: result.pagination,
    });
  }),

  /**
   * Get live markets
   * GET /api/markets/live
   */
  getLiveMarkets: asyncHandler(async (req, res) => {
    const { sportId } = req.query;

    const markets = await marketService.getLiveMarkets(sportId ? { 'event.sportId': sportId } : {});

    res.status(200).json({
      success: true,
      data: markets,
    });
  }),

  /**
   * Get upcoming markets
   * GET /api/markets/upcoming
   */
  getUpcomingMarkets: asyncHandler(async (req, res) => {
    const { sportId, hours = 24 } = req.query;

    const markets = await marketService.getUpcomingMarkets(
      sportId ? { 'event.sportId': sportId } : {},
      parseInt(hours)
    );

    res.status(200).json({
      success: true,
      data: markets,
    });
  }),

  /**
   * Get featured markets
   * GET /api/markets/featured
   */
  getFeaturedMarkets: asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const markets = await marketService.getFeaturedMarkets(parseInt(limit));

    res.status(200).json({
      success: true,
      data: markets,
    });
  }),

  /**
   * Get hot markets (most activity)
   * GET /api/markets/hot
   */
  getHotMarkets: asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const result = await marketService.getMarkets(
      { isHot: true, status: 'open' },
      { limit, sortBy: 'stats.totalMatched', sortOrder: 'desc' }
    );

    res.status(200).json({
      success: true,
      data: result.markets,
    });
  }),

  /**
   * Get market odds
   * GET /api/markets/:id/odds
   */
  getMarketOdds: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const market = await marketService.getMarketById(id);

    // Extract only odds data
    const oddsData = {
      marketId: market.marketId,
      marketName: market.marketName,
      status: market.status,
      inPlay: market.inPlay,
      runners: market.runners.map((runner) => ({
        runnerId: runner.runnerId,
        name: runner.name,
        status: runner.status,
        backOdds: runner.backOdds,
        layOdds: runner.layOdds,
        lastPriceTraded: runner.lastPriceTraded,
      })),
      updatedAt: market.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: oddsData,
    });
  }),

  /**
   * Get market statistics
   * GET /api/markets/:id/stats
   */
  getMarketStats: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const stats = await marketService.getMarketStats(id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  }),

  /**
   * Settle market (Admin only)
   * POST /api/markets/:id/settle
   */
  settleMarket: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { winningRunnerId } = req.body;
    const settledBy = req.user._id;

    if (!winningRunnerId) {
      return res.status(400).json({
        success: false,
        message: 'winningRunnerId is required',
      });
    }

    const result = await marketService.settleMarket(id, winningRunnerId, settledBy);

    res.status(200).json({
      success: true,
      message: 'Market settled successfully',
      data: result,
    });
  }),

  /**
   * Void market (Admin only)
   * POST /api/markets/:id/void
   */
  voidMarket: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason = 'Market voided by admin' } = req.body;
    const voidedBy = req.user._id;

    const result = await marketService.voidMarket(id, reason, voidedBy);

    res.status(200).json({
      success: true,
      message: 'Market voided successfully',
      data: result,
    });
  }),

  /**
   * Delete market (Admin only - use with caution)
   * DELETE /api/markets/:id
   */
  deleteMarket: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await marketService.deleteMarket(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),
};
