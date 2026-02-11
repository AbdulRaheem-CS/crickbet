/**
 * GSC+ Middleware
 * Signature verification for incoming callbacks from GSC+
 */

const { verifyCallbackSignature } = require('../utils/gsc-signature');
const gscConfig = require('../config/gsc');

/**
 * Verify GSC+ callback signature
 * Creates middleware for a specific callback action
 * @param {string} action - Callback action (balance, withdraw, deposit, pushBetData)
 * @returns {Function} Express middleware
 */
const verifyGscSignature = (action) => {
  return (req, res, next) => {
    try {
      console.log(`[GSC-MW] Incoming Callback: ${action}`);
      console.log(`[GSC-MW] Body:`, JSON.stringify(req.body, null, 2));

      const { operator_code, request_time, sign } = req.body;

      // Validate required fields
      if (!operator_code || !request_time || !sign) {
        console.error(`[GSC+ Callback] Missing signature fields for ${action}`);
        return res.json({
          data: [{
            code: gscConfig.responseCodes.INVALID_SIGNATURE,
            message: 'Missing signature fields',
          }],
        });
      }

      // Verify operator code matches
      if (operator_code !== gscConfig.operatorCode) {
        console.error(`[GSC+ Callback] Invalid operator code: ${operator_code}`);
        return res.json({
          data: [{
            code: gscConfig.responseCodes.PROXY_KEY_ERROR,
            message: 'Invalid operator code',
          }],
        });
      }

      // Verify signature
      const isValid = verifyCallbackSignature(action, operator_code, request_time, sign);

      if (!isValid) {
        console.error(`[GSC+ Callback] Invalid signature for ${action}`);
        console.error(`[GSC+ Callback] Received sign: ${sign}`);
        return res.json({
          data: [{
            code: gscConfig.responseCodes.INVALID_SIGNATURE,
            message: 'Invalid signature',
          }],
        });
      }

      // Signature valid, proceed
      next();
    } catch (error) {
      console.error(`[GSC+ Callback] Signature verification error:`, error);
      return res.json({
        data: [{
          code: gscConfig.responseCodes.INTERNAL_ERROR,
          message: 'Internal server error during signature verification',
        }],
      });
    }
  };
};

module.exports = {
  verifyGscSignature,
};
