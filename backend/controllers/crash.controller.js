const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getCurrentGame: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  placeBet: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, message: 'Bet placed' });
  }),
  cashOut: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Cashed out' });
  }),
  getHistory: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getMyBets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
};
