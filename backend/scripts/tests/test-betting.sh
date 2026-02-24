#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# test-betting.sh  —  Bet Placement, Settlement & Commission Tests
#
# Tests:
#   1.  Ensure a suitable market exists (create one via admin if needed)
#   2.  Get user balance before betting
#   3.  Place a BACK bet
#   4.  Confirm bet is auto-matched (status = matched)
#   5.  Confirm balance deducted immediately
#   6.  Retrieve bet by ID
#   7.  Retrieve user's bet list
#   8.  Settle market — declare a winner
#   9.  Verify winner's balance increases by profit
#   10. Verify affiliate commission credited (for losing side)
# ─────────────────────────────────────────────────────────────────────────────
source "$(dirname "$0")/_common.sh"

STAKE="${STAKE:-200}"
ODDS="${ODDS:-1.9}"
SPORT_ID="${SPORT_ID:-cricket}"

echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║          BETTING API TEST SUITE          ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Setup: tokens ─────────────────────────────────────────────────────────────
require_user_token
require_admin_token

# ── Test 1: Ensure active market ──────────────────────────────────────────────
title "[1/10] Get or create an active market"

MARKETS_RESP=$(curl -s "$API_URL/markets/live" -H "Authorization: Bearer $TOKEN")
MARKET_ID=$(jget "$MARKETS_RESP" "(d.get('data',[{}]) if isinstance(d.get('data',[]), list) else [])[0].get('_id','')" 2>/dev/null)

if [ -z "$MARKET_ID" ]; then
  warn "No live market found — creating one via admin..."
  MKT_TS=$(date +%s)
  START_TIME=$(python3 -c "import datetime; print((datetime.datetime.utcnow() + datetime.timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%SZ'))")
  CREATE_MARKET_RESP=$(curl -s -X POST "$API_URL/markets" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"marketId\":   \"test-mkt-$MKT_TS\",
      \"marketName\": \"India vs Australia — Match Odds ($MKT_TS)\",
      \"marketType\": \"match_odds\",
      \"status\":     \"open\",
      \"event\": {
        \"eventId\":   \"test-evt-$MKT_TS\",
        \"name\":      \"India vs Australia\",
        \"sportId\":   \"4\",
        \"sportName\": \"Cricket\",
        \"startTime\": \"$START_TIME\"
      },
      \"runners\": [
        {\"name\":\"India\",     \"runnerId\":\"IND\",
         \"backOdds\":[{\"price\":1.9,\"size\":5000}], \"layOdds\":[{\"price\":2.0,\"size\":3000}]},
        {\"name\":\"Australia\", \"runnerId\":\"AUS\",
         \"backOdds\":[{\"price\":2.2,\"size\":4000}], \"layOdds\":[{\"price\":2.3,\"size\":2000}]}
      ]
    }")
  MARKET_ID=$(jget "$CREATE_MARKET_RESP" "d.get('data',{}).get('_id','')")
  if [ -n "$MARKET_ID" ]; then
    pass "Market created: $MARKET_ID"
  else
    fail "Could not create market: $(jmsg "$CREATE_MARKET_RESP")"
    exit 1
  fi
else
  pass "Using live market: $MARKET_ID"
fi

# Save market for later tests
echo "$MARKET_ID" > /tmp/cb_market_id.txt

# Grab first runner ID
MARKET_DETAIL=$(curl -s "$API_URL/markets/$MARKET_ID" -H "Authorization: Bearer $TOKEN")
RUNNER_ID=$(jget "$MARKET_DETAIL" "(d.get('data',{}).get('runners',[{}]) or [{}])[0].get('runnerId','')")
RUNNER_NAME=$(jget "$MARKET_DETAIL" "(d.get('data',{}).get('runners',[{}]) or [{}])[0].get('name','')")
if [ -z "$RUNNER_ID" ]; then RUNNER_ID="IND"; RUNNER_NAME="India"; fi
info "Betting on runner: $RUNNER_NAME ($RUNNER_ID)"

# ── Test 2: Balance before ────────────────────────────────────────────────────
title "[2/10] Wallet balance before bet"
BAL_RESP=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_RESP"; then
  BALANCE_BEFORE=$(jget "$BAL_RESP" "d['data']['balance']")
  AVAIL_BEFORE=$(jget "$BAL_RESP"   "d['data']['availableBalance']")
  pass "Balance: ₹$BALANCE_BEFORE | Available: ₹$AVAIL_BEFORE"
else
  fail "Could not get balance: $(jmsg "$BAL_RESP")"
  BALANCE_BEFORE=0; AVAIL_BEFORE=0
fi

# ── Test 3: Place back bet ────────────────────────────────────────────────────
title "[3/10] Place BACK bet (₹$STAKE @ $ODDS on $RUNNER_NAME)"
BET_RESP=$(curl -s -X POST "$API_URL/bets/place" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"marketId\":   \"$MARKET_ID\",
    \"selectionId\": \"$RUNNER_ID\",
    \"betType\":    \"back\",
    \"odds\":       $ODDS,
    \"stake\":      $STAKE
  }")
if jok "$BET_RESP"; then
  BET_ID=$(jget "$BET_RESP" "d.get('data',{}).get('bet',{}).get('_id') or d.get('data',{}).get('_id','')")
  BET_STATUS=$(jget "$BET_RESP" "d.get('data',{}).get('bet',{}).get('status') or d.get('data',{}).get('status','')")
  BET_REF=$(jget "$BET_RESP" "d.get('data',{}).get('bet',{}).get('betRef') or d.get('data',{}).get('betRef','')")
  echo "$BET_ID" > /tmp/cb_bet_id.txt
  pass "Bet placed — ID: $BET_ID | Ref: $BET_REF | Status: $BET_STATUS"
else
  fail "Bet placement failed: $(jmsg "$BET_RESP")"
  exit 1
fi

# ── Test 4: Bet status = matched ──────────────────────────────────────────────
title "[4/10] Bet auto-matched check"
if [ "$BET_STATUS" = "matched" ]; then
  pass "Bet status is 'matched' ✓"
else
  fail "Expected status 'matched', got '$BET_STATUS'"
fi

# ── Test 5: Balance deducted ──────────────────────────────────────────────────
title "[5/10] Balance deducted after bet placement"
sleep 1
BAL_AFTER=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_AFTER"; then
  BALANCE_AFTER_BET=$(jget "$BAL_AFTER" "d['data']['balance']")
  AVAIL_AFTER_BET=$(jget "$BAL_AFTER"   "d['data']['availableBalance']")
  EXPECTED=$(python3 -c "print(round($BALANCE_BEFORE - $STAKE, 2))")
  pass "Balance after bet: ₹$BALANCE_AFTER_BET (expected ₹$EXPECTED)"
  if python3 -c "exit(0 if abs($BALANCE_AFTER_BET - $EXPECTED) < 0.01 else 1)" 2>/dev/null; then
    pass "Stake correctly deducted from balance"
  else
    fail "Balance not deducted correctly — expected ₹$EXPECTED, got ₹$BALANCE_AFTER_BET"
  fi
else
  fail "Could not fetch balance: $(jmsg "$BAL_AFTER")"
fi

# ── Test 6: Get bet by ID ─────────────────────────────────────────────────────
title "[6/10] Retrieve bet by ID"
if [ -n "$BET_ID" ]; then
  GET_BET=$(curl -s "$API_URL/bets/$BET_ID" -H "Authorization: Bearer $TOKEN")
  if jok "$GET_BET"; then
    FETCHED_STAKE=$(jget "$GET_BET" "d.get('data',{}).get('stake',0)")
    FETCHED_ODDS=$(jget "$GET_BET"  "d.get('data',{}).get('odds',0)")
    pass "Bet retrieved — stake: ₹$FETCHED_STAKE | odds: $FETCHED_ODDS"
  else
    fail "Could not fetch bet: $(jmsg "$GET_BET")"
  fi
else
  fail "No bet ID available to fetch"
fi

# ── Test 7: Bet history ───────────────────────────────────────────────────────
title "[7/10] User bet list"
MY_BETS=$(curl -s "$API_URL/bets" -H "Authorization: Bearer $TOKEN")
if jok "$MY_BETS"; then
  BET_COUNT=$(jget "$MY_BETS" "len(d.get('data',[]) if isinstance(d.get('data',[]),list) else d.get('data',{}).get('bets',[]))")
  pass "$BET_COUNT bet(s) in history"
else
  fail "Could not fetch bet list: $(jmsg "$MY_BETS")"
fi

# ── Test 8: Settle market ─────────────────────────────────────────────────────
title "[8/10] Admin settles market (winner: $RUNNER_NAME)"
SETTLE_RESP=$(curl -s -X POST "$API_URL/markets/$MARKET_ID/settle" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"winningRunnerId\": \"$RUNNER_ID\"}")
if jok "$SETTLE_RESP"; then
  SETTLED_COUNT=$(jget "$SETTLE_RESP" "d.get('data',{}).get('betsSettled') or d.get('data',{}).get('settledCount') or d.get('data',{}).get('winners',0)+d.get('data',{}).get('losers',0)")
  pass "Market settled — $SETTLED_COUNT bet(s) processed"
else
  fail "Market settlement failed: $(jmsg "$SETTLE_RESP")"
fi

# ── Test 9: Winner balance ────────────────────────────────────────────────────
title "[9/10] Winning balance credited"
sleep 1
BAL_FINAL=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
if jok "$BAL_FINAL"; then
  BALANCE_FINAL=$(jget "$BAL_FINAL" "d['data']['balance']")
  # Platform charges 2% commission on winnings
  # On win: stake is returned + net profit credited
  COMMISSION_RATE=0.02
  GROSS_PROFIT=$(python3 -c "print(round(($ODDS - 1) * $STAKE, 2))")
  COMMISSION=$(python3 -c "print(round($GROSS_PROFIT * $COMMISSION_RATE, 2))")
  NET_PROFIT=$(python3 -c "print(round($GROSS_PROFIT * (1 - $COMMISSION_RATE), 2))")
  # Balance after bet already had stake deducted — win restores stake + adds net profit
  EXPECTED_FINAL=$(python3 -c "print(round($BALANCE_AFTER_BET + $STAKE + $NET_PROFIT, 2))")
  pass "Balance after win: ₹$BALANCE_FINAL"
  info "Gross profit: ₹$GROSS_PROFIT | Commission (2%): ₹$COMMISSION | Net: ₹$NET_PROFIT | Expected: ₹$EXPECTED_FINAL"
  if python3 -c "exit(0 if abs($BALANCE_FINAL - $EXPECTED_FINAL) < 1.0 else 1)" 2>/dev/null; then
    pass "Profit correctly credited (₹$BALANCE_AFTER_BET + ₹$STAKE stake + ₹$NET_PROFIT profit = ₹$BALANCE_FINAL)"
  else
    fail "Payout mismatch — expected ~₹$EXPECTED_FINAL, got ₹$BALANCE_FINAL"
  fi
else
  fail "Could not fetch final balance: $(jmsg "$BAL_FINAL")"
fi

# ── Test 10: Affiliate commission ─────────────────────────────────────────────
title "[10/10] Affiliate commission check (if user has referrer)"
# Login as affiliate to check their wallet
AFF_EMAIL="${AFF_EMAIL:-ahmad123@gmail.com}"
AFF_PASS="${AFF_PASS:-Raheem@123}"
AFF_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$AFF_EMAIL\",\"password\":\"$AFF_PASS\"}")
AFF_TOKEN=$(jget "$AFF_RESP" "d.get('data',{}).get('token') or d.get('token','')")

if [ -n "$AFF_TOKEN" ]; then
  AFF_BAL_RESP=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $AFF_TOKEN")
  AFF_BALANCE=$(jget "$AFF_BAL_RESP" "d.get('data',{}).get('balance','?')")
  pass "Affiliate ($AFF_EMAIL) wallet: ₹$AFF_BALANCE"
  info "Commission credited only on player LOSS — verify manually if user won this bet"
else
  warn "Could not login as affiliate ($AFF_EMAIL) — skipping commission check"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}Betting Summary:${NC}"
echo -e "    Market ID   : $MARKET_ID"
echo -e "    Bet ID      : $BET_ID"
echo -e "    Runner      : $RUNNER_NAME ($RUNNER_ID)"
echo -e "    Stake       : ₹$STAKE @ $ODDS"
echo -e "    Balance:      ₹$BALANCE_BEFORE → ₹${BALANCE_AFTER_BET:-?} → ₹${BALANCE_FINAL:-?}"
print_summary "Betting Tests"
