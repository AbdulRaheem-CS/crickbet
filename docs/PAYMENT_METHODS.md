# Payment Methods System

## Overview
The payment methods system is now fully dynamic and database-driven. Payment methods are no longer hardcoded and can be managed through the database.

## Features
- ✅ **Dynamic Payment Methods**: Fetched from MongoDB database
- ✅ **JazzCash Support**: Pakistani mobile wallet integration
- ✅ **EasyPaisa Support**: Pakistani mobile wallet integration
- ✅ **UPI Support**: Indian UPI payments
- ✅ **Net Banking**: Direct bank transfers
- ✅ **Card Payments**: Debit/Credit card support
- ✅ **Region-based**: Payment methods can be filtered by region (PK, IN, BD)
- ✅ **Flexible Configuration**: Min/max amounts, fees, processing time

## Database Schema

### PaymentMethod Model
```javascript
{
  id: String,              // Unique identifier (e.g., 'jazzcash', 'upi')
  name: String,            // Display name (e.g., 'JazzCash')
  icon: String,            // Icon identifier
  type: String,            // Backend processing type
  enabled: Boolean,        // Enable/disable status
  minAmount: Number,       // Minimum transaction amount
  maxAmount: Number,       // Maximum transaction amount
  processingTime: String,  // Processing time display
  order: Number,           // Display order
  description: String,     // User-facing description
  regions: [String],       // Applicable regions ['PK', 'IN', 'BD']
  fees: {
    percentage: Number,    // Percentage fee
    fixed: Number          // Fixed fee
  }
}
```

## Setup Instructions

### 1. Seed Payment Methods
Run this command to populate the database with default payment methods:

```bash
cd backend
node scripts/seedPaymentMethods.js
```

This will add:
- JazzCash (Pakistan)
- EasyPaisa (Pakistan)
- UPI (India)
- Net Banking (All regions)
- Debit/Credit Card (All regions)

### 2. API Endpoints

**Get Payment Methods**
```
GET /api/wallet/payment-methods
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "jazzcash",
      "name": "JazzCash",
      "icon": "jazzcash",
      "type": "jazzcash",
      "enabled": true,
      "minAmount": 100,
      "maxAmount": 100000,
      "processingTime": "Instant",
      "order": 1
    },
    ...
  ]
}
```

**Initiate Deposit**
```
POST /api/wallet/deposit
Authorization: Bearer <token>

Body:
{
  "amount": 1000,
  "paymentMethod": "jazzcash"  // Must match payment method 'id'
}

Response:
{
  "success": true,
  "message": "Deposit initiated successfully",
  "data": {
    "transactionId": "...",
    "txnRef": "TXN-...",
    "amount": 1000,
    "status": "pending"
  }
}
```

## Supported Payment Method Types
The Transaction model now accepts these payment method types:
- `upi`
- `bank_transfer`
- `card`
- `wallet`
- `crypto`
- `jazzcash` ✨ NEW
- `easypaisa` ✨ NEW

## Frontend Integration
The frontend automatically fetches payment methods from the API and displays them in the deposit modal with appropriate icons.

## Managing Payment Methods

### Add New Payment Method
```javascript
const newMethod = new PaymentMethod({
  id: 'bkash',
  name: 'bKash',
  icon: 'wallet',
  type: 'wallet',
  enabled: true,
  minAmount: 100,
  maxAmount: 50000,
  processingTime: 'Instant',
  order: 6,
  description: 'Pay using bKash mobile wallet',
  regions: ['BD'],
  fees: { percentage: 0, fixed: 0 }
});
await newMethod.save();
```

### Disable Payment Method
```javascript
await PaymentMethod.updateOne(
  { id: 'jazzcash' },
  { enabled: false }
);
```

### Update Limits
```javascript
await PaymentMethod.updateOne(
  { id: 'upi' },
  { minAmount: 200, maxAmount: 200000 }
);
```

## Notes
- Payment methods are cached with 304 Not Modified responses
- Only enabled payment methods are returned by the API
- Payment methods are sorted by the `order` field
- The `type` field is used for backend payment processing
- The `icon` field is used for frontend display icons
