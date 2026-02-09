# Payment Gateway Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Razorpay Setup](#razorpay-setup-india)
3. [Paytm Setup](#paytm-setup-india)
4. [PhonePe Setup](#phonepe-setup-india)
5. [EasyPaisa Setup](#easypaisa-setup-pakistan)
6. [JazzCash Setup](#jazzcash-setup-pakistan)
7. [Manual Transfer Setup](#manual-transfer-setup)
8. [Testing Guide](#testing-guide)
9. [Webhook Configuration](#webhook-configuration)
10. [Production Deployment](#production-deployment)

---

## Overview

CrickBet supports 6 payment methods across 2 countries:

### India 🇮🇳
- **Razorpay** - UPI, Cards, NetBanking, Wallets
- **Paytm** - Paytm Wallet, UPI, Cards
- **PhonePe** - PhonePe UPI, Cards

### Pakistan 🇵🇰
- **EasyPaisa** - Mobile Account, Bank Account
- **JazzCash** - Mobile Wallet, Bank Account

### All Countries 🌍
- **Manual Transfer** - Bank Transfer, IMPS, NEFT, RTGS

---

## Razorpay Setup (India)

### Step 1: Create Razorpay Account
1. Visit [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with business email
3. Complete KYC (for production access)

### Step 2: Get API Credentials
1. Login to dashboard
2. Go to **Settings** → **API Keys**
3. Generate test keys for development
4. Get production keys after KYC approval

```bash
# Test Mode
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-test-secret

# Production Mode (after KYC)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-live-secret
```

### Step 3: Configure Webhook
1. Go to **Settings** → **Webhooks**
2. Click **+ Add New Webhook**
3. Enter webhook URL: `https://yourdomain.com/api/payment/webhook/razorpay`
4. Select events:
   - `payment.captured`
   - `payment.failed`
5. Click **Create Webhook**
6. Copy the **Webhook Secret**

```bash
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 4: Test Integration
```javascript
// Frontend (React/Next.js)
import { paymentAPI } from '@/lib/api-client';

const handleRazorpayPayment = async (amount) => {
  try {
    // Step 1: Initiate deposit
    const { transactionId, paymentData } = await paymentAPI.initiateDeposit({
      amount: amount,
      gateway: 'razorpay',
    });

    // Step 2: Load Razorpay checkout
    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.orderId,
      name: 'CrickBet',
      description: 'Deposit to Wallet',
      handler: async (response) => {
        // Step 3: Verify payment
        await paymentAPI.verifyRazorpay({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        
        // Success! Wallet credited
        alert('Payment successful!');
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phone,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

### Step 5: Add Razorpay Script
```html
<!-- Add to your HTML or _app.tsx -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## Paytm Setup (India)

### Step 1: Create Paytm Business Account
1. Visit [https://business.paytm.com/](https://business.paytm.com/)
2. Sign up as merchant
3. Complete KYC verification

### Step 2: Get API Credentials
1. Login to Paytm Dashboard
2. Go to **Developers** → **API Keys**
3. Generate staging keys for testing

```bash
# Test Mode
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_INDUSTRY_TYPE=Retail

# Production Mode
PAYTM_MERCHANT_ID=your_merchant_id
PAYTM_MERCHANT_KEY=your_merchant_key
PAYTM_WEBSITE=DEFAULT
PAYTM_INDUSTRY_TYPE=Retail
```

### Step 3: Configure Callback URL
```bash
PAYTM_CALLBACK_URL=https://yourdomain.com/api/payment/webhook/paytm
```

### Step 4: Test Integration
```javascript
// Frontend
const handlePaytmPayment = async (amount) => {
  try {
    const { transactionId, paymentData } = await paymentAPI.initiateDeposit({
      amount: amount,
      gateway: 'paytm',
    });

    // Redirect to Paytm checkout
    window.location.href = paymentData.paymentUrl;
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

---

## PhonePe Setup (India)

### Step 1: Create PhonePe Business Account
1. Visit [https://business.phonepe.com/](https://business.phonepe.com/)
2. Sign up and complete KYC
3. Enable Payment Gateway

### Step 2: Get API Credentials
1. Login to merchant dashboard
2. Go to **Integration** → **API Details**
3. Get Merchant ID, Salt Key, Salt Index

```bash
# Test Mode
PHONEPE_MERCHANT_ID=MERCHANTUAT
PHONEPE_SALT_KEY=your-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# Production Mode
PHONEPE_MERCHANT_ID=your-merchant-id
PHONEPE_SALT_KEY=your-salt-key
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api.phonepe.com/apis/hermes
```

### Step 3: Configure Webhook
Add webhook URL in PhonePe dashboard:
```
https://yourdomain.com/api/payment/webhook/phonepe
```

### Step 4: Test Integration
```javascript
// Frontend
const handlePhonePePayment = async (amount) => {
  try {
    const { transactionId, paymentData } = await paymentAPI.initiateDeposit({
      amount: amount,
      gateway: 'phonepe',
    });

    // Redirect to PhonePe payment page
    window.location.href = paymentData.paymentUrl;
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

---

## EasyPaisa Setup (Pakistan)

### Step 1: Create EasyPaisa Merchant Account
1. Visit [https://easypay.easypaisa.com.pk/](https://easypay.easypaisa.com.pk/)
2. Apply for merchant account
3. Complete documentation and KYC

### Step 2: Get Credentials
After approval, you'll receive:
```bash
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_HASH_KEY=your_hash_key
EASYPAISA_POST_BACK_URL=https://yourdomain.com/api/payment/webhook/easypaisa
EASYPAISA_MERCHANT_CALLBACK_URL=https://yourdomain.com/wallet/deposit/callback
```

### Step 3: Test Integration
```javascript
// Frontend
const handleEasyPaisaPayment = async (amount) => {
  try {
    const { transactionId, paymentData } = await paymentAPI.initiateDeposit({
      amount: amount,
      gateway: 'easypaisa',
    });

    // Redirect to EasyPaisa checkout
    window.location.href = paymentData.checkoutUrl;
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

---

## JazzCash Setup (Pakistan)

### Step 1: Create JazzCash Merchant Account
1. Visit [https://payments.jazzcash.com.pk/](https://payments.jazzcash.com.pk/)
2. Apply for merchant integration
3. Submit required documents

### Step 2: Get Credentials
After approval:
```bash
# Test Mode
JAZZCASH_MERCHANT_ID=MCxxxxxx
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform
JAZZCASH_RETURN_URL=https://yourdomain.com/api/payment/webhook/jazzcash

# Production Mode
JAZZCASH_API_URL=https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform
```

### Step 3: Test Integration
```javascript
// Frontend
const handleJazzCashPayment = async (amount) => {
  try {
    const { transactionId, paymentData } = await paymentAPI.initiateDeposit({
      amount: amount,
      gateway: 'jazzcash',
    });

    // Create form and submit to JazzCash
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.paymentUrl;

    Object.entries(paymentData.formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error('Payment failed:', error);
  }
};
```

---

## Manual Transfer Setup

### Step 1: Configure Bank Details
Add your bank account details in `.env`:

```bash
# India
BANK_ACCOUNT_NAME_IN=CrickBet Pvt Ltd
BANK_ACCOUNT_NUMBER_IN=1234567890
BANK_IFSC_CODE_IN=SBIN0001234
BANK_NAME_IN=State Bank of India
BANK_BRANCH_IN=Mumbai Main Branch

# Pakistan
BANK_ACCOUNT_NAME_PK=CrickBet Pakistan
BANK_ACCOUNT_NUMBER_PK=PK12HABB0000001234567890
BANK_IBAN_PK=PK12HABB0000001234567890
BANK_NAME_PK=Habib Bank Limited
BANK_BRANCH_PK=Karachi Main Branch
```

### Step 2: User Flow
1. User selects manual transfer
2. System shows bank details
3. User transfers money via IMPS/NEFT/RTGS
4. User submits UTR/transaction reference
5. Admin verifies and approves

### Step 3: Admin Verification
```javascript
// Admin panel
const verifyManualDeposit = async (transactionId, utr) => {
  await paymentAPI.verifyManualDeposit({
    transactionId: transactionId,
    paymentReference: utr,
    verified: true, // or false to reject
  });
};
```

---

## Testing Guide

### 1. Test Razorpay Payments

**Test Cards:**
- Success: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI:**
- Success: `success@razorpay`
- Failure: `failure@razorpay`

**Test NetBanking:**
- Select any bank
- Use username: `test`
- Use password: `test`

### 2. Test Other Gateways
Each gateway provides test credentials:
- **Paytm**: Use staging environment
- **PhonePe**: Use UAT merchant ID
- **EasyPaisa**: Contact support for test account
- **JazzCash**: Use sandbox environment

### 3. Test Webhooks Locally

Use **ngrok** to expose local server:
```bash
# Install ngrok
npm install -g ngrok

# Expose port 5001
ngrok http 5001

# Use ngrok URL in webhook configuration
# Example: https://abc123.ngrok.io/api/payment/webhook/razorpay
```

### 4. Test API Endpoints

**Get Payment Methods:**
```bash
curl http://localhost:5001/api/payment/methods?country=IN
```

**Initiate Deposit:**
```bash
curl -X POST http://localhost:5001/api/payment/deposit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "gateway": "razorpay"
  }'
```

**Check Payment Status:**
```bash
curl http://localhost:5001/api/payment/status/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Webhook Configuration

### Webhook Security
All webhooks verify signatures/checksums to prevent unauthorized requests.

### Razorpay Webhook Signature
```javascript
// Automatic verification in backend
// X-Razorpay-Signature header verified using HMAC SHA256
```

### Paytm Webhook Checksum
```javascript
// Automatic checksum verification
// CHECKSUMHASH parameter validated
```

### PhonePe Webhook Verification
```javascript
// Base64 payload decoded
// SHA256 checksum verified with salt key
```

### Webhook Response Times
Ensure webhooks respond within:
- Razorpay: 5 seconds
- Paytm: 3 seconds
- PhonePe: 10 seconds
- EasyPaisa: 5 seconds
- JazzCash: 5 seconds

### Webhook Retries
If webhook fails:
- Razorpay: Retries 5 times over 24 hours
- Paytm: Retries 3 times over 1 hour
- PhonePe: Retries 5 times over 1 hour

---

## Production Deployment

### Pre-Launch Checklist

#### 1. Environment Variables ✅
```bash
□ Set NODE_ENV=production
□ Use production database URL
□ Add production payment gateway credentials
□ Set FRONTEND_URL to production domain
□ Set BACKEND_URL to production API domain
□ Generate strong JWT_SECRET
```

#### 2. Payment Gateway Configuration ✅
```bash
□ Switch from test to live API keys
□ Complete KYC for all gateways
□ Verify webhook URLs use HTTPS
□ Test each gateway in production
□ Set up monitoring/alerts
```

#### 3. Security ✅
```bash
□ Enable rate limiting
□ Use HTTPS for all endpoints
□ Implement CORS properly
□ Add webhook IP whitelisting
□ Enable error logging (Sentry)
□ Set up transaction monitoring
```

#### 4. Compliance ✅
```bash
□ Add terms and conditions
□ Display payment gateway logos
□ Implement refund policy
□ Add privacy policy
□ Enable transaction receipts
□ Set up TDS/GST calculation (if required)
```

### SSL Certificate
Payment gateways require HTTPS:
```bash
# Using Let's Encrypt
certbot --nginx -d api.yourdomain.com
```

### Webhook URLs (Production)
Update webhook URLs in gateway dashboards:
```
https://api.yourdomain.com/api/payment/webhook/razorpay
https://api.yourdomain.com/api/payment/webhook/paytm
https://api.yourdomain.com/api/payment/webhook/phonepe
https://api.yourdomain.com/api/payment/webhook/easypaisa
https://api.yourdomain.com/api/payment/webhook/jazzcash
```

### Monitoring
Track these metrics:
- Payment success rate
- Average transaction time
- Failed transaction reasons
- Webhook delivery success
- Gateway downtime

### Error Handling
Log all payment errors:
```javascript
// Already implemented in backend
// Check logs in:
// - Console (development)
// - Sentry/LogTail (production)
```

---

## Troubleshooting

### Common Issues

**1. Razorpay "Invalid Key ID"**
- Solution: Check RAZORPAY_KEY_ID in .env
- Ensure using correct test/live key

**2. Webhook Not Receiving Events**
- Solution: Check webhook URL is publicly accessible
- Verify HTTPS certificate is valid
- Check firewall settings

**3. Payment Verification Failed**
- Solution: Check signature/checksum calculation
- Verify webhook secret matches gateway
- Check server time is synchronized

**4. Amount Mismatch**
- Solution: Razorpay uses paise (multiply by 100)
- Other gateways use rupees/PKR directly

**5. Transaction Stuck in Pending**
- Solution: Check webhook logs
- Manually verify via gateway dashboard
- Use admin manual verification

### Support Contacts
- **Razorpay**: support@razorpay.com
- **Paytm**: merchantcare@paytm.com
- **PhonePe**: merchantsupport@phonepe.com
- **EasyPaisa**: merchant.support@easypaisa.com.pk
- **JazzCash**: merchant@jazz.com.pk

---

## Next Steps

1. ✅ Backend payment integration complete
2. ⏳ Create frontend deposit/withdrawal UI
3. ⏳ Add payment gateway logos
4. ⏳ Implement transaction history page
5. ⏳ Add email notifications for payments
6. ⏳ Create admin payment management dashboard

---

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Paytm Integration Guide](https://developer.paytm.com/docs/)
- [PhonePe Developer Docs](https://developer.phonepe.com/docs)
- [EasyPaisa Integration](https://easypay.easypaisa.com.pk/developers)
- [JazzCash Developer Portal](https://payments.jazzcash.com.pk/developers)

---

**Last Updated:** Phase 3 Completion  
**Version:** 1.0  
**Status:** Production Ready ✅
