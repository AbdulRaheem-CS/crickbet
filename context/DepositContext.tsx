'use client';

/**
 * Deposit Context
 * Manages deposit modal state globally
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface DepositContextType {
  showDepositModal: boolean;
  openDepositModal: () => void;
  closeDepositModal: () => void;
}

const DepositContext = createContext<DepositContextType | undefined>(undefined);

export function DepositProvider({ children }: { children: ReactNode }) {
  const [showDepositModal, setShowDepositModal] = useState(false);

  const openDepositModal = () => {
    setShowDepositModal(true);
  };

  const closeDepositModal = () => {
    setShowDepositModal(false);
  };

  return (
    <DepositContext.Provider
      value={{
        showDepositModal,
        openDepositModal,
        closeDepositModal,
      }}
    >
      {children}
    </DepositContext.Provider>
  );
}

export function useDeposit() {
  const context = useContext(DepositContext);
  if (!context) {
    throw new Error('useDeposit must be used within DepositProvider');
  }
  return context;
}
