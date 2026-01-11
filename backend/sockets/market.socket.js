/**
 * Market Socket Handler
 * Handle market-related WebSocket events
 */

const { emitToMarket, emitToAll } = require('./index');

/**
 * Broadcast new market added
 */
exports.broadcastNewMarket = (marketData) => {
  emitToAll('market:new', {
    market: marketData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market going in-play
 */
exports.broadcastMarketInPlay = (marketId) => {
  emitToMarket(marketId, 'market:in_play', {
    marketId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast score update (for live events)
 */
exports.broadcastScoreUpdate = (marketId, scoreData) => {
  emitToMarket(marketId, 'event:score', {
    marketId,
    score: scoreData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast event update (overs, time, etc.)
 */
exports.broadcastEventUpdate = (marketId, eventData) => {
  emitToMarket(marketId, 'event:update', {
    marketId,
    data: eventData,
    timestamp: new Date().toISOString(),
  });
};
