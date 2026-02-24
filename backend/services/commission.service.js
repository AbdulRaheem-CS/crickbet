/**
 * Commission Service
 * Calculates and pays affiliate commissions when a player's bet is settled.
 *
 * Commission model: Revenue Share (RevShare)
 *   - House earns GGR when the player LOSES (stake is kept by house)
 *   - Affiliate earns commissionRate% of that GGR
 *   - When player WINS, house has no revenue → no commission generated
 *
 * CommissionDesignation overrides per-player rate; falls back to
 * User.affiliateCommissionRate, then to 0.
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const CommissionDesignation = require('../models/CommissionDesignation');
const Transaction = require('../models/Transaction');

/**
 * Process affiliate commission after a bet is settled.
 *
 * @param {Object} bet        - Settled Bet document (populated or plain)
 * @param {String} result     - 'won' | 'lost'
 * @param {Number} stake      - Matched stake amount
 * @returns {Object|null}     - Transaction record, or null if no commission due
 */
exports.processAfterSettlement = async (bet, result, stake) => {
  try {
    // Commission only generated when player LOSES (house earns the stake)
    if (result !== 'lost') return null;
    if (!stake || stake <= 0) return null;

    const playerId = bet.user.toString ? bet.user.toString() : String(bet.user);

    // 1. Find the player and their referrer
    const player = await User.findById(playerId).select('referredBy username');
    if (!player || !player.referredBy) return null;

    const affiliateId = player.referredBy.toString();

    // 2. Determine commission rate:
    //    CommissionDesignation (per-player override) → User.affiliateCommissionRate → 0
    const designation = await CommissionDesignation.findOne({
      affiliateId,
      playerId,
      status: 'active',
    });

    let commissionRate = 0;
    if (designation) {
      commissionRate = designation.commissionRate; // stored as 0–100 percentage
    } else {
      const affiliate = await User.findById(affiliateId).select('affiliateCommissionRate');
      commissionRate = affiliate?.affiliateCommissionRate || 0;
    }

    if (commissionRate <= 0) return null;

    // 3. Calculate commission amount
    const commissionAmount = parseFloat(((stake * commissionRate) / 100).toFixed(2));
    if (commissionAmount <= 0) return null;

    // 4. Credit the affiliate's wallet and record the transaction
    const affiliate = await User.findById(affiliateId);
    if (!affiliate) return null;

    const balanceBefore = affiliate.wallet?.balance || 0;
    affiliate.wallet = affiliate.wallet || {};
    affiliate.wallet.balance = parseFloat((balanceBefore + commissionAmount).toFixed(2));
    affiliate.wallet.lastTransactionAt = new Date();
    await affiliate.save();

    // 5. Create audit transaction
    const txn = new Transaction({
      user: affiliateId,
      type: 'affiliate_commission',
      amount: commissionAmount,
      balanceBefore,
      balanceAfter: affiliate.wallet.balance,
      bonusAmount: 0,
      bonusBalanceAfter: affiliate.wallet.bonus || 0,
      status: 'completed',
      currency: affiliate.wallet.currency || 'INR',
      description: `Commission ${commissionRate}% from ${player.username} — bet ${bet.betRef || bet._id}`,
      completedAt: new Date(),
    });
    await txn.save();

    console.log(
      `💰 Commission ₹${commissionAmount} (${commissionRate}%) credited to affiliate ${affiliate.username}` +
      ` for player ${player.username} losing bet ${bet.betRef}`
    );

    return txn;
  } catch (err) {
    // Non-fatal — don't break bet settlement if commission fails
    console.error('Commission processing error (non-fatal):', err.message);
    return null;
  }
};
