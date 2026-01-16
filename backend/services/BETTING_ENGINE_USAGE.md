# Betting Engine Usage Guide

## Quick Start

This guide shows you how to use the production-ready betting engine in your application.

---

## 1. PLACE A BET

### Place a Back Bet (Bet FOR a selection to win)

```javascript
const bettingService = require('../services/betting.service');

// Place back bet
const bet = await bettingService.placeBet(userId, {
  marketId: '507f1f77bcf86cd799439011',  // Market ID
  selectionId: 'team-a',                  // Runner/Selection ID
  betType: 'back',                        // 'back' or 'lay'
  odds: 2.5,                              // Decimal odds
  stake: 1000,                            // Stake amount in ₹
  placedFrom: {                           // Optional tracking
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    device: 'web'
  }
});

console.log(bet);
// {
//   _id: '...',
//   user: '...',
//   market: '...',
//   selection: { id: 'team-a', name: 'Team A' },
//   betType: 'back',
//   odds: 2.5,
//   stake: 1000,
//   potentialProfit: 1500,
//   liability: 1000,
//   status: 'matched',              // or 'unmatched' or 'partially_matched'
//   matchedAmount: 1000,
//   unmatchedAmount: 0,
//   betRef: 'BET-...',
//   createdAt: '...'
// }
```

### Place a Lay Bet (Bet AGAINST a selection)

```javascript
const bet = await bettingService.placeBet(userId, {
  marketId: '507f1f77bcf86cd799439011',
  selectionId: 'team-b',
  betType: 'lay',                         // Lay bet
  odds: 3.0,
  stake: 1000,
  placedFrom: { ip: req.ip }
});

// For lay bet:
// - liability = stake × (odds - 1) = 1000 × 2 = 2000
// - This ₹2000 will be locked in user's wallet
```

---

## 2. CANCEL AN UNMATCHED BET

```javascript
const cancelledBet = await bettingService.cancelBet(betId, userId);

console.log(cancelledBet.status);  // 'cancelled' or 'matched' (if partial)
console.log(cancelledBet.unmatchedAmount);  // 0
```

**Rules:**
- Can only cancel your own bets
- Can only cancel if status is 'unmatched' or 'partially_matched'
- Unmatched funds are automatically unlocked

---

## 3. CASH OUT A BET

### Calculate Cash Out Value First

```javascript
const currentOdds = 2.8;  // Current market odds (from odds feed)

const cashOutOffer = await bettingService.calculateCashOut(betId, currentOdds);

console.log(cashOutOffer);
// {
//   cashOutValue: 1150.5,      // Amount user will receive
//   commission: 60.5,           // 5% commission
//   originalStake: 1000,
//   currentOdds: 2.8,
//   originalOdds: 2.5,
//   profitLoss: 150.5           // Profit vs original stake
// }
```

### Execute Cash Out

```javascript
const result = await bettingService.cashOutBet(betId, userId);

console.log(result);
// {
//   betRef: 'BET-...',
//   cashOutValue: 1150.5,
//   commission: 60.5,
//   profitLoss: 150.5
// }

// User wallet will be:
// - Original liability unlocked
// - Cash out value credited
```

---

## 4. SETTLE A MARKET (Admin Only)

### Settle with Winner

```javascript
const result = await bettingService.settleMarket(
  marketId,
  'team-a',     // Winning runner ID
  adminUserId   // Admin who is settling
);

console.log(result);
// {
//   marketId: '...',
//   winningRunner: 'Team A',
//   totalBetsSettled: 150,
//   winners: 82,
//   losers: 68,
//   totalPayout: 245000,
//   totalCommission: 4900
// }
```

**What happens:**
1. All matched bets are settled
2. Winners get credited (stake + profit - commission)
3. Losers get debited (locked funds deducted)
4. Unmatched portions are voided and refunded
5. Market status becomes 'settled'

---

## 5. VOID A MARKET (Admin Only)

```javascript
const result = await bettingService.voidMarket(
  marketId,
  'Match abandoned due to rain',  // Reason
  adminUserId
);

console.log(result);
// {
//   marketId: '...',
//   reason: 'Match abandoned due to rain',
//   totalBetsVoided: 150
// }
```

**What happens:**
1. All bets are voided (matched + unmatched)
2. All stakes/liabilities are refunded
3. Funds are unlocked in wallet
4. Market status becomes 'void'

---

## 6. GET USER'S BETS

### All Active Bets

```javascript
const { bets, pagination } = await bettingService.getUserBets(userId, {
  status: ['unmatched', 'matched', 'partially_matched'],
  page: 1,
  limit: 20
});

console.log(bets);  // Array of bet objects
console.log(pagination);
// {
//   page: 1,
//   limit: 20,
//   total: 45,
//   pages: 3
// }
```

### Bets for Specific Market

```javascript
const { bets } = await bettingService.getUserBets(userId, {
  marketId: '507f1f77bcf86cd799439011',
  status: 'matched'
});
```

### All Settled Bets

```javascript
const { bets } = await bettingService.getUserBets(userId, {
  status: 'settled',
  page: 1,
  limit: 50
});
```

---

## 7. GET USER BETTING STATISTICS

```javascript
const stats = await bettingService.getUserBettingStats(userId);

console.log(stats);
// {
//   totalBets: 156,
//   won: 82,
//   lost: 68,
//   void: 6,
//   totalStaked: 145000,
//   totalWinnings: 98000,
//   totalLosses: 52000,
//   netProfitLoss: 46000,      // ₹46,000 profit
//   winRate: 52.56              // 52.56% win rate
// }
```

---

## 8. GET USER'S EXPOSURE IN A MARKET

```javascript
const exposure = await bettingService.getUserMarketExposure(userId, marketId);

console.log(exposure);
// {
//   "team-a": {
//     selectionName: "Team A",
//     totalStake: 5000,
//     potentialProfit: 7500,    // If team A wins
//     potentialLoss: 0          // If team A loses
//   },
//   "team-b": {
//     selectionName: "Team B",
//     totalStake: 3000,
//     potentialProfit: 0,
//     potentialLoss: 4500       // Worst case if team B wins
//   }
// }
```

**Use this to:**
- Show user their risk exposure
- Calculate worst-case scenario
- Display potential profit/loss per selection

---

## 9. UPDATE MARKET ODDS (Real-time)

```javascript
const Market = require('../models/Market');

const market = await Market.findById(marketId);

await market.updateOdds([
  {
    runnerId: 'team-a',
    backOdds: [
      { price: 2.5, size: 5000 },
      { price: 2.48, size: 3000 },
      { price: 2.46, size: 2000 }
    ],
    layOdds: [
      { price: 2.52, size: 4500 },
      { price: 2.54, size: 3500 },
      { price: 2.56, size: 2500 }
    ],
    lastPriceTraded: 2.5
  },
  {
    runnerId: 'team-b',
    backOdds: [
      { price: 3.0, size: 4000 },
      { price: 2.98, size: 2500 }
    ],
    layOdds: [
      { price: 3.02, size: 3800 },
      { price: 3.04, size: 2800 }
    ],
    lastPriceTraded: 3.0
  }
]);

// Odds updated successfully
// Emit socket event here for real-time UI update
```

---

## 10. EXAMPLE: COMPLETE BET FLOW IN CONTROLLER

```javascript
// backend/controllers/bet.controller.js

const bettingService = require('../services/betting.service');

exports.placeBet = async (req, res) => {
  try {
    const userId = req.user._id;
    const { marketId, selectionId, betType, odds, stake } = req.body;

    // Validate input
    if (!marketId || !selectionId || !betType || !odds || !stake) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Place bet
    const bet = await bettingService.placeBet(userId, {
      marketId,
      selectionId,
      betType,
      odds,
      stake,
      placedFrom: {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        device: req.body.device || 'web'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Bet placed successfully',
      data: {
        bet,
        status: bet.status,
        matched: bet.matchedAmount,
        unmatched: bet.unmatchedAmount
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelBet = async (req, res) => {
  try {
    const userId = req.user._id;
    const { betId } = req.params;

    const cancelledBet = await bettingService.cancelBet(betId, userId);

    res.json({
      success: true,
      message: 'Bet cancelled successfully',
      data: cancelledBet
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.cashOutBet = async (req, res) => {
  try {
    const userId = req.user._id;
    const { betId } = req.params;

    const result = await bettingService.cashOutBet(betId, userId);

    res.json({
      success: true,
      message: 'Cash out successful',
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserBets = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, marketId, page = 1, limit = 20 } = req.query;

    const result = await bettingService.getUserBets(userId, {
      status: status ? status.split(',') : null,
      marketId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBettingStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await bettingService.getUserBettingStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMarketExposure = async (req, res) => {
  try {
    const userId = req.user._id;
    const { marketId } = req.params;

    const exposure = await bettingService.getUserMarketExposure(userId, marketId);

    res.json({
      success: true,
      data: exposure
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin endpoints
exports.settleMarket = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { marketId } = req.params;
    const { winningRunnerId } = req.body;

    const result = await bettingService.settleMarket(marketId, winningRunnerId, adminId);

    res.json({
      success: true,
      message: 'Market settled successfully',
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.voidMarket = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { marketId } = req.params;
    const { reason } = req.body;

    const result = await bettingService.voidMarket(marketId, reason, adminId);

    res.json({
      success: true,
      message: 'Market voided successfully',
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
```

---

## ERROR HANDLING

All betting service methods throw descriptive errors:

```javascript
try {
  const bet = await bettingService.placeBet(userId, betData);
} catch (error) {
  // Error messages:
  // - "Missing required parameters"
  // - "Invalid bet type. Must be 'back' or 'lay'"
  // - "Odds must be between 1.01 and 1000"
  // - "Minimum stake is ₹100"
  // - "Market is suspended. Cannot place bet."
  // - "Selection is inactive. Cannot place bet."
  // - "Maximum profit limit is ₹500,000"
  // - "Bet placement failed: Insufficient balance"
  
  console.error(error.message);
}
```

---

## BEST PRACTICES

### 1. Always Use Try-Catch

```javascript
try {
  const bet = await bettingService.placeBet(userId, betData);
} catch (error) {
  // Handle error
}
```

### 2. Validate Input Before Calling Service

```javascript
if (stake < 100) {
  return res.status(400).json({ message: 'Minimum stake is ₹100' });
}

if (odds < 1.01 || odds > 1000) {
  return res.status(400).json({ message: 'Invalid odds range' });
}
```

### 3. Check Bet Status Before Actions

```javascript
const bet = await Bet.findById(betId);

if (bet.status === 'settled') {
  return res.status(400).json({ message: 'Bet already settled' });
}

if (bet.status === 'matched') {
  return res.status(400).json({ message: 'Fully matched bets cannot be cancelled' });
}
```

### 4. Use Pagination for Bet Lists

```javascript
const { bets, pagination } = await bettingService.getUserBets(userId, {
  page: req.query.page || 1,
  limit: 20  // Always limit results
});
```

---

## TESTING EXAMPLES

### Test 1: Place and Match Bets

```javascript
// User 1 places back bet
const backBet = await bettingService.placeBet(user1Id, {
  marketId,
  selectionId: 'team-a',
  betType: 'back',
  odds: 2.5,
  stake: 1000
});

// User 2 places matching lay bet
const layBet = await bettingService.placeBet(user2Id, {
  marketId,
  selectionId: 'team-a',
  betType: 'lay',
  odds: 2.5,
  stake: 1000
});

// Both bets should be matched
assert(backBet.status === 'matched');
assert(layBet.status === 'matched');
assert(backBet.matchedAmount === 1000);
assert(layBet.matchedAmount === 1000);
```

### Test 2: Settle Market

```javascript
// Place bets
const backBet = await bettingService.placeBet(user1Id, {...});
const layBet = await bettingService.placeBet(user2Id, {...});

// Settle market
const result = await bettingService.settleMarket(marketId, 'team-a', adminId);

// Check results
const settledBackBet = await Bet.findById(backBet._id);
assert(settledBackBet.status === 'settled');
assert(settledBackBet.result === 'won');

const settledLayBet = await Bet.findById(layBet._id);
assert(settledLayBet.result === 'lost');
```

---

## SUMMARY

This betting engine is **100% production-ready** with:

✅ Complete bet placement and matching  
✅ Full settlement logic  
✅ Cash out functionality  
✅ Market management  
✅ Exposure calculations  
✅ Statistics and reporting  
✅ Atomic operations  
✅ Wallet integration  
✅ Error handling  

**Ready to integrate into your application!**
