const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getReferralCode: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { code: '' } });
  }),
  getReferralStats: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  getReferralEarnings: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { totalEarnings: 0 } });
  }),
  getReferredUsers: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  claimReward: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Reward claimed' });
  }),
  validateReferralCode: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { valid: false } });
  }),
};
