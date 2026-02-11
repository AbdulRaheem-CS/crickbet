/**
 * GSC+ Platform Configuration
 * Centralized configuration for GSC+ Seamless Wallet API integration
 */

const gscConfig = {
  // Operator credentials
  operatorCode: process.env.GSC_OPERATOR_CODE || 'Q2R1',
  secretKey: process.env.GSC_SECRET_KEY || 'jv6yLcNgjDfeHwtC6hxkLf',
  operatorUrl: process.env.GSC_OPERATOR_URL || 'https://staging.gsimw.com',
  callbackBaseUrl: process.env.GSC_CALLBACK_BASE_URL || 'http://localhost:5001',
  environment: process.env.GSC_ENVIRONMENT || 'staging',

  // Default settings
  defaultCurrency: process.env.GSC_DEFAULT_CURRENCY || 'USD',
  defaultLanguage: parseInt(process.env.GSC_DEFAULT_LANGUAGE || '0', 10), // 0 = English

  // Callback endpoints (GSC+ calls these on our server)
  callbackPaths: {
    balance: '/v1/api/seamless/balance',
    withdraw: '/v1/api/seamless/withdraw',
    deposit: '/v1/api/seamless/deposit',
    pushBetData: '/v1/api/seamless/pushbetdata',
  },

  // Operator API endpoints (We call these on GSC+)
  operatorPaths: {
    launchGame: '/api/operators/launch-game',
    wagerList: '/api/operators/wagers',
    wager: '/api/operators/wagers', // + /:id or /:code
    gameList: '/api/operators/provider-games',
    gameHistory: '/api/operators', // + /:wager_code/game-history
    productList: '/api/operators/available-products',
    superLobby: '/superlobby/launch',
    createFreeRound: '/api/operators/create-free-round',
    cancelFreeRound: '/api/operators/cancel-free-round',
    getPlayerFRB: '/api/operators/get-player-frb',
    getBetScales: '/api/operators/get-bet-scales',
    walletBalance: '/api/operators/wallet-balance',
  },

  // Signature actions (used in MD5 signature generation)
  signatureActions: {
    balance: 'getbalance',
    withdraw: 'withdraw',
    deposit: 'deposit',
    pushBetData: 'pushbetdata',
    launchGame: 'launchgame',
    getWagers: 'getwagers',
    getWager: 'getwager',
    gameList: 'gamelist',
    gameHistory: 'gamehistory',
    productList: 'productlist',
    superLobby: 'launchsuperlobby',
    createFreeRound: 'createfreeround',
    cancelFreeRound: 'cancelfreeround',
    getPlayerFRB: 'getplayersfrb',
    getBetScales: 'getbetscales',
    walletBalance: 'getwalletcurrencies',
  },

  // Seamless wallet response codes
  responseCodes: {
    SUCCESS: 0,
    INTERNAL_ERROR: 999,
    MEMBER_NOT_FOUND: 1000,
    INSUFFICIENT_BALANCE: 1001,
    PROXY_KEY_ERROR: 1002,
    DUPLICATE_TRANSACTION: 1003,
    INVALID_SIGNATURE: 1004,
    GAME_LIST_ERROR: 1005,
    BET_NOT_FOUND: 1006,
    PRODUCT_MAINTENANCE: 2000,
  },

  // Operator response codes
  operatorCodes: {
    SUCCESS: 200,
    INTERNAL_ERROR: 999,
    INVALID_PARAMETER: 10002,
  },

  // Game types
  gameTypes: {
    SLOT: 'SLOT',
    LIVE_CASINO: 'LIVE_CASINO',
    SPORT_BOOK: 'SPORT_BOOK',
    VIRTUAL_SPORT: 'VIRTUAL_SPORT',
    LOTTERY: 'LOTTERY',
    QIPAI: 'QIPAI',
    P2P: 'P2P',
    FISHING: 'FISHING',
    COCK_FIGHTING: 'COCK_FIGHTING',
    BONUS: 'BONUS',
    ESPORT: 'ESPORT',
    POKER: 'POKER',
    OTHERS: 'OTHERS',
    LIVE_CASINO_PREMIUM: 'LIVE_CASINO_PREMIUM',
  },

  // Map GSC game types to our internal categories
  gameTypeToCategory: {
    SLOT: 'slots',
    LIVE_CASINO: 'live',
    LIVE_CASINO_PREMIUM: 'live',
    SPORT_BOOK: 'sports',
    VIRTUAL_SPORT: 'sports',
    FISHING: 'fishing',
    POKER: 'crash', // Includes Aviator, Dice etc.
    LOTTERY: 'lottery',
    ESPORT: 'sports',
    P2P: 'table',
    QIPAI: 'table',
    OTHERS: 'arcade',
    BONUS: 'other',
    COCK_FIGHTING: 'other',
  },

  // Platform types
  platforms: {
    WEB: 'WEB',
    DESKTOP: 'DESKTOP',
    MOBILE: 'MOBILE',
  },

  // Transaction action types
  transactionActions: {
    // Withdraw (deduct from player)
    BET: 'BET',
    TIP: 'TIP',
    BET_PRESERVE: 'BET_PRESERVE',

    // Deposit (add to player)
    SETTLED: 'SETTLED',
    JACKPOT: 'JACKPOT',
    BONUS: 'BONUS',
    FREEBET: 'FREEBET',
    PROMO: 'PROMO',
    LEADERBOARD: 'LEADERBOARD',
    PRESERVE_REFUND: 'PRESERVE_REFUND',

    // Can be either direction
    ROLLBACK: 'ROLLBACK',
    CANCEL: 'CANCEL',
    ADJUSTMENT: 'ADJUSTMENT',
  },

  // Wager statuses
  wagerStatuses: {
    BET: 'BET',
    BONUS: 'BONUS',
    SETTLED: 'SETTLED',
    RESETTLED: 'RESETTLED',
    VOID: 'VOID',
  },

  // Language codes
  languageCodes: {
    en: 0,
    zh_tw: 1,
    zh_cn: 2,
    th: 3,
    id: 4,
    ja: 5,
    ko: 6,
    vi: 7,
    de: 8,
    es: 9,
    fr: 10,
    ru: 11,
    pt: 12,
    my: 13,
    hi: 39,
  },

  // WBET special product code (winnings handled differently)
  WBET_PRODUCT_CODE: 1040,

  // Currency ratios that need conversion
  currencyRatios: {
    IDR2: 1000,
    VND2: 1000,
    KRW2: 1000,
    MMK2: 1000,
    KHR2: 1000,
    JPY2: 1000,
    INR2: 1000,
    PKR2: 1000,
    BDT2: 1000,
    // Add more as needed
  },
};

module.exports = gscConfig;
