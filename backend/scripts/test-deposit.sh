#!/bin/bash

##############################################################################
# Deposit Test Script
# Tests wallet deposit functionality including payment methods
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
echo -e "${BLUE}      DEPOSIT API TEST SUITE${NC}"
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

# Test 2: Get Payment Methods
echo -e "${YELLOW}[2/4] Testing Get Payment Methods...${NC}"
PAYMENT_METHODS_RESPONSE=$(curl -s -X GET "$API_URL/wallet/payment-methods" \
  -H "Authorization: Bearer $TOKEN")

json_pretty "$PAYMENT_METHODS_RESPONSE"

if json_check "$PAYMENT_METHODS_RESPONSE"; then
  METHOD_COUNT=$(json_get "$PAYMENT_METHODS_RESPONSE" "len(d.get('data',[]))")
  echo -e "${GREEN}✓ Found $METHOD_COUNT payment method(s)${NC}"
  
  # Show available methods
  echo -e "\n${BLUE}Available Payment Methods:${NC}"
  echo "$PAYMENT_METHODS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
for m in data:
    print(f\"  - {m.get('name','?')} ({m.get('id','?')}): ₹{m.get('minAmount','?')} - ₹{m.get('maxAmount','?')}\")
" 2>/dev/null
  
  # Get first payment method for testing
  PAYMENT_METHOD=$(json_get "$PAYMENT_METHODS_RESPONSE" "d.get('data',[])[0].get('id','')")
  echo -e "\n${YELLOW}Using payment method: $PAYMENT_METHOD${NC}\n"
else
  echo -e "${RED}✗ Failed to get payment methods${NC}\n"
  exit 1
fi

# Test 3: Initiate Deposit
DEPOSIT_AMOUNT=1000
echo -e "${YELLOW}[3/4] Testing Deposit Initiation (₹$DEPOSIT_AMOUNT)...${NC}"
DEPOSIT_RESPONSE=$(curl -s -X POST "$API_URL/wallet/deposit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": '"$DEPOSIT_AMOUNT"',
    "method": "'"$PAYMENT_METHOD"'"
  }')

json_pretty "$DEPOSIT_RESPONSE"

if json_check "$DEPOSIT_RESPONSE"; then
  TRANSACTION_ID=$(json_get "$DEPOSIT_RESPONSE" "d.get('data',{}).get('transactionId',d.get('data',{}).get('_id',''))")
  TXN_REF=$(json_get "$DEPOSIT_RESPONSE" "d.get('data',{}).get('txnRef','')")
  echo -e "${GREEN}✓ Deposit initiated successfully${NC}"
  echo -e "  Transaction ID: $TRANSACTION_ID"
  echo -e "  Reference: $TXN_REF\n"
else
  echo -e "${RED}✗ Deposit initiation failed${NC}"
  ERROR_MSG=$(json_get "$DEPOSIT_RESPONSE" "d.get('message','')")
  echo -e "${RED}Error: $ERROR_MSG${NC}\n"
  exit 1
fi

# Test 4: Verify Balance After Deposit
echo -e "${YELLOW}[4/4] Checking Balance After Deposit...${NC}"
echo -e "${BLUE}Note: In production, deposit is approved by admin or payment gateway${NC}\n"
sleep 2

FINAL_BALANCE_RESPONSE=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

json_pretty "$FINAL_BALANCE_RESPONSE"

if json_check "$FINAL_BALANCE_RESPONSE"; then
  CURRENT_BALANCE=$(json_get "$FINAL_BALANCE_RESPONSE" "d.get('data',{}).get('balance',0)")
  echo -e "${GREEN}✓ Balance check successful${NC}"
  echo -e "  Initial Balance: ₹$INITIAL_BALANCE"
  echo -e "  Current Balance: ₹$CURRENT_BALANCE"
  echo -e "  Status: Pending approval\n"
else
  echo -e "${RED}✗ Failed to check final balance${NC}\n"
  exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}   ALL DEPOSIT TESTS PASSED!${NC}"
echo -e "${BLUE}========================================${NC}\n"
echo -e "Summary:"
echo -e "  - Payment methods fetched: ${GREEN}✓${NC}"
echo -e "  - Deposit initiated: ${GREEN}✓${NC}"
echo -e "  - Transaction created: ${GREEN}✓${NC}"
echo -e "  - Balance tracking: ${GREEN}✓${NC}"
echo -e "\n${YELLOW}Note: Deposit is pending admin approval or payment gateway confirmation${NC}"
