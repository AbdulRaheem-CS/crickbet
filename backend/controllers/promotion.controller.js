const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getPromotions: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getPromotionById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  claimPromotion: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Promotion claimed' });
  }),
  applyPromoCode: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Promo code applied' });
  }),
  getMyBonuses: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getBonusProgress: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  forfeitBonus: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Bonus forfeited' });
  }),
};
