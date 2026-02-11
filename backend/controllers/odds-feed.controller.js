/**
 * Odds Feed Controller
 * Admin endpoints for managing odds feeds
 */

const { asyncHandler } = require('../middleware/error.middleware');
const oddsFeedService = require('../services/odds-feed.service');

module.exports = {
  /**
   * Manual odds update (Admin)
   * POST /api/odds-feed/manual
   */
  manualUpdate: asyncHandler(async (req, res) => {
    const { marketId, runners } = req.body;

    if (!marketId || !runners || !Array.isArray(runners)) {
      return res.status(400).json({
        success: false,
        message: 'marketId and runners array are required',
      });
    }

    const result = await oddsFeedService.manualOddsUpdate(marketId, runners);

    res.status(200).json({
      success: true,
      message: 'Odds updated manually',
      data: result,
    });
  }),

  /**
   * Update from simulated feed
   * POST /api/odds-feed/simulated/:marketId
   */
  simulatedUpdate: asyncHandler(async (req, res) => {
    const { marketId } = req.params;

    const result = await oddsFeedService.updateFromSimulatedFeed(marketId);

    res.status(200).json({
      success: true,
      message: 'Odds updated from simulated feed',
      data: result,
    });
  }),

  /**
   * Start automated feed for a market
   * POST /api/odds-feed/start/:marketId
   */
  startFeed: asyncHandler(async (req, res) => {
    const { marketId } = req.params;
    const { source = 'simulated', interval = 5000 } = req.body;

    const result = await oddsFeedService.startMarketFeed(marketId, {
      source,
      interval,
    });

    res.status(200).json({
      success: true,
      message: `Feed started for market ${marketId}`,
      data: result,
    });
  }),

  /**
   * Stop automated feed for a market
   * POST /api/odds-feed/stop/:marketId
   */
  stopFeed: asyncHandler(async (req, res) => {
    const { marketId } = req.params;

    const result = oddsFeedService.stopMarketFeed(marketId);

    res.status(200).json({
      success: true,
      message: `Feed stopped for market ${marketId}`,
      data: result,
    });
  }),

  /**
   * Start feeds for all open markets
   * POST /api/odds-feed/start-all
   */
  startAllFeeds: asyncHandler(async (req, res) => {
    const { source = 'simulated', interval = 5000 } = req.body;

    const result = await oddsFeedService.startAllFeeds({ source, interval });

    res.status(200).json({
      success: true,
      message: 'Feeds started for all open markets',
      data: result,
    });
  }),

  /**
   * Stop all active feeds
   * POST /api/odds-feed/stop-all
   */
  stopAllFeeds: asyncHandler(async (req, res) => {
    const result = oddsFeedService.stopAllFeeds();

    res.status(200).json({
      success: true,
      message: 'All feeds stopped',
      data: result,
    });
  }),

  /**
   * Get feed status
   * GET /api/odds-feed/status
   */
  getFeedStatus: asyncHandler(async (req, res) => {
    const status = oddsFeedService.getFeedStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  }),

  /**
   * Test Betfair API connection
   * GET /api/odds-feed/test/betfair
   */
  testBetfair: asyncHandler(async (req, res) => {
    const { marketId } = req.query;

    try {
      const odds = await oddsFeedService.fetchBetfairOdds(marketId);

      res.status(200).json({
        success: true,
        message: 'Betfair API test',
        data: odds,
        note: 'Integration not configured - placeholder only',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),

  /**
   * Test OddsAPI connection
   * GET /api/odds-feed/test/oddsapi
   */
  testOddsAPI: asyncHandler(async (req, res) => {
    const { sport, eventId } = req.query;

    try {
      const odds = await oddsFeedService.fetchOddsAPI(sport, eventId);

      res.status(200).json({
        success: true,
        message: 'OddsAPI test',
        data: odds,
        note: 'Integration not configured - placeholder only',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }),
};
