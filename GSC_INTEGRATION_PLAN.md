# GSC+ Seamless Wallet API Integration Plan

## 📋 Overview

**Provider:** GSC+ (Game Service Center Plus)  
**API Version:** Seamless Wallet API v2.0.5  
**Environment:** Staging  
**Operator Code:** Q2R1  
**Operator URL:** https://staging.gsimw.com  
**BO URL:** https://stagingfe.gsimw.com/gsi_agent_dashboard/#/login  

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CRICKBET PLATFORM                        │
│                                                                 │
│  ┌──────────────┐     ┌──────────────────┐     ┌─────────────┐ │
│  │   Next.js    │────▶│  Express Backend  │────▶│   MongoDB   │ │
│  │   Frontend   │◀────│  (Port 5001)      │◀────│   Database  │ │
│  └──────────────┘     └──────────────────┘     └─────────────┘ │
│                              │   ▲                              │
│                              │   │                              │
│            Outgoing API      │   │  Incoming Callbacks          │
│            (Operator APIs)   │   │  (Seamless Wallet APIs)      │
│                              ▼   │                              │
│                     ┌─────────────────┐                         │
│                     │   GSC+ Platform  │                        │
│                     │  staging.gsimw   │                        │
│                     └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Two-Way Communication:

**A) APIs WE CALL (Operator APIs → GSC+)**
These are endpoints on GSC+ servers that we call to manage games:
- 3.1 Launch Game
- 3.2 Wager List
- 3.3 Get Wager
- 3.4 Game List
- 3.5 Game History
- 3.6 Product List
- 3.7 Super Lobby
- 3.8 Create Free Round
- 3.9 Cancel Free Round
- 3.10 Get Player FRB
- 3.11 Get Bet Scales
- 3.12 Wallet Balance

**B) APIs GSC+ CALLS ON US (Seamless Wallet Callbacks)**
These are endpoints on OUR server that GSC+ calls to manage player wallets:
- 2.1 Balance → GET player balance
- 2.2 Withdraw → DEDUCT from player wallet (bets, tips)
- 2.3 Deposit → ADD to player wallet (wins, bonuses)
- 2.4 Push Bet Data → SYNC bet records

---

## 📂 Files to Create/Modify

### NEW Files:
```
backend/
├── config/
│   └── gsc.js                        # GSC+ configuration & constants
├── services/
│   └── gsc.service.js                 # GSC+ API client (calls TO GSC+)
├── controllers/
│   └── gsc-callback.controller.js     # Handles callbacks FROM GSC+
├── routes/
│   └── gsc-callback.routes.js         # Callback endpoints
├── middleware/
│   └── gsc.middleware.js              # Signature verification middleware
├── models/
│   ├── GscGame.js                     # Synced game catalog
│   ├── GscTransaction.js             # GSC+ transaction log
│   └── GscSession.js                 # Game sessions
└── utils/
    └── gsc-signature.js               # MD5 signature utilities
```

### MODIFIED Files:
```
backend/
├── .env                               # Add GSC+ credentials
├── server.js                          # Register new routes
├── controllers/
│   └── casino.controller.js           # Connect to real GSC+ APIs
├── services/
│   ├── casino.service.js              # Real game launch/list
│   └── wallet.service.js              # Handle GSC+ transactions
└── routes/
    └── casino.routes.js               # Add new endpoints
```

---

## 🔧 Implementation Phases

### Phase 1: Foundation (Config, Signature, Models)
1. Add GSC+ credentials to `.env`
2. Create `config/gsc.js` - Configuration constants
3. Create `utils/gsc-signature.js` - MD5 signature generation & verification
4. Create `models/GscGame.js` - Game catalog schema
5. Create `models/GscTransaction.js` - Transaction log schema
6. Create `models/GscSession.js` - Player session schema

### Phase 2: Outbound API Client (We → GSC+)
7. Create `services/gsc.service.js` - All outbound API calls:
   - `launchGame()` → POST /api/operators/launch-game
   - `getGameList()` → GET /api/operators/provider-games
   - `getProductList()` → GET /api/operators/available-products
   - `getWagerList()` → GET /api/operators/wagers
   - `getWager()` → GET /api/operators/wagers/:id
   - `getGameHistory()` → GET /api/operators/:code/game-history
   - `getWalletBalance()` → GET /api/operators/wallet-balance
   - `launchSuperLobby()` → POST /superlobby/launch
   - `createFreeRound()` → POST /api/operators/create-free-round
   - `cancelFreeRound()` → POST /api/operators/cancel-free-round
   - `getPlayerFRB()` → GET /api/operators/get-player-frb
   - `getBetScales()` → GET /api/operators/get-bet-scales

### Phase 3: Inbound Callback Handlers (GSC+ → Us)
8. Create `middleware/gsc.middleware.js` - Signature verification
9. Create `controllers/gsc-callback.controller.js` - Handle 4 callback endpoints:
   - `handleBalance()` → POST /v1/api/seamless/balance
   - `handleWithdraw()` → POST /v1/api/seamless/withdraw
   - `handleDeposit()` → POST /v1/api/seamless/deposit
   - `handlePushBetData()` → POST /v1/api/seamless/pushbetdata
10. Create `routes/gsc-callback.routes.js` - Mount callback routes

### Phase 4: Connect to Existing System
11. Update `casino.controller.js` - Use real GSC+ game data
12. Update `casino.service.js` - Real game launch URLs
13. Add game sync script `scripts/sync-gsc-games.js`
14. Register routes in `server.js`

### Phase 5: Frontend Integration
15. Update casino pages to fetch real game data
16. Implement game launch in iframe/new window
17. Real-time balance updates via Socket.io

---

## 🔐 Security Requirements

1. **Signature Verification:** Every callback from GSC+ must be verified using MD5
2. **Transaction Idempotency:** Duplicate transaction IDs must return previous result
3. **Atomic Wallet Operations:** Use MongoDB transactions for all balance changes
4. **IP Whitelisting:** Only accept callbacks from GSC+ IPs (get from GSC+ support)
5. **HTTPS Required:** All callback URLs must use HTTPS in production
6. **Secret Key Protection:** Never expose secret_key in logs or responses

---

## ⚠️ Critical Implementation Notes

1. **WBET Exception:** Product 1040 (WBET) winnings are NOT via /deposit API - must handle via /push-bet-data manually
2. **Currency Ratios:** Some currencies use 1:1000 ratio - must convert before responding
3. **Timestamp Format:** All requests use SECOND timestamps (not milliseconds) in GMT+8
4. **Balance Precision:** Support up to 4 decimal places (float64)
5. **Member Account:** Max 50 characters - our usernames must fit this
6. **Accept Settled Deposits Without Bets:** Some providers give promo bonuses without bets
7. **Negative Balance Edge Case:** RESETTLED action can cause negative balance (sports)

---

## 📊 Error Code Reference

### Seamless Wallet Codes (Our Responses):
| Code | Description |
|------|------------|
| 0 | Success |
| 999 | Internal Server Error |
| 1000 | Member does not exist |
| 1001 | Insufficient balance |
| 1002 | Proxy key error |
| 1003 | Duplicate transaction |
| 1004 | Invalid signature |
| 1005 | Not getting game list |
| 1006 | Bet does not exist |
| 2000 | Product under maintenance |

### Operator Codes (GSC+ Responses):
| Code | Description |
|------|------------|
| 200 | Success |
| 999 | Internal Server Error |
| 10002 | Invalid parameter |
