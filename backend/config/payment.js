/**
 * Payment Gateway Configuration
 * Settings for various payment providers
 */

const paymentConfig = {
  // Default payment provider
  defaultProvider: 'razorpay',

  // Razorpay Configuration
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    currency: 'INR',
  },

  // PayTM Configuration
  paytm: {
    merchantId: process.env.PAYTM_MERCHANT_ID,
    merchantKey: process.env.PAYTM_MERCHANT_KEY,
    website: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
    channelId: 'WEB',
    industryType: 'Retail',
  },

  // UPI Configuration
  upi: {
    merchantId: process.env.UPI_MERCHANT_ID,
    apiKey: process.env.UPI_API_KEY,
    merchantVpa: process.env.UPI_MERCHANT_VPA,
  },

  // Bank Transfer Configuration
  bankTransfer: {
    accountName: process.env.BANK_ACCOUNT_NAME,
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    ifscCode: process.env.BANK_IFSC_CODE,
    bankName: process.env.BANK_NAME,
  },

  // Minimum and Maximum limits
  limits: {
    minDeposit: 100, // INR
    maxDeposit: 1000000, // INR
    minWithdrawal: 500, // INR
    maxWithdrawal: 500000, // INR
    dailyWithdrawalLimit: 1000000, // INR
  },

  // Transaction fees
  fees: {
    depositFee: 0, // Percentage
    withdrawalFee: 0, // Percentage
    minWithdrawalFee: 0, // Fixed minimum fee
  },
};

module.exports = paymentConfig;
