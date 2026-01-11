const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getGames: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getGameById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  getGamesByCategory: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getGamesByProvider: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  launchGame: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { gameUrl: '' } });
  }),
  launchDemo: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { gameUrl: '' } });
  }),
  getSessions: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getSessionById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  endSession: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Session ended' });
  }),
  getPopularGames: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getFeaturedGames: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getNewGames: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
};
