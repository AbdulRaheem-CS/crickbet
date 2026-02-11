/**
 * Odds Feed Service
 * Integrates with third-party odds providers and manages real-time odds updates
 */

const marketService = require('./market.service');

class OddsFeedService {
  constructor() {
    this.isRunning = false;
    this.updateInterval = null;
    this.activeFeeds = new Map();
  }

  /**
   * Manual odds update (Admin Panel)
   * @param {String} marketId - Market ID
   * @param {Array} runners - Array of runner odds
   * @returns {Object} Update result
   */
  async manualOddsUpdate(marketId, runners) {
    try {
      // Validate odds format
      const validatedRunners = runners.map((runner) => {
        const { runnerId, backOdds, layOdds } = runner;

        // Validate back odds
        const validBackOdds = (backOdds || [])
          .filter((odd) => odd.price > 1.01 && odd.price <= 1000 && odd.size > 0)
          .sort((a, b) => b.price - a.price) // Sort descending
          .slice(0, 3);

        // Validate lay odds
        const validLayOdds = (layOdds || [])
          .filter((odd) => odd.price > 1.01 && odd.price <= 1000 && odd.size > 0)
          .sort((a, b) => a.price - b.price) // Sort ascending
          .slice(0, 3);

        return {
          runnerId,
          backOdds: validBackOdds,
          layOdds: validLayOdds,
          lastPriceTraded: runner.lastPriceTraded,
        };
      });

      const result = await marketService.updateOdds(marketId, validatedRunners);

      return {
        success: true,
        source: 'manual',
        ...result,
      };
    } catch (error) {
      throw new Error(`Manual odds update failed: ${error.message}`);
    }
  }

  /**
   * Betfair API Integration
   * Fetch odds from Betfair Exchange
   */
  async fetchBetfairOdds(marketId) {
    try {
      // NOTE: This is a placeholder. You need to:
      // 1. Get Betfair API credentials
      // 2. Install betfair-api-ng-client package
      // 3. Implement actual API calls

      // Example Betfair API call structure:
      /*
      const betfair = require('betfair-api-ng-client');
      
      const session = await betfair.login({
        applicationKey: process.env.BETFAIR_APP_KEY,
        username: process.env.BETFAIR_USERNAME,
        password: process.env.BETFAIR_PASSWORD,
      });

      const marketBook = await betfair.listMarketBook({
        marketIds: [marketId],
        priceProjection: {
          priceData: ['EX_BEST_OFFERS'],
          virtualise: false,
        },
      });

      const runners = marketBook[0].runners.map((runner) => ({
        runnerId: runner.selectionId,
        backOdds: runner.ex.availableToBack.map((odd) => ({
          price: odd.price,
          size: odd.size,
        })),
        layOdds: runner.ex.availableToLay.map((odd) => ({
          price: odd.price,
          size: odd.size,
        })),
        lastPriceTraded: runner.lastPriceTraded,
      }));

      return runners;
      */

      console.log('[OddsFeed] Betfair integration not configured');
      return null;
    } catch (error) {
      console.error('[OddsFeed] Betfair fetch error:', error.message);
      throw error;
    }
  }

  /**
   * OddsAPI Integration
   * Fetch odds from The Odds API (https://the-odds-api.com/)
   */
  async fetchOddsAPI(sport, eventId) {
    try {
      const apiKey = process.env.ODDS_API_KEY;

      if (!apiKey) {
        console.log('[OddsFeed] OddsAPI key not configured');
        return null;
      }

      // Example OddsAPI call:
      /*
      const axios = require('axios');
      
      const response = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${sport}/odds/`,
        {
          params: {
            apiKey,
            regions: 'uk,us,eu',
            markets: 'h2h,spreads,totals',
            oddsFormat: 'decimal',
            eventIds: eventId,
          },
        }
      );

      // Transform OddsAPI format to our format
      const odds = response.data.map((event) => {
        const bookmaker = event.bookmakers[0]; // Use first bookmaker
        
        return {
          eventId: event.id,
          runners: bookmaker.markets[0].outcomes.map((outcome) => ({
            runnerId: outcome.name,
            name: outcome.name,
            backOdds: [{ price: outcome.price, size: 10000 }],
            layOdds: [],
          })),
        };
      });

      return odds;
      */

      console.log('[OddsFeed] OddsAPI integration placeholder');
      return null;
    } catch (error) {
      console.error('[OddsFeed] OddsAPI fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Generate simulated odds (for development/testing)
   * @param {String} marketId - Market ID
   * @returns {Array} Simulated runner odds
   */
  async generateSimulatedOdds(marketId) {
    try {
      const market = await marketService.getMarketById(marketId);

      if (!market || !market.runners || market.runners.length === 0) {
        throw new Error('Market not found or has no runners');
      }

      // Generate realistic odds based on market type
      const simulatedRunners = market.runners.map((runner, index) => {
        // Base odds between 1.5 and 10
        const baseOdds = 1.5 + Math.random() * 8.5;
        const spread = 0.02; // 2% spread

        // Back odds (slightly higher)
        const backOdds = [
          { price: parseFloat((baseOdds + spread * 2).toFixed(2)), size: 1000 + Math.random() * 9000 },
          { price: parseFloat((baseOdds + spread).toFixed(2)), size: 2000 + Math.random() * 8000 },
          { price: parseFloat(baseOdds.toFixed(2)), size: 5000 + Math.random() * 15000 },
        ];

        // Lay odds (slightly lower)
        const layOdds = [
          { price: parseFloat(baseOdds.toFixed(2)), size: 1000 + Math.random() * 9000 },
          { price: parseFloat((baseOdds - spread).toFixed(2)), size: 2000 + Math.random() * 8000 },
          { price: parseFloat((baseOdds - spread * 2).toFixed(2)), size: 5000 + Math.random() * 15000 },
        ];

        return {
          runnerId: runner.runnerId,
          backOdds,
          layOdds,
          lastPriceTraded: parseFloat((baseOdds - spread / 2).toFixed(2)),
        };
      });

      return simulatedRunners;
    } catch (error) {
      throw new Error(`Simulated odds generation failed: ${error.message}`);
    }
  }

  /**
   * Update odds from simulated feed (development mode)
   * @param {String} marketId - Market ID
   * @returns {Object} Update result
   */
  async updateFromSimulatedFeed(marketId) {
    try {
      const runners = await this.generateSimulatedOdds(marketId);
      const result = await marketService.updateOdds(marketId, runners);

      return {
        success: true,
        source: 'simulated',
        ...result,
      };
    } catch (error) {
      throw new Error(`Simulated feed update failed: ${error.message}`);
    }
  }

  /**
   * Start automated odds updates for a market
   * @param {String} marketId - Market ID
   * @param {Object} options - Update options
   */
  async startMarketFeed(marketId, options = {}) {
    try {
      const {
        source = 'simulated', // 'manual', 'betfair', 'oddsapi', 'simulated'
        interval = 5000, // Update every 5 seconds
        autoStop = true, // Auto-stop when market closes
      } = options;

      // Check if feed already running
      if (this.activeFeeds.has(marketId)) {
        throw new Error(`Feed already running for market ${marketId}`);
      }

      const market = await marketService.getMarketById(marketId);

      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status !== 'open') {
        throw new Error(`Cannot start feed for market with status: ${market.status}`);
      }

      // Create feed interval
      const feedInterval = setInterval(async () => {
        try {
          // Check if market is still open
          const currentMarket = await marketService.getMarketById(marketId);

          if (autoStop && currentMarket.status !== 'open') {
            console.log(`[OddsFeed] Auto-stopping feed for ${marketId} - market ${currentMarket.status}`);
            this.stopMarketFeed(marketId);
            return;
          }

          // Fetch and update odds based on source
          let runners;
          switch (source) {
            case 'betfair':
              runners = await this.fetchBetfairOdds(marketId);
              break;
            case 'oddsapi':
              runners = await this.fetchOddsAPI(market.event.sportId, market.event.eventId);
              break;
            case 'simulated':
            default:
              runners = await this.generateSimulatedOdds(marketId);
              break;
          }

          if (runners) {
            await marketService.updateOdds(marketId, runners);
            console.log(`[OddsFeed] Updated odds for ${marketId} from ${source}`);
          }
        } catch (error) {
          console.error(`[OddsFeed] Feed update error for ${marketId}:`, error.message);
        }
      }, interval);

      // Store active feed
      this.activeFeeds.set(marketId, {
        interval: feedInterval,
        source,
        startedAt: new Date(),
      });

      console.log(`[OddsFeed] Started ${source} feed for ${marketId} (interval: ${interval}ms)`);

      return {
        success: true,
        marketId,
        source,
        interval,
      };
    } catch (error) {
      throw new Error(`Failed to start market feed: ${error.message}`);
    }
  }

  /**
   * Stop automated odds updates for a market
   * @param {String} marketId - Market ID
   */
  stopMarketFeed(marketId) {
    try {
      const feed = this.activeFeeds.get(marketId);

      if (!feed) {
        throw new Error(`No active feed found for market ${marketId}`);
      }

      clearInterval(feed.interval);
      this.activeFeeds.delete(marketId);

      console.log(`[OddsFeed] Stopped feed for ${marketId}`);

      return {
        success: true,
        marketId,
        duration: new Date() - feed.startedAt,
      };
    } catch (error) {
      throw new Error(`Failed to stop market feed: ${error.message}`);
    }
  }

  /**
   * Start automated feeds for all open markets
   * @param {Object} options - Feed options
   */
  async startAllFeeds(options = {}) {
    try {
      const { source = 'simulated', interval = 5000 } = options;

      // Get all open markets
      const result = await marketService.getMarkets(
        { status: 'open', isActive: true },
        { limit: 1000 }
      );

      const started = [];
      const errors = [];

      for (const market of result.markets) {
        try {
          await this.startMarketFeed(market.marketId, { source, interval });
          started.push(market.marketId);
        } catch (error) {
          errors.push({ marketId: market.marketId, error: error.message });
        }
      }

      this.isRunning = true;

      return {
        success: true,
        started: started.length,
        errors: errors.length,
        activeFeeds: this.activeFeeds.size,
      };
    } catch (error) {
      throw new Error(`Failed to start all feeds: ${error.message}`);
    }
  }

  /**
   * Stop all active feeds
   */
  stopAllFeeds() {
    try {
      let stopped = 0;

      for (const [marketId, feed] of this.activeFeeds.entries()) {
        clearInterval(feed.interval);
        stopped++;
      }

      this.activeFeeds.clear();
      this.isRunning = false;

      console.log(`[OddsFeed] Stopped all ${stopped} feeds`);

      return {
        success: true,
        stopped,
      };
    } catch (error) {
      throw new Error(`Failed to stop all feeds: ${error.message}`);
    }
  }

  /**
   * Get status of active feeds
   */
  getFeedStatus() {
    const activeFeeds = [];

    for (const [marketId, feed] of this.activeFeeds.entries()) {
      activeFeeds.push({
        marketId,
        source: feed.source,
        startedAt: feed.startedAt,
        uptime: new Date() - feed.startedAt,
      });
    }

    return {
      isRunning: this.isRunning,
      totalFeeds: this.activeFeeds.size,
      activeFeeds,
    };
  }

  /**
   * WebSocket odds feed handler
   * Call this method from Socket.io connection
   * @param {Object} socket - Socket.io socket instance
   */
  handleWebSocketFeed(socket) {
    console.log('[OddsFeed] WebSocket client connected:', socket.id);

    // Subscribe to market odds
    socket.on('subscribe:market', async (marketId) => {
      try {
        console.log(`[OddsFeed] Client ${socket.id} subscribed to market ${marketId}`);
        
        // Join socket room for this market
        socket.join(`market:${marketId}`);

        // Send initial odds
        const market = await marketService.getMarketById(marketId);
        socket.emit('market:odds', {
          marketId: market.marketId,
          runners: market.runners,
          timestamp: new Date(),
        });

        // Start feed if not already running
        if (!this.activeFeeds.has(marketId)) {
          await this.startMarketFeed(marketId, {
            source: process.env.ODDS_FEED_SOURCE || 'simulated',
            interval: 3000,
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Unsubscribe from market
    socket.on('unsubscribe:market', (marketId) => {
      console.log(`[OddsFeed] Client ${socket.id} unsubscribed from market ${marketId}`);
      socket.leave(`market:${marketId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('[OddsFeed] WebSocket client disconnected:', socket.id);
    });
  }

  /**
   * Broadcast odds update to WebSocket clients
   * @param {String} marketId - Market ID
   * @param {Object} oddsData - Updated odds data
   * @param {Object} io - Socket.io server instance
   */
  broadcastOddsUpdate(marketId, oddsData, io) {
    if (io) {
      io.to(`market:${marketId}`).emit('market:odds:update', {
        marketId,
        runners: oddsData.runners,
        timestamp: new Date(),
      });
    }
  }
}

module.exports = new OddsFeedService();
