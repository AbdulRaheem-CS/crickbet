/**
 * GSC+ Callback Controller
 * Handles incoming seamless wallet callbacks from GSC+ platform
 * 
 * These endpoints are called BY GSC+ when:
 * - A game provider needs to check player balance (2.1 Balance)
 * - A player places a bet or tips (2.2 Withdraw)
 * - A player wins or receives bonus (2.3 Deposit)
 * - Bet data needs to be synchronized (2.4 Push Bet Data)
 * 
 * CRITICAL: These must be fast, reliable, and idempotent.
 * All balance operations use MongoDB transactions for atomicity.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const GscTransaction = require('../models/GscTransaction');
const gscConfig = require('../config/gsc');

// ============================================================
// 2.1 Balance Callback
// POST /v1/api/seamless/balance
// ============================================================

/**
 * Handle balance inquiry from GSC+
 * Returns the balance for one or more players
 */
exports.handleBalance = async (req, res) => {
  try {
    const { batch_requests, currency } = req.body;

    console.log(`[GSC+ Balance] Checking balance for ${batch_requests.length} player(s)`);

    const responseData = [];

    for (const request of batch_requests) {
      const { member_account, product_code } = request;

      try {
        // Find user by username (member_account = username in our system)
        const user = await User.findOne({ username: member_account }).select('wallet');

        if (!user) {
          responseData.push({
            member_account,
            product_code,
            balance: 0,
            code: gscConfig.responseCodes.MEMBER_NOT_FOUND,
            message: 'Member not found',
          });
          continue;
        }

        responseData.push({
          member_account,
          product_code,
          balance: parseFloat((user.wallet.balance || 0).toFixed(4)),
          code: gscConfig.responseCodes.SUCCESS,
          message: '',
        });
      } catch (err) {
        console.error(`[GSC+ Balance] Error for ${member_account}:`, err.message);
        responseData.push({
          member_account,
          product_code,
          balance: 0,
          code: gscConfig.responseCodes.INTERNAL_ERROR,
          message: 'Internal error',
        });
      }
    }

    return res.json({ data: responseData });
  } catch (error) {
    console.error('[GSC+ Balance] Fatal error:', error);
    return res.json({
      data: [{
        code: gscConfig.responseCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      }],
    });
  }
};


// ============================================================
// 2.2 Withdraw Callback
// POST /v1/api/seamless/withdraw
// ============================================================

/**
 * Handle withdraw (deduction) from player wallet
 * Called when player places a bet, gives tip, etc.
 * 
 * Per GSC+ API 2.2:
 * Request:
 *   - batch_requests[]: { member_account, product_code, game_type, transactions[] }
 *   - operator_code, game_type (optional), currency, sign, request_time
 *   - sign = md5(operator_code + request_time + "withdraw" + secret_key)
 *   - Transaction fields: id, action, wager_code, wager_status, round_id,
 *     channel_code, amount, bet_amount, valid_bet_amount, prize_amount,
 *     tip_amount, settled_at, game_code, Channel_code, wager_type
 * 
 * Response:
 *   - data[]: { member_account, product_code, before_balance, balance, code, message }
 *   - balance fields: float64, up to 4 decimal places
 * 
 * IMPORTANT: Must handle duplicate transactions (idempotency)
 *   If tx_id exists and has been refunded before, return the duplicate transaction
 * IMPORTANT: Must check sufficient balance before deducting
 */
exports.handleWithdraw = async (req, res) => {
  try {
    const { batch_requests, currency } = req.body;

    console.log(`[GSC+ Withdraw] Processing ${batch_requests.length} withdraw request(s)`);

    const responseData = [];

    for (const request of batch_requests) {
      const { member_account, product_code, game_type, transactions } = request;

      try {
        // Find user
        const user = await User.findOne({ username: member_account });

        if (!user) {
          responseData.push({
            member_account,
            product_code,
            before_balance: 0,
            balance: 0,
            code: gscConfig.responseCodes.MEMBER_NOT_FOUND,
            message: 'Member not found',
          });
          continue;
        }

        let beforeBalance = user.wallet.balance || 0;
        let lastCode = gscConfig.responseCodes.SUCCESS;
        let lastMessage = '';

        // Process each transaction in the batch
        for (const txn of transactions) {
          const result = await processWithdrawTransaction(user, txn, product_code, game_type, currency, req.body);

          if (result.code !== gscConfig.responseCodes.SUCCESS) {
            lastCode = result.code;
            lastMessage = result.message;
          }
        }

        // Refresh user balance after all transactions
        const updatedUser = await User.findById(user._id).select('wallet');

        responseData.push({
          member_account,
          product_code,
          before_balance: parseFloat(beforeBalance.toFixed(4)),
          balance: parseFloat((updatedUser.wallet.balance || 0).toFixed(4)),
          code: lastCode,
          message: lastMessage,
        });
      } catch (err) {
        console.error(`[GSC+ Withdraw] Error for ${member_account}:`, err.message);
        responseData.push({
          member_account,
          product_code,
          before_balance: 0,
          balance: 0,
          code: gscConfig.responseCodes.INTERNAL_ERROR,
          message: 'Internal error',
        });
      }
    }

    return res.json({ data: responseData });
  } catch (error) {
    console.error('[GSC+ Withdraw] Fatal error:', error);
    return res.json({
      data: [{
        code: gscConfig.responseCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      }],
    });
  }
};

/**
 * Process a single withdraw transaction with atomicity
 * 
 * Per GSC+ docs (2.2):
 * - If the tx_id already exists and has been processed/refunded before,
 *   return the duplicate transaction with SUCCESS code (idempotency).
 * - Transactions contain: id, action, wager_code, wager_status, round_id,
 *   channel_code, amount, bet_amount, valid_bet_amount, prize_amount,
 *   tip_amount, settled_at, game_code, Channel_code, wager_type
 */
async function processWithdrawTransaction(user, txn, productCode, gameType, currency, rawRequest) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Check for duplicate transaction (idempotency)
      // Per GSC+ docs: if tx_id exists, return the duplicate transaction as SUCCESS
      const existing = await GscTransaction.findDuplicate(txn.id, 'withdraw');
      if (existing) {
        console.log(`[GSC+ Withdraw] Duplicate transaction: ${txn.id}, returning existing balance`);
        // Return SUCCESS with the existing balance (idempotent response)
        result = {
          code: gscConfig.responseCodes.SUCCESS,
          message: '',
          balanceAfter: existing.balanceAfter,
          beforeBalance: existing.balanceBefore,
        };
        return;
      }

      const amount = Math.abs(txn.amount);

      // Handle ROLLBACK/CANCEL - these ADD money back
      const isRefund = ['ROLLBACK', 'CANCEL'].includes(txn.action?.toUpperCase());

      // Get fresh user data within transaction
      const freshUser = await User.findById(user._id).session(session);
      const balanceBefore = freshUser.wallet.balance || 0;

      if (isRefund) {
        // Rollback: ADD funds back
        freshUser.wallet.balance += amount;
      } else {
        // Normal withdraw (BET, TIP): DEDUCT funds
        if (balanceBefore < amount) {
          result = {
            code: gscConfig.responseCodes.INSUFFICIENT_BALANCE,
            message: 'Insufficient balance',
            balanceAfter: balanceBefore,
            beforeBalance: balanceBefore,
          };
          return;
        }
        freshUser.wallet.balance -= amount;
      }

      freshUser.wallet.lastTransactionAt = new Date();
      await freshUser.save({ session });

      // Log GSC transaction with all fields from the API spec
      const gscTxn = new GscTransaction({
        gscTransactionId: txn.id,
        user: user._id,
        memberAccount: user.username,
        direction: 'withdraw',
        action: txn.action,
        amount: isRefund ? amount : -amount,
        balanceBefore,
        balanceAfter: freshUser.wallet.balance,
        productCode,
        gameType: gameType || txn.game_type,
        gameCode: txn.game_code,
        wagerCode: txn.wager_code,
        wagerStatus: txn.wager_status,
        roundId: txn.round_id,
        channelCode: txn.channel_code || txn.Channel_code,
        wagerType: txn.wager_type,
        betAmount: parseFloat(txn.bet_amount) || 0,
        validBetAmount: parseFloat(txn.valid_bet_amount) || 0,
        prizeAmount: parseFloat(txn.prize_amount) || 0,
        tipAmount: parseFloat(txn.tip_amount) || 0,
        settledAt: txn.settled_at,
        currency: currency || gscConfig.defaultCurrency,
        status: 'completed',
        rawRequest,
      });

      await gscTxn.save({ session });

      result = {
        code: gscConfig.responseCodes.SUCCESS,
        message: '',
        balanceAfter: freshUser.wallet.balance,
        beforeBalance: balanceBefore,
      };
    });

    await session.endSession();
    return result || { code: gscConfig.responseCodes.INTERNAL_ERROR, message: 'Transaction failed', balanceAfter: 0, beforeBalance: 0 };
  } catch (error) {
    await session.endSession();
    console.error(`[GSC+ Withdraw] Transaction error:`, error);
    return {
      code: gscConfig.responseCodes.INTERNAL_ERROR,
      message: error.message,
      balanceAfter: user.wallet.balance || 0,
      beforeBalance: user.wallet.balance || 0,
    };
  }
}


// ============================================================
// 2.3 Deposit Callback
// POST /v1/api/seamless/deposit
// ============================================================

/**
 * Handle deposit (credit) to player wallet
 * Called when player wins, receives bonus, jackpot, promo, etc.
 * 
 * IMPORTANT: Must accept settled deposits even without prior bets (provider promos)
 * IMPORTANT: WBET (product 1040) does NOT use this endpoint for winnings
 */
exports.handleDeposit = async (req, res) => {
  try {
    const { batch_requests, currency } = req.body;

    console.log(`[GSC+ Deposit] Processing ${batch_requests.length} deposit request(s)`);

    const responseData = [];

    for (const request of batch_requests) {
      const { member_account, product_code, game_type, transactions } = request;

      try {
        // Find user
        const user = await User.findOne({ username: member_account });

        if (!user) {
          responseData.push({
            member_account,
            product_code,
            before_balance: 0,
            balance: 0,
            code: gscConfig.responseCodes.MEMBER_NOT_FOUND,
            message: 'Member not found',
          });
          continue;
        }

        let currentBalance = user.wallet.balance || 0;
        let beforeBalance = currentBalance;
        let lastCode = gscConfig.responseCodes.SUCCESS;
        let lastMessage = '';

        // Process each transaction
        for (const txn of transactions) {
          const result = await processDepositTransaction(user, txn, product_code, game_type, currency, req.body);

          if (result.code === gscConfig.responseCodes.SUCCESS) {
            currentBalance = result.balanceAfter;
          } else {
            lastCode = result.code;
            lastMessage = result.message;
          }
        }

        // Refresh user balance
        const updatedUser = await User.findById(user._id).select('wallet');

        responseData.push({
          member_account,
          product_code,
          before_balance: parseFloat(beforeBalance.toFixed(4)),
          balance: parseFloat((updatedUser.wallet.balance || 0).toFixed(4)),
          code: lastCode,
          message: lastMessage,
        });
      } catch (err) {
        console.error(`[GSC+ Deposit] Error for ${member_account}:`, err.message);
        responseData.push({
          member_account,
          product_code,
          before_balance: 0,
          balance: 0,
          code: gscConfig.responseCodes.INTERNAL_ERROR,
          message: 'Internal error',
        });
      }
    }

    return res.json({ data: responseData });
  } catch (error) {
    console.error('[GSC+ Deposit] Fatal error:', error);
    return res.json({
      data: [{
        code: gscConfig.responseCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      }],
    });
  }
};

/**
 * Process a single deposit transaction with atomicity
 * Same idempotency rules as withdraw — duplicate tx_id returns SUCCESS
 */
async function processDepositTransaction(user, txn, productCode, gameType, currency, rawRequest) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Check for duplicate transaction (idempotency)
      // Per GSC+ docs: if tx_id exists, return SUCCESS with existing balance
      const existing = await GscTransaction.findDuplicate(txn.id, 'deposit');
      if (existing) {
        console.log(`[GSC+ Deposit] Duplicate transaction: ${txn.id}, returning existing balance`);
        result = {
          code: gscConfig.responseCodes.SUCCESS,
          message: '',
          balanceAfter: existing.balanceAfter,
        };
        return;
      }

      const amount = Math.abs(txn.amount);

      // Handle ROLLBACK/CANCEL in deposit context - these DEDUCT money
      const isDeduction = ['ROLLBACK', 'CANCEL'].includes(txn.action?.toUpperCase());

      // Get fresh user data
      const freshUser = await User.findById(user._id).session(session);
      const balanceBefore = freshUser.wallet.balance || 0;

      if (isDeduction) {
        // Rollback of a deposit: DEDUCT
        freshUser.wallet.balance -= amount;
        // Allow negative balance for RESETTLED edge cases (sports betting)
      } else {
        // Normal deposit (SETTLED, JACKPOT, BONUS, etc.): ADD funds
        freshUser.wallet.balance += amount;
      }

      freshUser.wallet.lastTransactionAt = new Date();
      await freshUser.save({ session });

      // Log GSC transaction with all fields from the API spec
      const gscTxn = new GscTransaction({
        gscTransactionId: txn.id,
        user: user._id,
        memberAccount: user.username,
        direction: 'deposit',
        action: txn.action,
        amount: isDeduction ? -amount : amount,
        balanceBefore,
        balanceAfter: freshUser.wallet.balance,
        productCode,
        gameType: gameType || txn.game_type,
        gameCode: txn.game_code,
        wagerCode: txn.wager_code,
        wagerStatus: txn.wager_status,
        roundId: txn.round_id,
        channelCode: txn.channel_code || txn.Channel_code,
        wagerType: txn.wager_type,
        betAmount: parseFloat(txn.bet_amount) || 0,
        validBetAmount: parseFloat(txn.valid_bet_amount) || 0,
        prizeAmount: parseFloat(txn.prize_amount) || 0,
        tipAmount: parseFloat(txn.tip_amount) || 0,
        settledAt: txn.settled_at,
        currency: currency || gscConfig.defaultCurrency,
        status: 'completed',
        rawRequest,
      });

      await gscTxn.save({ session });

      result = {
        code: gscConfig.responseCodes.SUCCESS,
        message: '',
        balanceAfter: freshUser.wallet.balance,
      };
    });

    await session.endSession();
    return result || { code: gscConfig.responseCodes.INTERNAL_ERROR, message: 'Transaction failed', balanceAfter: 0 };
  } catch (error) {
    await session.endSession();
    console.error(`[GSC+ Deposit] Transaction error:`, error);
    return {
      code: gscConfig.responseCodes.INTERNAL_ERROR,
      message: error.message,
      balanceAfter: user.wallet.balance || 0,
    };
  }
}


// ============================================================
// 2.4 Push Bet Data Callback
// POST /v1/api/seamless/pushbetdata
// ============================================================

/**
 * Handle push bet data from GSC+
 * Synchronizes all bet data and status (no balance changes)
 * Used for reporting, analytics, and bet history
 */
exports.handlePushBetData = async (req, res) => {
  try {
    const { wagers } = req.body;

    console.log(`[GSC+ PushBetData] Syncing ${wagers ? wagers.length : 0} wager(s)`);

    if (wagers && wagers.length > 0) {
      for (const wager of wagers) {
        try {
          // Store/update wager data
          await GscTransaction.findOneAndUpdate(
            {
              wagerCode: wager.wager_code,
              direction: 'pushbetdata',
            },
            {
              gscTransactionId: `pushbet_${wager.wager_code}_${wager.wager_status}`,
              memberAccount: wager.member_account,
              direction: 'pushbetdata',
              action: wager.wager_status,
              amount: 0, // Push bet data doesn't change balance
              productCode: parseInt(wager.product_code, 10),
              gameType: wager.game_type,
              gameCode: wager.game_code,
              wagerCode: wager.wager_code,
              wagerStatus: wager.wager_status,
              roundId: wager.round_id,
              channelCode: wager.channel_code,
              wagerType: wager.wager_type,
              betAmount: parseFloat(wager.bet_amount) || 0,
              validBetAmount: parseFloat(wager.valid_bet_amount) || 0,
              prizeAmount: parseFloat(wager.prize_amount) || 0,
              tipAmount: parseFloat(wager.tip_amount) || 0,
              settledAt: wager.settled_at,
              currency: wager.currency,
              status: 'completed',
              payload: wager.payload,
              rawRequest: wager,
            },
            { upsert: true, new: true }
          );

          // If this is WBET (product 1040) and status is SETTLED,
          // handle payout manually since WBET doesn't use /deposit
          if (parseInt(wager.product_code, 10) === gscConfig.WBET_PRODUCT_CODE
              && wager.wager_status === 'SETTLED'
              && parseFloat(wager.prize_amount) > 0) {
            await handleWbetPayout(wager);
          }
        } catch (err) {
          console.error(`[GSC+ PushBetData] Error processing wager ${wager.wager_code}:`, err.message);
        }
      }
    }

    return res.json({
      code: gscConfig.responseCodes.SUCCESS,
      message: '',
    });
  } catch (error) {
    console.error('[GSC+ PushBetData] Fatal error:', error);
    return res.json({
      code: gscConfig.responseCodes.INTERNAL_ERROR,
      message: 'Internal server error',
    });
  }
};


/**
 * Handle WBET special payout
 * WBET product winnings are not distributed via /deposit API,
 * must be handled manually after receiving push-bet-data
 */
async function handleWbetPayout(wager) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findOne({ username: wager.member_account }).session(session);
      if (!user) {
        console.error(`[GSC+ WBET] User not found: ${wager.member_account}`);
        return;
      }

      const prizeAmount = parseFloat(wager.prize_amount);
      const balanceBefore = user.wallet.balance || 0;

      user.wallet.balance += prizeAmount;
      user.wallet.lastTransactionAt = new Date();
      await user.save({ session });

      // Log the WBET payout
      const gscTxn = new GscTransaction({
        gscTransactionId: `wbet_payout_${wager.wager_code}`,
        user: user._id,
        memberAccount: wager.member_account,
        direction: 'deposit',
        action: 'WBET_PAYOUT',
        amount: prizeAmount,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        productCode: parseInt(wager.product_code, 10),
        gameType: wager.game_type,
        wagerCode: wager.wager_code,
        wagerStatus: wager.wager_status,
        roundId: wager.round_id,
        currency: wager.currency,
        status: 'completed',
      });

      await gscTxn.save({ session });

      console.log(`[GSC+ WBET] Payout of ${prizeAmount} to ${wager.member_account}`);
    });

    await session.endSession();
  } catch (error) {
    await session.endSession();
    console.error(`[GSC+ WBET] Payout error:`, error);
  }
}
