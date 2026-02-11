const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getSlots: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getSlotById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  playSlot: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  getPopularSlots: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getJackpotSlots: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
};
