/**
 * GSC+ Service
 * Outbound API client for calling GSC+ Operator APIs
 * 
 * These are APIs WE call on the GSC+ platform to:
 * - Launch games for players
 * - Get game lists & product lists
 * - Query wager/bet history
 * - Manage free rounds
 * - Launch Super Lobby
 * - Check wallet balance
 */

const gscConfig = require('../config/gsc');
const { generateOutboundSignature, getTimestamp, buildSignedParams, md5 } = require('../utils/gsc-signature');

const BASE_URL = gscConfig.operatorUrl;

// Cache for product → currency mapping from available-products API
let _productCurrencyCache = null;
let _productCurrencyCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get the operator-assigned currency for a given product_code + game_type
 * GSC+ assigns a specific currency per product per operator.
 * This MUST be used when launching games instead of the game's supportCurrency field.
 * @param {number} productCode 
 * @param {string} gameType 
 * @returns {string} Currency code (e.g., 'IDR', 'IDR2', 'CNY', 'VND')
 */
exports.getProductCurrency = async (productCode, gameType) => {
  const now = Date.now();
  
  // Refresh cache if expired or not loaded
  if (!_productCurrencyCache || (now - _productCurrencyCacheTime) > CACHE_TTL) {
    try {
      const params = buildSignedParams('productList', {});
      const url = `${BASE_URL}${gscConfig.operatorPaths.productList}?${new URLSearchParams(params).toString()}`;
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      const products = await response.json();

      if (Array.isArray(products)) {
        _productCurrencyCache = {};
        for (const p of products) {
          if (p.status === 'ACTIVATED') {
            // Key by productCode + gameType for specificity
            const key = `${p.product_code}_${p.game_type}`;
            _productCurrencyCache[key] = p.currency;
            // Also store by productCode alone as fallback
            if (!_productCurrencyCache[`${p.product_code}`]) {
              _productCurrencyCache[`${p.product_code}`] = p.currency;
            }
          }
        }
        _productCurrencyCacheTime = now;
        console.log(`[GSC+] Product currency cache refreshed: ${Object.keys(_productCurrencyCache).length} entries`);
      }
    } catch (error) {
      console.error('[GSC+] Failed to refresh product currency cache:', error.message);
    }
  }

  if (_productCurrencyCache) {
    // Try specific key first (productCode + gameType), then fallback to productCode only
    const specificKey = `${productCode}_${gameType}`;
    if (_productCurrencyCache[specificKey]) {
      return _productCurrencyCache[specificKey];
    }
    const fallbackKey = `${productCode}`;
    if (_productCurrencyCache[fallbackKey]) {
      return _productCurrencyCache[fallbackKey];
    }
  }

  // Ultimate fallback
  return gscConfig.defaultCurrency;
};

/**
 * Make HTTP request to GSC+ API
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} data - Request body or query params
 * @returns {Object} Response data
 */
const makeRequest = async (method, path, data = {}) => {
  const url = method === 'GET'
    ? `${BASE_URL}${path}?${new URLSearchParams(data).toString()}`
    : `${BASE_URL}${path}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (method === 'POST') {
    options.body = JSON.stringify(data);
  }

  console.log(`[GSC+] ${method} ${url}`);

  try {
    const response = await fetch(url, options);
    
    // Handle non-JSON responses (some providers return HTML on errors)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`GSC+ returned non-JSON response (HTTP ${response.status})`);
      }
      // Try to parse as JSON anyway (some APIs don't set content-type correctly)
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`GSC+ returned non-JSON response (HTTP ${response.status})`);
      }
    }

    const result = await response.json();

    // GSC+ returns PascalCase keys (Code, Message, URL, Content) for some endpoints
    // Normalize to lowercase for consistent access
    const code = result.Code ?? result.code;
    const message = result.Message ?? result.message;

    if (code && code !== 200 && code !== 0) {
      console.error(`[GSC+] API Error:`, result);
      throw new Error(`GSC+ API Error: ${message || 'Unknown error'} (code: ${code})`);
    }

    // Normalize response keys to lowercase for consistent usage
    if (result.Code !== undefined || result.URL !== undefined || result.Content !== undefined) {
      return {
        ...result,
        code: result.Code ?? result.code,
        message: result.Message ?? result.message,
        url: result.URL ?? result.url,
        content: result.Content ?? result.content,
      };
    }

    return result;
  } catch (error) {
    console.error(`[GSC+] Request failed:`, error.message);
    throw error;
  }
};


// ============================================================
// 3.1 Launch Game
// ============================================================

/**
 * Launch a game for a player
 * POST {{operator_url}}/api/operators/launch-game
 * 
 * @param {Object} params
 * @param {string} params.memberAccount - Player's unique identifier (max 50 chars) [Must]
 * @param {string} params.password - Player's password for identity verification [Must]
 * @param {string} params.nickname - Display name in game [Optional]
 * @param {string} params.currency - Currency code supported by the provider [Must]
 * @param {string} params.gameCode - Unique game identifier from game list API [Optional, depends on provider]
 * @param {number} params.productCode - Product code identifier [Must]
 * @param {string} params.gameType - Game type (SLOT, LIVE_CASINO, etc.) [Must]
 * @param {string} params.ip - Player's IP address [Must]
 * @param {string} params.platform - WEB, DESKTOP, MOBILE, or Widget [Must]
 * @param {string} params.lobbyUrl - Client site URL (operator_lobby_url) [Must]
 * @param {string} params.languageCode - Language code, default "0" [Optional]
 * @param {string} params.widgetId - SABA Sports Quick Bet Widget ID [Optional]
 * @param {boolean} params.isWidgetLogin - SABA Sports Widget login status [Optional]
 * @returns {Object} { code, message, url, content }
 */
exports.launchGame = async ({
  memberAccount,
  password,
  nickname,
  currency,
  gameCode = null,
  productCode,
  gameType,
  ip = '127.0.0.1',
  platform = 'WEB',
  lobbyUrl = '',
  languageCode = String(gscConfig.defaultLanguage),
  widgetId = null,
  isWidgetLogin = null,
}) => {
  const requestTime = getTimestamp();
  const sign = generateOutboundSignature('launchGame', requestTime);

  const body = {
    operator_code: gscConfig.operatorCode,
    member_account: memberAccount,
    password: password,
    nickname: nickname || memberAccount,
    currency: currency || gscConfig.defaultCurrency,
    product_code: productCode,
    game_type: gameType,
    language_code: String(languageCode),
    ip: ip,
    platform: platform,
    sign: sign,
    request_time: requestTime,
    operator_lobby_url: lobbyUrl,
  };

  // game_code is optional - only include if provided (required if provider supports direct play)
  if (gameCode) {
    body.game_code = gameCode;
  }

  // SABA Sports Widget parameters (optional)
  if (widgetId) {
    body.widget_id = widgetId;
  }
  if (isWidgetLogin !== null && isWidgetLogin !== undefined) {
    body.is_widget_login = isWidgetLogin;
  }

  console.log(`[GSC+] Launch game request:`, {
    member_account: memberAccount,
    product_code: productCode,
    game_type: gameType,
    game_code: gameCode,
    currency: body.currency,
    platform,
    ip,
  });

  return makeRequest('POST', gscConfig.operatorPaths.launchGame, body);
};


// ============================================================
// 3.2 Wager List
// ============================================================

/**
 * Get list of wagers within a time range
 * @param {Object} params
 * @param {number} params.start - Start time (timestamp milliseconds)
 * @param {number} params.end - End time (timestamp milliseconds, ≤ 5 min range)
 * @param {number} params.offset - Starting record number
 * @param {number} params.size - Number of records (default 5000)
 * @returns {Object} { wagers, pagination }
 */
exports.getWagerList = async ({ start, end, offset = 0, size = 5000 }) => {
  const params = buildSignedParams('getWagers', { start, end, offset, size });
  return makeRequest('GET', gscConfig.operatorPaths.wagerList, params);
};


// ============================================================
// 3.3 Get Single Wager
// ============================================================

/**
 * Get a single wager by ID or code
 * @param {string} idOrCode - Wager ID or code
 * @returns {Object} { wager }
 */
exports.getWager = async (idOrCode) => {
  const params = buildSignedParams('getWager');
  return makeRequest('GET', `${gscConfig.operatorPaths.wager}/${idOrCode}`, params);
};


// ============================================================
// 3.4 Game List
// ============================================================

/**
 * Get all games for a specific product
 * @param {Object} params
 * @param {number} params.productCode - Product code
 * @param {string} params.gameType - Optional game type filter
 * @param {number} params.offset - Starting record
 * @param {number} params.size - Number of records
 * @returns {Object} { code, message, provider_games, pagination }
 */
exports.getGameList = async ({ productCode, gameType, offset = 0, size }) => {
  const additionalParams = { product_code: productCode };
  if (gameType) additionalParams.game_type = gameType;
  if (offset) additionalParams.offset = offset;
  if (size) additionalParams.size = size;

  const params = buildSignedParams('gameList', additionalParams);
  return makeRequest('GET', gscConfig.operatorPaths.gameList, params);
};


// ============================================================
// 3.5 Game History
// ============================================================

/**
 * Get game history/replay URL for a wager
 * @param {string} wagerCode - Wager code
 * @returns {Object} { content } - URL or HTML content
 */
exports.getGameHistory = async (wagerCode) => {
  const params = buildSignedParams('gameHistory');
  return makeRequest('GET', `${gscConfig.operatorPaths.gameHistory}/${wagerCode}/game-history`, params);
};


// ============================================================
// 3.6 Product List
// ============================================================

/**
 * Get all available products/providers
 * @param {Object} params
 * @param {number} params.offset - Starting record
 * @param {number} params.size - Number of records
 * @returns {Array} List of products
 */
exports.getProductList = async ({ offset = 0, size } = {}) => {
  const additionalParams = {};
  if (offset) additionalParams.offset = offset;
  if (size) additionalParams.size = size;

  const params = buildSignedParams('productList', additionalParams);
  return makeRequest('GET', gscConfig.operatorPaths.productList, params);
};


// ============================================================
// 3.7 Super Lobby
// ============================================================

/**
 * Launch the Super Lobby for a player
 * @param {Object} params
 * @param {string} params.memberAccount - Player username
 * @param {string} params.nickname - Display name
 * @param {string} params.currency - Currency code
 * @param {string} params.platform - WEB, DESKTOP, MOBILE
 * @param {number} params.type - 0 = Super Lobby, 1 = Aurora Live
 * @param {string} params.lobbyUrl - Client site URL
 * @returns {Object} { url }
 */
exports.launchSuperLobby = async ({
  memberAccount,
  nickname,
  currency,
  platform = 'WEB',
  type = 0,
  lobbyUrl = '',
  languageCode = gscConfig.defaultLanguage,
}) => {
  const requestTime = getTimestamp();
  const sign = generateOutboundSignature('superLobby', requestTime);

  const body = {
    operator_code: gscConfig.operatorCode,
    member_account: memberAccount,
    nickname: nickname || memberAccount,
    currency: currency || gscConfig.defaultCurrency,
    language_code: languageCode,
    platform,
    sign,
    request_time: requestTime,
    type,
    operator_lobby_url: lobbyUrl,
  };

  return makeRequest('POST', gscConfig.operatorPaths.superLobby, body);
};


// ============================================================
// 3.8 Create Free Round
// ============================================================

/**
 * Create a free round bonus for a player
 * @param {Object} params
 * @returns {Object} { bonus_code }
 */
exports.createFreeRound = async ({
  memberAccount,
  currency,
  productCode,
  gameType,
  startAt,
  endAt,
  rounds,
  gameList,
  channelCode = 'gscp',
}) => {
  const requestTime = getTimestamp();
  const sign = generateOutboundSignature('createFreeRound', requestTime);

  const body = {
    operator_code: gscConfig.operatorCode,
    member_account: memberAccount,
    currency: currency || gscConfig.defaultCurrency,
    product_code: productCode,
    game_type: gameType,
    start_at: startAt,
    end_at: endAt,
    rounds,
    game_list: gameList,
    request_time: requestTime,
    channel_code: channelCode,
    sign,
  };

  return makeRequest('POST', gscConfig.operatorPaths.createFreeRound, body);
};


// ============================================================
// 3.9 Cancel Free Round
// ============================================================

/**
 * Cancel a previously created free round
 * @param {Object} params
 * @returns {Object} { bonus_code }
 */
exports.cancelFreeRound = async ({
  currency,
  productCode,
  gameType,
  bonusCode,
  channelCode = 'gscp',
}) => {
  const requestTime = getTimestamp();
  const sign = generateOutboundSignature('cancelFreeRound', requestTime);

  const body = {
    operator_code: gscConfig.operatorCode,
    currency: currency || gscConfig.defaultCurrency,
    product_code: productCode,
    game_type: gameType,
    bonus_code: bonusCode,
    request_time: requestTime,
    channel_code: channelCode,
    sign,
  };

  return makeRequest('POST', gscConfig.operatorPaths.cancelFreeRound, body);
};


// ============================================================
// 3.10 Get Player Free Round Bonus
// ============================================================

/**
 * Get player's free round bonus information
 * @param {Object} params
 * @returns {Object} { bonuses }
 */
exports.getPlayerFRB = async ({
  memberAccount,
  currency,
  productCode,
  gameType,
  channelCode = 'gscp',
}) => {
  const additionalParams = {
    member_account: memberAccount,
    currency: currency || gscConfig.defaultCurrency,
    product_code: productCode,
    game_type: gameType,
    channel_code: channelCode,
  };

  const params = buildSignedParams('getPlayerFRB', additionalParams);
  return makeRequest('GET', gscConfig.operatorPaths.getPlayerFRB, params);
};


// ============================================================
// 3.11 Get Game Bet Scales
// ============================================================

/**
 * Get bet scale configurations for games
 * @param {Object} params
 * @param {string} params.currency - Currency code
 * @param {number} params.productCode - Product code
 * @param {string} params.gameType - Game type
 * @param {string} params.betGameList - Comma-separated game IDs (max 50)
 * @returns {Object} { betScales }
 */
exports.getBetScales = async ({
  currency,
  productCode,
  gameType,
  betGameList,
  channelCode = 'gscp',
}) => {
  const additionalParams = {
    currency: currency || gscConfig.defaultCurrency,
    product_code: productCode,
    game_type: gameType,
    bet_game_list: betGameList,
    channel_code: channelCode,
  };

  const params = buildSignedParams('getBetScales', additionalParams);
  return makeRequest('GET', gscConfig.operatorPaths.getBetScales, params);
};


// ============================================================
// 3.12 Wallet Balance Inquiry
// ============================================================

/**
 * Get operator wallet balance per currency
 * @returns {Object} { code, message, data }
 */
exports.getWalletBalance = async () => {
  const params = buildSignedParams('walletBalance');
  return makeRequest('GET', gscConfig.operatorPaths.walletBalance, params);
};
