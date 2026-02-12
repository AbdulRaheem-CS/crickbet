const { asyncHandler } = require("../middleware/error.middleware");
const walletService = require("../services/wallet.service");
const Transaction = require("../models/Transaction");
const PaymentMethod = require("../models/PaymentMethod");

module.exports = {
  /**
   * Get wallet balance
   * GET /api/wallet/balance
   */
  getBalance: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const wallet = await walletService.getBalance(userId);
    
    res.status(200).json({
      success: true,
      data: wallet
    });
  }),

  /**
   * Get transactions
   * GET /api/wallet/transactions
   */
  getTransactions: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, status } = req.query;

    const result = await walletService.getTransactions(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status
    });

    res.status(200).json({
      success: true,
      data: result
    });
  }),

  /**
   * Get transaction by ID
   * GET /api/wallet/transactions/:id
   */
  getTransactionById: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      user: userId
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  }),

  /**
   * Initiate deposit
   * POST /api/wallet/deposit
   */
  initiateDeposit: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { amount, paymentMethod, method } = req.body;
    const methodId = paymentMethod || method;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!methodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Look up the payment method from DB to get its type
    const pmRecord = await PaymentMethod.findOne({ id: methodId, enabled: true });
    if (!pmRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or disabled payment method'
      });
    }

    const transaction = await walletService.processDeposit(
      userId,
      parseFloat(amount),
      pmRecord.type, // Use the DB type (e.g. 'jazzcash', 'upi', 'bank_transfer')
      {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    );

    res.status(201).json({
      success: true,
      message: 'Deposit initiated successfully',
      data: transaction
    });
  }),

  /**
   * Verify deposit (webhook or manual)
   * POST /api/wallet/deposit/verify
   */
  verifyDeposit: asyncHandler(async (req, res) => {
    const { transactionId, paymentId } = req.body;

    if (!transactionId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and Payment ID are required'
      });
    }

    const transaction = await walletService.verifyDeposit(transactionId, paymentId);

    res.status(200).json({
      success: true,
      message: 'Deposit verified successfully',
      data: transaction
    });
  }),

  /**
   * Request withdrawal
   * POST /api/wallet/withdraw
   */
  requestWithdrawal: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc) {
      return res.status(400).json({
        success: false,
        message: 'Bank details (accountNumber, ifsc, accountName) are required'
      });
    }

    const transaction = await walletService.processWithdrawal(
      userId,
      parseFloat(amount),
      bankDetails
    );

    res.status(201).json({
      success: true,
      message: 'Withdrawal requested successfully',
      data: transaction
    });
  }),

  /**
   * Get withdrawal status
   * GET /api/wallet/withdraw/:id
   */
  getWithdrawalStatus: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      user: userId,
      type: 'withdrawal'
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  }),

  /**
   * Cancel withdrawal (only pending)
   * POST /api/wallet/withdraw/:id/cancel
   */
  cancelWithdrawal: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      user: userId,
      type: 'withdrawal',
      status: 'pending'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Pending withdrawal not found'
      });
    }

    // Unlock funds
    await walletService.unlockFunds(userId, transaction.amount, 'withdrawal_cancelled');

    transaction.status = 'cancelled';
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal cancelled successfully',
      data: transaction
    });
  }),

  /**
   * Get total exposure
   * GET /api/wallet/exposure
   */
  getExposure: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const wallet = await walletService.getBalance(userId);

    res.status(200).json({
      success: true,
      data: {
        exposure: wallet.exposure || 0,
        lockedFunds: wallet.lockedFunds || 0
      }
    });
  }),

  /**
   * Get wallet statistics
   * GET /api/wallet/stats
   */
  getWalletStats: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const stats = await walletService.getWalletStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  }),

  /**
   * Get payment methods
   * GET /api/wallet/payment-methods
   */
  getPaymentMethods: asyncHandler(async (req, res) => {
    // Fetch payment methods from database
    const paymentMethods = await PaymentMethod.find({ enabled: true })
      .select('id name icon type enabled minAmount maxAmount processingTime order')
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: paymentMethods
    });
  }),

  /**
   * Payment gateway webhook
   * POST /api/wallet/webhook/payment
   */
  paymentWebhook: asyncHandler(async (req, res) => {
    // Handle payment gateway webhooks here
    // Example: Razorpay, Paytm, PhonePe webhooks
    
    const { event, data } = req.body;

    if (event === 'payment.success') {
      const { orderId, paymentId } = data;
      await walletService.verifyDeposit(orderId, paymentId);
    }

    res.status(200).json({ success: true });
  }),
};
