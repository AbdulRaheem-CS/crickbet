'use client';

/**
 * Wallet Context
 * Provides wallet state and methods
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '@/lib/services/wallet.service';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;          // total balance (raw)
  availableBalance: number; // balance minus locked funds — use this for display
  lockedFunds: number;
  exposure: number;
  bonus: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedFunds, setLockedFunds] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      refreshBalance();
    }
  }, [user]);

  const refreshBalance = async () => {
    setLoading(true);
    try {
      const response: any = await walletService.getBalance();
      // API returns { success: true, data: { balance, availableBalance, lockedFunds, exposure, bonus } }
      const data = response.data || {};
      setBalance(data.balance || 0);
      setAvailableBalance(data.availableBalance ?? data.balance ?? 0);
      setLockedFunds(data.lockedFunds || 0);
      setExposure(data.exposure || 0);
      setBonus(data.bonus || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ balance, availableBalance, lockedFunds, exposure, bonus, loading, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
