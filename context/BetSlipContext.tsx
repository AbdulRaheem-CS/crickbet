'use client';

/**
 * BetSlip Context
 * Manages bet slip state
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface BetSelection {
  marketId: string;
  marketName: string;
  runnerId: string;
  runnerName: string;
  betType: 'back' | 'lay';
  odds: number;
  stake: number;
}

interface BetSlipContextType {
  selections: BetSelection[];
  addSelection: (selection: BetSelection) => void;
  removeSelection: (marketId: string, runnerId: string) => void;
  updateStake: (marketId: string, runnerId: string, stake: number) => void;
  clearBetSlip: () => void;
  totalStake: number;
  potentialWin: number;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export function BetSlipProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<BetSelection[]>([]);

  const addSelection = (selection: BetSelection) => {
    setSelections((prev) => {
      // Remove existing selection for same market+runner
      const filtered = prev.filter(
        (s) => !(s.marketId === selection.marketId && s.runnerId === selection.runnerId)
      );
      return [...filtered, selection];
    });
  };

  const removeSelection = (marketId: string, runnerId: string) => {
    setSelections((prev) =>
      prev.filter((s) => !(s.marketId === marketId && s.runnerId === runnerId))
    );
  };

  const updateStake = (marketId: string, runnerId: string, stake: number) => {
    setSelections((prev) =>
      prev.map((s) =>
        s.marketId === marketId && s.runnerId === runnerId ? { ...s, stake } : s
      )
    );
  };

  const clearBetSlip = () => {
    setSelections([]);
  };

  const totalStake = selections.reduce((sum, s) => sum + s.stake, 0);
  const potentialWin = selections.reduce((sum, s) => sum + s.stake * (s.odds - 1), 0);

  return (
    <BetSlipContext.Provider
      value={{
        selections,
        addSelection,
        removeSelection,
        updateStake,
        clearBetSlip,
        totalStake,
        potentialWin,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  );
}

export function useBetSlip() {
  const context = useContext(BetSlipContext);
  if (context === undefined) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return context;
}
