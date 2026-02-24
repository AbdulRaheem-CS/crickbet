#!/bin/bash

##############################################################################
# Deposit Test Script  (5 steps)
#
# Flow:
#   1. Wallet balance (before)
#   2. List payment methods
#   3. Initiate deposit  → POST /api/wallet/deposit        (status: pending)
#   4. Verify / approve  → POST /api/wallet/deposit/verify (credits wallet)
#   5. Wallet balance (after) — confirm amount landed
#
# Admin credentials used ONLY for step 4 (deposit verification).
# User token is re-used for all other steps.
##############################################################################

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:5001/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@crickbet.com}"
ADMIN_PASS="${ADMIN_PASS:-Admin@123456}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── helpers ────────────────────────────────────────────────
json_get()   { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print($2)" 2>/dev/null; }
json_ok()    { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; }
json_print() { echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"; }

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       DEPOSIT API TEST SUITE             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}\n"

# ── User token ─────────────────────────────────────────────
if [ -f /tmp/test_token.txt ]; then
  TOKEN=$(cat /tmp/test_token.txt)
  USERNAME=$(cat /tmp/test_username.txt 2>/dev/null)
  echo -e "${GREEN}✓ Using existing user token (${USERNAME})${NC}\n"
else
  echo -e "${YELLOW}⚠ No user token — running auth test first...${NC}\n"
  bash "$SCRIPT_DIR/test-auth.sh"
  TOKEN=$(cat /tmp/test_token.txt 2>/dev/null)
  [ -z "$TOKEN" ] && { echo -e "${RED}✗ Cannot obtain user token. Abort.${NC}"; exit 1; }
fi

# ── Admin token (needed for deposit verification) ──────────
echo -e "${CYAN}[admin login] Obtaining admin token for deposit approval...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")

ADMIN_TOKEN=$(json_get "$ADMIN_LOGIN" "d.get('data',{}).get('token') or d.get('token','')")
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}⚠ Admin login failed — deposit verify step will be skipped.${NC}"
  echo -e "  Set ADMIN_EMAIL / ADMIN_PASS env vars if credentials differ.\n"
else
  echo -e "${GREEN}✓ Admin token obtained${NC}\n"
fi

# ══════════════════════════════════════════════════════════
# STEP 1 — Wallet balance before deposit
# ══════════════════════════════════════════════════════════
echo -e "${YELLOW}[1/5] Wallet balance (before deposit)...${NC}"
BAL_BEFORE_RESP=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")
json_print "$BAL_BEFORE_RESP"

if json_ok "$BAL_BEFORE_RESP"; then
  BALANCE_BEFORE=$(json_get "$BAL_BEFORE_RESP" "d['data']['balance']")
  echo -e "${GREEN}✓ Balance before: ₹$BALANCE_BEFORE${NC}\n"
else
  echo -e "${RED}✗ Failed to fetch wallet balance${NC}\n"; exit 1
fi

# ══════════════════════════════════════════════════════════
# STEP 2 — Payment methods
# ══════════════════════════════════════════════════════════
echo -e "${YELLOW}[2/5] Available payment methods...${NC}"
PM_RESP=$(curl -s -X GET "$API_URL/wallet/payment-methods" \
  -H "Authorization: Bearer $TOKEN")
json_print "$PM_RESP"

if json_ok "$PM_RESP"; then
  PM_COUNT=$(json_get "$PM_RESP" "len(d.get('data',[]))")
  echo -e "${GREEN}✓ Found $PM_COUNT payment method(s)${NC}"
  echo -e "\n${BLUE}Available methods:${NC}"
  echo "$PM_RESP" | python3 -c "
import sys,json
for m in json.load(sys.stdin).get('data',[]):
    print(f\"  - {m.get('name','?')} ({m.get('id','?')}): ₹{m.get('minAmount','?')} – ₹{m.get('maxAmount','?')}\")
" 2>/dev/null
  PAYMENT_METHOD=$(json_get "$PM_RESP" "d['data'][0]['id']")
  echo -e "\n${CYAN}Using: $PAYMENT_METHOD${NC}\n"
else
  echo -e "${RED}✗ Failed to fetch payment methods${NC}\n"; exit 1
fi

# ══════════════════════════════════════════════════════════
# STEP 3 — Initiate deposit (creates pending transaction)
# ══════════════════════════════════════════════════════════
DEPOSIT_AMOUNT=1000
echo -e "${YELLOW}[3/5] Initiate deposit ₹$DEPOSIT_AMOUNT via $PAYMENT_METHOD...${NC}"
DEPOSIT_RESP=$(curl -s -X POST "$API_URL/wallet/deposit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\": $DEPOSIT_AMOUNT, \"method\": \"$PAYMENT_METHOD\"}")
json_print "$DEPOSIT_RESP"

if json_ok "$DEPOSIT_RESP"; then
  TXN_ID=$(json_get "$DEPOSIT_RESP" "d['data'].get('transactionId') or d['data'].get('_id','')")
  TXN_REF=$(json_get "$DEPOSIT_RESP" "d['data'].get('txnRef','')")
  echo -e "${GREEN}✓ Deposit initiated (status: pending)${NC}"
  echo -e "  Transaction ID : $TXN_ID"
  echo -e "  Reference      : $TXN_REF\n"
else
  ERROR=$(json_get "$DEPOSIT_RESP" "d.get('message','unknown')")
  echo -e "${RED}✗ Deposit initiation failed — $ERROR${NC}\n"; exit 1
fi

# ══════════════════════════════════════════════════════════
# STEP 4 — Verify / approve deposit → credits the wallet
#   POST /api/wallet/deposit/verify
#   Body: { transactionId, paymentId }
#   The verifyDeposit service method does: user.wallet.balance += amount
# ══════════════════════════════════════════════════════════
echo -e "${YELLOW}[4/5] Verify deposit — credit ₹$DEPOSIT_AMOUNT to wallet...${NC}"

if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}⚠ Skipping verification (no admin token). Balance will remain unchanged.${NC}\n"
  VERIFY_OK=false
else
  # verifyDeposit is called via the user-facing /deposit/verify route
  # It only needs: transactionId (and optionally gatewayTransactionId)
  VERIFY_RESP=$(curl -s -X POST "$API_URL/wallet/deposit/verify" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"transactionId\": \"$TXN_ID\",
      \"paymentId\": \"MANUAL-TEST-$(date +%s)\"
    }")
  json_print "$VERIFY_RESP"

  if json_ok "$VERIFY_RESP"; then
    VERIFY_STATUS=$(json_get "$VERIFY_RESP" "d.get('data',{}).get('status','?')")
    echo -e "${GREEN}✓ Deposit verified! Transaction status: $VERIFY_STATUS${NC}\n"
    VERIFY_OK=true
  else
    ERR=$(json_get "$VERIFY_RESP" "d.get('message','unknown')")
    echo -e "${RED}✗ Verification failed — $ERR${NC}\n"
    VERIFY_OK=false
  fi
fi

# ══════════════════════════════════════════════════════════
# STEP 5 — Balance after deposit
# ══════════════════════════════════════════════════════════
echo -e "${YELLOW}[5/5] Wallet balance (after deposit)...${NC}"
BAL_AFTER_RESP=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")
json_print "$BAL_AFTER_RESP"

if json_ok "$BAL_AFTER_RESP"; then
  BALANCE_AFTER=$(json_get "$BAL_AFTER_RESP" "d['data']['balance']")
  CREDITED=$(python3 -c "print($BALANCE_AFTER - $BALANCE_BEFORE)" 2>/dev/null || echo "?")
  echo -e "${GREEN}✓ Balance after: ₹$BALANCE_AFTER${NC}"

  if [ "$VERIFY_OK" = true ]; then
    if python3 -c "exit(0 if $BALANCE_AFTER > $BALANCE_BEFORE else 1)" 2>/dev/null; then
      echo -e "${GREEN}  ₹$BALANCE_BEFORE  +  ₹$CREDITED credited  =  ₹$BALANCE_AFTER  ✓${NC}\n"
    else
      echo -e "${RED}  ⚠ Balance did not increase! Before: ₹$BALANCE_BEFORE  After: ₹$BALANCE_AFTER${NC}\n"
    fi
  fi
else
  echo -e "${RED}✗ Failed to fetch final balance${NC}\n"; exit 1
fi

# ── Summary ────────────────────────────────────────────────
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           TEST SUMMARY                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo -e "  Payment methods fetched : ${GREEN}✓${NC}"
echo -e "  Deposit initiated       : ${GREEN}✓${NC}  (₹$DEPOSIT_AMOUNT via $PAYMENT_METHOD)"
echo -e "  Deposit verified        : $([ "$VERIFY_OK" = true ] && echo -e "${GREEN}✓${NC}" || echo -e "${YELLOW}skipped${NC}")"
echo -e "  Balance before          : ₹$BALANCE_BEFORE"
echo -e "  Balance after           : ₹$BALANCE_AFTER"
if [ "$VERIFY_OK" = true ]; then
  echo -e "  Amount credited         : ₹$CREDITED"
fi
echo -e "  Transaction ref         : $TXN_REF"
echo ""
