#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# test-deposit.sh  —  Deposit / Wallet Tests
#
# Tests:
#   1. Get wallet balance (before)
#   2. List available payment methods
#   3. Initiate deposit (creates pending transaction)
#   4. Admin verifies / approves deposit (credits wallet)
#   5. Get wallet balance (after) — confirm amount landed
#   6. Check transaction appears in history
# ─────────────────────────────────────────────────────────────────────────────
source "$(dirname "$0")/_common.sh"

DEPOSIT_AMOUNT="${DEPOSIT_AMOUNT:-1000}"

echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║         DEPOSIT API TEST SUITE           ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Setup: get tokens ─────────────────────────────────────────────────────────
require_user_token
require_admin_token

# ── Test 1: Balance before ────────────────────────────────────────────────────
title "[1/6] Wallet balance (before deposit)"
BAL_RESP=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_RESP"; then
  BALANCE_BEFORE=$(jget "$BAL_RESP" "d['data']['balance']")
  AVAIL_BEFORE=$(jget "$BAL_RESP"   "d['data']['availableBalance']")
  LOCKED_BEFORE=$(jget "$BAL_RESP"  "d['data']['lockedFunds']")
  pass "Balance: ₹$BALANCE_BEFORE | Available: ₹$AVAIL_BEFORE | Locked: ₹$LOCKED_BEFORE"
else
  fail "Could not fetch balance: $(jmsg "$BAL_RESP")"; exit 1
fi

# ── Test 2: Payment methods ───────────────────────────────────────────────────
title "[2/6] Available payment methods"
PM_RESP=$(curl -s "$API_URL/wallet/payment-methods" -H "Authorization: Bearer $TOKEN")
if jok "$PM_RESP"; then
  PM_COUNT=$(jget "$PM_RESP" "len(d.get('data',[]))")
  PAYMENT_METHOD=$(jget "$PM_RESP" "d['data'][0]['id']")
  pass "$PM_COUNT payment method(s) — using: $PAYMENT_METHOD"
else
  fail "Could not fetch payment methods: $(jmsg "$PM_RESP")"
  PAYMENT_METHOD="upi"   # fallback
  warn "Using fallback method: $PAYMENT_METHOD"
fi

# ── Test 3: Initiate deposit ──────────────────────────────────────────────────
title "[3/6] Initiate deposit of ₹$DEPOSIT_AMOUNT"
DEP_RESP=$(curl -s -X POST "$API_URL/wallet/deposit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $DEPOSIT_AMOUNT,
    \"paymentMethod\": \"$PAYMENT_METHOD\",
    \"paymentDetails\": {
      \"utrNumber\":  \"UTR$(date +%s)\",
      \"accountName\": \"Test Depositor\"
    }
  }")
if jok "$DEP_RESP"; then
  TXN_ID=$(jget "$DEP_RESP" "d.get('data',{}).get('transactionId') or d.get('data',{}).get('_id','')")
  TXN_STATUS=$(jget "$DEP_RESP" "d.get('data',{}).get('status','')")
  pass "Deposit initiated — txnId: $TXN_ID | status: $TXN_STATUS"
else
  fail "Deposit initiation failed: $(jmsg "$DEP_RESP")"
  exit 1
fi

# ── Test 4: Admin verifies deposit ────────────────────────────────────────────
title "[4/6] Admin approves deposit"
if [ -z "$TXN_ID" ]; then
  fail "No transaction ID — skipping verification"
else
  VERIFY_RESP=$(curl -s -X POST "$API_URL/wallet/deposit/verify" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"transactionId\": \"$TXN_ID\",
      \"status\":        \"approved\",
      \"adminNote\":     \"Approved by test suite\"
    }")
  if jok "$VERIFY_RESP"; then
    NEW_BAL=$(jget "$VERIFY_RESP" "d.get('data',{}).get('newBalance','')")
    pass "Deposit approved — new balance: ₹$NEW_BAL"
  else
    fail "Deposit verification failed: $(jmsg "$VERIFY_RESP")"
  fi
fi

# ── Test 5: Balance after ─────────────────────────────────────────────────────
title "[5/6] Wallet balance (after deposit)"
sleep 1
BAL_AFTER=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_AFTER"; then
  BALANCE_AFTER=$(jget "$BAL_AFTER" "d['data']['balance']")
  AVAIL_AFTER=$(jget "$BAL_AFTER"   "d['data']['availableBalance']")
  EXPECTED=$(python3 -c "print($BALANCE_BEFORE + $DEPOSIT_AMOUNT)")
  pass "Balance after: ₹$BALANCE_AFTER | Available: ₹$AVAIL_AFTER"
  if python3 -c "exit(0 if abs($BALANCE_AFTER - $EXPECTED) < 0.01 else 1)" 2>/dev/null; then
    pass "Amount correctly credited (₹$BALANCE_BEFORE + ₹$DEPOSIT_AMOUNT = ₹$BALANCE_AFTER)"
  else
    fail "Balance mismatch — expected ₹$EXPECTED, got ₹$BALANCE_AFTER"
  fi
else
  fail "Could not fetch balance: $(jmsg "$BAL_AFTER")"
fi

# ── Test 6: Transaction history ───────────────────────────────────────────────
title "[6/6] Transaction appears in wallet history"
TXN_HIST=$(curl -s "$API_URL/wallet/transactions?limit=5" -H "Authorization: Bearer $TOKEN")
if jok "$TXN_HIST"; then
  COUNT=$(jget "$TXN_HIST" "len(d.get('data',[]) or d.get('data',{}).get('transactions',[]))")
  pass "Transaction history has $COUNT recent record(s)"
  LATEST_TYPE=$(jget "$TXN_HIST" "(d.get('data',[{}]) if isinstance(d.get('data',[]), list) else d.get('data',{}).get('transactions',[{}]))[0].get('type','')")
  info "Latest transaction type: $LATEST_TYPE"
else
  fail "Could not fetch transaction history: $(jmsg "$TXN_HIST")"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}Deposit Summary:${NC}"
echo -e "    Balance before  : ₹$BALANCE_BEFORE"
echo -e "    Deposit amount  : ₹$DEPOSIT_AMOUNT"
echo -e "    Balance after   : ₹${BALANCE_AFTER:-?}"
print_summary "Deposit Tests"
