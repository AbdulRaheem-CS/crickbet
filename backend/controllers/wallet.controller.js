const { asyncHandler } = require("../middleware/error.middleware");

module.exports = {
  getBalance: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { balance: 0, bonus: 0, exposure: 0 } });
  }),
  getTransactions: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getTransactionById: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: null });
  }),
  initiateDeposit: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Deposit initiated', data: {} });
  }),
  verifyDeposit: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Deposit verified' });
  }),
  requestWithdrawal: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Withdrawal requested' });
  }),
  getWithdrawalStatus: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  cancelWithdrawal: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Withdrawal cancelled' });
  }),
  getExposure: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: { exposure: 0 } });
  }),
  getWalletStats: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  getPaymentMethods: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  paymentWebhook: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true });
  }),
};
