// Test MongoDB Connection to VPS
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection URI:', process.env.MONGODB_URI || process.env.MONGO_URI);
console.log('');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB VPS!');
    console.log('');
    console.log('📊 Connection Details:');
    console.log('  Database:', mongoose.connection.name);
    console.log('  Host:', mongoose.connection.host);
    console.log('  Port:', mongoose.connection.port);
    console.log('');
    
    // Test database operation
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: Date
    });
    const Test = mongoose.model('Test', testSchema);
    
    return Test.create({
      message: 'Connection test from local machine',
      timestamp: new Date()
    });
  })
  .then((doc) => {
    console.log('✅ Test document created successfully:');
    console.log('  ID:', doc._id);
    console.log('  Message:', doc.message);
    console.log('');
    console.log('🎉 MongoDB VPS is working perfectly!');
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('');
    console.log('✅ Connection closed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ ERROR: Could not connect to MongoDB VPS');
    console.error('');
    console.error('Error message:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting tips:');
    console.error('1. Check if MongoDB is running on the VPS: sudo systemctl status mongod');
    console.error('2. Verify the connection string in .env file');
    console.error('3. Check if firewall allows port 27017: sudo ufw status');
    console.error('4. Verify username and password are correct');
    console.error('5. Test from VPS: mongosh "mongodb://crickbet_user:CrickbetDB2026@72.62.196.197:27017/crickbet?authSource=crickbet"');
    console.error('');
    process.exit(1);
  });
