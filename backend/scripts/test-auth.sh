#!/bin/bash

# Test Authentication Fix
# This script tests if login is working correctly

echo "🧪 Testing Authentication System"
echo "================================"
echo ""

# Test login
echo "📝 Testing Login..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "john@example.com",
    "password": "Test@123456"
  }')

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login Failed - No token received"
  exit 1
fi

echo "✅ Login Successful!"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Test /api/auth/me with token
echo "📝 Testing /api/auth/me with token..."
echo ""

ME_RESPONSE=$(curl -s -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ME_RESPONSE"
echo ""

# Check if successful
if echo "$ME_RESPONSE" | grep -q '"success":true'; then
  echo "✅ /api/auth/me Successful!"
  echo "🎉 Authentication system is working correctly!"
else
  echo "❌ /api/auth/me Failed"
  exit 1
fi
