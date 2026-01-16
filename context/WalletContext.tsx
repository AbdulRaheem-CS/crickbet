'use client';

/**
 * Wallet Context
 * Provides wallet state and methods
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletService } from '@/lib/services/wallet.service';
import { useAuth } from './AuthContext';

interface WalletContextType {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
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
      // API returns { success: true, data: { balance, bonus, exposure, ... } }
      setBalance(response.data?.balance || 0);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ balance, loading, refreshBalance }}>
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
