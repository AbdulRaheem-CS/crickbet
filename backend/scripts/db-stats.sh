#!/bin/bash

# Database Statistics Script
# Shows current state of MongoDB collections

echo ""
echo "📊 CrickBet Database Statistics"
echo "================================"
echo ""

cd "$(dirname "$0")/.." || exit

node -e "
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Bet = require('./models/Bet');
const Market = require('./models/Market');
const Transaction = require('./models/Transaction');
const KYC = require('./models/KYC');
const Affiliate = require('./models/Affiliate');
const AffiliateLink = require('./models/AffiliateLink');
const CommissionDesignation = require('./models/CommissionDesignation');
const Referral = require('./models/Referral');
const Promotion = require('./models/Promotion');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('📈 Collection Statistics:\n');
  
  const stats = {
    'Users': await User.countDocuments(),
    'Admin Users': await User.countDocuments({ role: 'admin' }),
    'Regular Users': await User.countDocuments({ role: 'user' }),
    'Bets': await Bet.countDocuments(),
    'Active Bets': await Bet.countDocuments({ status: 'active' }),
    'Markets': await Market.countDocuments(),
    'Open Markets': await Market.countDocuments({ status: 'open' }),
    'Transactions': await Transaction.countDocuments(),
    'Pending Withdrawals': await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
    'KYC Submissions': await KYC.countDocuments(),
    'Verified KYC': await KYC.countDocuments({ status: 'approved' }),
    'Affiliates': await Affiliate.countDocuments(),
    'Active Affiliates': await Affiliate.countDocuments({ status: 'active' }),
    'Affiliate Links': await AffiliateLink.countDocuments(),
    'Commission Designations': await CommissionDesignation.countDocuments(),
    'Referrals': await Referral.countDocuments(),
    'Active Promotions': await Promotion.countDocuments({ isActive: true }),
  };

  console.table(stats);
  
  // Get admin user
  const admin = await User.findOne({ role: 'admin' }).select('email username createdAt');
  if (admin) {
    console.log('\n👤 Admin User:');
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);
    console.log('   Created:', admin.createdAt);
  }

  // Recent users
  const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('username email createdAt');
  if (recentUsers.length > 0) {
    console.log('\n👥 Recent Users:');
    recentUsers.forEach((user, i) => {
      console.log(\`   \${i + 1}. \${user.username} (\${user.email}) - \${user.createdAt.toLocaleDateString()}\`);
    });
  }

  console.log('\n');
  await mongoose.connection.close();
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"
