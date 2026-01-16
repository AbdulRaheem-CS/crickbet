/**
 * Create Admin User Script
 * Creates a super admin user for accessing the admin panel
 * 
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

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

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@crickbet.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📧 Email: admin@crickbet.com');
      console.log('🔑 Password: Admin@123456');
      console.log('👤 Role:', existingAdmin.role);
      return;
    }

    // Create new admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@crickbet.com',
      password: 'Admin@123456', // Will be hashed by pre-save hook
      phone: '9999999999',
      role: 'super_admin',
      status: 'active',
      isEmailVerified: true,
      kycStatus: 'verified',
      wallet: {
        balance: 1000000,
        bonus: 0,
        currency: 'INR',
      },
      referralCode: 'ADMIN2026',
    });

    console.log('\n✅ Super Admin User Created Successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    admin@crickbet.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Role:     super_admin');
    console.log('💰 Balance:  ₹1,000,000');
    console.log('═══════════════════════════════════════\n');
    console.log('🌐 Login at: http://localhost:3000/login');
    console.log('🔐 Admin Panel: http://localhost:3000/admin\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createAdmin();
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
};

main();
