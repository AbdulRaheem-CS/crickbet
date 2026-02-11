/**
 * Models Index
 * Export all MongoDB models
 */

const User = require('./User');
const Bet = require('./Bet');
const Market = require('./Market');
const Transaction = require('./Transaction');
const KYC = require('./KYC');
const Referral = require('./Referral');
const Affiliate = require('./Affiliate');
const { CasinoGame, CasinoSession } = require('./Casino');
const Promotion = require('./Promotion');
const { LotteryDraw, LotteryTicket } = require('./Lottery');

module.exports = {
  User,
  Bet,
  Market,
  Transaction,
  KYC,
  Referral,
  Affiliate,
  CasinoGame,
  CasinoSession,
  Promotion,
  LotteryDraw,
  LotteryTicket,
};
