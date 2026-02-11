# Socket.io Quick Reference Guide

## 🚀 Quick Start

### Backend Setup
```javascript
// Already configured in backend/sockets/index.js
// Socket.io runs automatically with Express server
```

### Frontend Setup
```typescript
// Wrap your app with SocketProvider
import { SocketProvider } from '@/context/SocketContext';

function App() {
  return (
    <SocketProvider>
      {/* Your components */}
    </SocketProvider>
  );
}
```

---

## 📡 Available Events

### Client → Server (socket.emit)

| Event | Data | Description |
|-------|------|-------------|
| `bet:place` | `{ marketId, selection, type, odds, stake }` | Place a new bet |
| `bet:cancel` | `{ betId }` | Cancel pending bet |
| `market:subscribe` | `marketId` | Subscribe to market updates |
| `market:unsubscribe` | `marketId` | Unsubscribe from market |
| `subscribe:event` | `eventId` | Subscribe to live scores |
| `unsubscribe:event` | `eventId` | Unsubscribe from event |
| `bets:get` | `{ limit?, status? }` | Get user bets |
| `balance:get` | - | Get current balance |

### Server → Client (socket.on)

| Event | Data | Description |
|-------|------|-------------|
| `bet:placed` | `{ success, bet, timestamp }` | Bet placed successfully |
| `bet:matched` | `{ betId, marketId, matchedAmount, ... }` | Bet fully matched |
| `bet:partially_matched` | `{ betId, matchedAmount, remainingAmount }` | Bet partially matched |
| `bet:settled` | `{ betId, status, profitLoss, ... }` | Bet settled with result |
| `bet:cancelled` | `{ betId, refundAmount, timestamp }` | Bet cancelled |
| `bet:voided` | `{ betId, refundAmount, reason }` | Bet voided |
| `balance:update` | `{ balance, exposure, bonusBalance }` | Balance updated |
| `odds:update` | `{ marketId, odds, timestamp }` | Odds changed |
| `market:settled` | `{ marketId, result, timestamp }` | Market settled |
| `market:volume` | `{ marketId, totalVolume, backVolume, layVolume }` | Volume updated |
| `market:status` | `{ marketId, status, timestamp }` | Market status changed |
| `market:suspended` | `{ marketId, reason, timestamp }` | Market suspended |
| `market:reopened` | `{ marketId, timestamp }` | Market reopened |
| `market:data` | `{ market, stats, timestamp }` | Initial market data |
| `score:update` | `{ eventId, score, timestamp }` | Live score update |
| `notification` | `{ message, type, ... }` | User notification |
| `announcement` | `{ title, message, ... }` | System announcement |
| `bet:error` | `{ message, code }` | Bet operation error |
| `market:error` | `{ message, marketId }` | Market operation error |

---

## 💻 Usage Examples

### 1. Place a Bet
```typescript
import { useSocket } from '@/context/SocketContext';

const { placeBet, onBetPlaced } = useSocket();

// Place bet
placeBet({
  marketId: 'market_123',
  selection: 'Team A',
  type: 'back',
  odds: 2.5,
  stake: 100,
});

// Listen for confirmation
useEffect(() => {
  onBetPlaced((data) => {
    if (data.success) {
      console.log('Bet placed:', data.bet);
    }
  });
}, []);
```

### 2. Subscribe to Market
```typescript
const { subscribeToMarket, onOddsUpdate } = useSocket();

useEffect(() => {
  // Subscribe
  subscribeToMarket('market_123');

  // Listen to updates
  onOddsUpdate((data) => {
    if (data.marketId === 'market_123') {
      setOdds(data.odds);
    }
  });

  // Cleanup
  return () => {
    unsubscribeFromMarket('market_123');
  };
}, []);
```

### 3. Live Balance
```typescript
const { getBalance, onBalanceUpdate } = useSocket();

useEffect(() => {
  getBalance(); // Get initial

  onBalanceUpdate((data) => {
    setBalance(data.balance);
    setExposure(data.exposure);
  });
}, []);
```

### 4. Cancel Bet
```typescript
const { cancelBet } = useSocket();

const handleCancel = (betId: string) => {
  cancelBet(betId);
};

// Listen for confirmation
socket?.on('bet:cancelled', (data) => {
  console.log('Refunded:', data.refundAmount);
});
```

### 5. Live Notifications
```typescript
const { socket } = useSocket();
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  socket?.on('notification', (data) => {
    setNotifications(prev => [data, ...prev]);
  });

  return () => {
    socket?.off('notification');
  };
}, [socket]);
```

---

## 🎯 Common Patterns

### Auto-refresh on Updates
```typescript
const { onBetSettled, onBalanceUpdate } = useSocket();

useEffect(() => {
  onBetSettled((data) => {
    // Refresh bet list
    fetchBets();
  });

  onBalanceUpdate((data) => {
    // Update balance display
    setBalance(data.balance);
  });
}, []);
```

### Multiple Market Subscriptions
```typescript
const markets = ['market_1', 'market_2', 'market_3'];

useEffect(() => {
  markets.forEach(marketId => {
    subscribeToMarket(marketId);
  });

  return () => {
    markets.forEach(marketId => {
      unsubscribeFromMarket(marketId);
    });
  };
}, []);
```

### Conditional Rendering
```typescript
const { connected } = useSocket();

return (
  <div>
    {connected ? (
      <LiveOddsDisplay />
    ) : (
      <div>Connecting to live updates...</div>
    )}
  </div>
);
```

---

## 🔧 Backend Integration

### Trigger Events from Services

#### Bet Service:
```javascript
const { emitBetMatched, emitBalanceUpdate } = require('../sockets/betting.socket');

// After matching bet
emitBetMatched(userId, betData);
emitBalanceUpdate(userId, walletData);
```

#### Market Service:
```javascript
const { emitOddsUpdate, emitMarketSettled } = require('../sockets/betting.socket');

// After odds change
emitOddsUpdate(marketId, newOdds);

// After settlement
emitMarketSettled(marketId, result);
```

#### Wallet Service:
```javascript
const { emitBalanceUpdate } = require('../sockets/betting.socket');

// After any transaction
emitBalanceUpdate(userId, { balance, exposure, bonusBalance });
```

---

## 🎨 UI Components Cheatsheet

### Connection Status Badge
```tsx
const { connected } = useSocket();

<div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
```

### Live Balance Display
```tsx
const { onBalanceUpdate } = useSocket();
const [balance, setBalance] = useState(0);

useEffect(() => {
  onBalanceUpdate((data) => setBalance(data.balance));
}, []);

<p className="text-2xl font-bold">₹{balance.toFixed(2)}</p>
```

### Bet Status Badge
```tsx
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  matched: 'bg-green-100 text-green-800',
  settled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

<span className={`px-2 py-1 rounded text-xs ${statusColors[bet.status]}`}>
  {bet.status}
</span>
```

### Live Odds Button
```tsx
const { placeBet } = useSocket();

<button
  onClick={() => placeBet({ marketId, selection, type: 'back', odds, stake })}
  className="bg-blue-100 hover:bg-blue-200 p-2 rounded"
>
  <p className="font-bold">{odds.toFixed(2)}</p>
</button>
```

---

## ⚠️ Important Notes

### Authentication
- Socket automatically authenticates with JWT token from localStorage
- Anonymous connections allowed for public data
- Protected events require authentication

### Error Handling
```typescript
const { socket } = useSocket();

useEffect(() => {
  socket?.on('bet:error', (error) => {
    toast.error(error.message); // Show error to user
  });

  socket?.on('market:error', (error) => {
    console.error('Market error:', error);
  });
}, [socket]);
```

### Cleanup
Always clean up listeners:
```typescript
useEffect(() => {
  onBetPlaced(callback);
  
  return () => {
    offBetPlaced(); // Remove listener
  };
}, []);
```

### Performance
- Subscribe only to markets you're viewing
- Unsubscribe when leaving page
- Use useCallback for event handlers
- Limit notification history (max 5-10 items)

---

## 🐛 Debugging

### Check Connection
```typescript
const { socket, connected } = useSocket();

console.log('Socket ID:', socket?.id);
console.log('Connected:', connected);
```

### Monitor Events
```typescript
socket?.onAny((event, ...args) => {
  console.log(`Event: ${event}`, args);
});
```

### Test in Browser Console
```javascript
// Get socket instance from window
const socket = io('http://localhost:5001', {
  auth: { token: localStorage.getItem('token') }
});

// Test events
socket.emit('balance:get');
socket.on('balance:update', console.log);
```

---

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Phase 4 Completion Guide](./PHASE_4_COMPLETION.md)
- [Live Betting Example](./components/betting/LiveBettingExample.tsx)

---

**Quick Reference Version:** 1.0  
**Last Updated:** Phase 4 Completion
