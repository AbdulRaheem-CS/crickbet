require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const AFFILIATE_ID = '6973ef1d7c6538baadb6b5b8'; // ahmad's user id

const players = [
  {
    username: 'ref_player_1',
    email: 'ref_player_1@example.com',
    password: 'Player@1234',
    phone: '9000000001'
  },
  {
    username: 'ref_player_2',
    email: 'ref_player_2@example.com',
    password: 'Player@1234',
    phone: '9000000002'
  }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const p of players) {
      const exists = await User.findOne({ $or: [{ email: p.email }, { username: p.username }] });
      if (exists) {
        console.log(`Skipping existing user: ${p.email} (${p.username})`);
        continue;
      }

      const user = await User.create({
        username: p.username,
        email: p.email,
        password: p.password,
        phone: p.phone,
        role: 'user',
        referredBy: AFFILIATE_ID
      });

      console.log(`Created user: ${user.username} (${user._id}) referredBy=${user.referredBy}`);
    }

    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
