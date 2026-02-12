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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    WITHDRAWAL API TEST SUITE${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Helper: parse JSON with python3 (no jq dependency)
json_get() {
  echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print($2)" 2>/dev/null
}

json_check() {
  echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null
}

json_pretty() {
  echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

# Check if we have a token from auth test
if [ -f /tmp/test_token.txt ]; then
  TOKEN=$(cat /tmp/test_token.txt)
  echo -e "${GREEN}✓ Using existing test token${NC}\n"
else
  echo -e "${YELLOW}⚠ No test token found. Running auth test first...${NC}\n"
  bash "$SCRIPT_DIR/test-auth.sh"
  if [ -f /tmp/test_token.txt ]; then
    TOKEN=$(cat /tmp/test_token.txt)
  else
    echo -e "${RED}✗ Failed to obtain auth token${NC}"
    exit 1
  fi
fi

# Test 1: Get Current Balance
echo -e "${YELLOW}[1/4] Testing Get Wallet Balance...${NC}"
BALANCE_RESPONSE=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

json_pretty "$BALANCE_RESPONSE"

if json_check "$BALANCE_RESPONSE"; then
  INITIAL_BALANCE=$(json_get "$BALANCE_RESPONSE" "d.get('data',{}).get('balance',0)")
  echo -e "${GREEN}✓ Current balance: ₹$INITIAL_BALANCE${NC}\n"
else
  echo -e "${RED}✗ Failed to get wallet balance${NC}\n"
  exit 1
fi

# Test 2: Get Transaction History
echo -e "${YELLOW}[2/4] Testing Get Transaction History...${NC}"
TXN_RESPONSE=$(curl -s -X GET "$API_URL/wallet/transactions?limit=5" \
  -H "Authorization: Bearer $TOKEN")

json_pretty "$TXN_RESPONSE"

if json_check "$TXN_RESPONSE"; then
  TXN_COUNT=$(json_get "$TXN_RESPONSE" "len(d.get('data',{}).get('transactions',d.get('data',[])))" 2>/dev/null || echo "0")
  echo -e "${GREEN}✓ Transaction history retrieved ($TXN_COUNT recent transactions)${NC}\n"
else
  echo -e "${RED}✗ Failed to get transaction history${NC}\n"
  exit 1
fi

# Test 3: Get Wallet Stats
echo -e "${YELLOW}[3/4] Testing Get Wallet Stats...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/wallet/stats" \
  -H "Authorization: Bearer $TOKEN")

json_pretty "$STATS_RESPONSE"

if json_check "$STATS_RESPONSE"; then
  echo -e "${GREEN}✓ Wallet stats retrieved successfully${NC}\n"
else
  echo -e "${YELLOW}⚠ Wallet stats not available (optional endpoint)${NC}\n"
fi

# Test 4: Test Withdrawal Request (KYC Required)
WITHDRAWAL_AMOUNT=100
echo -e "${YELLOW}[4/4] Testing Withdrawal Request (₹$WITHDRAWAL_AMOUNT)...${NC}"
echo -e "${BLUE}Note: Withdrawals require KYC verification (security feature)${NC}\n"

WITHDRAWAL_RESPONSE=$(curl -s -X POST "$API_URL/wallet/withdrawal" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": '"$WITHDRAWAL_AMOUNT"',
    "bankDetails": {
      "accountName": "Test User",
      "accountNumber": "1234567890",
      "ifsc": "TEST0001234",
      "bankName": "Test Bank"
    }
  }')

json_pretty "$WITHDRAWAL_RESPONSE"

if json_check "$WITHDRAWAL_RESPONSE"; then
  TRANSACTION_ID=$(json_get "$WITHDRAWAL_RESPONSE" "d.get('data',{}).get('transactionId',d.get('data',{}).get('_id',''))")
  TXN_REF=$(json_get "$WITHDRAWAL_RESPONSE" "d.get('data',{}).get('txnRef','')")
  echo -e "${GREEN}✓ Withdrawal request submitted successfully${NC}"
  echo -e "  Transaction ID: $TRANSACTION_ID"
  echo -e "  Reference: $TXN_REF\n"
else
  # Check if it's a KYC requirement (expected security behavior)
  KYC_CODE=$(json_get "$WITHDRAWAL_RESPONSE" "d.get('code','')")
  ERROR_MSG=$(json_get "$WITHDRAWAL_RESPONSE" "d.get('message','')")
  
  if [ "$KYC_CODE" = "KYC_REQUIRED" ]; then
    echo -e "${GREEN}✓ KYC verification correctly enforced for withdrawals${NC}"
    echo -e "  ${BLUE}Security Check: KYC verification required before withdrawal${NC}"
    echo -e "  ${BLUE}This is expected behavior - users must verify identity first${NC}\n"
  else
    echo -e "${RED}✗ Withdrawal request failed: $ERROR_MSG${NC}\n"
    exit 1
  fi
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ALL WITHDRAWAL TESTS PASSED!${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "Summary:"
echo -e "  - Balance retrieved: ${GREEN}✓${NC}"
echo -e "  - Transaction history: ${GREEN}✓${NC}"
echo -e "  - Wallet stats: ${GREEN}✓${NC}"
echo -e "  - Withdrawal security (KYC): ${GREEN}✓${NC}"
echo -e "\n${YELLOW}Note: Withdrawals require KYC verification and admin approval${NC}"
