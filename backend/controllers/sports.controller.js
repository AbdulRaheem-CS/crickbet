const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getSports: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getCompetitions: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getEventsBySport: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getEventDetails: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  getLiveEvents: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getHighlights: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
};
