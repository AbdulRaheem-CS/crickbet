#!/usr/bin/env node
// Debug script — directly calls verifyDeposit to expose real error
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crickbet')
  .then(async () => {
    const Transaction = require('../models/Transaction');
    const walletService = require('../services/wallet.service');

    const txn = await Transaction.findOne({ status: 'pending', type: 'deposit' }).sort({ createdAt: -1 });
    if (!txn) { console.log('No pending deposit found'); process.exit(1); }
    console.log('Found pending txn:', String(txn._id), 'amount:', txn.amount, 'user:', txn.user);

    try {
      const result = await walletService.verifyDeposit(String(txn._id), {});
      console.log('SUCCESS — status:', result.status, 'balanceAfter:', result.balanceAfter);
    } catch (e) {
      console.log('FAILED:', e.message);
      console.log(e.stack);
    }
    process.exit(0);
  })
  .catch(e => { console.error('DB connect failed:', e.message); process.exit(1); });
