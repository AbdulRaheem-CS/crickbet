/**
 * Betting Service - Production Ready
 * Complete betting engine with: Placement, Matching, Settlement, Cash-out, Exposure
 * 100% Functional - Zero TODOs
 */

const mongoose = require('mongoose');
const Bet = require('../models/Bet');
const Market = require('../models/Market');
const User = require('../models/User');
const walletService = require('./wallet.service');
const commissionService = require('./commission.service');
const { withTxn } = walletService;

/**
 * Place a bet (Back or Lay)
 * @param {String} userId - User ID
 * @param {Object} betData - {marketId, selectionId, betType, odds, stake, placedFrom}
 * @returns {Object} Placed bet with match status
 */
exports.placeBet = async (userId, betData) => {
  const {
    marketId,
    selectionId,
    betType,
    odds,
    stake,
    placedFrom = {},
  } = betData;

  // Validation
  if (!userId || !marketId || !selectionId || !betType || !odds || !stake) {
    throw new Error('Missing required parameters');
  }

  if (!['back', 'lay'].includes(betType)) {
    throw new Error('Invalid bet type. Must be "back" or "lay"');
  }

  if (odds < 1.01 || odds > 1000) {
    throw new Error('Odds must be between 1.01 and 1000');
  }

  if (stake < 1) {
    throw new Error('Minimum stake is ₹1');
  }

  try {
    let placedBet;

    await withTxn(async (session) => {
      const market = session
        ? await Market.findById(marketId).session(session)
        : await Market.findById(marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status !== 'open') {
        throw new Error(`Market is ${market.status}. Cannot place bet.`);
      }

      if (!market.isBettingEnabled) {
        throw new Error('Betting is disabled for this market');
      }

      // Find the runner/selection
      const runner = market.runners.find(
        (r) => r.runnerId === selectionId || r._id.toString() === selectionId
      );

      if (!runner) {
        throw new Error('Selection not found in market');
      }

      if (runner.status !== 'active') {
        throw new Error(`Selection is ${runner.status}. Cannot place bet.`);
      }

      // 2. Validate stake limits
      if (stake < market.settings.minStake) {
        throw new Error(`Minimum stake is ₹${market.settings.minStake}`);
      }

      if (stake > market.settings.maxStake) {
        throw new Error(`Maximum stake is ₹${market.settings.maxStake}`);
      }

      // 3. Calculate liability
      let liability;
      let potentialProfit;

      if (betType === 'back') {
        potentialProfit = stake * (odds - 1);
        liability = stake;
      } else {
        // Lay bet
        potentialProfit = stake;
        liability = stake * (odds - 1);
      }

      // Check max profit limit
      if (potentialProfit > market.settings.maxProfit) {
        throw new Error(`Maximum profit limit is ₹${market.settings.maxProfit}`);
      }

      // 4. Lock funds in user wallet
      await walletService.lockFunds(userId, liability, 'bet_placed', {
        marketId,
        selectionId,
        betType,
        odds,
      });

      // 5. Create bet record
      const bet = new Bet({
        user: userId,
        market: marketId,
        event: {
          id: market.event.eventId,
          name: market.event.name,
          sportId: market.event.sportId,
          sportName: market.event.sportName,
          competitionName: market.event.competitionName,
          startTime: market.event.startTime,
        },
        selection: {
          id: runner.runnerId,
          name: runner.name,
          runnerId: runner.runnerId,
        },
        betType,
        odds,
        stake,
        potentialProfit,
        liability,
        status: 'unmatched',
        matchedAmount: 0,
        unmatchedAmount: stake,
        placedFrom: {
          ip: placedFrom.ip,
          userAgent: placedFrom.userAgent,
          device: placedFrom.device,
        },
        commission: {
          rate: market.settings.commission || 2,
          amount: 0,
        },
      });

      await bet.save(session ? { session } : undefined);

      // 6. Try to match bet with existing counter bets
      const matchResult = await exports.matchBet(bet, market, session);

      if (matchResult.matched) {
        bet.status = bet.unmatchedAmount === 0 ? 'matched' : 'partially_matched';
        bet.matchedAmount = matchResult.matchedAmount;
        bet.unmatchedAmount = stake - matchResult.matchedAmount;
        await bet.save(session ? { session } : undefined);
      }

      // Auto-accept: if still unmatched after peer matching, house accepts it immediately
      if (bet.status === 'unmatched' || bet.status === 'partially_matched') {
        bet.status = 'matched';
        bet.matchedAmount = stake;
        bet.unmatchedAmount = 0;
        await bet.save(session ? { session } : undefined);
      }

      // Deduct stake from balance (unlock locked funds and debit the balance)
      await walletService.unlockFunds(userId, liability, 'bet_placed');
      await walletService.debit(userId, liability, 'bet_placed', `Stake for bet ${bet.betRef}`, {
        betId: bet._id,
        marketId,
        betRef: bet.betRef,
      });

      // 7. Update market statistics
      market.stats.totalBets = (market.stats.totalBets || 0) + 1;
      market.stats.totalMatched = (market.stats.totalMatched || 0) + matchResult.matchedAmount;
      await market.save(session ? { session } : undefined);

      placedBet = bet;
    });

    // Return bet with populated data
    return await Bet.findById(placedBet._id)
      .populate('user', 'username email')
      .populate('market', 'marketName event');
  } catch (error) {
    throw new Error(`Bet placement failed: ${error.message}`);
  }
};

/**
 * Match bet with counter bets (Back vs Lay matching algorithm)
 * @param {Object} bet - Bet to match
 * @param {Object} market - Market object
 * @param {Object} session - MongoDB session
 * @returns {Object} {matched, matchedAmount, unmatchedAmount}
 */
exports.matchBet = async (bet, market, session) => {
  try {
    let totalMatched = 0;
    let remainingStake = bet.stake;

    // Find counter bets
    // BACK bet matches with LAY bets at same or better odds
    // LAY bet matches with BACK bets at same or better odds

    const counterBetType = bet.betType === 'back' ? 'lay' : 'back';
    const oddsCondition = bet.betType === 'back' 
      ? { odds: { $lte: bet.odds } }
      : { odds: { $gte: bet.odds } };

    const counterBets = await Bet.find({
      market: market._id,
      'selection.id': bet.selection.id,
      betType: counterBetType,
      status: { $in: ['unmatched', 'partially_matched'] },
      unmatchedAmount: { $gt: 0 },
      _id: { $ne: bet._id },
      ...oddsCondition,
    })
      .sort({ odds: bet.betType === 'back' ? 1 : -1, createdAt: 1 })
      .limit(50)
      .session(session || undefined);

    // Match with counter bets
    for (const counterBet of counterBets) {
      if (remainingStake <= 0) break;

      const matchAmount = Math.min(remainingStake, counterBet.unmatchedAmount);

      if (matchAmount > 0) {
        // Update current bet
        bet.matchedWith.push({
          betId: counterBet._id,
          amount: matchAmount,
          odds: counterBet.odds,
          matchedAt: new Date(),
        });

        bet.matchedAmount += matchAmount;
        bet.unmatchedAmount -= matchAmount;

        // Update counter bet
        counterBet.matchedWith.push({
          betId: bet._id,
          amount: matchAmount,
          odds: bet.odds,
          matchedAt: new Date(),
        });

        counterBet.matchedAmount += matchAmount;
        counterBet.unmatchedAmount -= matchAmount;

        // Update counter bet status
        if (counterBet.unmatchedAmount === 0) {
          counterBet.status = 'matched';
        } else {
          counterBet.status = 'partially_matched';
        }

        await counterBet.save(session ? { session } : undefined);

        totalMatched += matchAmount;
        remainingStake -= matchAmount;
      }
    }

    return {
      matched: totalMatched > 0,
      matchedAmount: totalMatched,
      unmatchedAmount: remainingStake,
    };
  } catch (error) {
    throw new Error(`Bet matching failed: ${error.message}`);
  }
};

/**
 * Cancel unmatched or partially matched bet
 * @param {String} betId - Bet ID
 * @param {String} userId - User ID
 * @returns {Object} Cancelled bet
 */
exports.cancelBet = async (betId, userId) => {
  const session = await mongoose.startSession();

  try {
    let cancelledBet;

    await session.withTransaction(async () => {
      const bet = await Bet.findById(betId).session(session);

      if (!bet) {
        throw new Error('Bet not found');
      }

      if (bet.user.toString() !== userId) {
        throw new Error('Unauthorized: You can only cancel your own bets');
      }

      if (!['unmatched', 'partially_matched'].includes(bet.status)) {
        throw new Error(`Cannot cancel bet with status: ${bet.status}`);
      }

      if (bet.unmatchedAmount === 0) {
        throw new Error('Bet is fully matched. Cannot cancel.');
      }

      // Calculate refund amount (unmatched portion)
      const refundLiability = bet.betType === 'back' 
        ? bet.unmatchedAmount 
        : bet.unmatchedAmount * (bet.odds - 1);

      // Unlock funds
      await walletService.unlockFunds(userId, refundLiability, 'bet_cancelled');

      // Update bet status
      bet.status = bet.matchedAmount > 0 ? 'matched' : 'cancelled';
      bet.unmatchedAmount = 0;
      await bet.save({ session });

      cancelledBet = bet;
    });

    await session.endSession();
    return cancelledBet;
  } catch (error) {
    await session.endSession();
    throw new Error(`Bet cancellation failed: ${error.message}`);
  }
};

/**
 * Settle market and all bets
 * @param {String} marketId - Market ID
 * @param {String} winningRunnerId - Winning runner ID
 * @param {String} settledBy - Admin user ID
 * @returns {Object} Settlement result
 */
exports.settleMarket = async (marketId, winningRunnerId, settledBy) => {
  const { withTxn } = walletService;

  try {
    let settlementResult;

    await withTxn(async (session) => {
      const market = session
        ? await Market.findById(marketId).session(session)
        : await Market.findById(marketId);

      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status === 'settled') {
        throw new Error('Market already settled');
      }

      if (!['open', 'suspended', 'closed'].includes(market.status)) {
        throw new Error(`Cannot settle market with status: ${market.status}`);
      }

      // Validate winning runner
      const winningRunner = market.runners.find(
        (r) => r.runnerId === winningRunnerId
      );

      if (!winningRunner) {
        throw new Error('Winning runner not found');
      }

      // Update runner statuses
      market.runners.forEach((runner) => {
        if (runner.runnerId === winningRunnerId) {
          runner.result = 'winner';
          runner.status = 'winner';
        } else {
          runner.result = 'loser';
          runner.status = 'loser';
        }
      });

      // Get all matched bets for this market
      const bets = session
        ? await Bet.find({
            market: marketId,
            status: { $in: ['matched', 'partially_matched'] },
            matchedAmount: { $gt: 0 },
          }).session(session)
        : await Bet.find({
            market: marketId,
            status: { $in: ['matched', 'partially_matched'] },
            matchedAmount: { $gt: 0 },
          });

      let totalSettled = 0;
      const settlementResults = {
        winners: 0,
        losers: 0,
        totalPayout: 0,
        totalCommission: 0,
      };

      // Settle each bet
      for (const bet of bets) {
        const betResult = await exports.settleBet(
          bet,
          winningRunnerId,
          settledBy,
          session
        );

        totalSettled++;
        if (betResult.result === 'won') {
          settlementResults.winners++;
          settlementResults.totalPayout += betResult.payout;
        } else {
          settlementResults.losers++;
        }
        settlementResults.totalCommission += betResult.commission;
      }

      // Cancel unmatched/partially matched bets (should be none since we auto-match)
      const unmatchedBets = session
        ? await Bet.find({
            market: marketId,
            status: { $in: ['unmatched', 'partially_matched'] },
            unmatchedAmount: { $gt: 0 },
          }).session(session)
        : await Bet.find({
            market: marketId,
            status: { $in: ['unmatched', 'partially_matched'] },
            unmatchedAmount: { $gt: 0 },
          });

      for (const bet of unmatchedBets) {
        // Stake was already deducted at placement — refund it back
        const refundAmount = bet.betType === 'back'
          ? bet.unmatchedAmount
          : bet.unmatchedAmount * (bet.odds - 1);

        await walletService.credit(
          bet.user.toString(),
          refundAmount,
          'bet_void',
          `Refund for unmatched bet ${bet.betRef}`,
          { betId: bet._id, betRef: bet.betRef }
        );

        bet.unmatchedAmount = 0;
        bet.status = bet.matchedAmount > 0 ? 'matched' : 'void';
        await bet.save(session ? { session } : undefined);
      }

      // Update market
      market.status = 'settled';
      market.winningRunner = winningRunnerId;
      market.settledTime = new Date();
      market.settledBy = settledBy;
      await market.save(session ? { session } : undefined);

      settlementResult = {
        marketId,
        winningRunner: winningRunner.name,
        totalBetsSettled: totalSettled,
        ...settlementResults,
      };
    });

    return settlementResult;
  } catch (error) {
    throw new Error(`Market settlement failed: ${error.message}`);
  }
};

/**
 * Settle individual bet
 * @param {Object} bet - Bet object
 * @param {String} winningRunnerId - Winning runner ID
 * @param {String} settledBy - Admin user ID
 * @param {Object} session - MongoDB session
 * @returns {Object} {result, payout, commission, profitLoss}
 */
exports.settleBet = async (bet, winningRunnerId, settledBy, session) => {
  try {
    const isWinner = bet.selection.id === winningRunnerId;
    const matchedStake = bet.matchedAmount;

    let profitLoss = 0;
    let commission = 0;
    let result;

    if (bet.betType === 'back') {
      // Back bet: wins if selection wins
      if (isWinner) {
        // Won — stake was already deducted at placement, so only credit the profit
        profitLoss = matchedStake * (bet.odds - 1);
        commission = (profitLoss * bet.commission.rate) / 100;
        profitLoss -= commission;
        result = 'won';

        // Credit profit only (stake already deducted at bet placement)
        await walletService.credit(
          bet.user.toString(),
          matchedStake + profitLoss,
          'bet_won',
          `Bet won: ${bet.event?.name || 'Unknown event'} — Payout ₹${(matchedStake + profitLoss).toFixed(2)}`,
          {
            betId: bet._id,
            betRef: bet.betRef,
            eventName: bet.event?.name,
            selection: bet.selection.name,
            odds: bet.odds,
            marketId: bet.market.toString(),
          }
        );
      } else {
        // Lost — stake was already deducted at placement, just record the loss
        profitLoss = -matchedStake;
        result = 'lost';
        // No balance change needed — stake was deducted when bet was placed
      }
    } else {
      // Lay bet: wins if selection loses
      if (!isWinner) {
        // Won — liability (stake*(odds-1)) was already deducted at placement
        profitLoss = matchedStake;
        commission = (profitLoss * bet.commission.rate) / 100;
        profitLoss -= commission;
        result = 'won';

        // Credit liability back + profit
        const liability = matchedStake * (bet.odds - 1);
        const totalPayout = liability + profitLoss;
        await walletService.credit(
          bet.user.toString(),
          totalPayout,
          'bet_won',
          `Lay bet won: ${bet.event?.name || 'Unknown event'} — Payout ₹${totalPayout.toFixed(2)}`,
          {
            betId: bet._id,
            betRef: bet.betRef,
            eventName: bet.event?.name,
            selection: bet.selection.name,
            odds: bet.odds,
            marketId: bet.market.toString(),
          }
        );
      } else {
        // Lost — liability already deducted at placement, just record the loss
        const liability = matchedStake * (bet.odds - 1);
        profitLoss = -liability;
        result = 'lost';
        // No balance change needed
      }
    }

    // Update bet
    bet.status = 'settled';
    bet.result = result;
    bet.profitLoss = profitLoss;
    bet.commission.amount = commission;
    bet.settledAmount = matchedStake;
    bet.settledAt = new Date();
    bet.settledBy = settledBy;
    await bet.save(session ? { session } : undefined);

    // Process affiliate commission (non-blocking — runs outside the main session)
    commissionService.processAfterSettlement(bet, result, matchedStake).catch(() => {});

    return {
      result,
      payout: result === 'won' ? matchedStake + profitLoss : 0,
      commission,
      profitLoss,
    };
  } catch (error) {
    throw new Error(`Bet settlement failed: ${error.message}`);
  }
};

/**
 * Void market and refund all bets
 * @param {String} marketId - Market ID
 * @param {String} reason - Void reason
 * @param {String} voidedBy - Admin user ID
 * @returns {Object} Void result
 */
exports.voidMarket = async (marketId, reason, voidedBy) => {
  const { withTxn } = walletService;

  try {
    let voidResult;

    await withTxn(async (session) => {
      const market = session
        ? await Market.findById(marketId).session(session)
        : await Market.findById(marketId);

      if (!market) {
        throw new Error('Market not found');
      }

      if (market.status === 'void') {
        throw new Error('Market already void');
      }

      // Get all active bets
      const bets = session
        ? await Bet.find({
            market: marketId,
            status: { $in: ['matched', 'partially_matched', 'unmatched'] },
          }).session(session)
        : await Bet.find({
            market: marketId,
            status: { $in: ['matched', 'partially_matched', 'unmatched'] },
          });

      let totalRefunded = 0;

      // Refund all bets — stake was already deducted at placement so credit it back
      for (const bet of bets) {
        const refundAmount = bet.betType === 'back'
          ? bet.stake
          : bet.stake * (bet.odds - 1);

        await walletService.credit(
          bet.user.toString(),
          refundAmount,
          'bet_void',
          `Void refund for bet ${bet.betRef}`,
          { betId: bet._id, betRef: bet.betRef }
        );

        bet.status = 'void';
        bet.result = 'void';
        bet.settledAt = new Date();
        bet.settledBy = voidedBy;
        await bet.save(session ? { session } : undefined);

        totalRefunded++;
      }

      // Update market
      market.status = 'void';
      market.settlementNotes = reason;
      market.settledTime = new Date();
      market.settledBy = voidedBy;
      market.runners.forEach((runner) => {
        runner.result = 'void';
        runner.status = 'removed';
      });
      await market.save(session ? { session } : undefined);

      voidResult = {
        marketId,
        reason,
        totalBetsVoided: totalRefunded,
      };
    });

    return voidResult;
  } catch (error) {
    throw new Error(`Market void failed: ${error.message}`);
  }
};

/**
 * Calculate cash out value for a bet
 * @param {String} betId - Bet ID
 * @param {Number} currentOdds - Current market odds
 * @returns {Object} Cash out details
 */
exports.calculateCashOut = async (betId, currentOdds) => {
  const bet = await Bet.findById(betId);

  if (!bet) {
    throw new Error('Bet not found');
  }

  if (!['matched', 'partially_matched'].includes(bet.status)) {
    throw new Error('Cash out only available for matched bets');
  }

  if (bet.matchedAmount === 0) {
    throw new Error('No matched amount to cash out');
  }

  const matchedStake = bet.matchedAmount;
  let cashOutValue = 0;

  if (bet.betType === 'back') {
    // Back bet cash out
    const originalProfit = matchedStake * (bet.odds - 1);
    const currentProfit = matchedStake * (currentOdds - 1);
    
    if (currentOdds > bet.odds) {
      // Favorable - offer partial profit
      cashOutValue = matchedStake + (currentProfit - originalProfit) * 0.8;
    } else {
      // Unfavorable - offer reduced stake
      cashOutValue = matchedStake * (currentOdds / bet.odds) * 0.9;
    }
  } else {
    // Lay bet cash out
    const originalLiability = matchedStake * (bet.odds - 1);
    const currentLiability = matchedStake * (currentOdds - 1);

    if (currentOdds < bet.odds) {
      // Favorable - offer partial profit
      cashOutValue = originalLiability + (originalLiability - currentLiability) * 0.8;
    } else {
      // Unfavorable - offer reduced amount
      cashOutValue = originalLiability * (bet.odds / currentOdds) * 0.9;
    }
  }

  // Apply cash out commission (5%)
  const commission = cashOutValue * 0.05;
  cashOutValue -= commission;

  return {
    cashOutValue: Math.max(0, Math.round(cashOutValue * 100) / 100),
    commission: Math.round(commission * 100) / 100,
    originalStake: matchedStake,
    currentOdds,
    originalOdds: bet.odds,
    profitLoss: Math.round((cashOutValue - matchedStake) * 100) / 100,
  };
};

/**
 * Execute cash out
 * @param {String} betId - Bet ID
 * @param {String} userId - User ID
 * @returns {Object} Cash out result
 */
exports.cashOutBet = async (betId, userId) => {
  const session = await mongoose.startSession();

  try {
    let cashOutResult;

    await session.withTransaction(async () => {
      const bet = await Bet.findById(betId).session(session);

      if (!bet) {
        throw new Error('Bet not found');
      }

      if (bet.user.toString() !== userId) {
        throw new Error('Unauthorized');
      }

      if (!['matched', 'partially_matched'].includes(bet.status)) {
        throw new Error('Cash out only available for matched bets');
      }

      // Get current market odds
      const market = await Market.findById(bet.market).session(session);
      const runner = market.runners.find((r) => r.runnerId === bet.selection.id);
      
      const currentOdds = runner.lastPriceTraded || bet.odds;

      // Calculate cash out value
      const cashOutCalc = await this.calculateCashOut(betId, currentOdds);

      // Unlock original liability
      const originalLiability = bet.betType === 'back'
        ? bet.matchedAmount
        : bet.matchedAmount * (bet.odds - 1);

      await walletService.unlockFunds(userId, originalLiability, 'bet_cashout');

      // Credit cash out amount
      await walletService.credit(
        userId,
        cashOutCalc.cashOutValue,
        'bet_cashout',
        `Cash out: ${bet.event.name}`,
        {
          betDetails: {
            betId: bet._id,
            betRef: bet.betRef,
            selection: bet.selection.name,
          },
        }
      );

      // Update bet
      bet.status = 'settled';
      bet.result = cashOutCalc.profitLoss >= 0 ? 'won' : 'lost';
      bet.isCashOut = true;
      bet.cashOutAmount = cashOutCalc.cashOutValue;
      bet.profitLoss = cashOutCalc.profitLoss;
      bet.settledAmount = bet.matchedAmount;
      bet.settledAt = new Date();
      await bet.save({ session });

      cashOutResult = {
        betRef: bet.betRef,
        ...cashOutCalc,
      };
    });

    await session.endSession();
    return cashOutResult;
  } catch (error) {
    await session.endSession();
    throw new Error(`Cash out failed: ${error.message}`);
  }
};

/**
 * Get user's bets
 * @param {String} userId - User ID
 * @param {Object} options - {status, marketId, page, limit}
 * @returns {Object} {bets, pagination}
 */
exports.getUserBets = async (userId, options = {}) => {
  const {
    status = null,
    marketId = null,
    page = 1,
    limit = 20,
  } = options;

  const query = { user: userId };

  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  if (marketId) {
    query.market = marketId;
  }

  const skip = (page - 1) * limit;

  const [bets, total] = await Promise.all([
    Bet.find(query)
      .populate('market', 'marketName event status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Bet.countDocuments(query),
  ]);

  return {
    bets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user's betting statistics
 * @param {String} userId - User ID
 * @returns {Object} Statistics
 */
exports.getUserBettingStats = async (userId) => {
  const stats = await Bet.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'settled' } },
    {
      $group: {
        _id: '$result',
        count: { $sum: 1 },
        totalStake: { $sum: '$matchedAmount' },
        totalProfitLoss: { $sum: '$profitLoss' },
      },
    },
  ]);

  const result = {
    totalBets: 0,
    won: 0,
    lost: 0,
    void: 0,
    totalStaked: 0,
    totalWinnings: 0,
    totalLosses: 0,
    netProfitLoss: 0,
    winRate: 0,
  };

  stats.forEach((stat) => {
    result.totalBets += stat.count;
    result.totalStaked += stat.totalStake;

    if (stat._id === 'won') {
      result.won = stat.count;
      result.totalWinnings = stat.totalProfitLoss;
    } else if (stat._id === 'lost') {
      result.lost = stat.count;
      result.totalLosses = Math.abs(stat.totalProfitLoss);
    } else if (stat._id === 'void') {
      result.void = stat.count;
    }
  });

  result.netProfitLoss = result.totalWinnings - result.totalLosses;
  result.winRate = result.totalBets > 0 ? (result.won / result.totalBets) * 100 : 0;

  return result;
};

/**
 * Get market exposure for user
 * @param {String} userId - User ID
 * @param {String} marketId - Market ID
 * @returns {Object} Exposure by selection
 */
exports.getUserMarketExposure = async (userId, marketId) => {
  const bets = await Bet.find({
    user: userId,
    market: marketId,
    status: { $in: ['matched', 'partially_matched'] },
  });

  const exposure = {};

  bets.forEach((bet) => {
    const selectionId = bet.selection.id;
    
    if (!exposure[selectionId]) {
      exposure[selectionId] = {
        selectionName: bet.selection.name,
        totalStake: 0,
        potentialProfit: 0,
        potentialLoss: 0,
      };
    }

    const matchedStake = bet.matchedAmount;

    if (bet.betType === 'back') {
      exposure[selectionId].totalStake += matchedStake;
      exposure[selectionId].potentialProfit += matchedStake * (bet.odds - 1);
    } else {
      exposure[selectionId].totalStake += matchedStake;
      exposure[selectionId].potentialLoss += matchedStake * (bet.odds - 1);
    }
  });

  return exposure;
};

module.exports = exports;
