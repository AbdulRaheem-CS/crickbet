const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getKYCStatus: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { status: 'not_submitted' } });
  }),
  submitKYC: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, message: 'KYC submitted successfully' });
  }),
  updateKYC: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'KYC updated' });
  }),
  uploadDocument: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Document uploaded' });
  }),
  verifyPAN: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'PAN verification initiated' });
  }),
  verifyAadhaar: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Aadhaar verification initiated' });
  }),
  verifyBankAccount: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Bank verification initiated' });
  }),
  getDocuments: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
};
