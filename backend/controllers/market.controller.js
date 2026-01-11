const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getMarkets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getMarketById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  getMarketsBySport: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getMarketsByEvent: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getMarketsByCompetition: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getLiveMarkets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getUpcomingMarkets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getFeaturedMarkets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getHotMarkets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getMarketOdds: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
};
