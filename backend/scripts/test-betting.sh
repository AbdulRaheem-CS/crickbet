#!/bin/bash

##############################################################################
# Betting Logic Test Script  (8 steps)
#
# Flow:
#   0.  Admin login → create demo market if none exists
#   1.  GET /api/markets  — li  echo -e "  Balance after    : ₹$AFTER_BALANCE  (locked ₹$LOCKED, avail ₹$AFTER_AVAIL)"t active markets
#   2.  GET /api/wallet/balance  — balance before bet
#   3.  POST /api/bets/place  — place back bet
#   4.  GET /api/wallet/balance  — confirm deduction
#   5.  GET /api/bets/:id  — bet detail
#   6.  GET /api/bets  — history
#
# KYC is NOT required (middleware removed from route).
# Admin creds: ADMIN_EMAIL / ADMIN_PASS env vars (defaults below).
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

py_get()   { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print($2)" 2>/dev/null; }
py_ok()    { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; }
py_print() { echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"; }

echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        BETTING API TEST SUITE            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}\n"

# ── User token ────────────────────────────────────────────
if [ -f /tmp/test_token.txt ]; then
  TOKEN=$(cat /tmp/test_token.txt)
  USERNAME=$(cat /tmp/test_username.txt 2>/dev/null)
  echo -e "${GREEN}✓ Using existing user token (${USERNAME})${NC}\n"
else
  echo -e "${YELLOW}⚠ No user token — running auth test first...${NC}\n"
  bash "$SCRIPT_DIR/test-auth.sh"
  TOKEN=$(cat /tmp/test_token.txt 2>/dev/null)
  USERNAME=$(cat /tmp/test_username.txt 2>/dev/null)
  [ -z "$TOKEN" ] && { echo -e "${RED}✗ Cannot obtain user token. Abort.${NC}"; exit 1; }
fi

# ── Admin token ───────────────────────────────────────────
echo -e "${CYAN}[setup] Logging in as admin...${NC}"
ADMIN_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
ADMIN_TOKEN=$(py_get "$ADMIN_LOGIN" "d.get('data',{}).get('token') or d.get('token','')")
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${RED}✗ Admin login failed. Set ADMIN_EMAIL / ADMIN_PASS if credentials differ.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Admin token obtained${NC}\n"

# ── Step 0: Ensure an active market exists ────────────────
echo -e "${CYAN}[setup] Checking for active markets...${NC}"
EXISTING=$(curl -s "$API_URL/markets?status=open&limit=1" -H "Authorization: Bearer $TOKEN")
EXISTING_COUNT=$(py_get "$EXISTING" "len(d.get('data',[]))")

if [ "${EXISTING_COUNT:-0}" -gt 0 ]; then
  echo -e "${GREEN}✓ Active market already exists${NC}\n"
else
  echo -e "${YELLOW}  No active markets — creating demo market via admin...${NC}"
  TS=$(date +%s)
  START_TIME=$(python3 -c "from datetime import datetime,timezone,timedelta; print((datetime.now(timezone.utc)+timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%SZ'))")
  CREATE_RESP=$(curl -s -X POST "$API_URL/markets" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"marketId\":   \"DEMO-$TS\",
      \"marketName\": \"India vs Australia - Match Odds\",
      \"marketType\": \"match_odds\",
      \"event\": {
        \"eventId\":   \"EVT-$TS\",
        \"name\":      \"India vs Australia\",
        \"sportId\":   \"4\",
        \"sportName\": \"Cricket\",
        \"startTime\": \"$START_TIME\",
        \"timezone\":  \"UTC\"
      },
      \"competition\": {
        \"competitionId\": \"COMP-IPL\",
        \"name\":           \"IPL 2026\"
      },
      \"runners\": [
        { \"runnerId\": \"runner_1\", \"name\": \"India\",     \"sortPriority\": 1,
          \"backOdds\": [{\"price\": 1.90, \"size\": 5000}],
          \"layOdds\":  [{\"price\": 1.91, \"size\": 3000}] },
        { \"runnerId\": \"runner_2\", \"name\": \"Australia\", \"sortPriority\": 2,
          \"backOdds\": [{\"price\": 2.10, \"size\": 4000}],
          \"layOdds\":  [{\"price\": 2.11, \"size\": 2000}] }
      ],
      \"status\": \"open\",
      \"isBettingEnabled\": true
    }")
  py_print "$CREATE_RESP"
  if py_ok "$CREATE_RESP"; then
    echo -e "${GREEN}✓ Demo market created${NC}\n"
  else
    ERR=$(py_get "$CREATE_RESP" "d.get('message','unknown')")
    echo -e "${RED}✗ Failed to create demo market — $ERR${NC}\n"
    exit 1
  fi
fi

# ── Test 1: Get Available Markets ─────────────────────────
echo -e "${YELLOW}[1/6] Get Available Markets...${NC}"
MARKETS_RESPONSE=$(curl -s "$API_URL/markets?status=open&limit=5" \
  -H "Authorization: Bearer $TOKEN")
py_print "$MARKETS_RESPONSE"

if py_ok "$MARKETS_RESPONSE"; then
  MARKET_COUNT=$(py_get "$MARKETS_RESPONSE" "len(d.get('data',[]))")
  echo -e "${GREEN}✓ Found $MARKET_COUNT active market(s)${NC}\n"
  MARKET_ID=$(py_get "$MARKETS_RESPONSE" "d['data'][0]['_id']")
  SELECTION_ID=$(py_get "$MARKETS_RESPONSE" \
    "(d['data'][0].get('runners') or [{}])[0].get('_id','runner_1')")
  MARKET_NAME=$(py_get "$MARKETS_RESPONSE" "d['data'][0].get('marketName','?')")
  echo -e "${BLUE}  Market : $MARKET_NAME${NC}"
  echo -e "${BLUE}  ID     : $MARKET_ID${NC}"
  echo -e "${BLUE}  Runner : $SELECTION_ID${NC}\n"
else
  echo -e "${RED}✗ Failed to get markets${NC}\n"; exit 1
fi

# ── Test 2: Wallet Balance Before Bet ────────────────────
echo -e "${YELLOW}[2/6] Wallet balance (before bet)...${NC}"
BALANCE_RESPONSE=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
py_print "$BALANCE_RESPONSE"
if py_ok "$BALANCE_RESPONSE"; then
  INITIAL_BALANCE=$(py_get "$BALANCE_RESPONSE" "d['data']['balance']")
  echo -e "${GREEN}✓ Balance: ₹$INITIAL_BALANCE${NC}\n"
else
  echo -e "${RED}✗ Failed to get wallet balance${NC}\n"; exit 1
fi

# ── Test 3: Place a Bet  POST /api/bets/place ─────────────
BET_AMOUNT=100
BET_ODDS=1.90
echo -e "${YELLOW}[3/6] Place back bet (₹$BET_AMOUNT @ $BET_ODDS on $MARKET_NAME)...${NC}"
PLACE_BET_RESPONSE=$(curl -s -X POST "$API_URL/bets/place" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"marketId\":    \"$MARKET_ID\",
    \"selectionId\": \"$SELECTION_ID\",
    \"betType\":     \"back\",
    \"odds\":        $BET_ODDS,
    \"stake\":       $BET_AMOUNT
  }")
py_print "$PLACE_BET_RESPONSE"

if py_ok "$PLACE_BET_RESPONSE"; then
  BET_OBJ=$(echo "$PLACE_BET_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); b=d.get('data',{}).get('bet', d.get('data',{})); print(json.dumps(b))" 2>/dev/null)
  BET_ID=$(echo "$BET_OBJ"   | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('_id',''))"         2>/dev/null)
  BET_REF=$(echo "$BET_OBJ"  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('betRef',''))"      2>/dev/null)
  POTENTIAL_WIN=$(echo "$BET_OBJ" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('potentialProfit','N/A'))" 2>/dev/null)
  echo -e "${GREEN}✓ Bet placed successfully${NC}"
  echo -e "  Bet ID       : $BET_ID"
  echo -e "  Ref          : $BET_REF"
  echo -e "  Stake        : ₹$BET_AMOUNT"
  echo -e "  Potential Win: ₹$POTENTIAL_WIN\n"
else
  ERROR_MSG=$(py_get "$PLACE_BET_RESPONSE" "d.get('message','unknown')")
  echo -e "${RED}✗ Failed to place bet — $ERROR_MSG${NC}\n"
  BET_ID=""; BET_REF=""; POTENTIAL_WIN="N/A"
fi

# ── Test 4: Wallet Balance After Bet ─────────────────────
echo -e "${YELLOW}[4/6] Wallet balance (after bet)...${NC}"
sleep 1
AFTER_BAL_RESPONSE=$(curl -s "$API_URL/wallet/balance" -H "Authorization: Bearer $TOKEN")
py_print "$AFTER_BAL_RESPONSE"
if py_ok "$AFTER_BAL_RESPONSE"; then
  AFTER_BALANCE=$(py_get "$AFTER_BAL_RESPONSE" "d['data']['balance']")
  AFTER_AVAIL=$(py_get "$AFTER_BAL_RESPONSE"   "d['data']['availableBalance']")
  LOCKED=$(py_get "$AFTER_BAL_RESPONSE"        "d['data']['lockedFunds']")
  DIFF=$(python3 -c "print(${INITIAL_BALANCE:-0} - ${AFTER_BALANCE:-0})" 2>/dev/null || echo "?")
  echo -e "${GREEN}✓ Balance: ₹$INITIAL_BALANCE → ₹$AFTER_BALANCE  (locked: ₹$LOCKED, avail: ₹$AFTER_AVAIL)${NC}\n"
else
  echo -e "${RED}✗ Failed to get balance after bet${NC}\n"
fi

# ── Test 5: Bet Details  GET /api/bets/:id ───────────────
echo -e "${YELLOW}[5/6] Bet details...${NC}"
if [ -n "$BET_ID" ]; then
  BET_DETAILS_RESPONSE=$(curl -s "$API_URL/bets/$BET_ID" -H "Authorization: Bearer $TOKEN")
  py_print "$BET_DETAILS_RESPONSE"
  if py_ok "$BET_DETAILS_RESPONSE"; then
    BET_STATUS=$(py_get "$BET_DETAILS_RESPONSE" "d['data'].get('status','?')")
    echo -e "${GREEN}✓ Bet status: $BET_STATUS${NC}\n"
  else
    echo -e "${RED}✗ Failed to get bet details${NC}\n"
    BET_STATUS="N/A"
  fi
else
  echo -e "${YELLOW}⚠ No bet ID — skipping.${NC}\n"; BET_STATUS="N/A"
fi

# ── Test 6: Bet History  GET /api/bets ───────────────────
echo -e "${YELLOW}[6/6] Bet history...${NC}"
BET_HISTORY_RESPONSE=$(curl -s "$API_URL/bets?limit=10" -H "Authorization: Bearer $TOKEN")
py_print "$BET_HISTORY_RESPONSE"
if py_ok "$BET_HISTORY_RESPONSE"; then
  BET_COUNT=$(py_get "$BET_HISTORY_RESPONSE" \
    "len(d.get('data',{}).get('bets', d.get('data') if isinstance(d.get('data'),list) else []))")
  echo -e "${GREEN}✓ $BET_COUNT bet(s) in history${NC}\n"
else
  echo -e "${RED}✗ Failed to get bet history${NC}\n"; exit 1
fi

# ── Summary ───────────────────────────────────────────────
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           TEST SUMMARY                   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo -e "  Markets fetched  : ${GREEN}✓${NC}"
echo -e "  Balance before   : ₹$INITIAL_BALANCE"
echo -e "  Bet placed       : $([ -n "$BET_ID" ] && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}")"
echo -e "  Balance after    : ₹$AFTER_BALANCE  (deducted ₹$DIFF)"
echo -e "  Bet details      : $([ "$BET_STATUS" != "N/A" ] && echo -e "${GREEN}✓ ($BET_STATUS)${NC}" || echo -e "${YELLOW}skipped${NC}")"
echo -e "  Bet history      : ${GREEN}✓ ($BET_COUNT bets)${NC}"
if [ -n "$BET_ID" ]; then
  echo -e "\n${BLUE}Placed Bet:${NC}"
  echo -e "  ID           : $BET_ID"
  echo -e "  Ref          : $BET_REF"
  echo -e "  Market       : $MARKET_NAME"
  echo -e "  Stake        : ₹$BET_AMOUNT @ $BET_ODDS"
  echo -e "  Potential Win: ₹$POTENTIAL_WIN"
  echo -e "  Status       : $BET_STATUS"
fi
echo -e "\n${YELLOW}Note: Bet will be settled when admin closes the market.${NC}\n"
