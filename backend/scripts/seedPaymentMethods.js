/**
 * Seed Payment Methods
 * Run this script to populate payment methods in the database
 * Usage: node backend/scripts/seedPaymentMethods.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const PaymentMethod = require('../models/PaymentMethod');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crickbet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Payment methods data
const paymentMethods = [
  {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: 'jazzcash',
    type: 'jazzcash',
    enabled: true,
    minAmount: 100,
    maxAmount: 100000,
    processingTime: 'Instant',
    order: 1,
    description: 'Pay using JazzCash mobile wallet',
    regions: ['PK'],
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    icon: 'easypaisa',
    type: 'easypaisa',
    enabled: true,
    minAmount: 100,
    maxAmount: 100000,
    processingTime: 'Instant',
    order: 2,
    description: 'Pay using EasyPaisa mobile wallet',
    regions: ['PK'],
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: 'upi',
    type: 'upi',
    enabled: true,
    minAmount: 100,
    maxAmount: 100000,
    processingTime: 'Instant',
    order: 3,
    description: 'Pay using UPI (PhonePe, Google Pay, Paytm)',
    regions: ['IN'],
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: 'bank',
    type: 'bank_transfer',
    enabled: true,
    minAmount: 500,
    maxAmount: 200000,
    processingTime: '1-2 hours',
    order: 4,
    description: 'Direct bank transfer',
    regions: ['IN', 'PK', 'BD'],
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  {
    id: 'card',
    name: 'Debit/Credit Card',
    icon: 'card',
    type: 'card',
    enabled: true,
    minAmount: 100,
    maxAmount: 100000,
    processingTime: 'Instant',
    order: 5,
    description: 'Pay using Visa, MasterCard, or other cards',
    regions: ['IN', 'PK', 'BD'],
    fees: {
      percentage: 2,
      fixed: 0,
    },
  },
];

// Seed function
const seedPaymentMethods = async () => {
  try {
    console.log('🌱 Seeding payment methods...');

    // Clear existing payment methods
    await PaymentMethod.deleteMany({});
    console.log('🗑️  Cleared existing payment methods');

    // Insert new payment methods
    const inserted = await PaymentMethod.insertMany(paymentMethods);
    console.log(`✅ Successfully seeded ${inserted.length} payment methods:`);
    
    inserted.forEach((method) => {
      console.log(`   - ${method.name} (${method.id})`);
    });

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding payment methods:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
(async () => {
  await connectDB();
  await seedPaymentMethods();
})();
