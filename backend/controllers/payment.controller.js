/**
 * Payment Controller
 * Handles payment gateway operations and webhooks
 */

const { asyncHandler } = require('../middleware/error.middleware');
const paymentService = require('../services/payment.service');

module.exports = {
  /**
   * Get available payment methods
   * GET /api/payment/methods
   */
  getPaymentMethods: asyncHandler(async (req, res) => {
    const { country = 'IN' } = req.query;

    const methods = paymentService.getAvailablePaymentMethods(country);

    res.status(200).json({
      success: true,
      data: methods,
    });
  }),

  /**
   * Initiate deposit
   * POST /api/payment/deposit
   */
  initiateDeposit: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { amount, gateway = 'razorpay', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const result = await paymentService.initiateDeposit(
      userId,
      parseFloat(amount),
      gateway,
      {
        ...metadata,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }
    );

    res.status(201).json({
      success: true,
      message: 'Deposit initiated successfully',
      data: result,
    });
  }),

  /**
   * Verify Razorpay payment
   * POST /api/payment/verify/razorpay
   */
  verifyRazorpay: asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment parameters',
      });
    }

    const result = await paymentService.verifyRazorpay(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: result,
    });
  }),

  /**
   * Razorpay webhook handler
   * POST /api/payment/webhook/razorpay
   */
  webhookRazorpay: asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    console.log('[Payment] Razorpay webhook received:', webhookBody.event);

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    // Handle different events
    const { event, payload } = webhookBody;

    try {
      switch (event) {
        case 'payment.captured':
          await paymentService.verifyRazorpay(
            payload.payment.entity.order_id,
            payload.payment.entity.id,
            '' // Signature already verified
          );
          break;

        case 'payment.failed':
          console.log('[Payment] Razorpay payment failed:', payload.payment.entity.id);
          break;

        default:
          console.log('[Payment] Unhandled Razorpay event:', event);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[Payment] Razorpay webhook error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }),

  /**
   * Paytm webhook handler
   * POST /api/payment/webhook/paytm
   */
  webhookPaytm: asyncHandler(async (req, res) => {
    console.log('[Payment] Paytm webhook received:', req.body);

    try {
      const result = await paymentService.verifyPaytm(req.body);

      res.status(200).send('RECEIVED');
    } catch (error) {
      console.error('[Payment] Paytm webhook error:', error.message);
      res.status(500).send('ERROR');
    }
  }),

  /**
   * PhonePe webhook handler
   * POST /api/payment/webhook/phonepe
   */
  webhookPhonePe: asyncHandler(async (req, res) => {
    console.log('[Payment] PhonePe webhook received:', req.body);

    try {
      const result = await paymentService.verifyPhonePe(req.body);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('[Payment] PhonePe webhook error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }),

  /**
   * EasyPaisa webhook handler
   * POST /api/payment/webhook/easypaisa
   */
  webhookEasyPaisa: asyncHandler(async (req, res) => {
    console.log('[Payment] EasyPaisa webhook received:', req.body);

    try {
      const result = await paymentService.verifyEasyPaisa(req.body);

      res.status(200).send('OK');
    } catch (error) {
      console.error('[Payment] EasyPaisa webhook error:', error.message);
      res.status(500).send('ERROR');
    }
  }),

  /**
   * JazzCash webhook handler
   * POST /api/payment/webhook/jazzcash
   */
  webhookJazzCash: asyncHandler(async (req, res) => {
    console.log('[Payment] JazzCash webhook received:', req.body);

    try {
      const result = await paymentService.verifyJazzCash(req.body);

      // JazzCash expects specific response format
      if (result.success) {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Payment Successful</title></head>
          <body>
            <h1>Payment Successful</h1>
            <p>Your payment has been processed successfully.</p>
            <script>
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL}/wallet?payment=success';
              }, 3000);
            </script>
          </body>
          </html>
        `);
      } else {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Payment Failed</title></head>
          <body>
            <h1>Payment Failed</h1>
            <p>Your payment could not be processed.</p>
            <script>
              setTimeout(() => {
                window.location.href = '${process.env.FRONTEND_URL}/wallet?payment=failed';
              }, 3000);
            </script>
          </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('[Payment] JazzCash webhook error:', error.message);
      res.status(500).send('ERROR');
    }
  }),

  /**
   * Manual deposit verification (Admin)
   * POST /api/payment/verify/manual
   */
  verifyManualDeposit: asyncHandler(async (req, res) => {
    const { transactionId, paymentReference, verified = true } = req.body;

    if (!transactionId || !paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and payment reference are required',
      });
    }

    const Transaction = require('../models/Transaction');
    const walletService = require('../services/wallet.service');

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.type !== 'deposit') {
      return res.status(400).json({
        success: false,
        message: 'Not a deposit transaction',
      });
    }

    if (verified) {
      await walletService.verifyDeposit(transactionId, paymentReference);
      
      res.status(200).json({
        success: true,
        message: 'Deposit verified and credited successfully',
      });
    } else {
      transaction.status = 'failed';
      transaction.metadata.failureReason = 'Manual verification failed';
      transaction.metadata.verifiedBy = req.user._id;
      await transaction.save();

      res.status(200).json({
        success: true,
        message: 'Deposit marked as failed',
      });
    }
  }),

  /**
   * Request withdrawal
   * POST /api/payment/withdrawal
   */
  requestWithdrawal: asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { amount, bankDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc) {
      return res.status(400).json({
        success: false,
        message: 'Complete bank details are required',
      });
    }

    const result = await paymentService.processWithdrawal(
      userId,
      parseFloat(amount),
      bankDetails
    );

    res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  }),

  /**
   * Get payment status
   * GET /api/payment/status/:transactionId
   */
  getPaymentStatus: asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const userId = req.user._id;

    const Transaction = require('../models/Transaction');

    const transaction = await Transaction.findOne({
      _id: transactionId,
      user: userId,
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId: transaction._id,
        orderId: transaction.orderId,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        gateway: transaction.metadata?.gateway,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  }),

  /**
   * Test payment gateway connection (Admin)
   * GET /api/payment/test/:gateway
   */
  testGateway: asyncHandler(async (req, res) => {
    const { gateway } = req.params;

    const gateways = {
      razorpay: !!process.env.RAZORPAY_KEY_ID,
      paytm: !!process.env.PAYTM_MERCHANT_ID,
      phonepe: !!process.env.PHONEPE_MERCHANT_ID,
      easypaisa: !!process.env.EASYPAISA_STORE_ID,
      jazzcash: !!process.env.JAZZCASH_MERCHANT_ID,
    };

    const isConfigured = gateways[gateway];

    res.status(200).json({
      success: true,
      gateway,
      configured: isConfigured,
      message: isConfigured
        ? `${gateway} is configured and ready`
        : `${gateway} is not configured. Please set environment variables.`,
    });
  }),
};
