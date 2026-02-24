#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# test-auth.sh  —  Authentication & Registration Tests
#
# Tests:
#   1. Login with valid credentials
#   2. Get user profile (/auth/me)
#   3. Login with wrong password (expect 401)
#   4. Login with non-existent email (expect failure)
#   5. Token refresh / re-auth
# ─────────────────────────────────────────────────────────────────────────────
source "$(dirname "$0")/_common.sh"

echo -e "${BOLD}${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║        AUTHENTICATION TEST SUITE         ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Test 1: Valid login ───────────────────────────────────────────────────────
title "[1/5] Valid login"
RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASS\"}")

TOKEN=$(jget "$RESP" "d.get('data',{}).get('token') or d.get('token','')")
if [ -n "$TOKEN" ]; then
  echo "$TOKEN" > "$TOKEN_FILE"
  USERNAME=$(jget "$RESP" "d.get('data',{}).get('user',{}).get('username') or d.get('data',{}).get('username','')")
  echo "$USERNAME" > "$USERNAME_FILE"
  pass "Login successful — user: $USERNAME"
  info "Token: ${TOKEN:0:40}..."
else
  fail "Login failed: $(jmsg "$RESP")"
  exit 1
fi

# ── Test 2: Get profile (/auth/me) ────────────────────────────────────────────
title "[2/5] Get user profile (/auth/me)"
ME=$(curl -s "$API_URL/auth/me" -H "Authorization: Bearer $TOKEN")
if jok "$ME"; then
  EMAIL=$(jget "$ME" "d.get('data',{}).get('email','')")
  ROLE=$(jget "$ME"  "d.get('data',{}).get('role','')")
  pass "Profile fetched — email: $EMAIL | role: $ROLE"
else
  fail "Profile fetch failed: $(jmsg "$ME")"
fi

# ── Test 3: Wrong password ────────────────────────────────────────────────────
title "[3/5] Login with wrong password (expect failure)"
RESP_BAD=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$TEST_USER_EMAIL\",\"password\":\"WrongPass999\"}")
if [ "$RESP_BAD" = "401" ] || [ "$RESP_BAD" = "400" ]; then
  pass "Rejected with HTTP $RESP_BAD (expected)"
else
  fail "Expected 401/400, got HTTP $RESP_BAD"
fi

# ── Test 4: Non-existent user ─────────────────────────────────────────────────
title "[4/5] Login with non-existent email (expect failure)"
RESP_UNKNOWN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"nobody_xyz@test.com","password":"Test@1234"}')
if [ "$RESP_UNKNOWN" = "401" ] || [ "$RESP_UNKNOWN" = "400" ] || [ "$RESP_UNKNOWN" = "404" ]; then
  pass "Rejected with HTTP $RESP_UNKNOWN (expected)"
else
  fail "Expected 4xx, got HTTP $RESP_UNKNOWN"
fi

# ── Test 5: Admin login ────────────────────────────────────────────────────────
title "[5/5] Admin login"
ADMIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrPhone\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
ADMIN_TOKEN=$(jget "$ADMIN_RESP" "d.get('data',{}).get('token') or d.get('token','')")
if [ -n "$ADMIN_TOKEN" ]; then
  echo "$ADMIN_TOKEN" > "$ADMIN_TOKEN_FILE"
  ADMIN_ROLE=$(jget "$ADMIN_RESP" "d.get('data',{}).get('user',{}).get('role') or d.get('data',{}).get('role','')")
  pass "Admin logged in — role: $ADMIN_ROLE"
else
  fail "Admin login failed: $(jmsg "$ADMIN_RESP")"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary "Auth Tests"
