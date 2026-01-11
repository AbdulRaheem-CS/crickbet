/**
 * Odds Socket Handler
 * Handle live odds updates via WebSocket
 */

const { emitToMarket } = require('./index');

/**
 * Broadcast odds update to market subscribers
 */
exports.broadcastOddsUpdate = (marketId, oddsData) => {
  emitToMarket(marketId, 'odds:update', {
    marketId,
    odds: oddsData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market status update
 */
exports.broadcastMarketStatus = (marketId, status) => {
  emitToMarket(marketId, 'market:status', {
    marketId,
    status,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market suspended
 */
exports.broadcastMarketSuspended = (marketId) => {
  emitToMarket(marketId, 'market:suspended', {
    marketId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market resumed
 */
exports.broadcastMarketResumed = (marketId, oddsData) => {
  emitToMarket(marketId, 'market:resumed', {
    marketId,
    odds: oddsData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market closed
 */
exports.broadcastMarketClosed = (marketId) => {
  emitToMarket(marketId, 'market:closed', {
    marketId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market result
 */
exports.broadcastMarketResult = (marketId, winningRunner) => {
  emitToMarket(marketId, 'market:result', {
    marketId,
    winner: winningRunner,
    timestamp: new Date().toISOString(),
  });
};
