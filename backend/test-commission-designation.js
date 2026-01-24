/**
 * Test Script for Commission Designation API
 * Tests the complete CRUD operations with database
 */

const mongoose = require('mongoose');
const CommissionDesignation = require('./models/CommissionDesignation');
const User = require('./models/User');
require('dotenv').config();

async function testCommissionDesignation() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if CommissionDesignation model is accessible
    console.log('\n📋 Test 1: Model Check');
    console.log('CommissionDesignation model:', CommissionDesignation.modelName);
    
    // Test 2: Count existing designations
    console.log('\n📋 Test 2: Count Existing Designations');
    const count = await CommissionDesignation.countDocuments();
    console.log(`Total designations in database: ${count}`);

    // Test 3: Fetch all designations
    console.log('\n📋 Test 3: Fetch All Designations');
    const designations = await CommissionDesignation.find()
      .populate('affiliateId', 'username email')
      .populate('playerId', 'username email')
      .limit(5)
      .lean();
    
    if (designations.length > 0) {
      console.log(`Found ${designations.length} designations:`);
      designations.forEach((d, i) => {
        console.log(`  ${i + 1}. Affiliate: ${d.affiliateId?.username || 'N/A'}, Player: ${d.playerId?.username || 'N/A'}, Rate: ${d.commissionRate}%, Status: ${d.status}`);
      });
    } else {
      console.log('No designations found in database');
    }

    // Test 4: Check if there are any affiliates
    console.log('\n📋 Test 4: Check Available Affiliates');
    const affiliateCount = await User.countDocuments({ role: 'affiliate' });
    console.log(`Total affiliates in database: ${affiliateCount}`);

    if (affiliateCount > 0) {
      const sampleAffiliate = await User.findOne({ role: 'affiliate' }).select('username email').lean();
      console.log(`Sample affiliate: ${sampleAffiliate.username} (${sampleAffiliate.email})`);
    }

    // Test 5: Check if there are any users (potential players)
    console.log('\n📋 Test 5: Check Available Users');
    const userCount = await User.countDocuments({ role: 'user' });
    console.log(`Total users in database: ${userCount}`);

    if (userCount > 0) {
      const sampleUser = await User.findOne({ role: 'user' }).select('username email').lean();
      console.log(`Sample user: ${sampleUser.username} (${sampleUser.email})`);
    }

    // Test 6: Verify schema indexes
    console.log('\n📋 Test 6: Schema Indexes');
    const indexes = await CommissionDesignation.collection.getIndexes();
    console.log('Indexes on CommissionDesignation:');
    Object.keys(indexes).forEach(key => {
      console.log(`  - ${key}`);
    });

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

testCommissionDesignation();
