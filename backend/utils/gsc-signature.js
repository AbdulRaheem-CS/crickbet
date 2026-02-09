/**
 * GSC+ Signature Utility
 * MD5 signature generation and verification for GSC+ API communication
 */

const crypto = require('crypto');
const gscConfig = require('../config/gsc');

/**
 * Generate MD5 hash
 * @param {string} input - String to hash
 * @returns {string} MD5 hash hex string
 */
const md5 = (input) => {
  return crypto.createHash('md5').update(input).digest('hex');
};

/**
 * Generate signature for OUTBOUND requests (We → GSC+)
 * 
 * Operator API signature formats:
 *   launchGame:       md5(request_time + secret_key + "launchgame" + operator_code)
 *   getWagers:        md5(request_time + secret_key + "getwagers" + operator_code)
 *   getWager:         md5(request_time + secret_key + "getwager" + operator_code)
 *   gameList:         md5(request_time + secret_key + "gamelist" + operator_code)
 *   gameHistory:      md5(request_time + secret_key + "gamehistory" + operator_code)
 *   productList:      md5(request_time + secret_key + "productlist" + operator_code)
 *   superLobby:       md5(request_time + secret_key + "launchsuperlobby" + operator_code)
 *   createFreeRound:  md5(request_time + secret_key + "createfreeround" + operator_code)
 *   cancelFreeRound:  md5(request_time + secret_key + "cancelfreeround" + operator_code)
 *   getPlayerFRB:     md5(request_time + secret_key + "getplayersfrb" + operator_code)
 *   getBetScales:     md5(request_time + secret_key + "getbetscales" + operator_code)
 *   walletBalance:    md5(request_time + secret_key + "getwalletcurrencies" + operator_code)
 * 
 * @param {string} action - Signature action key from gscConfig.signatureActions
 * @param {number} requestTime - Unix timestamp in seconds
 * @returns {string} MD5 signature
 */
const generateOutboundSignature = (action, requestTime) => {
  const { operatorCode, secretKey } = gscConfig;
  const actionStr = gscConfig.signatureActions[action];

  if (!actionStr) {
    throw new Error(`Unknown signature action: ${action}`);
  }

  const input = `${requestTime}${secretKey}${actionStr}${operatorCode}`;
  return md5(input);
};

/**
 * Generate signature for INBOUND callback verification (GSC+ → Us)
 * 
 * Seamless Wallet signature formats:
 *   balance:      md5(operator_code + request_time + "getbalance" + secret_key)
 *   withdraw:     md5(operator_code + request_time + "withdraw" + secret_key)
 *   deposit:      md5(operator_code + request_time + "deposit" + secret_key)
 *   pushBetData:  md5(operator_code + request_time + "pushbetdata" + secret_key)
 * 
 * @param {string} action - Signature action key
 * @param {string} operatorCode - Operator code from request
 * @param {string} requestTime - Request timestamp from request
 * @returns {string} MD5 signature
 */
const generateCallbackSignature = (action, operatorCode, requestTime) => {
  const { secretKey } = gscConfig;
  const actionStr = gscConfig.signatureActions[action];

  if (!actionStr) {
    throw new Error(`Unknown callback signature action: ${action}`);
  }

  const input = `${operatorCode}${requestTime}${actionStr}${secretKey}`;
  return md5(input);
};

/**
 * Verify incoming callback signature from GSC+
 * @param {string} action - Callback action (balance, withdraw, deposit, pushBetData)
 * @param {string} operatorCode - Operator code from request body
 * @param {string} requestTime - Request time from request body
 * @param {string} receivedSign - Signature from request body
 * @returns {boolean} Whether signature is valid
 */
const verifyCallbackSignature = (action, operatorCode, requestTime, receivedSign) => {
  const expectedSign = generateCallbackSignature(action, operatorCode, requestTime);
  return expectedSign === receivedSign;
};

/**
 * Get current timestamp in seconds (for GSC+ API)
 * @returns {number} Unix timestamp in seconds
 */
const getTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Build signed query params for GET requests
 * @param {string} action - Signature action key
 * @param {Object} additionalParams - Extra query parameters
 * @returns {Object} Params object with sign and request_time
 */
const buildSignedParams = (action, additionalParams = {}) => {
  const requestTime = getTimestamp();
  const sign = generateOutboundSignature(action, requestTime);

  return {
    operator_code: gscConfig.operatorCode,
    sign,
    request_time: requestTime,
    ...additionalParams,
  };
};

module.exports = {
  md5,
  generateOutboundSignature,
  generateCallbackSignature,
  verifyCallbackSignature,
  getTimestamp,
  buildSignedParams,
};
