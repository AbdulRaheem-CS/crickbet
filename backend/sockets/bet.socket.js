/**
 * Bet Socket Handler
 * Handle bet placement and updates via WebSocket
 */

const { emitToUser, emitToMarket } = require('./index');

/**
 * Notify user about bet placement
 */
exports.notifyBetPlaced = (userId, betData) => {
  emitToUser(userId, 'bet:placed', {
    bet: betData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify user about bet matched
 */
exports.notifyBetMatched = (userId, betData) => {
  emitToUser(userId, 'bet:matched', {
    bet: betData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify user about bet partially matched
 */
exports.notifyBetPartiallyMatched = (userId, betData, matchedAmount) => {
  emitToUser(userId, 'bet:partially_matched', {
    bet: betData,
    matchedAmount,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify user about bet settled
 */
exports.notifyBetSettled = (userId, betData, result, profitLoss) => {
  emitToUser(userId, 'bet:settled', {
    bet: betData,
    result,
    profitLoss,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify user about bet cancelled
 */
exports.notifyBetCancelled = (userId, betId) => {
  emitToUser(userId, 'bet:cancelled', {
    betId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast market volume update
 */
exports.broadcastMarketVolume = (marketId, volumeData) => {
  emitToMarket(marketId, 'market:volume', {
    marketId,
    volume: volumeData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Notify wallet balance update
 */
exports.notifyBalanceUpdate = (userId, balance) => {
  emitToUser(userId, 'wallet:balance_update', {
    balance,
    timestamp: new Date().toISOString(),
  });
};
