require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set in .env');
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const User = require('../models/User');
    const Affiliate = require('../models/Affiliate');

    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node approve-affiliate.js <email>');
      process.exit(1);
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }

    user.status = 'active';
    user.approvedAt = new Date();
    await user.save();

    const affiliate = await Affiliate.findOne({ user: user._id }).exec();
    if (affiliate) {
      affiliate.status = 'active';
      affiliate.approvedAt = new Date();
      await affiliate.save();
    }

    console.log('Approved user:', JSON.stringify({
      _id: user._id,
      email: user.email,
      status: user.status,
      approvedAt: user.approvedAt
    }, null, 2));

    if (affiliate) console.log('Affiliate updated:', JSON.stringify({
      _id: affiliate._id,
      affiliateCode: affiliate.affiliateCode,
      status: affiliate.status
    }, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
