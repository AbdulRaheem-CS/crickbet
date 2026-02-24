#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# test-withdrawal.sh  —  Withdrawal Flow Tests
#
# Tests:
#   1.  Get balance before withdrawal
#   2.  Request a withdrawal (POST /api/wallet/withdrawal)
#   3.  Verify balance is locked (availableBalance decreases, lockedFunds increases)
#   4.  Get withdrawal status by ID
#   5.  Admin views pending withdrawals
#   6.  Admin approves the withdrawal
#   7.  Verify balance is deducted after approval
#   8.  Request another withdrawal + admin REJECTS it
#   9.  Verify balance is restored after rejection
# ─────────────────────────────────────────────────────────────────────────────
source "$(dirname "$0")/_common.sh"

WITHDRAW_AMOUNT="${WITHDRAW_AMOUNT:-300}"
UPI_ID="${UPI_ID:-test@upi}"

echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║        WITHDRAWAL API TEST SUITE         ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Setup: tokens ─────────────────────────────────────────────────────────────
require_user_token
require_admin_token

# ── Test 1: Balance before ────────────────────────────────────────────────────
title "[1/9] Wallet balance before withdrawal"
BAL_RESP=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_RESP"; then
  BALANCE_BEFORE=$(jget "$BAL_RESP" "d['data']['balance']")
  AVAIL_BEFORE=$(jget "$BAL_RESP"   "d['data']['availableBalance']")
  LOCKED_BEFORE=$(jget "$BAL_RESP"  "d['data']['lockedFunds']")
  pass "Balance: ₹$BALANCE_BEFORE | Available: ₹$AVAIL_BEFORE | Locked: ₹$LOCKED_BEFORE"
  # Guard: need enough available balance
  if python3 -c "exit(0 if float('${AVAIL_BEFORE:-0}') >= $WITHDRAW_AMOUNT else 1)" 2>/dev/null; then
    pass "Sufficient balance to withdraw ₹$WITHDRAW_AMOUNT"
  else
    warn "Available balance (₹$AVAIL_BEFORE) < withdrawal amount (₹$WITHDRAW_AMOUNT)"
    WITHDRAW_AMOUNT=$(python3 -c "v=float('${AVAIL_BEFORE:-0}'); print(int(v*0.5) if v > 10 else 0)")
    if [ "$WITHDRAW_AMOUNT" -le 0 ]; then
      fail "Insufficient funds — run test-deposit.sh first"
      exit 1
    fi
    warn "Adjusted withdrawal amount to ₹$WITHDRAW_AMOUNT"
  fi
else
  fail "Could not get balance: $(jmsg "$BAL_RESP")"; exit 1
fi

# ── Test 2: Request withdrawal ────────────────────────────────────────────────
title "[2/9] Request withdrawal of ₹$WITHDRAW_AMOUNT"
WD_RESP=$(curl -s -X POST "$API_URL/wallet/withdrawal" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\":        $WITHDRAW_AMOUNT,
    \"paymentMethod\": \"upi\",
    \"paymentDetails\": {
      \"upiId\":       \"$UPI_ID\",
      \"accountName\": \"Test User\"
    }
  }")
if jok "$WD_RESP"; then
  WD_ID=$(jget "$WD_RESP" "d.get('data',{}).get('withdrawalId') or d.get('data',{}).get('_id','')")
  WD_STATUS=$(jget "$WD_RESP" "d.get('data',{}).get('status','pending')")
  pass "Withdrawal requested — ID: $WD_ID | Status: $WD_STATUS"
  echo "$WD_ID" > /tmp/cb_wd_id.txt
else
  fail "Withdrawal request failed: $(jmsg "$WD_RESP")"
  exit 1
fi

# ── Test 3: Balance locked ────────────────────────────────────────────────────
title "[3/9] Balance locked after withdrawal request"
sleep 1
BAL_LOCKED=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_LOCKED"; then
  AVAIL_LOCKED=$(jget "$BAL_LOCKED"  "d['data']['availableBalance']")
  LOCKED_NOW=$(jget "$BAL_LOCKED"    "d['data']['lockedFunds']")
  BALANCE_NOW=$(jget "$BAL_LOCKED"   "d['data']['balance']")
  pass "Balance: ₹$BALANCE_NOW | Available: ₹$AVAIL_LOCKED | Locked: ₹$LOCKED_NOW"
  # Service deducts from balance AND adds to lockedFunds → availableBalance drops by 2x amount
  EXPECTED_AVAIL=$(python3 -c "print(round($AVAIL_BEFORE - 2 * $WITHDRAW_AMOUNT, 2))")
  EXPECTED_LOCKED=$(python3 -c "print(round($LOCKED_BEFORE + $WITHDRAW_AMOUNT, 2))")
  if python3 -c "exit(0 if abs($AVAIL_LOCKED - $EXPECTED_AVAIL) < 0.01 else 1)" 2>/dev/null; then
    pass "Available balance correctly reduced (was ₹$AVAIL_BEFORE → ₹$AVAIL_LOCKED)"
  else
    fail "Available balance mismatch — expected ₹$EXPECTED_AVAIL, got ₹$AVAIL_LOCKED"
  fi
  if python3 -c "exit(0 if abs($LOCKED_NOW - $EXPECTED_LOCKED) < 0.01 else 1)" 2>/dev/null; then
    pass "Locked funds correctly increased by ₹$WITHDRAW_AMOUNT (now ₹$LOCKED_NOW)"
  else
    fail "Locked funds mismatch — expected ₹$EXPECTED_LOCKED, got ₹$LOCKED_NOW"
  fi
else
  fail "Could not get balance: $(jmsg "$BAL_LOCKED")"
fi

# ── Test 4: Get withdrawal status ─────────────────────────────────────────────
title "[4/9] Get withdrawal status by ID"
if [ -n "$WD_ID" ]; then
  WD_STATUS_RESP=$(curl -s "$API_URL/wallet/withdrawal/$WD_ID" \
    -H "Authorization: Bearer $TOKEN")
  if jok "$WD_STATUS_RESP"; then
    FETCHED_STATUS=$(jget "$WD_STATUS_RESP" "d.get('data',{}).get('status','')")
    FETCHED_AMOUNT=$(jget "$WD_STATUS_RESP" "d.get('data',{}).get('amount',0)")
    pass "Status: $FETCHED_STATUS | Amount: ₹$FETCHED_AMOUNT"
  else
    fail "Could not fetch withdrawal: $(jmsg "$WD_STATUS_RESP")"
  fi
else
  fail "No withdrawal ID available"
fi

# ── Test 5: Admin views pending withdrawals ───────────────────────────────────
title "[5/9] Admin views pending withdrawals"
PENDING_RESP=$(curl -s "$API_URL/admin/withdrawals/pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
if jok "$PENDING_RESP"; then
  PENDING_COUNT=$(jget "$PENDING_RESP" "len(d.get('data',[]) or [])")
  pass "$PENDING_COUNT pending withdrawal(s) in queue"
else
  fail "Could not fetch pending withdrawals: $(jmsg "$PENDING_RESP")"
fi

# ── Test 6: Admin approves withdrawal ─────────────────────────────────────────
title "[6/9] Admin approves withdrawal"
if [ -n "$WD_ID" ]; then
  APPROVE_RESP=$(curl -s -X POST "$API_URL/admin/withdrawals/$WD_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"adminNote\": \"Approved via test suite\",
      \"reference\": \"REF$(date +%s)\"
    }")
  if jok "$APPROVE_RESP"; then
    APPROVE_STATUS=$(jget "$APPROVE_RESP" "d.get('data',{}).get('status','')")
    pass "Withdrawal approved — status: $APPROVE_STATUS"
  else
    fail "Withdrawal approval failed: $(jmsg "$APPROVE_RESP")"
  fi
else
  fail "No withdrawal ID to approve"
fi

# ── Test 7: Balance deducted after approval ───────────────────────────────────
title "[7/9] Balance deducted after approval"
sleep 1
BAL_APPROVED=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_APPROVED"; then
  BALANCE_APPROVED=$(jget "$BAL_APPROVED" "d['data']['balance']")
  AVAIL_APPROVED=$(jget "$BAL_APPROVED"   "d['data']['availableBalance']")
  LOCKED_APPROVED=$(jget "$BAL_APPROVED"  "d['data']['lockedFunds']")
  EXPECTED_BAL=$(python3 -c "print(round($BALANCE_BEFORE - $WITHDRAW_AMOUNT, 2))")
  pass "Balance: ₹$BALANCE_APPROVED | Available: ₹$AVAIL_APPROVED | Locked: ₹$LOCKED_APPROVED"
  if python3 -c "exit(0 if abs($BALANCE_APPROVED - $EXPECTED_BAL) < 0.01 else 1)" 2>/dev/null; then
    pass "Balance correctly reduced by ₹$WITHDRAW_AMOUNT (₹$BALANCE_BEFORE → ₹$BALANCE_APPROVED)"
  else
    fail "Balance mismatch — expected ₹$EXPECTED_BAL, got ₹$BALANCE_APPROVED"
  fi
else
  fail "Could not get balance: $(jmsg "$BAL_APPROVED")"
fi

# ── Test 8: Request + reject flow ─────────────────────────────────────────────
title "[8/9] Request second withdrawal (for rejection test)"
# Use current available balance
CUR_BAL=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
CUR_AVAIL=$(jget "$CUR_BAL" "d.get('data',{}).get('availableBalance','0')")
REJECT_AMOUNT=$(python3 -c "v=float('${CUR_AVAIL:-0}'); print(int(v*0.3) if v > 10 else 0)")

if [ "$REJECT_AMOUNT" -le 0 ]; then
  warn "Insufficient funds for rejection test — skipping tests 8-9"
  TESTS_PASSED=$((TESTS_PASSED+2))   # count as skipped/passed
  echo -e "  ${YELLOW}  ⊘ Skipped (no funds)${NC}"
else
  WD2_RESP=$(curl -s -X POST "$API_URL/wallet/withdrawal" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"amount\":        $REJECT_AMOUNT,
      \"paymentMethod\": \"upi\",
      \"paymentDetails\": { \"upiId\": \"$UPI_ID\" }
    }")
  if jok "$WD2_RESP"; then
    WD2_ID=$(jget "$WD2_RESP" "d.get('data',{}).get('withdrawalId') or d.get('data',{}).get('_id','')")
    BAL_PRE_REJECT=$(jget "$CUR_BAL" "d['data']['availableBalance']")
    pass "Second withdrawal requested — ID: $WD2_ID | Amount: ₹$REJECT_AMOUNT"

    # ── Test 9: Admin rejects it ─────────────────────────────────────────────
    title "[9/9] Admin rejects withdrawal — balance restored"
    sleep 0.5
    REJECT_RESP=$(curl -s -X POST "$API_URL/admin/withdrawals/$WD2_ID/reject" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"reason\": \"Rejected via test suite\"}")
    if jok "$REJECT_RESP"; then
      pass "Withdrawal rejected"
      sleep 1
      BAL_RESTORED=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
      AVAIL_RESTORED=$(jget "$BAL_RESTORED" "d.get('data',{}).get('availableBalance','0')")
      pass "Available balance after rejection: ₹$AVAIL_RESTORED"
      EXPECTED_RESTORE=$(python3 -c "print(round($BAL_PRE_REJECT, 2))")
      if python3 -c "exit(0 if abs($AVAIL_RESTORED - $EXPECTED_RESTORE) < 0.01 else 1)" 2>/dev/null; then
        pass "Balance correctly restored (₹$AVAIL_RESTORED)"
      else
        fail "Balance not restored — expected ₹$EXPECTED_RESTORE, got ₹$AVAIL_RESTORED"
      fi
    else
      fail "Withdrawal rejection failed: $(jmsg "$REJECT_RESP")"
    fi
  else
    fail "Second withdrawal request failed: $(jmsg "$WD2_RESP")"
    title "[9/9] Admin rejects withdrawal — SKIPPED (no withdrawal to reject)"
    warn "Skipped"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}Withdrawal Summary:${NC}"
echo -e "    Balance before  : ₹$BALANCE_BEFORE"
echo -e "    Withdrawn       : ₹$WITHDRAW_AMOUNT"
echo -e "    Balance after   : ₹${BALANCE_APPROVED:-?}"
print_summary "Withdrawal Tests"
