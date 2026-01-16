/**
 * Database Initialization Script
 * Run this to set up MongoDB collections, indexes, and initial data
 * 
 * Usage: node scripts/init-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const Bet = require('../models/Bet');
const Market = require('../models/Market');
const Transaction = require('../models/Transaction');
const KYC = require('../models/KYC');
const Affiliate = require('../models/Affiliate');
const AffiliateLink = require('../models/AffiliateLink');
const CommissionDesignation = require('../models/CommissionDesignation');
const Referral = require('../models/Referral');
const Casino = require('../models/Casino');
const Promotion = require('../models/Promotion');
const Lottery = require('../models/Lottery');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Create indexes for all collections
const createIndexes = async () => {
  console.log('\n📊 Creating Database Indexes...\n');

  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ phone: 1 }, { sparse: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('✅ User indexes created');

    // Bet indexes
    await Bet.collection.createIndex({ userId: 1, createdAt: -1 });
    await Bet.collection.createIndex({ marketId: 1 });
    await Bet.collection.createIndex({ status: 1 });
    await Bet.collection.createIndex({ settled: 1 });
    await Bet.collection.createIndex({ createdAt: -1 });
    console.log('✅ Bet indexes created');

    // Market indexes
    await Market.collection.createIndex({ matchId: 1 });
    await Market.collection.createIndex({ status: 1 });
    await Market.collection.createIndex({ sportType: 1 });
    await Market.collection.createIndex({ startTime: 1 });
    console.log('✅ Market indexes created');

    // Transaction indexes
    await Transaction.collection.createIndex({ userId: 1, createdAt: -1 });
    await Transaction.collection.createIndex({ type: 1 });
    await Transaction.collection.createIndex({ status: 1 });
    await Transaction.collection.createIndex({ createdAt: -1 });
    await Transaction.collection.createIndex({ reference: 1 }, { sparse: true });
    console.log('✅ Transaction indexes created');

    // KYC indexes
    await KYC.collection.createIndex({ userId: 1 }, { unique: true });
    await KYC.collection.createIndex({ status: 1 });
    await KYC.collection.createIndex({ verificationLevel: 1 });
    console.log('✅ KYC indexes created');

    // Affiliate indexes
    await Affiliate.collection.createIndex({ userId: 1 }, { unique: true });
    await Affiliate.collection.createIndex({ affiliateCode: 1 }, { unique: true });
    await Affiliate.collection.createIndex({ upline: 1 });
    await Affiliate.collection.createIndex({ status: 1 });
    console.log('✅ Affiliate indexes created');

    // AffiliateLink indexes
    await AffiliateLink.collection.createIndex({ affiliateId: 1 });
    await AffiliateLink.collection.createIndex({ shortCode: 1 }, { unique: true });
    await AffiliateLink.collection.createIndex({ isActive: 1 });
    console.log('✅ AffiliateLink indexes created');

    // CommissionDesignation indexes
    await CommissionDesignation.collection.createIndex({ affiliateId: 1 });
    await CommissionDesignation.collection.createIndex({ isActive: 1 });
    console.log('✅ CommissionDesignation indexes created');

    // Referral indexes
    await Referral.collection.createIndex({ referrerId: 1 });
    await Referral.collection.createIndex({ refereeId: 1 }, { unique: true });
    await Referral.collection.createIndex({ status: 1 });
    console.log('✅ Referral indexes created');

    // Casino indexes
    await Casino.collection.createIndex({ userId: 1, createdAt: -1 });
    await Casino.collection.createIndex({ gameId: 1 });
    await Casino.collection.createIndex({ status: 1 });
    console.log('✅ Casino indexes created');

    // Promotion indexes
    await Promotion.collection.createIndex({ code: 1 }, { unique: true });
    await Promotion.collection.createIndex({ isActive: 1 });
    await Promotion.collection.createIndex({ validFrom: 1, validTo: 1 });
    console.log('✅ Promotion indexes created');

    // Lottery indexes
    await Lottery.collection.createIndex({ drawDate: 1 });
    await Lottery.collection.createIndex({ status: 1 });
    console.log('✅ Lottery indexes created');

    console.log('\n✅ All indexes created successfully!\n');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Create initial admin user
const createAdminUser = async () => {
  console.log('👤 Creating Admin User...\n');

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@crickbet.com',
      password: 'Admin@123456', // Will be hashed automatically by User model
      role: 'admin',
      isActive: true,
      emailVerified: true,
      balance: {
        BDT: 0,
        INR: 0,
        USD: 0,
        EUR: 0,
        GBP: 0,
      },
      currency: 'BDT',
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', adminUser.email);
    console.log('   Password: Admin@123456');
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!\n');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Create sample commission designations
const createSampleCommissionDesignations = async () => {
  console.log('💰 Creating Sample Commission Designations...\n');

  try {
    const existingDesignations = await CommissionDesignation.countDocuments();
    if (existingDesignations > 0) {
      console.log('ℹ️  Commission designations already exist\n');
      return;
    }

    // Sample commission structure
    const sampleDesignation = {
      name: 'Standard Commission',
      description: 'Default commission structure for new affiliates',
      sports: {
        cricket: 5.0,
        football: 4.0,
        tennis: 4.0,
        other: 3.0,
      },
      casino: 8.0,
      slots: 10.0,
      lottery: 6.0,
      liveCasino: 7.0,
      minCommission: 100,
      maxCommission: 100000,
      paymentSchedule: 'monthly',
      isActive: true,
    };

    await CommissionDesignation.create(sampleDesignation);
    console.log('✅ Sample commission designation created\n');
  } catch (error) {
    console.error('❌ Error creating commission designations:', error.message);
  }
};

// Display collection statistics
const displayStats = async () => {
  console.log('📈 Database Statistics:\n');

  try {
    const stats = {
      Users: await User.countDocuments(),
      Bets: await Bet.countDocuments(),
      Markets: await Market.countDocuments(),
      Transactions: await Transaction.countDocuments(),
      KYC: await KYC.countDocuments(),
      Affiliates: await Affiliate.countDocuments(),
      AffiliateLinks: await AffiliateLink.countDocuments(),
      CommissionDesignations: await CommissionDesignation.countDocuments(),
      Referrals: await Referral.countDocuments(),
      CasinoSessions: await Casino.countDocuments(),
      Promotions: await Promotion.countDocuments(),
      Lotteries: await Lottery.countDocuments(),
    };

    console.table(stats);
    console.log('');
  } catch (error) {
    console.error('❌ Error fetching stats:', error.message);
  }
};

// Main initialization function
const initializeDatabase = async () => {
  console.log('\n🚀 Starting Database Initialization...\n');
  console.log('=' .repeat(50));

  try {
    // Connect to MongoDB
    await connectDB();

    // Create indexes
    await createIndexes();

    // Create admin user
    await createAdminUser();

    // Create sample commission designations
    await createSampleCommissionDesignations();

    // Display statistics
    await displayStats();

    console.log('=' .repeat(50));
    console.log('\n✅ Database initialization completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Change the admin password');
    console.log('   2. Configure payment gateways');
    console.log('   3. Add cricket matches and markets');
    console.log('   4. Start the backend server: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed\n');
    process.exit(0);
  }
};

// Run initialization
initializeDatabase();
