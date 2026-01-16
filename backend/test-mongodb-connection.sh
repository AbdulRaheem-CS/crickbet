#!/bin/bash

# MongoDB Connection Test Script
# This script helps you test your MongoDB connection

echo "========================================="
echo "MongoDB Connection Test"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file in the backend directory.${NC}"
    echo -e "${YELLOW}You can copy from .env.example:${NC}"
    echo ""
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

# Load environment variables
source .env

echo -e "${YELLOW}Testing MongoDB connection...${NC}"
echo ""
echo "Connection URI: ${MONGODB_URI}"
echo ""

# Test with Node.js
node -e "
const mongoose = require('mongoose');

mongoose.connect('${MONGODB_URI}')
  .then(() => {
    console.log('\\x1b[32m✅ SUCCESS: Connected to MongoDB!\\x1b[0m');
    console.log('');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    console.log('');
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('\\x1b[32m✅ Connection closed successfully\\x1b[0m');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\x1b[31m❌ ERROR: Could not connect to MongoDB\\x1b[0m');
    console.error('');
    console.error('Error message:', error.message);
    console.error('');
    console.error('\\x1b[33mTroubleshooting tips:\\x1b[0m');
    console.error('1. Check if MongoDB is running on the VPS');
    console.error('2. Verify the connection string in .env file');
    console.error('3. Check if firewall allows port 27017');
    console.error('4. Verify username and password are correct');
    console.error('');
    process.exit(1);
  });
" || {
    echo -e "${RED}❌ Error: Failed to run test${NC}"
    echo -e "${YELLOW}Make sure you have installed dependencies:${NC}"
    echo ""
    echo "  npm install"
    echo ""
    exit 1
}

echo ""
echo "========================================="
