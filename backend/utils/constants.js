/**
 * Constants
 * Application-wide constants
 */

// Bet Types
exports.BET_TYPES = {
  BACK: 'back',
  LAY: 'lay',
};

// Bet Status
exports.BET_STATUS = {
  PENDING: 'pending',
  UNMATCHED: 'unmatched',
  PARTIALLY_MATCHED: 'partially_matched',
  MATCHED: 'matched',
  SETTLED: 'settled',
  VOID: 'void',
  CANCELLED: 'cancelled',
};

// Bet Results
exports.BET_RESULTS = {
  WON: 'won',
  LOST: 'lost',
  VOID: 'void',
  HALF_WON: 'half_won',
  HALF_LOST: 'half_lost',
};

// Market Status
exports.MARKET_STATUS = {
  OPEN: 'open',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
  SETTLED: 'settled',
  VOID: 'void',
};

// Market Types
exports.MARKET_TYPES = {
  MATCH_ODDS: 'match_odds',
  BOOKMAKER: 'bookmaker',
  FANCY: 'fancy',
  SESSION: 'session',
  TOSS: 'toss',
};

// Transaction Types
exports.TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET_PLACED: 'bet_placed',
  BET_WON: 'bet_won',
  BET_LOST: 'bet_lost',
  BET_VOID: 'bet_void',
  BONUS: 'bonus',
  REFERRAL_BONUS: 'referral_bonus',
  COMMISSION: 'commission',
  ADJUSTMENT: 'adjustment',
};

// Transaction Status
exports.TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REVERSED: 'reversed',
};

// User Roles
exports.USER_ROLES = {
  USER: 'user',
  VIP: 'vip',
  AFFILIATE: 'affiliate',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

// User Status
exports.USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
};

// KYC Status
exports.KYC_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// KYC Levels
exports.KYC_LEVELS = {
  NONE: 'none',
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  FULL: 'full',
};

// Payment Methods
exports.PAYMENT_METHODS = {
  UPI: 'upi',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  WALLET: 'wallet',
  CRYPTO: 'crypto',
};

// Sports
exports.SPORTS = {
  CRICKET: '4',
  FOOTBALL: '1',
  TENNIS: '2',
  HORSE_RACING: '7',
};

// Casino Game Categories
exports.CASINO_CATEGORIES = {
  SLOTS: 'slots',
  TABLE: 'table',
  LIVE: 'live',
  CRASH: 'crash',
  FISHING: 'fishing',
  ARCADE: 'arcade',
};

// Promotion Types
exports.PROMOTION_TYPES = {
  WELCOME_BONUS: 'welcome_bonus',
  DEPOSIT_BONUS: 'deposit_bonus',
  FREE_BET: 'free_bet',
  CASHBACK: 'cashback',
  RELOAD_BONUS: 'reload_bonus',
};

// Limits
exports.LIMITS = {
  MIN_DEPOSIT: 100,
  MAX_DEPOSIT: 1000000,
  MIN_WITHDRAWAL: 500,
  MAX_WITHDRAWAL: 500000,
  MIN_BET: 10,
  MAX_BET: 100000,
  MIN_ODDS: 1.01,
  MAX_ODDS: 1000,
};

// Commission Rates
exports.COMMISSION_RATES = {
  SPORTS: 2, // 2%
  CASINO: 0, // 0%
  EXCHANGE: 2, // 2%
};

// Timeouts
exports.TIMEOUTS = {
  OTP_EXPIRY: 300, // 5 minutes
  PASSWORD_RESET_EXPIRY: 3600, // 1 hour
  SESSION_EXPIRY: 86400, // 24 hours
};

// Regex Patterns
exports.PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
};

// Error Codes
exports.ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  KYC_REQUIRED: 'KYC_REQUIRED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  MARKET_CLOSED: 'MARKET_CLOSED',
  BET_NOT_ALLOWED: 'BET_NOT_ALLOWED',
};
