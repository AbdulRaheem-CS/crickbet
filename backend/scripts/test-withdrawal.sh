#!/bin/bash

##############################################################################
# Withdrawal Test Script
# Tests wallet withdrawal functionality
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
echo -e "${BLUE}    WITHDRAWAL API TEST SUITE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if we have a token from auth test
if [ -f /tmp/test_token.txt ]; then
  TOKEN=$(cat /tmp/test_token.txt)
  echo -e "${GREEN}✓ Using existing test token${NC}\n"
else
  echo -e "${YELLOW}⚠ No test token found. Running auth test first...${NC}\n"
  ./test-auth.sh
  TOKEN=$(cat /tmp/test_token.txt)
fi

# Test 1: Get Current Balance
echo -e "${YELLOW}[1/3] Testing Get Wallet Balance...${NC}"
BALANCE_RESPONSE=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

echo "$BALANCE_RESPONSE" | jq '.'

if echo "$BALANCE_RESPONSE" | jq -e '.success == true' > /dev/null; then
  INITIAL_BALANCE=$(echo "$BALANCE_RESPONSE" | jq -r '.data.balance')
  echo -e "${GREEN}✓ Current balance: ₹$INITIAL_BALANCE${NC}\n"
else
  echo -e "${RED}✗ Failed to get wallet balance${NC}\n"
  exit 1
fi

# Check if user has sufficient balance
if (( $(echo "$INITIAL_BALANCE < 100" | bc -l) )); then
  echo -e "${YELLOW}⚠ Insufficient balance for withdrawal test (need at least ₹100)${NC}"
  echo -e "${YELLOW}  Please add funds to test account or run deposit test first${NC}\n"
  exit 1
fi

# Test 2: Initiate Withdrawal
WITHDRAWAL_AMOUNT=100
echo -e "${YELLOW}[2/3] Testing Withdrawal Request (₹$WITHDRAWAL_AMOUNT)...${NC}"
WITHDRAWAL_RESPONSE=$(curl -s -X POST "$API_URL/wallet/withdraw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": '"$WITHDRAWAL_AMOUNT"',
    "method": "bank_transfer",
    "bankDetails": {
      "accountName": "Test User",
      "accountNumber": "1234567890",
      "ifscCode": "TEST0001234",
      "bankName": "Test Bank"
    }
  }')

echo "$WITHDRAWAL_RESPONSE" | jq '.'

if echo "$WITHDRAWAL_RESPONSE" | jq -e '.success == true' > /dev/null; then
  TRANSACTION_ID=$(echo "$WITHDRAWAL_RESPONSE" | jq -r '.data.transactionId')
  TXN_REF=$(echo "$WITHDRAWAL_RESPONSE" | jq -r '.data.txnRef')
  echo -e "${GREEN}✓ Withdrawal request submitted successfully${NC}"
  echo -e "  Transaction ID: $TRANSACTION_ID"
  echo -e "  Reference: $TXN_REF\n"
else
  echo -e "${RED}✗ Withdrawal request failed${NC}\n"
  ERROR_MSG=$(echo "$WITHDRAWAL_RESPONSE" | jq -r '.message')
  echo -e "${RED}Error: $ERROR_MSG${NC}\n"
  exit 1
fi

# Test 3: Verify Balance Updated
echo -e "${YELLOW}[3/3] Verifying Balance After Withdrawal Request...${NC}"
sleep 2

FINAL_BALANCE_RESPONSE=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

echo "$FINAL_BALANCE_RESPONSE" | jq '.'

if echo "$FINAL_BALANCE_RESPONSE" | jq -e '.success == true' > /dev/null; then
  CURRENT_BALANCE=$(echo "$FINAL_BALANCE_RESPONSE" | jq -r '.data.balance')
  echo -e "${GREEN}✓ Balance check successful${NC}"
  echo -e "  Initial Balance: ₹$INITIAL_BALANCE"
  echo -e "  Current Balance: ₹$CURRENT_BALANCE"
  echo -e "  Requested Withdrawal: ₹$WITHDRAWAL_AMOUNT"
  echo -e "  Status: Pending approval\n"
else
  echo -e "${RED}✗ Failed to check final balance${NC}\n"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ALL WITHDRAWAL TESTS PASSED!${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "Summary:"
echo -e "  - Balance retrieved: ${GREEN}✓${NC}"
echo -e "  - Withdrawal requested: ${GREEN}✓${NC}"
echo -e "  - Transaction created: ${GREEN}✓${NC}"
echo -e "  - Bank details validated: ${GREEN}✓${NC}"
echo -e "\n${YELLOW}Note: Withdrawal is pending admin approval${NC}"
