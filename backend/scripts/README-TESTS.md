# API Test Scripts

Comprehensive test suite for demonstrating all CrickBet platform functionalities to clients.

## Prerequisites

1. **Backend server must be running**
   ```bash
   cd backend
   npm start
   # Server should be running on http://localhost:5001
   ```

2. **Required tools installed**
   ```bash
   # Check if tools are available
   which curl   # HTTP client
   which jq     # JSON processor
   which bc     # Calculator for balance checks
   ```

3. **Install missing tools (if needed)**
   ```bash
   # macOS
   brew install jq bc

   # Ubuntu/Debian
   sudo apt-get install jq bc curl

   # Windows (Git Bash or WSL)
   # jq: Download from https://stedolan.github.io/jq/
   ```

## Test Scripts

### 1. Authentication Test (`test-auth.sh`)
Tests user registration and login functionality.

**What it tests:**
- ✅ User registration with email, username, password
- ✅ User login with credentials
- ✅ JWT token generation
- ✅ Token persistence for other tests

**Run:**
```bash
cd backend/scripts
chmod +x test-auth.sh
./test-auth.sh
```

**Expected Output:**
```
========================================
   AUTHENTICATION API TEST SUITE
========================================

[1/2] Testing User Registration...
✓ User registration successful

[2/2] Testing User Login...
✓ User login successful

========================================
   ALL AUTHENTICATION TESTS PASSED!
========================================
```

---

### 2. Deposit Test (`test-deposit.sh`)
Tests complete wallet deposit flow including payment methods.

**What it tests:**
- ✅ Get current wallet balance
- ✅ Fetch available payment methods (JazzCash, EasyPaisa, UPI, Cards, Bank)
- ✅ Initiate deposit transaction
- ✅ Transaction reference generation
- ✅ Balance tracking

**Run:**
```bash
chmod +x test-deposit.sh
./test-deposit.sh
```

**Expected Output:**
```
========================================
      DEPOSIT API TEST SUITE
========================================

[1/4] Testing Get Wallet Balance...
✓ Current balance: ₹0.00

[2/4] Testing Get Payment Methods...
✓ Found 5 payment method(s)

Available Payment Methods:
  - JazzCash (jazzcash): ₹100 - ₹100000
  - EasyPaisa (easypaisa): ₹100 - ₹100000
  - UPI (upi): ₹100 - ₹100000
  - Net Banking (netbanking): ₹500 - ₹200000
  - Debit/Credit Card (card): ₹100 - ₹100000

[3/4] Testing Deposit Initiation (₹1000)...
✓ Deposit initiated successfully
  Transaction ID: 6789...
  Reference: TXN-XYZ123

[4/4] Simulating Deposit Approval & Checking Balance...
✓ Balance check successful

========================================
   ALL DEPOSIT TESTS PASSED!
========================================
```

---

### 3. Withdrawal Test (`test-withdrawal.sh`)
Tests wallet withdrawal functionality with bank details.

**What it tests:**
- ✅ Get wallet balance
- ✅ Validate sufficient funds
- ✅ Submit withdrawal request with bank details
- ✅ Transaction creation
- ✅ Balance update (pending approval)

**Run:**
```bash
chmod +x test-withdrawal.sh
./test-withdrawal.sh
```

**Expected Output:**
```
========================================
    WITHDRAWAL API TEST SUITE
========================================

[1/3] Testing Get Wallet Balance...
✓ Current balance: ₹1000.00

[2/3] Testing Withdrawal Request (₹100)...
✓ Withdrawal request submitted successfully
  Transaction ID: 6789...
  Reference: TXN-ABC456

[3/3] Verifying Balance After Withdrawal Request...
✓ Balance check successful
  Initial Balance: ₹1000.00
  Current Balance: ₹900.00
  Status: Pending approval

========================================
   ALL WITHDRAWAL TESTS PASSED!
========================================
```

---

### 4. Betting Test (`test-betting.sh`)
Tests complete betting flow from market selection to bet placement.

**What it tests:**
- ✅ Fetch active betting markets
- ✅ Check wallet balance before betting
- ✅ Place a bet with odds and stake
- ✅ Balance deduction after bet
- ✅ Bet details retrieval
- ✅ Bet history/transaction log

**Run:**
```bash
chmod +x test-betting.sh
./test-betting.sh
```

**Expected Output:**
```
========================================
      BETTING API TEST SUITE
========================================

[1/6] Testing Get Available Markets...
✓ Found 3 active market(s)

[2/6] Testing Get Wallet Balance...
✓ Current balance: ₹1000.00

[3/6] Testing Place Bet (₹50 @ 2.5 odds)...
✓ Bet placed successfully
  Bet ID: 6789...
  Bet Ref: BET-XYZ789
  Stake: ₹50
  Potential Win: ₹125

[4/6] Verifying Balance After Bet Placement...
✓ Balance updated correctly
  Initial Balance: ₹1000.00
  Current Balance: ₹950.00
  Deducted Amount: ₹50

[5/6] Testing Get Bet Details...
✓ Bet details retrieved successfully
  Status: pending

[6/6] Testing Get Bet History...
✓ Retrieved 1 bet(s) from history

========================================
   ALL BETTING TESTS PASSED!
========================================
```

---

### 5. Master Test (`test-all.sh`)
Runs all tests in sequence for complete demonstration.

**What it tests:**
- ✅ Complete user journey from registration to betting
- ✅ All API endpoints in realistic workflow
- ✅ End-to-end integration

**Run:**
```bash
chmod +x test-all.sh
./test-all.sh
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        CRICKBET API COMPREHENSIVE TEST SUITE               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RUNNING: AUTHENTICATION TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
... (auth test output) ...
✓ AUTHENTICATION TEST PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RUNNING: DEPOSIT TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
... (deposit test output) ...
✓ DEPOSIT TEST PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RUNNING: WITHDRAWAL TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
... (withdrawal test output) ...
✓ WITHDRAWAL TEST PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RUNNING: BETTING TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
... (betting test output) ...
✓ BETTING TEST PASSED

╔════════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                            ║
╚════════════════════════════════════════════════════════════╝

✓ ALL TESTS PASSED SUCCESSFULLY!

Summary:
  ✓ Authentication (Register & Login)
  ✓ Wallet Deposits (with payment methods)
  ✓ Wallet Withdrawals (with bank details)
  ✓ Betting Logic (place bet, check balance, history)

All core functionalities are working correctly!
```

---

## Quick Start for Client Demo

**Complete demonstration in one command:**

```bash
cd backend/scripts
chmod +x *.sh
./test-all.sh
```

This will:
1. Create a new test user
2. Login and get authentication token
3. Check wallet balance
4. Fetch available payment methods
5. Initiate a deposit
6. Request a withdrawal
7. Fetch betting markets
8. Place a bet
9. Verify all balances and transactions

**Total demo time:** ~30-45 seconds

---

## Environment Configuration

By default, tests use `http://localhost:5001/api`. To test against a different environment:

```bash
# Test against staging server
export API_URL=https://staging.crickbet.com/api
./test-all.sh

# Test against production
export API_URL=https://api.crickbet.com/api
./test-all.sh
```

---

## Troubleshooting

### "curl: command not found"
```bash
# macOS
brew install curl

# Ubuntu
sudo apt-get install curl
```

### "jq: command not found"
```bash
# macOS
brew install jq

# Ubuntu
sudo apt-get install jq
```

### "Connection refused"
- Make sure backend server is running on port 5001
- Check `backend/server.js` is started: `npm start`
- Verify MongoDB is connected

### "No payment methods found"
- Run the payment methods seed script first:
```bash
cd backend
node scripts/seedPaymentMethods.js
```

### "No active markets found"
- This is expected if no markets are created yet
- Betting test will skip bet placement in this case
- In production, admin creates markets through admin panel

---

## Output Files

Test scripts create temporary files in `/tmp/`:
- `/tmp/test_token.txt` - JWT authentication token
- `/tmp/test_username.txt` - Generated test username

These are automatically used by subsequent tests.

---

## For Developers

### Adding New Tests

1. Create a new script: `test-feature.sh`
2. Follow the same structure:
   - Use color codes for output
   - Check for existing token
   - Test specific API endpoints
   - Validate responses with `jq`
   - Show summary at the end

3. Add to `test-all.sh`:
```bash
run_test "FEATURE TEST" "test-feature.sh"
```

### Response Validation

All tests use `jq` to parse and validate JSON responses:

```bash
# Check if response is successful
if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
  # Extract data
  DATA=$(echo "$RESPONSE" | jq -r '.data.field')
fi
```

---

## Client Presentation Tips

1. **Screen Recording**: Record the test execution for client review
2. **Live Demo**: Run `./test-all.sh` during client call
3. **Custom Data**: Modify test amounts/values for client-specific scenarios
4. **Parallel Terminal**: Show API logs in one terminal, tests in another

---

## Success Criteria

All tests passing means:
- ✅ User authentication working
- ✅ JWT token generation working
- ✅ Payment methods API working
- ✅ Wallet deposits working
- ✅ Wallet withdrawals working
- ✅ Balance tracking accurate
- ✅ Transaction creation working
- ✅ Betting logic working
- ✅ Bet history tracking working

**This demonstrates a fully functional betting platform!**
