/**
 * Betting Socket Handler
 * Real-time betting events and market updates
 * Phase 4: Real-time Features Implementation
 */

// Lazy helpers to avoid circular-dependency issues at require time
const socketHelpers = {
  getIO: (...args) => require('./index').getIO(...args),
  emitToUser: (...args) => require('./index').emitToUser(...args),
  emitToMarket: (...args) => require('./index').emitToMarket(...args),
  emitToAll: (...args) => require('./index').emitToAll(...args),
};
const { getIO, emitToUser, emitToMarket, emitToAll } = socketHelpers;

const bettingService = require('../services/betting.service');
const marketService = require('../services/market.service');
const walletService = require('../services/wallet.service');

/**
 * Initialize betting socket handlers
 * @param {Socket} socket - Socket.io socket instance
 */
exports.initializeBettingSocket = (socket) => {
  console.log(`Betting socket initialized for: ${socket.id}`);

  // ============================================
  // CLIENT LISTENERS (socket.on)
  // ============================================

  /**
   * Handle bet placement
   * Client sends: { marketId, selection, type, odds, stake }
   */
  socket.on('bet:place', async (data) => {
    try {
      if (!socket.userId) {
        socket.emit('bet:error', {
          message: 'Authentication required to place bets',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      const { marketId, selection, type, odds, stake } = data;

      // Validate input
      if (!marketId || !selection || !type || !odds || !stake) {
        socket.emit('bet:error', {
          message: 'Invalid bet data',
          code: 'INVALID_DATA',
        });
        return;
      }

      // Place bet via service
      const bet = await bettingService.placeBet({
        userId: socket.userId,
        marketId,
        selection,
        type, // 'back' or 'lay'
        odds: parseFloat(odds),
        stake: parseFloat(stake),
      });

      // Emit success to user
      socket.emit('bet:placed', {
        success: true,
        bet: {
          id: bet._id,
          marketId: bet.marketId,
          selection: bet.selection,
          type: bet.type,
          odds: bet.odds,
          stake: bet.stake,
          status: bet.status,
          potentialProfit: bet.potentialProfit,
          placedAt: bet.createdAt,
        },
        timestamp: new Date().toISOString(),
      });

      // Update user balance
      const wallet = await walletService.getWallet(socket.userId);
      socket.emit('balance:update', {
        balance: wallet.balance,
        exposure: wallet.exposure,
        timestamp: new Date().toISOString(),
      });

      // Broadcast market volume update
      const marketStats = await marketService.getMarketStats(marketId);
      emitToMarket(marketId, 'market:volume', {
        marketId,
        totalVolume: marketStats.totalVolume,
        backVolume: marketStats.backVolume,
        layVolume: marketStats.layVolume,
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Bet placed: ${bet._id} by user ${socket.userId}`);
    } catch (error) {
      console.error('Error placing bet:', error);
      socket.emit('bet:error', {
        message: error.message || 'Failed to place bet',
        code: 'BET_PLACEMENT_FAILED',
      });
    }
  });

  /**
   * Handle market subscription
   * Client sends: marketId
   */
  socket.on('market:subscribe', async (marketId) => {
    try {
      if (!marketId) {
        return;
      }

      // Join market room
      socket.join(`market:${marketId}`);

      // Send initial market data
      const market = await marketService.getMarket(marketId);
      const stats = await marketService.getMarketStats(marketId);

      socket.emit('market:data', {
        market: {
          id: market._id,
          name: market.name,
          sportId: market.sportId,
          eventId: market.eventId,
          status: market.status,
          selections: market.selections,
          startTime: market.startTime,
        },
        stats: {
          totalVolume: stats.totalVolume,
          totalBets: stats.totalBets,
        },
        timestamp: new Date().toISOString(),
      });

      console.log(`📊 Socket ${socket.id} subscribed to market ${marketId}`);
    } catch (error) {
      console.error('Error subscribing to market:', error);
      socket.emit('market:error', {
        message: 'Failed to subscribe to market',
        marketId,
      });
    }
  });

  /**
   * Handle market unsubscription
   * Client sends: marketId
   */
  socket.on('market:unsubscribe', (marketId) => {
    if (marketId) {
      socket.leave(`market:${marketId}`);
      console.log(`📊 Socket ${socket.id} unsubscribed from market ${marketId}`);
    }
  });

  /**
   * Handle bet cancellation
   * Client sends: betId
   */
  socket.on('bet:cancel', async (data) => {
    try {
      if (!socket.userId) {
        socket.emit('bet:error', {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      const { betId } = data;

      if (!betId) {
        socket.emit('bet:error', {
          message: 'Bet ID required',
          code: 'INVALID_DATA',
        });
        return;
      }

      // Cancel bet via service
      const result = await bettingService.cancelBet(betId, socket.userId);

      // Emit confirmation
      socket.emit('bet:cancelled', {
        success: true,
        betId,
        refundAmount: result.refundAmount,
        timestamp: new Date().toISOString(),
      });

      // Update balance
      const wallet = await walletService.getWallet(socket.userId);
      socket.emit('balance:update', {
        balance: wallet.balance,
        exposure: wallet.exposure,
        timestamp: new Date().toISOString(),
      });

      console.log(`❌ Bet cancelled: ${betId} by user ${socket.userId}`);
    } catch (error) {
      console.error('Error cancelling bet:', error);
      socket.emit('bet:error', {
        message: error.message || 'Failed to cancel bet',
        code: 'BET_CANCEL_FAILED',
      });
    }
  });

  /**
   * Handle user bets request
   * Client sends: { limit, status }
   */
  socket.on('bets:get', async (data) => {
    try {
      if (!socket.userId) {
        return;
      }

      const { limit = 20, status } = data || {};

      const bets = await bettingService.getUserBets(socket.userId, {
        limit,
        status,
      });

      socket.emit('bets:list', {
        bets: bets.map((bet) => ({
          id: bet._id,
          marketId: bet.marketId,
          marketName: bet.marketName,
          selection: bet.selection,
          type: bet.type,
          odds: bet.odds,
          stake: bet.stake,
          status: bet.status,
          potentialProfit: bet.potentialProfit,
          profitLoss: bet.profitLoss,
          placedAt: bet.createdAt,
          settledAt: bet.settledAt,
        })),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching bets:', error);
      socket.emit('bet:error', {
        message: 'Failed to fetch bets',
        code: 'FETCH_BETS_FAILED',
      });
    }
  });

  /**
   * Handle wallet balance request
   */
  socket.on('balance:get', async () => {
    try {
      if (!socket.userId) {
        return;
      }

      const wallet = await walletService.getWallet(socket.userId);

      socket.emit('balance:update', {
        balance: wallet.balance,
        exposure: wallet.exposure,
        bonusBalance: wallet.bonusBalance,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  });
};

// ============================================
// SERVER EMITTERS (Triggered by backend events)
// ============================================

/**
 * Emit odds update to market subscribers
 * @param {string} marketId - Market ID
 * @param {object} oddsData - Updated odds data
 */
exports.emitOddsUpdate = (marketId, oddsData) => {
  emitToMarket(marketId, 'odds:update', {
    marketId,
    odds: oddsData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit bet matched notification
 * @param {string} userId - User ID
 * @param {object} betData - Matched bet data
 */
exports.emitBetMatched = (userId, betData) => {
  emitToUser(userId, 'bet:matched', {
    betId: betData._id || betData.id,
    marketId: betData.marketId,
    selection: betData.selection,
    type: betData.type,
    odds: betData.odds,
    stake: betData.stake,
    matchedAmount: betData.matchedAmount || betData.stake,
    status: 'matched',
    timestamp: new Date().toISOString(),
  });

  console.log(`✅ Bet matched notification sent to user ${userId}`);
};

/**
 * Emit bet partially matched notification
 * @param {string} userId - User ID
 * @param {object} betData - Bet data
 * @param {number} matchedAmount - Matched amount
 */
exports.emitBetPartiallyMatched = (userId, betData, matchedAmount) => {
  emitToUser(userId, 'bet:partially_matched', {
    betId: betData._id || betData.id,
    marketId: betData.marketId,
    matchedAmount,
    remainingAmount: betData.stake - matchedAmount,
    timestamp: new Date().toISOString(),
  });

  console.log(`⚡ Bet partially matched: ${betData._id} - ${matchedAmount}/${betData.stake}`);
};

/**
 * Emit balance update to user
 * @param {string} userId - User ID
 * @param {object} balanceData - Updated balance
 */
exports.emitBalanceUpdate = (userId, balanceData) => {
  emitToUser(userId, 'balance:update', {
    balance: balanceData.balance,
    availableBalance: balanceData.availableBalance ?? (balanceData.balance - (balanceData.lockedFunds || 0)),
    lockedFunds: balanceData.lockedFunds || 0,
    exposure: balanceData.exposure,
    bonusBalance: balanceData.bonusBalance || 0,
    timestamp: new Date().toISOString(),
  });

  console.log(`💰 Balance updated for user ${userId}: available=₹${balanceData.availableBalance ?? balanceData.balance}`);
};

/**
 * Emit market settled notification
 * @param {string} marketId - Market ID
 * @param {object} result - Settlement result
 */
exports.emitMarketSettled = (marketId, result) => {
  emitToMarket(marketId, 'market:settled', {
    marketId,
    result: {
      winner: result.winner,
      status: 'settled',
      settledAt: result.settledAt || new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });

  console.log(`🏁 Market settled: ${marketId} - Winner: ${result.winner}`);
};

/**
 * Emit bet settled notification to user
 * @param {string} userId - User ID
 * @param {object} betData - Settled bet data
 */
exports.emitBetSettled = (userId, betData) => {
  emitToUser(userId, 'bet:settled', {
    betId: betData._id || betData.id,
    marketId: betData.marketId,
    status: betData.status,
    profitLoss: betData.profitLoss,
    settledAt: betData.settledAt || new Date().toISOString(),
    timestamp: new Date().toISOString(),
  });

  console.log(`🏁 Bet settled for user ${userId}: ${betData._id} - P/L: ₹${betData.profitLoss}`);
};

/**
 * Emit market status update
 * @param {string} marketId - Market ID
 * @param {string} status - New status
 */
exports.emitMarketStatusUpdate = (marketId, status) => {
  emitToMarket(marketId, 'market:status', {
    marketId,
    status,
    timestamp: new Date().toISOString(),
  });

  console.log(`📊 Market status updated: ${marketId} - ${status}`);
};

/**
 * Emit market volume update
 * @param {string} marketId - Market ID
 * @param {object} volumeData - Volume statistics
 */
exports.emitMarketVolume = (marketId, volumeData) => {
  emitToMarket(marketId, 'market:volume', {
    marketId,
    totalVolume: volumeData.totalVolume,
    backVolume: volumeData.backVolume,
    layVolume: volumeData.layVolume,
    totalBets: volumeData.totalBets,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit market suspended notification
 * @param {string} marketId - Market ID
 * @param {string} reason - Suspension reason
 */
exports.emitMarketSuspended = (marketId, reason) => {
  emitToMarket(marketId, 'market:suspended', {
    marketId,
    reason,
    timestamp: new Date().toISOString(),
  });

  console.log(`⏸️ Market suspended: ${marketId} - ${reason}`);
};

/**
 * Emit market reopened notification
 * @param {string} marketId - Market ID
 */
exports.emitMarketReopened = (marketId) => {
  emitToMarket(marketId, 'market:reopened', {
    marketId,
    timestamp: new Date().toISOString(),
  });

  console.log(`▶️ Market reopened: ${marketId}`);
};

/**
 * Broadcast live score update
 * @param {string} eventId - Event ID
 * @param {object} scoreData - Live score data
 */
exports.broadcastLiveScore = (eventId, scoreData) => {
  const io = getIO();
  io.to(`event:${eventId}`).emit('score:update', {
    eventId,
    score: scoreData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit bet voided notification
 * @param {string} userId - User ID
 * @param {object} betData - Voided bet data
 */
exports.emitBetVoided = (userId, betData) => {
  emitToUser(userId, 'bet:voided', {
    betId: betData._id || betData.id,
    marketId: betData.marketId,
    refundAmount: betData.stake,
    reason: betData.voidReason,
    timestamp: new Date().toISOString(),
  });

  console.log(`🚫 Bet voided: ${betData._id} for user ${userId}`);
};

/**
 * Emit notification to user
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 */
exports.emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast system announcement
 * @param {object} announcement - Announcement data
 */
exports.broadcastAnnouncement = (announcement) => {
  emitToAll('announcement', {
    ...announcement,
    timestamp: new Date().toISOString(),
  });

  console.log(`📢 System announcement broadcasted: ${announcement.title}`);
};

module.exports = exports;
