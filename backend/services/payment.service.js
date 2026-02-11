/**
 * Payment Service
 * Handles payment gateway integrations and transaction processing
 */

const crypto = require('crypto');
const axios = require('axios');
const Transaction = require('../models/Transaction');
const walletService = require('./wallet.service');

class PaymentService {
  constructor() {
    // Payment gateway configurations
    this.gateways = {
      razorpay: {
        enabled: !!process.env.RAZORPAY_KEY_ID,
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
      },
      paytm: {
        enabled: !!process.env.PAYTM_MERCHANT_ID,
        merchantId: process.env.PAYTM_MERCHANT_ID,
        merchantKey: process.env.PAYTM_MERCHANT_KEY,
        website: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
        industryType: process.env.PAYTM_INDUSTRY_TYPE || 'Retail',
      },
      phonepe: {
        enabled: !!process.env.PHONEPE_MERCHANT_ID,
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        saltKey: process.env.PHONEPE_SALT_KEY,
        saltIndex: process.env.PHONEPE_SALT_INDEX || 1,
      },
      easypaisa: {
        enabled: !!process.env.EASYPAISA_STORE_ID,
        storeId: process.env.EASYPAISA_STORE_ID,
        hashKey: process.env.EASYPAISA_HASH_KEY,
      },
      jazzcash: {
        enabled: !!process.env.JAZZCASH_MERCHANT_ID,
        merchantId: process.env.JAZZCASH_MERCHANT_ID,
        password: process.env.JAZZCASH_PASSWORD,
        integritySalt: process.env.JAZZCASH_INTEGRITY_SALT,
      },
    };
  }

  /**
   * Get available payment methods
   * @param {String} country - User's country code
   * @returns {Array} Available payment methods
   */
  getAvailablePaymentMethods(country = 'IN') {
    const methods = [];

    // India - Razorpay, Paytm, PhonePe
    if (country === 'IN') {
      if (this.gateways.razorpay.enabled) {
        methods.push({
          id: 'razorpay',
          name: 'Razorpay',
          types: ['UPI', 'Cards', 'NetBanking', 'Wallets'],
          logo: 'razorpay.png',
          minAmount: 100,
          maxAmount: 200000,
          processingTime: 'Instant',
        });
      }

      if (this.gateways.paytm.enabled) {
        methods.push({
          id: 'paytm',
          name: 'Paytm',
          types: ['Paytm Wallet', 'UPI', 'Cards', 'NetBanking'],
          logo: 'paytm.png',
          minAmount: 100,
          maxAmount: 100000,
          processingTime: 'Instant',
        });
      }

      if (this.gateways.phonepe.enabled) {
        methods.push({
          id: 'phonepe',
          name: 'PhonePe',
          types: ['PhonePe UPI', 'Cards'],
          logo: 'phonepe.png',
          minAmount: 100,
          maxAmount: 100000,
          processingTime: 'Instant',
        });
      }
    }

    // Pakistan - EasyPaisa, JazzCash
    if (country === 'PK') {
      if (this.gateways.easypaisa.enabled) {
        methods.push({
          id: 'easypaisa',
          name: 'EasyPaisa',
          types: ['EasyPaisa Account', 'Mobile Account'],
          logo: 'easypaisa.png',
          minAmount: 500,
          maxAmount: 50000,
          processingTime: 'Instant',
        });
      }

      if (this.gateways.jazzcash.enabled) {
        methods.push({
          id: 'jazzcash',
          name: 'JazzCash',
          types: ['JazzCash Account', 'Mobile Wallet'],
          logo: 'jazzcash.png',
          minAmount: 500,
          maxAmount: 50000,
          processingTime: 'Instant',
        });
      }
    }

    // Manual bank transfer (available for all)
    methods.push({
      id: 'manual',
      name: 'Manual Bank Transfer',
      types: ['Bank Transfer', 'IMPS', 'NEFT', 'RTGS'],
      logo: 'bank.png',
      minAmount: 1000,
      maxAmount: 500000,
      processingTime: '1-24 hours',
      instructions: 'Transfer to provided bank account and submit transaction reference',
    });

    return methods;
  }

  /**
   * Initiate deposit via payment gateway
   * @param {String} userId - User ID
   * @param {Number} amount - Deposit amount
   * @param {String} gateway - Payment gateway (razorpay, paytm, phonepe, etc.)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Payment initiation result
   */
  async initiateDeposit(userId, amount, gateway = 'razorpay', metadata = {}) {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Check minimum amount
      const minAmount = gateway === 'manual' ? 1000 : 100;
      if (amount < minAmount) {
        throw new Error(`Minimum deposit amount is ₹${minAmount}`);
      }

      // Create transaction record
      const transaction = await walletService.processDeposit(
        userId,
        amount,
        gateway,
        {
          status: 'pending',
          gateway,
          ...metadata,
        }
      );

      // Initiate payment based on gateway
      let paymentData;
      switch (gateway) {
        case 'razorpay':
          paymentData = await this.initiateRazorpay(transaction);
          break;
        case 'paytm':
          paymentData = await this.initiatePaytm(transaction);
          break;
        case 'phonepe':
          paymentData = await this.initiatePhonePe(transaction);
          break;
        case 'easypaisa':
          paymentData = await this.initiateEasyPaisa(transaction);
          break;
        case 'jazzcash':
          paymentData = await this.initiateJazzCash(transaction);
          break;
        case 'manual':
          paymentData = this.initiateManualTransfer(transaction);
          break;
        default:
          throw new Error(`Unsupported payment gateway: ${gateway}`);
      }

      // Update transaction with payment data
      transaction.metadata = {
        ...transaction.metadata,
        ...paymentData,
      };
      await transaction.save();

      return {
        success: true,
        transactionId: transaction._id,
        orderId: transaction.orderId,
        gateway,
        amount,
        paymentData,
      };
    } catch (error) {
      throw new Error(`Deposit initiation failed: ${error.message}`);
    }
  }

  /**
   * Razorpay integration
   */
  async initiateRazorpay(transaction) {
    try {
      if (!this.gateways.razorpay.enabled) {
        throw new Error('Razorpay not configured');
      }

      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: this.gateways.razorpay.keyId,
        key_secret: this.gateways.razorpay.keySecret,
      });

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: transaction.amount * 100, // Convert to paise
        currency: 'INR',
        receipt: transaction.orderId,
        notes: {
          userId: transaction.user.toString(),
          transactionId: transaction._id.toString(),
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: this.gateways.razorpay.keyId,
      };
    } catch (error) {
      throw new Error(`Razorpay initiation failed: ${error.message}`);
    }
  }

  /**
   * Paytm integration
   */
  async initiatePaytm(transaction) {
    try {
      if (!this.gateways.paytm.enabled) {
        throw new Error('Paytm not configured');
      }

      const paytmParams = {
        body: {
          requestType: 'Payment',
          mid: this.gateways.paytm.merchantId,
          websiteName: this.gateways.paytm.website,
          orderId: transaction.orderId,
          callbackUrl: `${process.env.BACKEND_URL}/api/payment/webhook/paytm`,
          txnAmount: {
            value: transaction.amount.toString(),
            currency: 'INR',
          },
          userInfo: {
            custId: transaction.user.toString(),
          },
        },
      };

      // Generate checksum
      const checksum = await this.generatePaytmChecksum(
        JSON.stringify(paytmParams.body)
      );

      return {
        orderId: transaction.orderId,
        mid: this.gateways.paytm.merchantId,
        amount: transaction.amount,
        checksum,
        paytmParams,
        txnToken: checksum, // In production, get actual token from Paytm
      };
    } catch (error) {
      throw new Error(`Paytm initiation failed: ${error.message}`);
    }
  }

  /**
   * PhonePe integration
   */
  async initiatePhonePe(transaction) {
    try {
      if (!this.gateways.phonepe.enabled) {
        throw new Error('PhonePe not configured');
      }

      const payload = {
        merchantId: this.gateways.phonepe.merchantId,
        merchantTransactionId: transaction.orderId,
        merchantUserId: transaction.user.toString(),
        amount: transaction.amount * 100, // Convert to paise
        redirectUrl: `${process.env.FRONTEND_URL}/payment/callback`,
        redirectMode: 'POST',
        callbackUrl: `${process.env.BACKEND_URL}/api/payment/webhook/phonepe`,
        mobileNumber: transaction.metadata?.phone || '',
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      // Encode payload
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Generate checksum
      const checksumString = base64Payload + '/pg/v1/pay' + this.gateways.phonepe.saltKey;
      const checksum = crypto
        .createHash('sha256')
        .update(checksumString)
        .digest('hex') + '###' + this.gateways.phonepe.saltIndex;

      // Make API call
      const response = await axios.post(
        'https://api.phonepe.com/apis/hermes/pg/v1/pay',
        {
          request: base64Payload,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
          },
        }
      );

      return {
        orderId: transaction.orderId,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId: transaction.orderId,
      };
    } catch (error) {
      throw new Error(`PhonePe initiation failed: ${error.message}`);
    }
  }

  /**
   * EasyPaisa integration
   */
  async initiateEasyPaisa(transaction) {
    try {
      if (!this.gateways.easypaisa.enabled) {
        throw new Error('EasyPaisa not configured');
      }

      const orderId = transaction.orderId;
      const amount = transaction.amount;
      const storeId = this.gateways.easypaisa.storeId;

      // Generate hash
      const hashString = `${amount}${storeId}${orderId}${this.gateways.easypaisa.hashKey}`;
      const hash = crypto.createHash('sha256').update(hashString).digest('hex');

      // Prepare checkout data
      const checkoutData = {
        storeId,
        orderId,
        amount,
        postBackURL: `${process.env.BACKEND_URL}/api/payment/webhook/easypaisa`,
        orderRefNum: orderId,
        merchantHashedReq: hash,
      };

      return {
        orderId,
        amount,
        storeId,
        checkoutUrl: 'https://easypay.easypaisa.com.pk/easypay/Index.jsf',
        checkoutData,
      };
    } catch (error) {
      throw new Error(`EasyPaisa initiation failed: ${error.message}`);
    }
  }

  /**
   * JazzCash integration
   */
  async initiateJazzCash(transaction) {
    try {
      if (!this.gateways.jazzcash.enabled) {
        throw new Error('JazzCash not configured');
      }

      const merchantId = this.gateways.jazzcash.merchantId;
      const password = this.gateways.jazzcash.password;
      const orderId = transaction.orderId;
      const amount = transaction.amount * 100; // Convert to paisa
      const dateTime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];

      // Generate hash
      const hashString = `${this.gateways.jazzcash.integritySalt}&${amount}&${orderId}&${merchantId}&${password}&${dateTime}`;
      const hash = crypto.createHmac('sha256', this.gateways.jazzcash.integritySalt)
        .update(hashString)
        .digest('hex')
        .toUpperCase();

      const paymentData = {
        pp_Version: '1.1',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: merchantId,
        pp_Password: password,
        pp_TxnRefNo: orderId,
        pp_Amount: amount,
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: dateTime,
        pp_BillReference: orderId,
        pp_Description: 'Deposit to wallet',
        pp_ReturnURL: `${process.env.BACKEND_URL}/api/payment/webhook/jazzcash`,
        pp_SecureHash: hash,
      };

      return {
        orderId,
        amount: transaction.amount,
        paymentUrl: 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform',
        paymentData,
      };
    } catch (error) {
      throw new Error(`JazzCash initiation failed: ${error.message}`);
    }
  }

  /**
   * Manual bank transfer
   */
  initiateManualTransfer(transaction) {
    return {
      orderId: transaction.orderId,
      amount: transaction.amount,
      bankDetails: {
        accountName: 'CrickBet Pvt Ltd',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        branch: 'Main Branch',
      },
      instructions: [
        'Transfer the amount to the above bank account',
        'Use order ID as reference/remark',
        'Submit transaction screenshot/UTR number',
        'Funds will be credited within 1-24 hours after verification',
      ],
    };
  }

  /**
   * Verify Razorpay payment
   */
  async verifyRazorpay(orderId, paymentId, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.gateways.razorpay.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid payment signature');
      }

      // Find transaction
      const transaction = await Transaction.findOne({
        'metadata.orderId': orderId,
        type: 'deposit',
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify with wallet service
      await walletService.verifyDeposit(transaction._id, paymentId);

      return {
        success: true,
        transactionId: transaction._id,
        message: 'Payment verified successfully',
      };
    } catch (error) {
      throw new Error(`Razorpay verification failed: ${error.message}`);
    }
  }

  /**
   * Verify Paytm payment webhook
   */
  async verifyPaytm(webhookData) {
    try {
      const { ORDERID, STATUS, TXNID, CHECKSUMHASH } = webhookData;

      // Verify checksum
      const isValid = await this.verifyPaytmChecksum(webhookData, CHECKSUMHASH);

      if (!isValid) {
        throw new Error('Invalid checksum');
      }

      // Find transaction
      const transaction = await Transaction.findOne({
        orderId: ORDERID,
        type: 'deposit',
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (STATUS === 'TXN_SUCCESS') {
        await walletService.verifyDeposit(transaction._id, TXNID);
      } else {
        transaction.status = 'failed';
        transaction.metadata.failureReason = STATUS;
        await transaction.save();
      }

      return {
        success: STATUS === 'TXN_SUCCESS',
        transactionId: transaction._id,
      };
    } catch (error) {
      throw new Error(`Paytm verification failed: ${error.message}`);
    }
  }

  /**
   * Verify PhonePe payment webhook
   */
  async verifyPhonePe(webhookData) {
    try {
      const { response } = webhookData;
      const base64Response = response;

      // Decode response
      const decodedResponse = JSON.parse(
        Buffer.from(base64Response, 'base64').toString()
      );

      const { success, code, data } = decodedResponse;

      if (!success) {
        throw new Error(`Payment failed: ${code}`);
      }

      // Find transaction
      const transaction = await Transaction.findOne({
        orderId: data.merchantTransactionId,
        type: 'deposit',
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await walletService.verifyDeposit(transaction._id, data.transactionId);

      return {
        success: true,
        transactionId: transaction._id,
      };
    } catch (error) {
      throw new Error(`PhonePe verification failed: ${error.message}`);
    }
  }

  /**
   * Verify EasyPaisa payment
   */
  async verifyEasyPaisa(webhookData) {
    try {
      const { orderId, status, paymentToken } = webhookData;

      // Find transaction
      const transaction = await Transaction.findOne({
        orderId,
        type: 'deposit',
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (status === '0000') {
        // Success
        await walletService.verifyDeposit(transaction._id, paymentToken);
      } else {
        transaction.status = 'failed';
        transaction.metadata.failureReason = status;
        await transaction.save();
      }

      return {
        success: status === '0000',
        transactionId: transaction._id,
      };
    } catch (error) {
      throw new Error(`EasyPaisa verification failed: ${error.message}`);
    }
  }

  /**
   * Verify JazzCash payment
   */
  async verifyJazzCash(webhookData) {
    try {
      const { pp_TxnRefNo, pp_ResponseCode, pp_SecureHash } = webhookData;

      // Verify hash
      const hashData = { ...webhookData };
      delete hashData.pp_SecureHash;

      const hashString = Object.keys(hashData)
        .sort()
        .map((key) => hashData[key])
        .join('&');

      const expectedHash = crypto
        .createHmac('sha256', this.gateways.jazzcash.integritySalt)
        .update(this.gateways.jazzcash.integritySalt + '&' + hashString)
        .digest('hex')
        .toUpperCase();

      if (expectedHash !== pp_SecureHash) {
        throw new Error('Invalid hash');
      }

      // Find transaction
      const transaction = await Transaction.findOne({
        orderId: pp_TxnRefNo,
        type: 'deposit',
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (pp_ResponseCode === '000') {
        // Success
        await walletService.verifyDeposit(transaction._id, webhookData.pp_TxnRefNo);
      } else {
        transaction.status = 'failed';
        transaction.metadata.failureReason = pp_ResponseCode;
        await transaction.save();
      }

      return {
        success: pp_ResponseCode === '000',
        transactionId: transaction._id,
      };
    } catch (error) {
      throw new Error(`JazzCash verification failed: ${error.message}`);
    }
  }

  /**
   * Process withdrawal
   * @param {String} userId - User ID
   * @param {Number} amount - Withdrawal amount
   * @param {Object} bankDetails - Bank account details
   * @returns {Object} Withdrawal result
   */
  async processWithdrawal(userId, amount, bankDetails) {
    try {
      // Validate bank details
      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc) {
        throw new Error('Bank details are required');
      }

      // Check withdrawal eligibility
      const eligible = await walletService.checkWithdrawalEligibility(userId, amount);

      if (!eligible.eligible) {
        throw new Error(eligible.reason);
      }

      // Create withdrawal transaction
      const transaction = await walletService.processWithdrawal(userId, amount, bankDetails);

      return {
        success: true,
        transactionId: transaction._id,
        message: 'Withdrawal request submitted successfully',
        estimatedTime: '1-3 business days',
      };
    } catch (error) {
      throw new Error(`Withdrawal processing failed: ${error.message}`);
    }
  }

  /**
   * Generate Paytm checksum
   */
  async generatePaytmChecksum(params) {
    // Placeholder - implement actual Paytm checksum generation
    const checksum = crypto
      .createHash('sha256')
      .update(params + this.gateways.paytm.merchantKey)
      .digest('hex');
    return checksum;
  }

  /**
   * Verify Paytm checksum
   */
  async verifyPaytmChecksum(params, checksum) {
    // Placeholder - implement actual Paytm checksum verification
    return true;
  }
}

module.exports = new PaymentService();
