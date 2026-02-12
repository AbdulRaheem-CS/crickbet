#!/bin/bash

##############################################################################
# Authentication Test Script
# Tests login and user profile retrieval
# Saves token to /tmp/test_token.txt for other test scripts
##############################################################################

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_URL="${API_URL:-http://localhost:5001/api}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   AUTHENTICATION API TEST SUITE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Login
echo -e "${YELLOW}[1/2] Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "john@example.com",
    "password": "Test@123456"
  }')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token using python3 (works without jq) - token may be at top level or nested under data
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import sys,json
d=json.load(sys.stdin)
token = d.get('token','') or d.get('data',{}).get('token','')
print(token)
" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login Failed - No token received${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Login Successful!${NC}"
echo -e "  Token: ${TOKEN:0:50}..."

# Save token for other test scripts
echo "$TOKEN" > /tmp/test_token.txt
echo -e "  ${BLUE}Token saved to /tmp/test_token.txt${NC}\n"

# Test 2: Get User Profile (/api/auth/me)
echo -e "${YELLOW}[2/2] Testing /api/auth/me...${NC}"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ME_RESPONSE"

if echo "$ME_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; then
  USERNAME=$(echo "$ME_RESPONSE" | python3 -c "
import sys,json
d=json.load(sys.stdin)
user = d.get('data',{})
if isinstance(user, dict) and 'user' in user:
    user = user['user']
print(user.get('username',''))
" 2>/dev/null)
  echo "$USERNAME" > /tmp/test_username.txt
  echo -e "${GREEN}✓ Profile retrieved successfully!${NC}"
  echo -e "  Username: $USERNAME\n"
else
  echo -e "${RED}✗ /api/auth/me Failed${NC}"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ALL AUTH TESTS PASSED!${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "Summary:"
echo -e "  - Login: ${GREEN}✓${NC}"
echo -e "  - Profile: ${GREEN}✓${NC}"
echo -e "  🎉 Authentication system is working correctly!"
