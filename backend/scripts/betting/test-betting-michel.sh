#!/bin/bash

##############################################################################
# Betting Test Script — User: michel123@gmail.com
# Tests complete betting flow for michel123:
#   1. Login
#   2. Get profile
#   3. Check wallet balance
#   4. Fetch available markets
#   5. Place a back bet
#   6. Verify balance deducted
#   7. Retrieve bet details
#   8. Get open bets
#   9. Get full bet history
#  10. Get betting stats
##############################################################################

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Config ────────────────────────────────────────────────────────────────────
API_URL="${API_URL:-http://localhost:5001/api}"
EMAIL="michel123@gmail.com"
PASSWORD="Michel@123"
STAKE=100
ODDS=1.90
BET_TYPE="back"

# ── Helpers ───────────────────────────────────────────────────────────────────
pass() { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; }
info() { echo -e "${CYAN}  → $1${NC}"; }
step() { echo -e "\n${YELLOW}[$1] $2${NC}"; }
json() { echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"; }
extract() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print($2)" 2>/dev/null; }

PASS_COUNT=0
FAIL_COUNT=0
record_pass() { PASS_COUNT=$((PASS_COUNT + 1)); }
record_fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); }

echo -e "\n${BLUE}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║       BETTING TEST — michel123@gmail.com         ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════╝${NC}\n"
echo -e "  API  : ${CYAN}$API_URL${NC}"
echo -e "  User : ${CYAN}$EMAIL${NC}"
echo -e "  Stake: ${CYAN}₹$STAKE @ $ODDS odds ($BET_TYPE)${NC}\n"

# ────────────────────────────────────────────────────────────────────────────
# STEP 1 — Login
# ────────────────────────────────────────────────────────────────────────────
step "1/10" "Login as $EMAIL"

LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

json "$LOGIN_RESP"

TOKEN=$(extract "$LOGIN_RESP" "d.get('token', d.get('data',{}).get('token',''))")

if [ -z "$TOKEN" ]; then
  fail "Login failed — no token received"
  record_fail
  echo -e "\n${RED}Cannot continue without a valid token. Aborting.${NC}"
  exit 1
fi

pass "Login successful"
info "Token: ${TOKEN:0:60}..."
record_pass

# Save token for potential re-use
echo "$TOKEN" > /tmp/michel_token.txt

# ────────────────────────────────────────────────────────────────────────────
# STEP 2 — Get Profile
# ────────────────────────────────────────────────────────────────────────────
step "2/10" "Get user profile (/auth/me)"

ME_RESP=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

json "$ME_RESP"

ME_OK=$(extract "$ME_RESP" "str(d.get('success',False))")
if [ "$ME_OK" = "True" ]; then
  USERNAME=$(extract "$ME_RESP" "d.get('data',{}).get('username','')")
  KYC_STATUS=$(extract "$ME_RESP" "d.get('data',{}).get('kycStatus','unknown')")
  pass "Profile retrieved"
  info "Username  : $USERNAME"
  info "KYC Status: $KYC_STATUS"
  record_pass

  if [ "$KYC_STATUS" != "verified" ]; then
    echo -e "\n${YELLOW}⚠  KYC not verified ($KYC_STATUS). The /bets/place route requires KYC.${NC}"
    echo -e "${YELLOW}   Bet placement will likely be blocked. Continuing for diagnostic purposes...${NC}"
  fi
else
  fail "Could not retrieve profile"
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 3 — Wallet Balance (before bet)
# ────────────────────────────────────────────────────────────────────────────
step "3/10" "Wallet balance (before bet)"

BAL_RESP=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

json "$BAL_RESP"

BAL_OK=$(extract "$BAL_RESP" "str(d.get('success',False))")
if [ "$BAL_OK" = "True" ]; then
  INITIAL_BALANCE=$(extract "$BAL_RESP" "str(d.get('data',{}).get('balance',0))")
  pass "Wallet balance fetched"
  info "Balance: ₹$INITIAL_BALANCE"
  record_pass
else
  fail "Could not fetch wallet balance"
  INITIAL_BALANCE="0"
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 4 — Fetch Available Markets
# ────────────────────────────────────────────────────────────────────────────
step "4/10" "Fetch available markets"

MARKETS_RESP=$(curl -s -X GET "$API_URL/markets?status=active&limit=10" \
  -H "Authorization: Bearer $TOKEN")

json "$MARKETS_RESP"

MARKETS_OK=$(extract "$MARKETS_RESP" "str(d.get('success',False))")
if [ "$MARKETS_OK" = "True" ]; then
  MARKET_COUNT=$(extract "$MARKETS_RESP" "str(len(d.get('data',d.get('markets',[]))))")
  pass "Markets fetched ($MARKET_COUNT active)"
  record_pass

  if [ "$MARKET_COUNT" = "0" ] || [ -z "$MARKET_COUNT" ]; then
    echo -e "\n${YELLOW}⚠  No active markets found. Creating a demo market via admin API...${NC}"

    # ── Try to grab admin token from env or login ─────────────────────────
    if [ -f /tmp/admin_token.txt ]; then
      ADMIN_TOKEN=$(cat /tmp/admin_token.txt)
    else
      echo -e "${CYAN}  Logging in as admin to create market...${NC}"
      ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"emailOrPhone":"admin@crickbet.com","password":"Admin@123456"}')
      ADMIN_TOKEN=$(extract "$ADMIN_LOGIN" "d.get('token', d.get('data',{}).get('token',''))")
      [ -n "$ADMIN_TOKEN" ] && echo "$ADMIN_TOKEN" > /tmp/admin_token.txt
    fi

    if [ -n "$ADMIN_TOKEN" ]; then
      CREATE_MARKET_RESP=$(curl -s -X POST "$API_URL/markets" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
          "eventName"       : "India vs Australia — Test Series",
          "marketName"      : "Match Winner",
          "sport"           : "cricket",
          "competition"     : "ICC Test Series 2026",
          "startTime"       : "2026-02-25T10:00:00.000Z",
          "status"          : "active",
          "inPlay"          : false,
          "runners": [
            {"name":"India",     "runnerRef":"runner_india",     "status":"active","backOdds":1.90,"layOdds":1.95},
            {"name":"Australia", "runnerRef":"runner_australia",  "status":"active","backOdds":2.10,"layOdds":2.15},
            {"name":"Draw",      "runnerRef":"runner_draw",       "status":"active","backOdds":3.50,"layOdds":3.60}
          ],
          "minBet": 10,
          "maxBet": 50000,
          "isFeatured": true
        }')
      json "$CREATE_MARKET_RESP"
      MARKET_ID=$(extract "$CREATE_MARKET_RESP" "d.get('data',{}).get('_id','')")
      SELECTION_ID=$(extract "$CREATE_MARKET_RESP" \
        "d.get('data',{}).get('runners',d.get('data',{}).get('selections',[{}]))[0].get('_id',d.get('data',{}).get('runners',d.get('data',{}).get('selections',[{}]))[0].get('runnerRef',''))")
      if [ -n "$MARKET_ID" ]; then
        pass "Demo market created"
        info "Market ID    : $MARKET_ID"
        info "Selection ID : $SELECTION_ID"
      else
        fail "Could not create demo market"
        MARKET_ID=""
      fi
    else
      echo -e "${RED}  Admin token not available. Cannot create market.${NC}"
      MARKET_ID=""
      SELECTION_ID=""
    fi
  else
    # Pick first market & first runner
    MARKET_ID=$(extract "$MARKETS_RESP" \
      "d.get('data',d.get('markets',[]))[0].get('_id','')")
    MARKET_NAME=$(extract "$MARKETS_RESP" \
      "d.get('data',d.get('markets',[]))[0].get('eventName',d.get('data',d.get('markets',[]))[0].get('marketName',''))")
    SELECTION_ID=$(extract "$MARKETS_RESP" \
      "(d.get('data',d.get('markets',[]))[0].get('runners',d.get('data',d.get('markets',[]))[0].get('selections',[{}]))[0].get('_id','') or d.get('data',d.get('markets',[]))[0].get('runners',d.get('data',d.get('markets',[]))[0].get('selections',[{}]))[0].get('runnerRef',''))")
    info "Market  : $MARKET_NAME"
    info "Market ID   : $MARKET_ID"
    info "Selection ID: $SELECTION_ID"
  fi
else
  fail "Could not fetch markets"
  MARKET_ID=""
  SELECTION_ID=""
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 5 — Place a Bet
# ────────────────────────────────────────────────────────────────────────────
step "5/10" "Place a $BET_TYPE bet (₹$STAKE @ $ODDS)"

BET_ID=""
BET_REF=""
POTENTIAL_WIN=""

if [ -z "$MARKET_ID" ] || [ -z "$SELECTION_ID" ]; then
  fail "Skipping bet placement — no marketId or selectionId available"
  record_fail
else
  PLACE_RESP=$(curl -s -X POST "$API_URL/bets/place" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"marketId\"    : \"$MARKET_ID\",
      \"selectionId\" : \"$SELECTION_ID\",
      \"betType\"     : \"$BET_TYPE\",
      \"odds\"        : $ODDS,
      \"stake\"       : $STAKE,
      \"device\"      : \"web\"
    }")

  json "$PLACE_RESP"

  PLACE_OK=$(extract "$PLACE_RESP" "str(d.get('success',False))")
  if [ "$PLACE_OK" = "True" ]; then
    BET_ID=$(extract "$PLACE_RESP" "d.get('data',{}).get('bet',{}).get('_id','')")
    BET_REF=$(extract "$PLACE_RESP" "d.get('data',{}).get('bet',{}).get('betRef','')")
    POTENTIAL_WIN=$(extract "$PLACE_RESP" "str(d.get('data',{}).get('bet',{}).get('potentialWin','N/A'))")
    BET_STATUS_PLACED=$(extract "$PLACE_RESP" "d.get('data',{}).get('bet',{}).get('status','')")
    pass "Bet placed successfully"
    info "Bet ID       : $BET_ID"
    info "Bet Ref      : $BET_REF"
    info "Stake        : ₹$STAKE"
    info "Potential Win: ₹$POTENTIAL_WIN"
    info "Status       : $BET_STATUS_PLACED"
    record_pass
  else
    ERR_MSG=$(extract "$PLACE_RESP" "d.get('message','unknown error')")
    fail "Bet placement failed: $ERR_MSG"
    record_fail
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 6 — Wallet Balance (after bet)
# ────────────────────────────────────────────────────────────────────────────
step "6/10" "Wallet balance (after bet)"
sleep 1

BAL_AFTER_RESP=$(curl -s -X GET "$API_URL/wallet/balance" \
  -H "Authorization: Bearer $TOKEN")

json "$BAL_AFTER_RESP"

BAL_AFTER_OK=$(extract "$BAL_AFTER_RESP" "str(d.get('success',False))")
if [ "$BAL_AFTER_OK" = "True" ]; then
  AFTER_BALANCE=$(extract "$BAL_AFTER_RESP" "str(d.get('data',{}).get('balance',0))")
  pass "Post-bet balance fetched"
  info "Balance before: ₹$INITIAL_BALANCE"
  info "Balance after : ₹$AFTER_BALANCE"
  if [ -n "$BET_ID" ]; then
    DEDUCTED=$(python3 -c "print(round(float('${INITIAL_BALANCE:-0}') - float('${AFTER_BALANCE:-0}'), 2))" 2>/dev/null)
    info "Deducted      : ₹$DEDUCTED"
  fi
  record_pass
else
  fail "Could not fetch post-bet balance"
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 7 — Get Bet Details (by ID)
# ────────────────────────────────────────────────────────────────────────────
step "7/10" "Get bet details by ID"

if [ -z "$BET_ID" ]; then
  echo -e "${YELLOW}  ⚠  No bet ID available (bet was not placed). Skipping.${NC}"
  record_fail
else
  BET_DETAIL_RESP=$(curl -s -X GET "$API_URL/bets/$BET_ID" \
    -H "Authorization: Bearer $TOKEN")

  json "$BET_DETAIL_RESP"

  DETAIL_OK=$(extract "$BET_DETAIL_RESP" "str(d.get('success',False))")
  if [ "$DETAIL_OK" = "True" ]; then
    BET_DETAIL_STATUS=$(extract "$BET_DETAIL_RESP" "d.get('data',{}).get('status','')")
    pass "Bet details retrieved"
    info "Bet ID  : $BET_ID"
    info "Status  : $BET_DETAIL_STATUS"
    record_pass
  else
    fail "Could not retrieve bet details"
    record_fail
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 8 — Get Open Bets
# ────────────────────────────────────────────────────────────────────────────
step "8/10" "Get open bets (unmatched / partially matched)"

OPEN_RESP=$(curl -s -X GET "$API_URL/bets/status/open" \
  -H "Authorization: Bearer $TOKEN")

json "$OPEN_RESP"

OPEN_OK=$(extract "$OPEN_RESP" "str(d.get('success',False))")
if [ "$OPEN_OK" = "True" ]; then
  OPEN_COUNT=$(extract "$OPEN_RESP" "str(d.get('data',{}).get('total', len(d.get('data',{}).get('bets',[]))))")
  pass "Open bets fetched"
  info "Open bets: $OPEN_COUNT"
  record_pass
else
  fail "Could not fetch open bets"
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 9 — Full Bet History
# ────────────────────────────────────────────────────────────────────────────
step "9/10" "Full bet history (last 20)"

HIST_RESP=$(curl -s -X GET "$API_URL/bets?limit=20" \
  -H "Authorization: Bearer $TOKEN")

json "$HIST_RESP"

HIST_OK=$(extract "$HIST_RESP" "str(d.get('success',False))")
if [ "$HIST_OK" = "True" ]; then
  HIST_COUNT=$(extract "$HIST_RESP" "str(d.get('data',{}).get('total', len(d.get('data',{}).get('bets',[]))))")
  pass "Bet history fetched"
  info "Total bets on record: $HIST_COUNT"
  record_pass
else
  fail "Could not fetch bet history"
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# STEP 10 — Betting Stats
# ────────────────────────────────────────────────────────────────────────────
step "10/10" "Betting statistics summary"

STATS_RESP=$(curl -s -X GET "$API_URL/bets/stats/summary" \
  -H "Authorization: Bearer $TOKEN")

json "$STATS_RESP"

STATS_OK=$(extract "$STATS_RESP" "str(d.get('success',False))")
if [ "$STATS_OK" = "True" ]; then
  pass "Betting stats fetched"
  record_pass
else
  fail "Could not fetch betting stats"
  record_fail
fi

# ────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ────────────────────────────────────────────────────────────────────────────
TOTAL=$((PASS_COUNT + FAIL_COUNT))

echo -e "\n${BLUE}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║                  TEST SUMMARY                   ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo -e "  Passed : ${GREEN}${BOLD}$PASS_COUNT${NC} / $TOTAL"
echo -e "  Failed : ${RED}${BOLD}$FAIL_COUNT${NC} / $TOTAL"
echo -e ""
echo -e "  User         : $EMAIL"
echo -e "  Username     : $USERNAME"
echo -e "  KYC Status   : $KYC_STATUS"
echo -e "  Balance      : ₹$INITIAL_BALANCE  →  ₹$AFTER_BALANCE"
if [ -n "$BET_ID" ]; then
  echo -e "  Bet ID       : $BET_ID"
  echo -e "  Bet Ref      : $BET_REF"
  echo -e "  Stake        : ₹$STAKE"
  echo -e "  Odds         : $ODDS ($BET_TYPE)"
  echo -e "  Potential Win: ₹$POTENTIAL_WIN"
  echo -e "  Bet Status   : $BET_DETAIL_STATUS"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "\n${GREEN}${BOLD}  🎉 All tests passed!${NC}"
else
  echo -e "\n${YELLOW}  ⚠  Some tests failed — check output above for details.${NC}"
fi

echo -e "\n  Token saved → ${CYAN}/tmp/michel_token.txt${NC}"
echo -e "${BLUE}${BOLD}══════════════════════════════════════════════════${NC}\n"
