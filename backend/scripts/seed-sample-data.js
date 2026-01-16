/**
 * Sample Data Seeding Script
 * Populates database with test data for development and testing
 * 
 * Usage: node scripts/seed-sample-data.js
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

// Generate random number between min and max
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random date in the past X days
const randomPastDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - randomBetween(0, days));
  return date;
};

// Create sample users
const createSampleUsers = async () => {
  console.log('\n👥 Creating Sample Users...\n');

  const sampleUsers = [
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'Test@123456',
      phone: '1234567890',
      role: 'user',
      status: 'active',
      isEmailVerified: true,
      wallet: {
        balance: 5000,
        bonus: 500,
        currency: 'INR',
      },
      referralCode: 'JOHN2026',
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'Test@123456',
      phone: '1234567891',
      role: 'user',
      status: 'active',
      isEmailVerified: true,
      wallet: {
        balance: 10000,
        bonus: 1000,
        currency: 'INR',
      },
      referralCode: 'JANE2026',
    },
    {
      username: 'mike_wilson',
      email: 'mike@example.com',
      password: 'Test@123456',
      phone: '1234567892',
      role: 'user',
      status: 'active',
      isEmailVerified: true,
      wallet: {
        balance: 15000,
        bonus: 1500,
        currency: 'INR',
      },
      referralCode: 'MIKE2026',
    },
    {
      username: 'sarah_jones',
      email: 'sarah@example.com',
      password: 'Test@123456',
      phone: '1234567893',
      role: 'user',
      status: 'active',
      isEmailVerified: true,
      wallet: {
        balance: 8000,
        bonus: 800,
        currency: 'INR',
      },
      referralCode: 'SARAH2026',
    },
    {
      username: 'david_brown',
      email: 'david@example.com',
      password: 'Test@123456',
      phone: '1234567894',
      role: 'user',
      status: 'active',
      isEmailVerified: true,
      wallet: {
        balance: 20000,
        bonus: 2000,
        currency: 'INR',
      },
      referralCode: 'DAVID2026',
    },
  ];

  const createdUsers = [];
  for (const userData of sampleUsers) {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`  ✅ Created user: ${user.username} (${user.email})`);
      } else {
        createdUsers.push(existingUser);
        console.log(`  ℹ️  User already exists: ${userData.username}`);
      }
    } catch (error) {
      console.error(`  ❌ Error creating user ${userData.username}:`, error.message);
    }
  }

  console.log(`\n✅ Total users: ${createdUsers.length}\n`);
  return createdUsers;
};

// Create sample cricket markets
const createSampleMarkets = async () => {
  console.log('🏏 Creating Sample Cricket Markets...\n');

  const sampleMatches = [
    {
      marketId: 'MARKET001',
      event: {
        eventId: 'EVT001',
        name: 'India vs Pakistan - ODI',
        sportId: 'cricket',
        sportName: 'Cricket',
        competitionName: 'Asia Cup',
        venue: 'Dubai International Stadium',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isInPlay: false,
      },
      marketName: 'Match Odds',
      marketType: 'match_odds',
      runners: [
        {
          runnerId: 'IND',
          name: 'India',
          sortPriority: 1,
          status: 'active',
          backOdds: [{ price: 1.85, size: 50000 }],
          layOdds: [{ price: 1.87, size: 45000 }],
        },
        {
          runnerId: 'PAK',
          name: 'Pakistan',
          sortPriority: 2,
          status: 'active',
          backOdds: [{ price: 2.10, size: 45000 }],
          layOdds: [{ price: 2.12, size: 42000 }],
        },
      ],
      status: 'open',
      isActive: true,
      inPlay: false,
    },
    {
      marketId: 'MARKET002',
      event: {
        eventId: 'EVT002',
        name: 'England vs Australia - Test Match',
        sportId: 'cricket',
        sportName: 'Cricket',
        competitionName: 'The Ashes',
        venue: 'Lords',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        isInPlay: false,
      },
      marketName: 'Match Odds',
      marketType: 'match_odds',
      runners: [
        {
          runnerId: 'ENG',
          name: 'England',
          sortPriority: 1,
          status: 'active',
          backOdds: [{ price: 2.00, size: 40000 }],
          layOdds: [{ price: 2.02, size: 38000 }],
        },
        {
          runnerId: 'AUS',
          name: 'Australia',
          sortPriority: 2,
          status: 'active',
          backOdds: [{ price: 1.95, size: 42000 }],
          layOdds: [{ price: 1.97, size: 40000 }],
        },
        {
          runnerId: 'DRAW',
          name: 'Draw',
          sortPriority: 3,
          status: 'active',
          backOdds: [{ price: 3.50, size: 20000 }],
          layOdds: [{ price: 3.55, size: 18000 }],
        },
      ],
      status: 'open',
      isActive: true,
      inPlay: false,
    },
    {
      marketId: 'MARKET003',
      event: {
        eventId: 'EVT003',
        name: 'Bangladesh vs Sri Lanka - T20',
        sportId: 'cricket',
        sportName: 'Cricket',
        competitionName: 'T20 Series',
        venue: 'Sher-e-Bangla National Stadium',
        startTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        isInPlay: false,
      },
      marketName: 'Match Odds',
      marketType: 'match_odds',
      runners: [
        {
          runnerId: 'BAN',
          name: 'Bangladesh',
          sortPriority: 1,
          status: 'active',
          backOdds: [{ price: 1.75, size: 35000 }],
          layOdds: [{ price: 1.77, size: 33000 }],
        },
        {
          runnerId: 'SL',
          name: 'Sri Lanka',
          sortPriority: 2,
          status: 'active',
          backOdds: [{ price: 2.20, size: 30000 }],
          layOdds: [{ price: 2.22, size: 28000 }],
        },
      ],
      status: 'open',
      isActive: true,
      inPlay: false,
    },
  ];

  const createdMarkets = [];
  for (const marketData of sampleMatches) {
    try {
      const market = await Market.create(marketData);
      createdMarkets.push(market);
      console.log(`  ✅ Created market: ${market.name}`);
    } catch (error) {
      console.error(`  ❌ Error creating market:`, error.message);
    }
  }

  console.log(`\n✅ Total markets created: ${createdMarkets.length}\n`);
  return createdMarkets;
};

// Create sample bets
const createSampleBets = async (users, markets) => {
  console.log('💰 Creating Sample Bets...\n');

  if (users.length === 0 || markets.length === 0) {
    console.log('  ⚠️  No users or markets available. Skipping bet creation.\n');
    return [];
  }

  const sampleBets = [];
  
  // Create 15-20 random bets
  for (let i = 0; i < 15; i++) {
    const user = users[randomBetween(0, users.length - 1)];
    const market = markets[randomBetween(0, markets.length - 1)];
    const runner = market.runners[randomBetween(0, market.runners.length - 1)];
    
    const betType = Math.random() > 0.5 ? 'back' : 'lay';
    const stake = [100, 200, 500, 1000, 1500][randomBetween(0, 4)];
    const status = ['pending', 'matched', 'settled'][randomBetween(0, 2)];
    const odds = runner.backOdds[0]?.price || 2.0;
    
    const betData = {
      userId: user._id,
      marketId: market._id,
      selection: runner.name,
      selectionId: runner.runnerId,
      odds: odds,
      stake: stake,
      type: betType,
      status: status,
      isSettled: status === 'settled',
      result: status === 'settled' ? (Math.random() > 0.4 ? 'won' : 'lost') : null,
      potentialWin: stake * (odds - 1),
      actualWin: 0,
      createdAt: randomPastDate(7),
    };

    // Calculate payout for won bets
    if (betData.result === 'won') {
      betData.actualWin = stake * (odds - 1);
    }

    sampleBets.push(betData);
  }

  const createdBets = [];
  for (const betData of sampleBets) {
    try {
      const bet = await Bet.create(betData);
      createdBets.push(bet);
      console.log(`  ✅ Created bet: ${bet.selection} @ ${bet.odds} - ${bet.stake} BDT (${bet.status})`);
    } catch (error) {
      console.error(`  ❌ Error creating bet:`, error.message);
    }
  }

  console.log(`\n✅ Total bets created: ${createdBets.length}\n`);
  return createdBets;
};

// Create sample transactions
const createSampleTransactions = async (users) => {
  console.log('💳 Creating Sample Transactions...\n');

  if (users.length === 0) {
    console.log('  ⚠️  No users available. Skipping transaction creation.\n');
    return [];
  }

  const transactionTypes = ['deposit', 'withdrawal', 'bet', 'win', 'commission'];
  const statuses = ['completed', 'pending', 'processing'];
  const currencies = ['BDT', 'INR', 'USD'];

  const sampleTransactions = [];

  // Create 20-25 random transactions
  for (let i = 0; i < 20; i++) {
    const user = users[randomBetween(0, users.length - 1)];
    const type = transactionTypes[randomBetween(0, transactionTypes.length - 1)];
    const status = type === 'bet' || type === 'win' ? 'completed' : statuses[randomBetween(0, statuses.length - 1)];
    const currency = currencies[randomBetween(0, 2)];
    
    let amount;
    switch (type) {
      case 'deposit':
        amount = [500, 1000, 2000, 5000, 10000][randomBetween(0, 4)];
        break;
      case 'withdrawal':
        amount = [1000, 2000, 3000, 5000][randomBetween(0, 3)];
        break;
      case 'bet':
        amount = [100, 200, 500, 1000][randomBetween(0, 3)];
        break;
      case 'win':
        amount = [200, 400, 1000, 2000, 5000][randomBetween(0, 4)];
        break;
      case 'commission':
        amount = [50, 100, 200, 500][randomBetween(0, 3)];
        break;
      default:
        amount = 100;
    }

    const transactionData = {
      userId: user._id,
      type: type,
      amount: amount,
      currency: currency,
      status: status,
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
      reference: `TXN${Date.now()}${randomBetween(1000, 9999)}`,
      createdAt: randomPastDate(30),
    };

    // Add payment method for deposits/withdrawals
    if (type === 'deposit' || type === 'withdrawal') {
      transactionData.paymentMethod = ['bank_transfer', 'razorpay', 'stripe', 'crypto'][randomBetween(0, 3)];
    }

    sampleTransactions.push(transactionData);
  }

  const createdTransactions = [];
  for (const txnData of sampleTransactions) {
    try {
      const transaction = await Transaction.create(txnData);
      createdTransactions.push(transaction);
      console.log(`  ✅ Created transaction: ${transaction.type} - ${transaction.amount} ${transaction.currency} (${transaction.status})`);
    } catch (error) {
      console.error(`  ❌ Error creating transaction:`, error.message);
    }
  }

  console.log(`\n✅ Total transactions created: ${createdTransactions.length}\n`);
  return createdTransactions;
};

// Create sample KYC submissions
const createSampleKYC = async (users) => {
  console.log('📄 Creating Sample KYC Submissions...\n');

  if (users.length === 0) {
    console.log('  ⚠️  No users available. Skipping KYC creation.\n');
    return [];
  }

  const statuses = ['pending', 'approved', 'rejected'];
  const levels = ['level1', 'level2', 'level3'];

  const createdKYCs = [];
  
  // Create KYC for first 3 users
  for (let i = 0; i < Math.min(3, users.length); i++) {
    const user = users[i];
    
    try {
      const existingKYC = await KYC.findOne({ userId: user._id });
      if (existingKYC) {
        console.log(`  ℹ️  KYC already exists for user: ${user.username}`);
        continue;
      }

      const kycData = {
        userId: user._id,
        status: statuses[i % 3],
        verificationLevel: levels[Math.min(i, 2)],
        personalInfo: {
          fullName: user.username.replace('_', ' '),
          dateOfBirth: new Date('1990-01-01'),
          nationality: 'Bangladesh',
          address: {
            street: '123 Main Street',
            city: 'Dhaka',
            state: 'Dhaka',
            postalCode: '1200',
            country: 'Bangladesh',
          },
        },
        documents: {
          identityProof: {
            type: 'aadhaar',
            number: `AAAA${randomBetween(1000, 9999)}${randomBetween(1000, 9999)}`,
            documentUrl: '/uploads/kyc/aadhaar_sample.pdf',
            status: statuses[i % 3],
          },
          addressProof: {
            type: 'utility_bill',
            documentUrl: '/uploads/kyc/utility_bill_sample.pdf',
            status: statuses[i % 3],
          },
        },
        submittedAt: randomPastDate(15),
      };

      const kyc = await KYC.create(kycData);
      createdKYCs.push(kyc);
      console.log(`  ✅ Created KYC for: ${user.username} (${kyc.status})`);
    } catch (error) {
      console.error(`  ❌ Error creating KYC for ${user.username}:`, error.message);
    }
  }

  console.log(`\n✅ Total KYC submissions created: ${createdKYCs.length}\n`);
  return createdKYCs;
};

// Create sample affiliates
const createSampleAffiliates = async (users) => {
  console.log('🤝 Creating Sample Affiliates...\n');

  if (users.length < 2) {
    console.log('  ⚠️  Not enough users for affiliate creation.\n');
    return [];
  }

  const createdAffiliates = [];

  // Make first 2 users affiliates
  for (let i = 0; i < Math.min(2, users.length); i++) {
    const user = users[i];
    
    try {
      const existingAffiliate = await Affiliate.findOne({ userId: user._id });
      if (existingAffiliate) {
        console.log(`  ℹ️  Affiliate already exists for: ${user.username}`);
        createdAffiliates.push(existingAffiliate);
        continue;
      }

      const affiliateData = {
        userId: user._id,
        affiliateCode: user.referralCode || `AFF${user._id.toString().slice(-6).toUpperCase()}`,
        status: 'active',
        tier: i === 0 ? 'gold' : 'silver',
        totalEarnings: {
          BDT: randomBetween(5000, 20000),
          INR: randomBetween(1000, 5000),
          USD: 0,
        },
        monthlyEarnings: {
          BDT: randomBetween(1000, 5000),
          INR: randomBetween(500, 2000),
          USD: 0,
        },
        referralCount: randomBetween(5, 15),
        activeReferrals: randomBetween(3, 10),
        clickCount: randomBetween(50, 200),
        conversionRate: randomBetween(5, 15),
      };

      const affiliate = await Affiliate.create(affiliateData);
      createdAffiliates.push(affiliate);
      console.log(`  ✅ Created affiliate: ${user.username} (${affiliate.affiliateCode})`);
    } catch (error) {
      console.error(`  ❌ Error creating affiliate for ${user.username}:`, error.message);
    }
  }

  console.log(`\n✅ Total affiliates created: ${createdAffiliates.length}\n`);
  return createdAffiliates;
};

// Main seeding function
const seedDatabase = async () => {
  console.log('\n🌱 Starting Database Seeding...\n');
  console.log('=' .repeat(60));

  try {
    // Connect to MongoDB
    await connectDB();

    // Create sample data
    const users = await createSampleUsers();
    const markets = await createSampleMarkets();
    const bets = await createSampleBets(users, markets);
    const transactions = await createSampleTransactions(users);
    const kycs = await createSampleKYC(users);
    const affiliates = await createSampleAffiliates(users);

    console.log('=' .repeat(60));
    console.log('\n✅ Database seeding completed successfully!\n');
    
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Markets: ${markets.length}`);
    console.log(`   Bets: ${bets.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    console.log(`   KYC Submissions: ${kycs.length}`);
    console.log(`   Affiliates: ${affiliates.length}`);
    
    console.log('\n📝 Test Login Credentials:');
    console.log('   Email: john@example.com');
    console.log('   Password: Test@123456');
    console.log('\n   Email: admin@crickbet.com');
    console.log('   Password: Admin@123456');
    
    console.log('\n🚀 You can now test the application with sample data!\n');

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed\n');
    process.exit(0);
  }
};

// Run seeding
seedDatabase();
