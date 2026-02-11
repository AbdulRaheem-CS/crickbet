/**
 * Market Service
 * Business logic for market management and odds updates
 */

const Market = require('../models/Market');
const Bet = require('../models/Bet');

class MarketService {
  /**
   * Create a new market
   * @param {Object} marketData - Market creation data
   * @returns {Object} Created market
   */
  async createMarket(marketData) {
    try {
      // Check if market already exists
      const existingMarket = await Market.findOne({ marketId: marketData.marketId });
      if (existingMarket) {
        throw new Error('Market with this ID already exists');
      }

      // Validate required fields
      if (!marketData.marketId || !marketData.marketName || !marketData.marketType) {
        throw new Error('marketId, marketName, and marketType are required');
      }

      if (!marketData.event || !marketData.event.eventId || !marketData.event.name) {
        throw new Error('Event information (eventId, name) is required');
      }

      // Initialize runners if provided
      if (marketData.runners && Array.isArray(marketData.runners)) {
        marketData.runners = marketData.runners.map((runner, index) => ({
          runnerId: runner.runnerId || `runner_${index + 1}`,
          name: runner.name,
          sortPriority: runner.sortPriority || index + 1,
          status: runner.status || 'active',
          backOdds: runner.backOdds || [],
          layOdds: runner.layOdds || [],
          totalMatched: 0,
        }));
      }

      // Set default values
      const market = new Market({
        ...marketData,
        status: marketData.status || 'open',
        isActive: true,
        isBettingEnabled: marketData.isBettingEnabled !== undefined ? marketData.isBettingEnabled : true,
        inPlay: marketData.inPlay || false,
        marketStartTime: marketData.marketStartTime || marketData.event?.startTime,
        stats: {
          totalMatched: 0,
          totalBets: 0,
          totalUsers: 0,
        },
      });

      await market.save();

      return market;
    } catch (error) {
      throw new Error(`Failed to create market: ${error.message}`);
    }
  }

  /**
   * Update market details
   * @param {String} marketId - Market ID
   * @param {Object} updateData - Fields to update
   * @returns {Object} Updated market
   */
  async updateMarket(marketId, updateData) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      // Prevent updating certain fields if market is settled
      if (market.status === 'settled' && updateData.status !== 'settled') {
        throw new Error('Cannot modify a settled market');
      }

      // Update allowed fields
      const allowedUpdates = [
        'marketName', 'status', 'isActive', 'isBettingEnabled', 'inPlay',
        'displayOrder', 'isFeatured', 'isHot', 'settings', 'metadata'
      ];

      allowedUpdates.forEach((field) => {
        if (updateData[field] !== undefined) {
          if (field === 'settings' && typeof updateData.settings === 'object') {
            market.settings = { ...market.settings, ...updateData.settings };
          } else {
            market[field] = updateData[field];
          }
        }
      });

      // Update timing fields
      if (updateData.status === 'suspended' && !market.suspendedTime) {
        market.suspendedTime = new Date();
      }
      if (updateData.inPlay && !market.inPlayTime) {
        market.inPlayTime = new Date();
      }

      await market.save();

      return market;
    } catch (error) {
      throw new Error(`Failed to update market: ${error.message}`);
    }
  }

  /**
   * Add runner to market
   * @param {String} marketId - Market ID
   * @param {Object} runnerData - Runner details
   * @returns {Object} Updated market
   */
  async addRunner(marketId, runnerData) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status === 'settled') {
        throw new Error('Cannot add runner to settled market');
      }

      // Check if runner already exists
      const existingRunner = market.runners.find(
        (r) => r.runnerId === runnerData.runnerId || r.name === runnerData.name
      );

      if (existingRunner) {
        throw new Error('Runner already exists in this market');
      }

      // Add new runner
      const newRunner = {
        runnerId: runnerData.runnerId || `runner_${market.runners.length + 1}`,
        name: runnerData.name,
        sortPriority: runnerData.sortPriority || market.runners.length + 1,
        status: runnerData.status || 'active',
        backOdds: runnerData.backOdds || [],
        layOdds: runnerData.layOdds || [],
        totalMatched: 0,
      };

      market.runners.push(newRunner);
      await market.save();

      return market;
    } catch (error) {
      throw new Error(`Failed to add runner: ${error.message}`);
    }
  }

  /**
   * Remove or suspend runner
   * @param {String} marketId - Market ID
   * @param {String} runnerId - Runner ID
   * @param {Boolean} permanent - Permanently remove or just suspend
   * @returns {Object} Updated market
   */
  async removeRunner(marketId, runnerId, permanent = false) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status === 'settled') {
        throw new Error('Cannot modify runners in settled market');
      }

      const runner = market.runners.find(
        (r) => r.runnerId === runnerId || r._id.toString() === runnerId
      );

      if (!runner) {
        throw new Error('Runner not found');
      }

      // Check if there are active bets on this runner
      const activeBets = await Bet.countDocuments({
        market: market._id,
        selectionId: runnerId,
        status: { $in: ['unmatched', 'partially_matched', 'matched'] },
      });

      if (activeBets > 0 && permanent) {
        throw new Error(`Cannot remove runner with ${activeBets} active bets. Suspend instead.`);
      }

      if (permanent) {
        // Permanently remove
        market.runners = market.runners.filter(
          (r) => r.runnerId !== runnerId && r._id.toString() !== runnerId
        );
      } else {
        // Just suspend/remove status
        runner.status = 'removed';
      }

      await market.save();

      return market;
    } catch (error) {
      throw new Error(`Failed to remove runner: ${error.message}`);
    }
  }

  /**
   * Update runner odds in real-time
   * @param {String} marketId - Market ID
   * @param {Array} oddsUpdates - Array of {runnerId, backOdds, layOdds, lastPriceTraded}
   * @returns {Object} Update result
   */
  async updateOdds(marketId, oddsUpdates) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      if (!['open', 'suspended'].includes(market.status)) {
        throw new Error(`Cannot update odds for market with status: ${market.status}`);
      }

      // Use the model method to update odds
      const result = await market.updateOdds(oddsUpdates);

      return result;
    } catch (error) {
      throw new Error(`Failed to update odds: ${error.message}`);
    }
  }

  /**
   * Bulk update odds for multiple markets
   * @param {Array} marketOddsUpdates - Array of {marketId, runners: [{runnerId, backOdds, layOdds}]}
   * @returns {Object} Bulk update result
   */
  async bulkUpdateOdds(marketOddsUpdates) {
    try {
      const results = [];
      const errors = [];

      for (const update of marketOddsUpdates) {
        try {
          const result = await this.updateOdds(update.marketId, update.runners);
          results.push({ marketId: update.marketId, success: true, result });
        } catch (error) {
          errors.push({ marketId: update.marketId, error: error.message });
        }
      }

      return {
        success: results.length,
        failed: errors.length,
        results,
        errors,
      };
    } catch (error) {
      throw new Error(`Bulk odds update failed: ${error.message}`);
    }
  }

  /**
   * Update market status
   * @param {String} marketId - Market ID
   * @param {String} status - New status (open, suspended, closed, settled, void)
   * @returns {Object} Updated market
   */
  async updateMarketStatus(marketId, status) {
    try {
      const validStatuses = ['open', 'suspended', 'closed', 'settled', 'void'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      // Validate status transition
      if (market.status === 'settled' && status !== 'settled') {
        throw new Error('Cannot change status of settled market');
      }

      market.status = status;

      // Update timing fields
      if (status === 'suspended' && !market.suspendedTime) {
        market.suspendedTime = new Date();
      }
      if (status === 'closed') {
        market.isBettingEnabled = false;
      }

      await market.save();

      return market;
    } catch (error) {
      throw new Error(`Failed to update market status: ${error.message}`);
    }
  }

  /**
   * Get market by ID
   * @param {String} marketId - Market ID
   * @param {Boolean} includeStats - Include betting statistics
   * @returns {Object} Market details
   */
  async getMarketById(marketId, includeStats = false) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      if (includeStats) {
        // Get additional statistics
        const betsCount = await Bet.countDocuments({ market: market._id });
        const totalMatched = await Bet.aggregate([
          { $match: { market: market._id, status: 'matched' } },
          { $group: { _id: null, total: { $sum: '$stake' } } },
        ]);

        market.stats.totalBets = betsCount;
        market.stats.totalMatched = totalMatched[0]?.total || 0;
      }

      return market;
    } catch (error) {
      throw new Error(`Failed to get market: ${error.message}`);
    }
  }

  /**
   * Get markets with filters
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting
   * @returns {Object} Markets list with pagination
   */
  async getMarkets(filters = {}, options = {}) {
    try {
      const {
        sportId,
        competitionId,
        status,
        inPlay,
        isActive,
        isFeatured,
        startTimeFrom,
        startTimeTo,
        marketType,
      } = filters;

      const {
        page = 1,
        limit = 20,
        sortBy = 'event.startTime',
        sortOrder = 'asc',
      } = options;

      // Build query
      const query = {};

      if (sportId) query['event.sportId'] = sportId;
      if (competitionId) query['event.competitionId'] = competitionId;
      if (status) query.status = Array.isArray(status) ? { $in: status } : status;
      if (inPlay !== undefined) query.inPlay = inPlay;
      if (isActive !== undefined) query.isActive = isActive;
      if (isFeatured !== undefined) query.isFeatured = isFeatured;
      if (marketType) query.marketType = marketType;

      // Date range filter
      if (startTimeFrom || startTimeTo) {
        query['event.startTime'] = {};
        if (startTimeFrom) query['event.startTime'].$gte = new Date(startTimeFrom);
        if (startTimeTo) query['event.startTime'].$lte = new Date(startTimeTo);
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [markets, total] = await Promise.all([
        Market.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Market.countDocuments(query),
      ]);

      return {
        markets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get markets: ${error.message}`);
    }
  }

  /**
   * Get live markets
   * @param {Object} filters - Optional filters
   * @returns {Array} Live markets
   */
  async getLiveMarkets(filters = {}) {
    try {
      const query = {
        status: 'open',
        inPlay: true,
        isActive: true,
        ...filters,
      };

      const markets = await Market.find(query)
        .sort({ 'stats.totalMatched': -1, 'event.startTime': 1 })
        .limit(50)
        .lean();

      return markets;
    } catch (error) {
      throw new Error(`Failed to get live markets: ${error.message}`);
    }
  }

  /**
   * Get upcoming markets
   * @param {Object} filters - Optional filters
   * @param {Number} hours - Hours ahead to look (default 24)
   * @returns {Array} Upcoming markets
   */
  async getUpcomingMarkets(filters = {}, hours = 24) {
    try {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const query = {
        status: 'open',
        inPlay: false,
        isActive: true,
        'event.startTime': {
          $gte: now,
          $lte: futureTime,
        },
        ...filters,
      };

      const markets = await Market.find(query)
        .sort({ 'event.startTime': 1, displayOrder: 1 })
        .limit(100)
        .lean();

      return markets;
    } catch (error) {
      throw new Error(`Failed to get upcoming markets: ${error.message}`);
    }
  }

  /**
   * Get markets by event
   * @param {String} eventId - Event ID
   * @returns {Array} Markets for the event
   */
  async getMarketsByEvent(eventId) {
    try {
      const markets = await Market.find({
        'event.eventId': eventId,
        isActive: true,
      })
        .sort({ displayOrder: 1, marketType: 1 })
        .lean();

      return markets;
    } catch (error) {
      throw new Error(`Failed to get markets by event: ${error.message}`);
    }
  }

  /**
   * Get featured markets
   * @param {Number} limit - Number of markets to return
   * @returns {Array} Featured markets
   */
  async getFeaturedMarkets(limit = 10) {
    try {
      const markets = await Market.find({
        isFeatured: true,
        isActive: true,
        status: { $in: ['open', 'suspended'] },
      })
        .sort({ displayOrder: 1, 'stats.totalMatched': -1 })
        .limit(limit)
        .lean();

      return markets;
    } catch (error) {
      throw new Error(`Failed to get featured markets: ${error.message}`);
    }
  }

  /**
   * Settle market with winner
   * @param {String} marketId - Market ID
   * @param {String} winningRunnerId - Winning runner ID
   * @param {String} settledBy - Admin user ID
   * @returns {Object} Settlement result
   */
  async settleMarket(marketId, winningRunnerId, settledBy) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      // Use model method to settle
      const result = await market.settleMarket(winningRunnerId, settledBy);

      return result;
    } catch (error) {
      throw new Error(`Failed to settle market: ${error.message}`);
    }
  }

  /**
   * Void market
   * @param {String} marketId - Market ID
   * @param {String} reason - Reason for voiding
   * @param {String} voidedBy - Admin user ID
   * @returns {Object} Void result
   */
  async voidMarket(marketId, reason, voidedBy) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      // Use model method to void
      const result = await market.voidMarket(reason, voidedBy);

      return result;
    } catch (error) {
      throw new Error(`Failed to void market: ${error.message}`);
    }
  }

  /**
   * Get market statistics
   * @param {String} marketId - Market ID
   * @returns {Object} Market statistics
   */
  async getMarketStats(marketId) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      // Aggregate betting statistics
      const betStats = await Bet.aggregate([
        { $match: { market: market._id } },
        {
          $group: {
            _id: null,
            totalBets: { $sum: 1 },
            totalStake: { $sum: '$stake' },
            totalMatched: {
              $sum: { $cond: [{ $eq: ['$status', 'matched'] }, '$stake', 0] },
            },
            totalUnmatched: {
              $sum: { $cond: [{ $eq: ['$status', 'unmatched'] }, '$stake', 0] },
            },
            uniqueUsers: { $addToSet: '$user' },
          },
        },
      ]);

      const stats = betStats[0] || {};

      // Get runner-wise statistics
      const runnerStats = await Bet.aggregate([
        { $match: { market: market._id, status: 'matched' } },
        {
          $group: {
            _id: '$selectionId',
            totalStake: { $sum: '$stake' },
            backStake: {
              $sum: { $cond: [{ $eq: ['$betType', 'back'] }, '$stake', 0] },
            },
            layStake: {
              $sum: { $cond: [{ $eq: ['$betType', 'lay'] }, '$stake', 0] },
            },
            betCount: { $sum: 1 },
          },
        },
      ]);

      return {
        marketId: market._id,
        marketName: market.marketName,
        status: market.status,
        totalBets: stats.totalBets || 0,
        totalStake: stats.totalStake || 0,
        totalMatched: stats.totalMatched || 0,
        totalUnmatched: stats.totalUnmatched || 0,
        uniqueUsers: stats.uniqueUsers?.length || 0,
        runnerStats,
      };
    } catch (error) {
      throw new Error(`Failed to get market stats: ${error.message}`);
    }
  }

  /**
   * Delete market (admin only, use with caution)
   * @param {String} marketId - Market ID
   * @returns {Object} Delete result
   */
  async deleteMarket(marketId) {
    try {
      const market = await Market.findOne({ 
        $or: [{ _id: marketId }, { marketId: marketId }] 
      });

      if (!market) {
        throw new Error('Market not found');
      }

      // Check if there are any bets
      const betCount = await Bet.countDocuments({ market: market._id });

      if (betCount > 0) {
        throw new Error(`Cannot delete market with ${betCount} bets. Void the market instead.`);
      }

      await Market.deleteOne({ _id: market._id });

      return {
        success: true,
        message: 'Market deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete market: ${error.message}`);
    }
  }
}

module.exports = new MarketService();
