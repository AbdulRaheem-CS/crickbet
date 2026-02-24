#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# _common.sh  —  Shared helpers for all CrickBet test scripts
# Source this file at the top of every test:   source "$(dirname "$0")/_common.sh"
# ─────────────────────────────────────────────────────────────────────────────

# ── Colour palette ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Default configuration (override via env vars) ─────────────────────────────
API_URL="${API_URL:-http://localhost:5001/api}"
TEST_USER_EMAIL="${TEST_USER_EMAIL:-michel123@gmail.com}"
TEST_USER_PASS="${TEST_USER_PASS:-Michel@123}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@crickbet.com}"
ADMIN_PASS="${ADMIN_PASS:-Admin@123456}"

TOKEN_FILE="/tmp/cb_user_token.txt"
USERNAME_FILE="/tmp/cb_username.txt"
ADMIN_TOKEN_FILE="/tmp/cb_admin_token.txt"

# ── Print helpers ─────────────────────────────────────────────────────────────
pass()  { echo -e "${GREEN}  ✓${NC} $1"; TESTS_PASSED=$((TESTS_PASSED+1)); }
fail()  { echo -e "${RED}  ✗${NC} $1"; TESTS_FAILED=$((TESTS_FAILED+1)); }
info()  { echo -e "${CYAN}  ▶${NC} $1"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }
title() { echo -e "\n${BOLD}${BLUE}$1${NC}"; }
sep()   { echo -e "${BLUE}─────────────────────────────────────────${NC}"; }

TESTS_PASSED=0
TESTS_FAILED=0

# ── JSON helpers ──────────────────────────────────────────────────────────────
# Usage: jget "$JSON" "d.get('data',{}).get('token','')"
jget() { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); print($2)" 2>/dev/null; }
jok()  { echo "$1" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; }
jpp()  { echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"; }
jmsg() { jget "$1" "d.get('message','(no message)')"; }

# ── Token management ──────────────────────────────────────────────────────────
login_user() {
  local RESP
  RESP=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"emailOrPhone\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASS\"}")
  local TOK
  TOK=$(jget "$RESP" "d.get('data',{}).get('token') or d.get('token','')")
  if [ -z "$TOK" ]; then
    echo -e "${RED}✗ User login failed: $(jmsg "$RESP")${NC}"
    return 1
  fi
  echo "$TOK" > "$TOKEN_FILE"
  local UNAME
  UNAME=$(jget "$RESP" "d.get('data',{}).get('user',{}).get('username') or d.get('data',{}).get('username','')")
  echo "$UNAME" > "$USERNAME_FILE"
  TOKEN="$TOK"
  USERNAME="$UNAME"
  pass "User logged in: $USERNAME"
  return 0
}

login_admin() {
  local RESP
  RESP=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"emailOrPhone\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
  local TOK
  TOK=$(jget "$RESP" "d.get('data',{}).get('token') or d.get('token','')")
  if [ -z "$TOK" ]; then
    echo -e "${RED}✗ Admin login failed: $(jmsg "$RESP")${NC}"
    return 1
  fi
  echo "$TOK" > "$ADMIN_TOKEN_FILE"
  ADMIN_TOKEN="$TOK"
  pass "Admin logged in"
  return 0
}

require_user_token() {
  if [ -f "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE")
    USERNAME=$(cat "$USERNAME_FILE" 2>/dev/null)
    info "Re-using cached user token ($USERNAME)"
  else
    warn "No cached token — logging in..."
    login_user || exit 1
  fi
}

require_admin_token() {
  if [ -f "$ADMIN_TOKEN_FILE" ]; then
    ADMIN_TOKEN=$(cat "$ADMIN_TOKEN_FILE")
    info "Re-using cached admin token"
  else
    login_admin || exit 1
  fi
}

# ── Summary printer ───────────────────────────────────────────────────────────
print_summary() {
  local SUITE_NAME="${1:-Test Suite}"
  local TOTAL=$((TESTS_PASSED + TESTS_FAILED))
  echo ""
  sep
  echo -e "${BOLD}  $SUITE_NAME — Results: ${GREEN}$TESTS_PASSED passed${NC} / ${RED}$TESTS_FAILED failed${NC} / $TOTAL total"
  sep
  if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "  ${GREEN}${BOLD}🎉 ALL TESTS PASSED${NC}"
  else
    echo -e "  ${RED}${BOLD}❌ $TESTS_FAILED TEST(S) FAILED${NC}"
    return 1
  fi
}
