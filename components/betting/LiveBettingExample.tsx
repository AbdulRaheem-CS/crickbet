/**
 * Real-time Betting Component Example
 * Demonstrates how to use Socket Context for live betting
 * Phase 4: Real-time Features
 */

'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

interface Bet {
  id: string;
  marketId: string;
  selection: string;
  type: 'back' | 'lay';
  odds: number;
  stake: number;
  status: string;
  potentialProfit: number;
  placedAt: string;
}

interface MarketOdds {
  [selection: string]: {
    back: number[];
    lay: number[];
  };
}

export default function LiveBettingExample() {
  const {
    connected,
    subscribeToMarket,
    unsubscribeFromMarket,
    placeBet,
    cancelBet,
    getUserBets,
    getBalance,
    onBetPlaced,
    onBetMatched,
    onBetSettled,
    onBalanceUpdate,
    onOddsUpdate,
    onMarketSettled,
    onMarketVolume,
    offBetPlaced,
    offBetMatched,
    offBalanceUpdate,
    offOddsUpdate,
  } = useSocket();

  const [marketId] = useState('market_123'); // Example market ID
  const [balance, setBalance] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [odds, setOdds] = useState<MarketOdds>({});
  const [bets, setBets] = useState<Bet[]>([]);
  const [volume, setVolume] = useState({ total: 0, back: 0, lay: 0 });
  const [notifications, setNotifications] = useState<string[]>([]);

  // Subscribe to market on mount
  useEffect(() => {
    if (connected && marketId) {
      subscribeToMarket(marketId);
      getUserBets({ limit: 20 });
      getBalance();

      return () => {
        unsubscribeFromMarket(marketId);
      };
    }
  }, [connected, marketId]);

  // Set up event listeners
  useEffect(() => {
    // Bet placed successfully
    onBetPlaced((data) => {
      console.log('✅ Bet placed:', data);
      setBets((prev) => [data.bet, ...prev]);
      addNotification(`Bet placed: ${data.bet.selection} at ${data.bet.odds}`);
    });

    // Bet matched
    onBetMatched((data) => {
      console.log('🎯 Bet matched:', data);
      setBets((prev) =>
        prev.map((bet) =>
          bet.id === data.betId ? { ...bet, status: 'matched' } : bet
        )
      );
      addNotification(`Bet matched: ${data.selection} - ₹${data.matchedAmount}`);
    });

    // Bet settled
    onBetSettled((data) => {
      console.log('🏁 Bet settled:', data);
      setBets((prev) =>
        prev.map((bet) =>
          bet.id === data.betId
            ? { ...bet, status: 'settled', profitLoss: data.profitLoss }
            : bet
        )
      );
      const profitLoss = data.profitLoss >= 0 ? `+₹${data.profitLoss}` : `₹${data.profitLoss}`;
      addNotification(`Bet settled: ${profitLoss}`);
    });

    // Balance updated
    onBalanceUpdate((data) => {
      console.log('💰 Balance updated:', data);
      setBalance(data.balance);
      setExposure(data.exposure);
    });

    // Odds updated
    onOddsUpdate((data) => {
      console.log('📊 Odds updated:', data);
      setOdds(data.odds);
    });

    // Market settled
    onMarketSettled((data) => {
      console.log('🏁 Market settled:', data);
      addNotification(`Market settled - Winner: ${data.result.winner}`);
    });

    // Market volume updated
    onMarketVolume((data) => {
      console.log('📈 Volume updated:', data);
      setVolume({
        total: data.totalVolume,
        back: data.backVolume,
        lay: data.layVolume,
      });
    });

    // Cleanup listeners on unmount
    return () => {
      offBetPlaced();
      offBetMatched();
      offBalanceUpdate();
      offOddsUpdate();
    };
  }, []);

  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev.slice(0, 4)]);
  };

  const handlePlaceBet = (selection: string, type: 'back' | 'lay', odds: number) => {
    const stake = 100; // Example stake

    placeBet({
      marketId,
      selection,
      type,
      odds,
      stake,
    });
  };

  const handleCancelBet = (betId: string) => {
    cancelBet(betId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            connected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Wallet</h3>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-2xl font-bold text-green-600">₹{balance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exposure</p>
            <p className="text-2xl font-bold text-red-600">₹{exposure.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Market Volume */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Market Volume</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold">₹{volume.total.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Back</p>
            <p className="text-xl font-bold text-blue-600">₹{volume.back.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Lay</p>
            <p className="text-xl font-bold text-pink-600">₹{volume.lay.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Odds Display (Example) */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Live Odds</h3>
        {Object.keys(odds).length === 0 ? (
          <p className="text-gray-500">Waiting for odds...</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(odds).map(([selection, selectionOdds]) => (
              <div key={selection} className="border rounded p-3">
                <p className="font-medium mb-2">{selection}</p>
                <div className="flex gap-4">
                  {/* Back Odds */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">BACK</p>
                    <div className="flex gap-1">
                      {selectionOdds.back.map((odd, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePlaceBet(selection, 'back', odd)}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 p-2 rounded text-center transition-colors"
                        >
                          <p className="font-bold text-blue-900">{odd.toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lay Odds */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">LAY</p>
                    <div className="flex gap-1">
                      {selectionOdds.lay.map((odd, idx) => (
                        <button
                          key={idx}
                          onClick={() => handlePlaceBet(selection, 'lay', odd)}
                          className="flex-1 bg-pink-100 hover:bg-pink-200 p-2 rounded text-center transition-colors"
                        >
                          <p className="font-bold text-pink-900">{odd.toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Live Updates</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No updates yet</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((notification, idx) => (
              <li
                key={idx}
                className="text-sm p-2 bg-gray-50 rounded border-l-4 border-blue-500"
              >
                {notification}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Active Bets */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">My Bets</h3>
        {bets.length === 0 ? (
          <p className="text-gray-500 text-sm">No active bets</p>
        ) : (
          <div className="space-y-2">
            {bets.map((bet) => (
              <div
                key={bet.id}
                className="border rounded p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium">{bet.selection}</p>
                  <p className="text-sm text-gray-600">
                    {bet.type.toUpperCase()} @ {bet.odds.toFixed(2)} × ₹{bet.stake}
                  </p>
                  <p className="text-xs text-gray-500">
                    Potential: ₹{bet.potentialProfit.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      bet.status === 'matched'
                        ? 'bg-green-100 text-green-800'
                        : bet.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {bet.status}
                  </span>
                  {bet.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBet(bet.id)}
                      className="mt-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
