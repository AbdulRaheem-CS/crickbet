#!/bin/bash
# ─── Settlement End-to-End Test ───────────────────────────────────────────────
BASE="http://localhost:5001/api"
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'; BOLD='\033[1m'
pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
info() { echo -e "${YELLOW}▶${NC} $1"; }

echo -e "\n${BOLD}╔══════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║      SETTLEMENT END-TO-END TEST          ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════╝${NC}\n"

# ── 1. Login as Michel ────────────────────────────────────────────────────────
info "Login as michel..."
MICHEL=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"michel123@gmail.com","password":"Michel@123"}')
TOKEN=$(echo $MICHEL | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token',''))" 2>/dev/null)
[ -n "$TOKEN" ] && pass "Michel logged in" || { fail "Login failed: $MICHEL"; exit 1; }

# ── 2. Login as Admin ─────────────────────────────────────────────────────────
info "Login as admin..."
ADMIN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crickbet.com","password":"Admin@123456"}')
ADMIN_TOKEN=$(echo $ADMIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('token',''))" 2>/dev/null)
[ -n "$ADMIN_TOKEN" ] && pass "Admin logged in" || { fail "Admin login failed"; exit 1; }

# ── 3. Get balance before ─────────────────────────────────────────────────────
info "Michel balance BEFORE bet..."
BAL_BEFORE=$(curl -s "$BASE/wallet/balance" -H "Authorization: Bearer $TOKEN")
BALANCE_BEFORE=$(echo $BAL_BEFORE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('balance',0))" 2>/dev/null)
AVAIL_BEFORE=$(echo $BAL_BEFORE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('availableBalance',0))" 2>/dev/null)
pass "Balance before: ₹${BALANCE_BEFORE} (available: ₹${AVAIL_BEFORE})"

# ── 4. Create a fresh market for this test ────────────────────────────────────
info "Creating a fresh test market..."
MKT=$(curl -s -X POST "$BASE/markets" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "TEST-SETTLE-'$(date +%s)'",
    "marketName": "Match Odds",
    "marketType": "match_odds",
    "event": {
      "eventId": "EVT-TEST-'$(date +%s)'",
      "name": "India vs England - Settlement Test",
      "sportId": "cricket",
      "sportName": "Cricket",
      "competitionName": "Test Series",
      "venue": "Lords",
      "startTime": "2026-03-01T10:00:00.000Z",
      "isInPlay": false
    },
    "runners": [
      {
        "runnerId": "IND",
        "name": "India",
        "sortPriority": 1,
        "backOdds": [{"price": 1.85, "size": 50000}],
        "layOdds": [{"price": 1.87, "size": 45000}]
      },
      {
        "runnerId": "ENG",
        "name": "England",
        "sortPriority": 2,
        "backOdds": [{"price": 2.10, "size": 40000}],
        "layOdds": [{"price": 2.12, "size": 38000}]
      }
    ],
    "status": "open",
    "settings": {
      "minStake": 100,
      "maxStake": 100000,
      "maxProfit": 500000,
      "commission": 2
    }
  }')
MKT_ID=$(echo $MKT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('_id',''))" 2>/dev/null)
[ -n "$MKT_ID" ] && pass "Market created: $MKT_ID" || { MKT_ERR=$(echo $MKT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message',''))" 2>/dev/null); fail "Market creation failed: $MKT_ERR"; exit 1; }

# ── 5. Get runner ID ──────────────────────────────────────────────────────────
RUNNER_ID=$(echo $MKT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('runners',[{}])[0].get('_id',''))" 2>/dev/null)
RUNNER_NAME=$(echo $MKT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('runners',[{}])[0].get('name',''))" 2>/dev/null)
RUNNER_ID_STR=$(echo $MKT | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('runners',[{}])[0].get('runnerId',''))" 2>/dev/null)
info "Betting on: $RUNNER_NAME (runnerId: $RUNNER_ID_STR)"

# ── 6. Place a ₹200 back bet on India ────────────────────────────────────────
info "Placing ₹200 back bet on India @ 1.85..."
BET=$(curl -s -X POST "$BASE/bets/place" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"marketId\": \"$MKT_ID\",
    \"selectionId\": \"$RUNNER_ID_STR\",
    \"betType\": \"back\",
    \"odds\": 1.85,
    \"stake\": 200
  }")
BET_ID=$(echo $BET | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('bet',{}).get('_id',''))" 2>/dev/null)
BET_STATUS=$(echo $BET | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('bet',{}).get('status',''))" 2>/dev/null)
BET_REF=$(echo $BET | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('bet',{}).get('betRef',''))" 2>/dev/null)
[ -n "$BET_ID" ] && pass "Bet placed: $BET_REF (status: $BET_STATUS)" || { BET_ERR=$(echo $BET | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message',''))" 2>/dev/null); fail "Bet failed: $BET_ERR"; exit 1; }

# ── 7. Balance after bet ──────────────────────────────────────────────────────
sleep 1
BAL_AFTER_BET=$(curl -s "$BASE/wallet/balance" -H "Authorization: Bearer $TOKEN")
BALANCE_AFTER_BET=$(echo $BAL_AFTER_BET | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('balance',0))" 2>/dev/null)
AVAIL_AFTER_BET=$(echo $BAL_AFTER_BET | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('availableBalance',0))" 2>/dev/null)
EXPECTED_AFTER_BET=$(python3 -c "print($BALANCE_BEFORE - 200)")
if [ "$BALANCE_AFTER_BET" = "$EXPECTED_AFTER_BET" ]; then
  pass "Balance after bet: ₹${BALANCE_AFTER_BET} (deducted ₹200 ✓)"
else
  fail "Balance after bet: ₹${BALANCE_AFTER_BET} (expected ₹${EXPECTED_AFTER_BET})"
fi

# ── 8. Settle market — India wins ─────────────────────────────────────────────
info "Admin settling market — India (IND) wins..."
SETTLE=$(curl -s -X POST "$BASE/admin/markets/$MKT_ID/settle" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"winner\": \"$RUNNER_ID_STR\", \"result\": \"IND wins\"}")
SETTLE_MSG=$(echo $SETTLE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message',''))" 2>/dev/null)
SETTLE_OK=$(echo $SETTLE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success',''))" 2>/dev/null)
[ "$SETTLE_OK" = "True" ] && pass "Settlement: $SETTLE_MSG" || { SETTLE_ERR=$(echo $SETTLE | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null); fail "Settlement failed: $SETTLE_ERR"; }
WINNERS=$(echo $SETTLE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('winners','?'))" 2>/dev/null)
LOSERS=$(echo $SETTLE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('losers','?'))" 2>/dev/null)
PAYOUT=$(echo $SETTLE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('totalPayout','?'))" 2>/dev/null)
info "  Winners: $WINNERS | Losers: $LOSERS | Total payout: ₹$PAYOUT"

# ── 9. Balance after settlement ───────────────────────────────────────────────
sleep 1
BAL_SETTLED=$(curl -s "$BASE/wallet/balance" -H "Authorization: Bearer $TOKEN")
BALANCE_SETTLED=$(echo $BAL_SETTLED | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('balance',0))" 2>/dev/null)
AVAIL_SETTLED=$(echo $BAL_SETTLED | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('availableBalance',0))" 2>/dev/null)
# Expected: balance_before - 200 + (200 * 1.85) - commission
# profit = 200 * 0.85 = 170, commission = 2% of 170 = 3.4, net profit = 166.6
# Total back = 200 (stake) + 166.6 (profit) = 366.6 → credited back
# Net change from before = +166.6
EXPECTED_PROFIT=$(python3 -c "stake=200; profit=stake*(1.85-1); comm=profit*0.02; net=stake+profit-comm; print(round(net,2))")
EXPECTED_FINAL=$(python3 -c "print(round($BALANCE_BEFORE - 200 + $EXPECTED_PROFIT, 2))")
echo ""
echo -e "${BOLD}─── Settlement Result ────────────────────────────────${NC}"
echo "  Stake placed  : ₹200 @ 1.85 on India"
echo "  Balance before: ₹${BALANCE_BEFORE}"
echo "  Balance →bet  : ₹${BALANCE_AFTER_BET} (deducted ₹200)"
echo "  Balance →win  : ₹${BALANCE_SETTLED}"
echo "  Expected final: ₹${EXPECTED_FINAL}  (stake back + profit)"
echo "  Available     : ₹${AVAIL_SETTLED}"
echo ""

if [ "$BALANCE_SETTLED" = "$EXPECTED_FINAL" ] || \
   python3 -c "exit(0 if abs($BALANCE_SETTLED - $EXPECTED_FINAL) < 1 else 1)" 2>/dev/null; then
  pass "BALANCE CORRECT after settlement ✓"
elif python3 -c "exit(0 if $BALANCE_SETTLED > $BALANCE_AFTER_BET else 1)" 2>/dev/null; then
  pass "Balance increased after win (₹${BALANCE_AFTER_BET} → ₹${BALANCE_SETTLED})"
  fail "But expected ~₹${EXPECTED_FINAL}"
else
  fail "Balance NOT updated after settlement — still ₹${BALANCE_SETTLED}"
fi

# ── 10. Verify bet is settled ─────────────────────────────────────────────────
sleep 1
BET_DETAIL=$(curl -s "$BASE/bets/$BET_ID" -H "Authorization: Bearer $TOKEN")
FINAL_STATUS=$(echo $BET_DETAIL | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('status',''))" 2>/dev/null)
FINAL_RESULT=$(echo $BET_DETAIL | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('result',''))" 2>/dev/null)
FINAL_PL=$(echo $BET_DETAIL | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('profitLoss',''))" 2>/dev/null)
[ "$FINAL_STATUS" = "settled" ] && pass "Bet status: settled ✓" || fail "Bet status: $FINAL_STATUS (expected 'settled')"
[ "$FINAL_RESULT" = "won" ] && pass "Bet result: won ✓" || fail "Bet result: $FINAL_RESULT (expected 'won')"
[ -n "$FINAL_PL" ] && pass "Profit/Loss: ₹${FINAL_PL}" || fail "P/L not set"

echo ""
echo -e "${BOLD}═══════════════ TEST COMPLETE ═══════════════${NC}"
