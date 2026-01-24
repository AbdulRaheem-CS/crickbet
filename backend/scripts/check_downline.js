require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const AFFILIATE_ID = '6973ef1d7c6538baadb6b5b8'; // ahmad

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const downline = await User.find({ referredBy: AFFILIATE_ID }).select('username email role referredBy createdAt').lean();
    console.log('Downline count:', downline.length);
    console.log(JSON.stringify(downline, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
})();
