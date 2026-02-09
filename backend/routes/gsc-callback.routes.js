/**
 * GSC+ Callback Routes
 * Endpoints that GSC+ platform calls on our server
 * 
 * These routes must:
 * 1. NOT require JWT authentication (GSC+ uses signature-based auth)
 * 2. Use GSC+ signature verification middleware
 * 3. Return responses in GSC+ expected format
 * 4. Be fast and reliable
 */

const express = require('express');
const router = express.Router();
const gscCallbackController = require('../controllers/gsc-callback.controller');
const { verifyGscSignature } = require('../middleware/gsc.middleware');

// ============================================================
// Seamless Wallet Callback Endpoints
// These are called by GSC+ game providers
// ============================================================

/**
 * 2.1 Balance Callback
 * @route POST /v1/api/seamless/balance
 * @desc GSC+ checks player balance before/during game
 * @access GSC+ Platform (signature verified)
 */
router.post(
  '/balance',
  verifyGscSignature('balance'),
  gscCallbackController.handleBalance
);

/**
 * 2.2 Withdraw Callback
 * @route POST /v1/api/seamless/withdraw
 * @desc GSC+ deducts from player wallet (bets, tips)
 * @access GSC+ Platform (signature verified)
 */
router.post(
  '/withdraw',
  verifyGscSignature('withdraw'),
  gscCallbackController.handleWithdraw
);

/**
 * 2.3 Deposit Callback
 * @route POST /v1/api/seamless/deposit
 * @desc GSC+ credits to player wallet (wins, bonuses)
 * @access GSC+ Platform (signature verified)
 */
router.post(
  '/deposit',
  verifyGscSignature('deposit'),
  gscCallbackController.handleDeposit
);

/**
 * 2.4 Push Bet Data Callback
 * @route POST /v1/api/seamless/pushbetdata
 * @desc GSC+ syncs bet data and status (no balance changes)
 * @access GSC+ Platform (signature verified)
 */
router.post(
  '/pushbetdata',
  verifyGscSignature('pushBetData'),
  gscCallbackController.handlePushBetData
);

module.exports = router;
