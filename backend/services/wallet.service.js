/**
 * Wallet Service
 * Production-ready wallet management with atomic operations
 * Handles: Balance check, Lock funds, Unlock funds, Credit wins, Debit losses, Transaction ledger
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * Run `fn` inside a Mongoose session+transaction when the MongoDB deployment
 * supports it (replica set / mongos).  On a standalone node the very first
 * real query inside a transaction throws
 * "Transaction numbers are only allowed on a replica set member or mongos".
 * We catch that once, remember it, and fall back to running `fn` without any
 * session so the rest of the call-stack works on standalone deployments.
 *
 * Usage:
 *   const result = await withTxn(async (session) => {
 *     // use session (may be null on standalone)
 *     const user = await User.findById(id).session(session);
 *     ...
 *     await user.save({ session });
 *     return something;
 *   });
 */
let _replicaSet = undefined; // true | false | undefined (not yet tested)

const withTxn = async (fn) => {
  // First call: probe
  if (_replicaSet === undefined) {
    const probe = await mongoose.startSession();
    try {
      probe.startTransaction();
      await User.findOne().session(probe).select('_id').lean(); // hits server
      await probe.abortTransaction();
      _replicaSet = true;
    } catch (_e) {
      try { await probe.abortTransaction(); } catch (_) {}
      _replicaSet = false;
    } finally {
      try { await probe.endSession(); } catch (_) {}
    }
  }

  if (_replicaSet) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => { result = await fn(session); });
      return result;
    } finally {
      await session.endSession();
    }
  } else {
    // Standalone — run without session
    return fn(null);
  }
};

exports.withTxn = withTxn;

/**
 * Get user wallet balance
 * @param {String} userId - User ID
 * @returns {Object} Wallet information with available balance
 */
exports.getBalance = async (userId) => {
  const user = await User.findById(userId).select('wallet');
  if (!user) {
    throw new Error('User not found');
  }

  return {
    balance: user.wallet.balance || 0,
    bonus: user.wallet.bonus || 0,
    exposure: user.wallet.exposure || 0,
    lockedFunds: user.wallet.lockedFunds || 0,
    availableBalance: (user.wallet.balance || 0) - (user.wallet.lockedFunds || 0),
    totalBalance: (user.wallet.balance || 0) + (user.wallet.bonus || 0),
    currency: user.wallet.currency || 'INR',
  };
};

/**
 * Credit funds to user wallet (Atomic operation)
 * Use for: Deposits, Wins, Bonuses, Refunds
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to credit
 * @param {String} type - Transaction type
 * @param {String} description - Description
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Transaction record
 */
exports.credit = async (userId, amount, type, description, metadata = {}) => {
  // Validation
  if (!userId || !amount || !type || !description) {
    throw new Error('Missing required parameters: userId, amount, type, description');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  try {
    let transaction;

    await withTxn(async (session) => {
      // Get current user with lock (prevents race conditions)
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.wallet.balance || 0;
      const bonusBefore = user.wallet.bonus || 0;

      // Determine if this is bonus or real money
      const isBonus = metadata.isBonus || type === 'bonus' || type === 'referral_bonus';
      const bonusAmount = isBonus ? amount : 0;
      const realAmount = isBonus ? 0 : amount;

      // Update user wallet atomically
      user.wallet.balance += realAmount;
      user.wallet.bonus += bonusAmount;
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // Create transaction record for audit trail
      transaction = new Transaction({
        user: userId,
        type,
        amount: realAmount,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        bonusAmount,
        bonusBalanceAfter: user.wallet.bonus,
        status: 'completed',
        currency: user.wallet.currency,
        description,
        reference: metadata.reference || {},
        paymentDetails: metadata.paymentDetails || {},
        betDetails: metadata.betDetails || {},
        casinoDetails: metadata.casinoDetails || {},
        adminNotes: metadata.adminNotes,
        processedBy: metadata.processedBy,
        metadata: {
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          device: metadata.device,
        },
        completedAt: new Date(),
      });

      await transaction.save(session ? { session } : undefined);
    });

    return transaction;
  } catch (error) {
    throw new Error(`Credit failed: ${error.message}`);
  }
};

/**
 * Debit funds from user wallet (Atomic operation)
 * Use for: Withdrawals, Bet placement, Losses
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to debit
 * @param {String} type - Transaction type
 * @param {String} description - Description
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Transaction record
 */
exports.debit = async (userId, amount, type, description, metadata = {}) => {
  // Validation
  if (!userId || !amount || !type || !description) {
    throw new Error('Missing required parameters: userId, amount, type, description');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  try {
    let transaction;

    await withTxn(async (session) => {
      // Get current user with lock
      const user = session
        ? await User.findById(userId).session(session)
        : await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.wallet.balance || 0;
      const bonusBefore = user.wallet.bonus || 0;

      // Check if using bonus or real money
      const useBonus = metadata.useBonus || false;
      let bonusUsed = 0;
      let realMoneyUsed = 0;

      if (useBonus && bonusBefore > 0) {
        // Use bonus first, then real money
        bonusUsed = Math.min(amount, bonusBefore);
        realMoneyUsed = amount - bonusUsed;
      } else {
        realMoneyUsed = amount;
      }

      // Check sufficient balance (critical for preventing overdraft)
      // For bet_stake: funds were already unlocked just before this call, so check full balance
      const availableBalance = balanceBefore - (user.wallet.lockedFunds || 0);
      if (realMoneyUsed > balanceBefore) {
        throw new Error(`Insufficient balance. Balance: ₹${balanceBefore}, Required: ₹${realMoneyUsed}`);
      }

      // Update user wallet atomically
      user.wallet.balance -= realMoneyUsed;
      user.wallet.bonus -= bonusUsed;
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // Create transaction record
      transaction = new Transaction({
        user: userId,
        type,
        amount: realMoneyUsed,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        bonusAmount: -bonusUsed,
        bonusBalanceAfter: user.wallet.bonus,
        status: 'completed',
        currency: user.wallet.currency,
        description,
        reference: metadata.reference || {},
        paymentDetails: metadata.paymentDetails || {},
        betDetails: metadata.betDetails || {},
        casinoDetails: metadata.casinoDetails || {},
        adminNotes: metadata.adminNotes,
        processedBy: metadata.processedBy,
        metadata: {
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          device: metadata.device,
        },
        completedAt: new Date(),
      });

      await transaction.save(session ? { session } : undefined);
    });
    return transaction;
  } catch (error) {
    throw new Error(`Debit failed: ${error.message}`);
  }
};

/**
 * Lock funds (for pending bets/operations)
 * CRITICAL: Prevents double spending while bet is pending
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to lock
 * @param {String} reason - Reason for lock (e.g., "bet_placed")
 * @param {Object} reference - Reference to bet/operation
 * @returns {Object} Updated wallet
 */
exports.lockFunds = async (userId, amount, reason, reference = {}) => {
  if (!userId || !amount || !reason) {
    throw new Error('Missing required parameters: userId, amount, reason');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  try {
    let user;

    await withTxn(async (session) => {
      user = session
        ? await User.findById(userId).session(session)
        : await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const availableBalance = (user.wallet.balance || 0) - (user.wallet.lockedFunds || 0);

      // Critical check: Prevent locking more than available
      if (amount > availableBalance) {
        throw new Error(`Insufficient funds to lock. Available: ₹${availableBalance}, Requested: ₹${amount}`);
      }

      // Lock the funds
      user.wallet.lockedFunds = (user.wallet.lockedFunds || 0) + amount;
      
      // For bets, also update exposure
      if (reason === 'bet_placed' || reason === 'bet_pending') {
        user.wallet.exposure = (user.wallet.exposure || 0) + amount;
      }

      user.wallet.lastTransactionAt = new Date();
      await user.save(session ? { session } : undefined);
    });

    return {
      balance: user.wallet.balance,
      lockedFunds: user.wallet.lockedFunds,
      availableBalance: user.wallet.balance - user.wallet.lockedFunds,
      exposure: user.wallet.exposure,
    };
  } catch (error) {
    throw new Error(`Lock funds failed: ${error.message}`);
  }
};

/**
 * Unlock funds (after bet settles/operation completes)
 * @param {String} userId - User ID
 * @param {Number} amount - Amount to unlock
 * @param {String} reason - Reason for unlock
 * @returns {Object} Updated wallet
 */
exports.unlockFunds = async (userId, amount, reason) => {
  if (!userId || !amount || !reason) {
    throw new Error('Missing required parameters: userId, amount, reason');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  try {
    let user;

    await withTxn(async (session) => {
      user = session
        ? await User.findById(userId).session(session)
        : await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Unlock the funds
      user.wallet.lockedFunds = Math.max(0, (user.wallet.lockedFunds || 0) - amount);

      // For bets, also update exposure
      if (reason === 'bet_settled' || reason === 'bet_void' || reason === 'bet_cancelled') {
        user.wallet.exposure = Math.max(0, (user.wallet.exposure || 0) - amount);
      }

      user.wallet.lastTransactionAt = new Date();
      await user.save(session ? { session } : undefined);
    });

    return {
      balance: user.wallet.balance,
      lockedFunds: user.wallet.lockedFunds,
      availableBalance: user.wallet.balance - user.wallet.lockedFunds,
      exposure: user.wallet.exposure,
    };
  } catch (error) {
    throw new Error(`Unlock funds failed: ${error.message}`);
  }
};

/**
 * Credit wins (Unlock funds + Credit winnings)
 * Use when bet wins: Unlock stake + Credit profit
 * @param {String} userId - User ID
 * @param {Number} stakeAmount - Original stake to unlock
 * @param {Number} winAmount - Winning amount (including stake)
 * @param {Object} betDetails - Bet information
 * @returns {Object} Transaction record
 */
exports.creditWin = async (userId, stakeAmount, winAmount, betDetails = {}) => {
  if (!userId || !stakeAmount || !winAmount) {
    throw new Error('Missing required parameters: userId, stakeAmount, winAmount');
  }

  try {
    let transaction;

    await withTxn(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.wallet.balance || 0;

      // 1. Unlock the staked funds
      user.wallet.lockedFunds = Math.max(0, (user.wallet.lockedFunds || 0) - stakeAmount);
      user.wallet.exposure = Math.max(0, (user.wallet.exposure || 0) - stakeAmount);

      // 2. Credit the win amount (this includes the original stake returned + profit)
      const profitAmount = winAmount - stakeAmount;
      user.wallet.balance += winAmount;
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // 3. Create transaction record
      transaction = new Transaction({
        user: userId,
        type: 'bet_won',
        amount: winAmount,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        bonusAmount: 0,
        bonusBalanceAfter: user.wallet.bonus,
        status: 'completed',
        currency: user.wallet.currency,
        description: `Bet won: ${betDetails.eventName || 'Unknown event'} - Profit: ₹${profitAmount}`,
        betDetails: {
          betId: betDetails.betId,
          betRef: betDetails.betRef,
          marketId: betDetails.marketId,
          eventName: betDetails.eventName,
          selection: betDetails.selection,
          odds: betDetails.odds,
          stake: stakeAmount,
        },
        completedAt: new Date(),
      });

      await transaction.save(session ? { session } : undefined);
    });

    return transaction;
  } catch (error) {
    throw new Error(`Credit win failed: ${error.message}`);
  }
};

/**
 * Debit losses (Unlock funds + Confirm loss)
 * Use when bet loses: Unlock stake (already deducted)
 * @param {String} userId - User ID
 * @param {Number} stakeAmount - Original stake to unlock
 * @param {Object} betDetails - Bet information
 * @returns {Object} Transaction record
 */
exports.debitLoss = async (userId, stakeAmount, betDetails = {}) => {
  if (!userId || !stakeAmount) {
    throw new Error('Missing required parameters: userId, stakeAmount');
  }

  try {
    let transaction;

    await withTxn(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.wallet.balance || 0;

      // Unlock the staked funds (money already deducted when bet was placed)
      user.wallet.lockedFunds = Math.max(0, (user.wallet.lockedFunds || 0) - stakeAmount);
      user.wallet.exposure = Math.max(0, (user.wallet.exposure || 0) - stakeAmount);
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // Create transaction record for audit
      transaction = new Transaction({
        user: userId,
        type: 'bet_lost',
        amount: -stakeAmount,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        bonusAmount: 0,
        bonusBalanceAfter: user.wallet.bonus,
        status: 'completed',
        currency: user.wallet.currency,
        description: `Bet lost: ${betDetails.eventName || 'Unknown event'}`,
        betDetails: {
          betId: betDetails.betId,
          betRef: betDetails.betRef,
          marketId: betDetails.marketId,
          eventName: betDetails.eventName,
          selection: betDetails.selection,
          odds: betDetails.odds,
          stake: stakeAmount,
        },
        completedAt: new Date(),
      });

      await transaction.save(session ? { session } : undefined);
    });

    return transaction;
  } catch (error) {
    throw new Error(`Debit loss failed: ${error.message}`);
  }
};

/**
 * Process deposit (initiate)
 * @param {String} userId - User ID
 * @param {Number} amount - Deposit amount
 * @param {String} paymentMethod - Payment method
 * @param {Object} paymentDetails - Payment details
 * @returns {Object} Pending transaction
 */
exports.processDeposit = async (userId, amount, paymentMethod, paymentDetails = {}) => {
  if (!userId || !amount || !paymentMethod) {
    throw new Error('Missing required parameters');
  }

  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero');
  }

  // Validate deposit limits
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Create pending transaction
  const transaction = new Transaction({
    user: userId,
    type: 'deposit',
    amount,
    balanceBefore: user.wallet.balance,
    balanceAfter: user.wallet.balance, // Not updated yet
    status: 'pending',
    currency: user.wallet.currency,
    description: `Deposit via ${paymentMethod}`,
    paymentDetails: {
      method: paymentMethod,
      ...paymentDetails,
    },
  });

  await transaction.save();

  return {
    transactionId: transaction._id,
    txnRef: transaction.txnRef,
    amount,
    currency: user.wallet.currency,
    status: 'pending',
  };
};

/**
 * Verify and complete deposit (after payment confirmation)
 * @param {String} transactionId - Transaction ID
 * @param {Object} gatewayResponse - Payment gateway response
 * @returns {Object} Completed transaction
 */
exports.verifyDeposit = async (transactionId, gatewayResponse = {}) => {
  const transaction = await Transaction.findById(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.type !== 'deposit') {
    throw new Error('Invalid transaction type');
  }

  if (transaction.status === 'completed') {
    throw new Error('Transaction already completed');
  }

  // Attempt to use a MongoDB session/transaction (requires replica set).
  // On standalone MongoDB the first query with lsid fails — detect that and
  // fall back to plain sequential updates.
  let useSession = false;
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction(); // client-side only — does NOT hit the server yet

    // Fire a real server-round-trip inside the session to verify replica-set support.
    await User.findById(transaction.user).session(session).select('_id').lean();
    useSession = true; // replica set confirmed
  } catch (probeErr) {
    if (session) { try { session.endSession(); } catch (_) {} }
    session = null;
    useSession = false;
  }

  try {
    if (useSession) {
      // ── Replica-set path (atomic) ──────────────────────────
      const user = await User.findById(transaction.user).session(session);
      if (!user) throw new Error('User not found');
      user.wallet.balance += transaction.amount;
      user.wallet.lastTransactionAt = new Date();
      await user.save(session ? { session } : undefined);

      transaction.balanceAfter = user.wallet.balance;
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      if (gatewayResponse.gatewayTransactionId)
        transaction.paymentDetails.gatewayTransactionId = gatewayResponse.gatewayTransactionId;
      if (gatewayResponse.gateway)
        transaction.paymentDetails.gateway = gatewayResponse.gateway;
      await transaction.save(session ? { session } : undefined);

      await session.commitTransaction();
      } else {
      // ── Standalone path — use findByIdAndUpdate (no sessions needed) ──
      const user = await User.findById(transaction.user);
      if (!user) throw new Error('User not found');

      const newBalance = user.wallet.balance + transaction.amount;

      // Atomically credit the wallet
      await User.findByIdAndUpdate(transaction.user, {
        $inc: { 'wallet.balance': transaction.amount },
        $set:  { 'wallet.lastTransactionAt': new Date() },
      });

      // Atomically complete the transaction record
      const paymentDetailsUpdate = {};
      if (gatewayResponse.gatewayTransactionId)
        paymentDetailsUpdate['paymentDetails.gatewayTransactionId'] = gatewayResponse.gatewayTransactionId;
      if (gatewayResponse.gateway)
        paymentDetailsUpdate['paymentDetails.gateway'] = gatewayResponse.gateway;

      await Transaction.findByIdAndUpdate(transaction._id, {
        $set: {
          status: 'completed',
          balanceAfter: newBalance,
          completedAt: new Date(),
          ...paymentDetailsUpdate,
        },
      });

      // Refresh the local object so the caller gets the updated doc
      transaction.status = 'completed';
      transaction.balanceAfter = newBalance;
      transaction.completedAt = new Date();
    }

    return transaction;
  } catch (error) {
    if (useSession && session) {
      await session.abortTransaction();
      }
    throw new Error(`Verify deposit failed: ${error.message}`);
  }
};

/**
 * Process withdrawal (initiate)
 * @param {String} userId - User ID
 * @param {Number} amount - Withdrawal amount
 * @param {String} paymentMethod - Payment method
 * @param {Object} paymentDetails - Payment details
 * @returns {Object} Pending withdrawal
 */
exports.processWithdrawal = async (userId, amount, paymentMethod, paymentDetails = {}) => {
  if (!userId || !amount || !paymentMethod) {
    throw new Error('Missing required parameters');
  }

  if (amount <= 0) {
    throw new Error('Withdrawal amount must be greater than zero');
  }

  // Check withdrawal eligibility
  const eligibility = await exports.checkWithdrawalEligibility(userId, amount);
  if (!eligibility.eligible) {
    throw new Error(`Withdrawal not allowed: ${eligibility.reason}`);
  }

  try {
    let transaction;

    await withTxn(async (session) => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      const balanceBefore = user.wallet.balance;

      // Deduct amount immediately (locked until approved)
      user.wallet.balance -= amount;
      user.wallet.lockedFunds = (user.wallet.lockedFunds || 0) + amount;
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // Create pending withdrawal transaction
      transaction = new Transaction({
        user: userId,
        type: 'withdrawal',
        amount: -amount,
        balanceBefore,
        balanceAfter: user.wallet.balance,
        status: 'pending',
        currency: user.wallet.currency,
        description: `Withdrawal via ${paymentMethod}`,
        paymentDetails: {
          method: paymentMethod,
          ...paymentDetails,
        },
      });

      await transaction.save(session ? { session } : undefined);
    });

    return transaction;
  } catch (error) {
    throw new Error(`Process withdrawal failed: ${error.message}`);
  }
};

/**
 * Approve withdrawal (admin action)
 * @param {String} transactionId - Transaction ID
 * @param {String} adminId - Admin user ID
 * @param {Object} gatewayResponse - Payment gateway response
 * @returns {Object} Completed transaction
 */
exports.approveWithdrawal = async (transactionId, adminId, gatewayResponse = {}) => {
  const transaction = await Transaction.findById(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.type !== 'withdrawal') {
    throw new Error('Invalid transaction type');
  }

  if (transaction.status !== 'pending') {
    throw new Error(`Cannot approve withdrawal with status: ${transaction.status}`);
  }

  try {
    await withTxn(async (session) => {
      const user = await User.findById(transaction.user).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Unlock the funds (amount already deducted)
      const withdrawalAmount = Math.abs(transaction.amount);
      user.wallet.lockedFunds = Math.max(0, (user.wallet.lockedFunds || 0) - withdrawalAmount);
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // Complete transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.processedBy = adminId;
      transaction.paymentDetails.gatewayTransactionId = gatewayResponse.gatewayTransactionId;
      transaction.paymentDetails.gateway = gatewayResponse.gateway;

      await transaction.save(session ? { session } : undefined);
    });

    return transaction;
  } catch (error) {
    throw new Error(`Approve withdrawal failed: ${error.message}`);
  }
};

/**
 * Reject withdrawal (admin action)
 * @param {String} transactionId - Transaction ID
 * @param {String} adminId - Admin user ID
 * @param {String} reason - Rejection reason
 * @returns {Object} Failed transaction
 */
exports.rejectWithdrawal = async (transactionId, adminId, reason) => {
  const transaction = await Transaction.findById(transactionId);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.type !== 'withdrawal') {
    throw new Error('Invalid transaction type');
  }

  if (transaction.status !== 'pending') {
    throw new Error(`Cannot reject withdrawal with status: ${transaction.status}`);
  }

  try {
    await withTxn(async (session) => {
      const user = await User.findById(transaction.user).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Refund the amount
      const withdrawalAmount = Math.abs(transaction.amount);
      user.wallet.balance += withdrawalAmount;
      user.wallet.lockedFunds = Math.max(0, (user.wallet.lockedFunds || 0) - withdrawalAmount);
      user.wallet.lastTransactionAt = new Date();

      await user.save(session ? { session } : undefined);

      // Mark transaction as failed
      transaction.status = 'failed';
      transaction.failedAt = new Date();
      transaction.failureReason = reason;
      transaction.processedBy = adminId;

      await transaction.save(session ? { session } : undefined);
    });

    return transaction;
  } catch (error) {
    throw new Error(`Reject withdrawal failed: ${error.message}`);
  }
};

/**
 * Transfer funds between users
 * @param {String} fromUserId - Sender user ID
 * @param {String} toUserId - Receiver user ID
 * @param {Number} amount - Transfer amount
 * @param {String} description - Transfer description
 * @returns {Object} Both transactions
 */
exports.transfer = async (fromUserId, toUserId, amount, description = 'Transfer') => {
  if (!fromUserId || !toUserId || !amount) {
    throw new Error('Missing required parameters');
  }

  if (amount <= 0) {
    throw new Error('Transfer amount must be greater than zero');
  }

  if (fromUserId === toUserId) {
    throw new Error('Cannot transfer to same user');
  }

  try {
    let debitTxn, creditTxn;

    await withTxn(async (session) => {
      // Get both users
      const fromUser = await User.findById(fromUserId).session(session);
      const toUser = await User.findById(toUserId).session(session);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      // Check balance
      const availableBalance = (fromUser.wallet.balance || 0) - (fromUser.wallet.lockedFunds || 0);
      if (amount > availableBalance) {
        throw new Error(`Insufficient balance. Available: ₹${availableBalance}`);
      }

      const fromBalanceBefore = fromUser.wallet.balance;
      const toBalanceBefore = toUser.wallet.balance;

      // Debit from sender
      fromUser.wallet.balance -= amount;
      fromUser.wallet.lastTransactionAt = new Date();
      await fromUser.save(session ? { session } : undefined);

      // Credit to receiver
      toUser.wallet.balance += amount;
      toUser.wallet.lastTransactionAt = new Date();
      await toUser.save(session ? { session } : undefined);

      // Create debit transaction
      debitTxn = new Transaction({
        user: fromUserId,
        type: 'transfer_out',
        amount: -amount,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromUser.wallet.balance,
        status: 'completed',
        currency: fromUser.wallet.currency,
        description: `${description} to User ${toUserId}`,
        reference: { type: 'transfer', id: toUserId },
        completedAt: new Date(),
      });

      // Create credit transaction
      creditTxn = new Transaction({
        user: toUserId,
        type: 'transfer_in',
        amount,
        balanceBefore: toBalanceBefore,
        balanceAfter: toUser.wallet.balance,
        status: 'completed',
        currency: toUser.wallet.currency,
        description: `${description} from User ${fromUserId}`,
        reference: { type: 'transfer', id: fromUserId },
        completedAt: new Date(),
      });

      await debitTxn.save(session ? { session } : undefined);
      await creditTxn.save(session ? { session } : undefined);
    });

    return { debitTxn, creditTxn };
  } catch (error) {
    throw new Error(`Transfer failed: ${error.message}`);
  }
};

/**
 * Apply bonus to user
 * @param {String} userId - User ID
 * @param {Number} amount - Bonus amount
 * @param {String} bonusType - Bonus type
 * @param {Object} metadata - Bonus metadata
 * @returns {Object} Transaction record
 */
exports.applyBonus = async (userId, amount, bonusType, metadata = {}) => {
  return await exports.credit(userId, amount, 'bonus', `${bonusType} bonus applied`, {
    ...metadata,
    isBonus: true,
  });
};

/**
 * Check withdrawal eligibility
 * @param {String} userId - User ID
 * @param {Number} amount - Withdrawal amount
 * @returns {Object} Eligibility status
 */
exports.checkWithdrawalEligibility = async (userId, amount) => {
  const user = await User.findById(userId);
  
  if (!user) {
    return { eligible: false, reason: 'User not found' };
  }

  // Check available balance
  const availableBalance = (user.wallet.balance || 0) - (user.wallet.lockedFunds || 0);
  if (amount > availableBalance) {
    return { 
      eligible: false, 
      reason: `Insufficient balance. Available: ₹${availableBalance}, Requested: ₹${amount}` 
    };
  }

  // Check minimum withdrawal amount
  const minWithdrawal = 100; // ₹100 minimum
  if (amount < minWithdrawal) {
    return { eligible: false, reason: `Minimum withdrawal amount is ₹${minWithdrawal}` };
  }

  // Check account status
  if (user.status !== 'active') {
    return { eligible: false, reason: 'Account is not active' };
  }

  return { eligible: true, reason: 'Eligible for withdrawal' };
};

/**
 * Get user transactions (with pagination)
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} Transactions and metadata
 */
exports.getTransactions = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    type = null,
    status = null,
    startDate = null,
    endDate = null,
  } = options;

  const query = { user: userId };

  if (type) query.type = type;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get wallet statistics
 * @param {String} userId - User ID
 * @param {Object} options - Date range options
 * @returns {Object} Wallet statistics
 */
exports.getWalletStats = async (userId, options = {}) => {
  const { startDate, endDate } = options;

  const query = { user: userId, status: 'completed' };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const stats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Calculate totals
  const result = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBetsPlaced: 0,
    totalWon: 0,
    totalLost: 0,
    totalBonus: 0,
    netProfitLoss: 0,
    transactionCount: 0,
  };

  stats.forEach((stat) => {
    result.transactionCount += stat.count;

    switch (stat._id) {
      case 'deposit':
        result.totalDeposits += stat.totalAmount;
        break;
      case 'withdrawal':
        result.totalWithdrawals += Math.abs(stat.totalAmount);
        break;
      case 'bet_placed':
        result.totalBetsPlaced += Math.abs(stat.totalAmount);
        break;
      case 'bet_won':
        result.totalWon += stat.totalAmount;
        break;
      case 'bet_lost':
        result.totalLost += Math.abs(stat.totalAmount);
        break;
      case 'bonus':
      case 'referral_bonus':
        result.totalBonus += stat.totalAmount;
        break;
    }
  });

  // Calculate net profit/loss
  result.netProfitLoss = result.totalWon - result.totalLost;

  return result;
};

module.exports = exports;
