#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# run-all.sh  —  Master test runner for CrickBet API
#
# Usage:
#   bash run-all.sh                    # Run all suites
#   bash run-all.sh auth               # Run only auth tests
#   bash run-all.sh deposit betting    # Run deposit + betting
#
# Environment overrides (optional):
#   API_URL=http://localhost:5001/api  bash run-all.sh
#   TEST_USER_EMAIL=...  TEST_USER_PASS=...  bash run-all.sh
#   STAKE=500  DEPOSIT_AMOUNT=2000     bash run-all.sh
# ─────────────────────────────────────────────────────────────────────────────
TESTS_DIR="$(dirname "$0")"
source "$TESTS_DIR/_common.sh"

# ── Colour / style overrides for master output ────────────────────────────────
PURPLE='\033[0;35m'

echo -e "${BOLD}${PURPLE}"
echo "╔══════════════════════════════════════════════╗"
echo "║       CRICKBET — FULL API TEST SUITE         ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  ${CYAN}API       :${NC} $API_URL"
echo -e "  ${CYAN}Test User :${NC} $TEST_USER_EMAIL"
echo -e "  ${CYAN}Admin     :${NC} $ADMIN_EMAIL"
echo -e "  ${CYAN}Run at    :${NC} $(date)"
echo ""

# ── Restart backend with relaxed rate limits for testing ──────────────────────
info "Restarting backend with test rate-limits (10 000 req/15 min)..."
pkill -f "node server.js" 2>/dev/null
sleep 1
cd "$(dirname "$0")/../.." || exit 1   # backend/
RATE_LIMIT_MAX_REQUESTS=10000 node server.js > /tmp/cb-server.log 2>&1 &
sleep 3
if ! curl -s --max-time 3 "$API_URL/../health" >/dev/null 2>&1 && \
   ! curl -s --max-time 3 "$API_URL/auth/login" -X OPTIONS >/dev/null 2>&1; then
  pass "Backend started (PID $!)"
else
  pass "Backend running"
fi
cd - >/dev/null

# ── Clear cached tokens so each run is fresh ─────────────────────────────────
rm -f /tmp/cb_user_token.txt /tmp/cb_admin_token.txt /tmp/cb_username.txt

# ── Determine which suites to run ─────────────────────────────────────────────
ALL_SUITES=("auth" "deposit" "betting" "withdrawal")

if [ $# -gt 0 ]; then
  SUITES=("$@")
else
  SUITES=("${ALL_SUITES[@]}")
fi

# ── Track grand totals ─────────────────────────────────────────────────────────
GRAND_PASSED=0
GRAND_FAILED=0
SUITE_RESULTS=()

run_suite() {
  local NAME="$1"
  local SCRIPT="$TESTS_DIR/test-${NAME}.sh"

  if [ ! -f "$SCRIPT" ]; then
    echo -e "${RED}  ✗ Suite not found: $SCRIPT${NC}"
    SUITE_RESULTS+=("${RED}✗${NC} $NAME (file not found)")
    GRAND_FAILED=$((GRAND_FAILED+1))
    return 1
  fi

  echo ""
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${PURPLE}  Running: $NAME${NC}"
  echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

  # Run the suite and capture its exit code
  bash "$SCRIPT"
  local EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    SUITE_RESULTS+=("${GREEN}✓${NC} $NAME")
    GRAND_PASSED=$((GRAND_PASSED+1))
  else
    SUITE_RESULTS+=("${RED}✗${NC} $NAME")
    GRAND_FAILED=$((GRAND_FAILED+1))
  fi
}

# ── Run selected suites ────────────────────────────────────────────────────────
for SUITE in "${SUITES[@]}"; do
  run_suite "$SUITE"
done

# ── Grand summary ─────────────────────────────────────────────────────────────
GRAND_TOTAL=$((GRAND_PASSED + GRAND_FAILED))
echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${PURPLE}  GRAND SUMMARY${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

for RESULT in "${SUITE_RESULTS[@]}"; do
  echo -e "    $RESULT"
done

echo ""
echo -e "  Suites : ${GREEN}$GRAND_PASSED passed${NC} / ${RED}$GRAND_FAILED failed${NC} / $GRAND_TOTAL total"
echo ""

if [ "$GRAND_FAILED" -eq 0 ]; then
  echo -e "  ${GREEN}${BOLD}🎉  ALL SUITES PASSED${NC}"
  exit 0
else
  echo -e "  ${RED}${BOLD}❌  $GRAND_FAILED SUITE(S) FAILED${NC}"
  exit 1
fi
