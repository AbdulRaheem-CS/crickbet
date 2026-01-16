'use client';

/**
 * Socket Context
 * Manages WebSocket connection for real-time updates
 * Phase 4: Enhanced with betting event handlers
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

// Event types
interface BetPlacedEvent {
  success: boolean;
  bet: {
    id: string;
    marketId: string;
    selection: string;
    type: 'back' | 'lay';
    odds: number;
    stake: number;
    status: string;
    potentialProfit: number;
    placedAt: string;
  };
  timestamp: string;
}

interface BetMatchedEvent {
  betId: string;
  marketId: string;
  selection: string;
  type: 'back' | 'lay';
  odds: number;
  stake: number;
  matchedAmount: number;
  status: string;
  timestamp: string;
}

interface BalanceUpdateEvent {
  balance: number;
  exposure: number;
  bonusBalance?: number;
  timestamp: string;
}

interface OddsUpdateEvent {
  marketId: string;
  odds: any;
  timestamp: string;
}

interface MarketSettledEvent {
  marketId: string;
  result: {
    winner: string;
    status: string;
    settledAt: string;
  };
  timestamp: string;
}

interface BetSettledEvent {
  betId: string;
  marketId: string;
  status: string;
  profitLoss: number;
  settledAt: string;
  timestamp: string;
}

interface MarketVolumeEvent {
  marketId: string;
  totalVolume: number;
  backVolume: number;
  layVolume: number;
  totalBets: number;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  
  // Market subscriptions
  subscribeToMarket: (marketId: string) => void;
  unsubscribeFromMarket: (marketId: string) => void;
  
  // Event subscriptions
  subscribeToEvent: (eventId: string) => void;
  unsubscribeFromEvent: (eventId: string) => void;
  
  // Betting actions
  placeBet: (data: {
    marketId: string;
    selection: string;
    type: 'back' | 'lay';
    odds: number;
    stake: number;
  }) => void;
  cancelBet: (betId: string) => void;
  getUserBets: (data?: { limit?: number; status?: string }) => void;
  getBalance: () => void;
  
  // Event listeners
  onBetPlaced: (callback: (data: BetPlacedEvent) => void) => void;
  onBetMatched: (callback: (data: BetMatchedEvent) => void) => void;
  onBetSettled: (callback: (data: BetSettledEvent) => void) => void;
  onBalanceUpdate: (callback: (data: BalanceUpdateEvent) => void) => void;
  onOddsUpdate: (callback: (data: OddsUpdateEvent) => void) => void;
  onMarketSettled: (callback: (data: MarketSettledEvent) => void) => void;
  onMarketVolume: (callback: (data: MarketVolumeEvent) => void) => void;
  
  // Remove listeners
  offBetPlaced: () => void;
  offBetMatched: () => void;
  offBetSettled: () => void;
  offBalanceUpdate: () => void;
  offOddsUpdate: () => void;
  offMarketSettled: () => void;
  offMarketVolume: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Handle bet errors
    newSocket.on('bet:error', (data) => {
      console.error('Bet error:', data);
      // You can show toast notification here
    });

    // Handle market errors
    newSocket.on('market:error', (data) => {
      console.error('Market error:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Market subscriptions
  const subscribeToMarket = useCallback((marketId: string) => {
    if (socket) {
      socket.emit('market:subscribe', marketId);
      console.log('📊 Subscribed to market:', marketId);
    }
  }, [socket]);

  const unsubscribeFromMarket = useCallback((marketId: string) => {
    if (socket) {
      socket.emit('market:unsubscribe', marketId);
      console.log('📊 Unsubscribed from market:', marketId);
    }
  }, [socket]);

  // Event subscriptions (for live scores)
  const subscribeToEvent = useCallback((eventId: string) => {
    if (socket) {
      socket.emit('subscribe:event', eventId);
      console.log('🏏 Subscribed to event:', eventId);
    }
  }, [socket]);

  const unsubscribeFromEvent = useCallback((eventId: string) => {
    if (socket) {
      socket.emit('unsubscribe:event', eventId);
      console.log('🏏 Unsubscribed from event:', eventId);
    }
  }, [socket]);

  // Betting actions
  const placeBet = useCallback((data: {
    marketId: string;
    selection: string;
    type: 'back' | 'lay';
    odds: number;
    stake: number;
  }) => {
    if (socket) {
      socket.emit('bet:place', data);
      console.log('🎯 Placing bet:', data);
    }
  }, [socket]);

  const cancelBet = useCallback((betId: string) => {
    if (socket) {
      socket.emit('bet:cancel', { betId });
      console.log('❌ Cancelling bet:', betId);
    }
  }, [socket]);

  const getUserBets = useCallback((data?: { limit?: number; status?: string }) => {
    if (socket) {
      socket.emit('bets:get', data);
      console.log('📋 Getting user bets');
    }
  }, [socket]);

  const getBalance = useCallback(() => {
    if (socket) {
      socket.emit('balance:get');
      console.log('💰 Getting balance');
    }
  }, [socket]);

  // Event listeners
  const onBetPlaced = useCallback((callback: (data: BetPlacedEvent) => void) => {
    if (socket) {
      socket.on('bet:placed', callback);
    }
  }, [socket]);

  const onBetMatched = useCallback((callback: (data: BetMatchedEvent) => void) => {
    if (socket) {
      socket.on('bet:matched', callback);
    }
  }, [socket]);

  const onBetSettled = useCallback((callback: (data: BetSettledEvent) => void) => {
    if (socket) {
      socket.on('bet:settled', callback);
    }
  }, [socket]);

  const onBalanceUpdate = useCallback((callback: (data: BalanceUpdateEvent) => void) => {
    if (socket) {
      socket.on('balance:update', callback);
    }
  }, [socket]);

  const onOddsUpdate = useCallback((callback: (data: OddsUpdateEvent) => void) => {
    if (socket) {
      socket.on('odds:update', callback);
    }
  }, [socket]);

  const onMarketSettled = useCallback((callback: (data: MarketSettledEvent) => void) => {
    if (socket) {
      socket.on('market:settled', callback);
    }
  }, [socket]);

  const onMarketVolume = useCallback((callback: (data: MarketVolumeEvent) => void) => {
    if (socket) {
      socket.on('market:volume', callback);
    }
  }, [socket]);

  // Remove listeners
  const offBetPlaced = useCallback(() => {
    if (socket) {
      socket.off('bet:placed');
    }
  }, [socket]);

  const offBetMatched = useCallback(() => {
    if (socket) {
      socket.off('bet:matched');
    }
  }, [socket]);

  const offBetSettled = useCallback(() => {
    if (socket) {
      socket.off('bet:settled');
    }
  }, [socket]);

  const offBalanceUpdate = useCallback(() => {
    if (socket) {
      socket.off('balance:update');
    }
  }, [socket]);

  const offOddsUpdate = useCallback(() => {
    if (socket) {
      socket.off('odds:update');
    }
  }, [socket]);

  const offMarketSettled = useCallback(() => {
    if (socket) {
      socket.off('market:settled');
    }
  }, [socket]);

  const offMarketVolume = useCallback(() => {
    if (socket) {
      socket.off('market:volume');
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      connected,
      subscribeToMarket,
      unsubscribeFromMarket,
      subscribeToEvent,
      unsubscribeFromEvent,
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
      offBetSettled,
      offBalanceUpdate,
      offOddsUpdate,
      offMarketSettled,
      offMarketVolume,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

