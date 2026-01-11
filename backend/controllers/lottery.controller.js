const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getDraws: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getDrawById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  getActiveDraws: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getUpcomingDraws: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  buyTicket: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, message: 'Ticket purchased' });
  }),
  getMyTickets: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getTicketById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  getResults: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getDrawWinners: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
};
