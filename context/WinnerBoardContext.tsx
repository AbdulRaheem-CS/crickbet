'use client';

/**
 * Winner Board Context
 * Provides winner board modal state throughout the app
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface WinnerBoardContextType {
  showWinnerBoardModal: boolean;
  openWinnerBoardModal: () => void;
  closeWinnerBoardModal: () => void;
  activeTab: 'leader' | 'first-to-reach';
  setActiveTab: (tab: 'leader' | 'first-to-reach') => void;
}

const WinnerBoardContext = createContext<WinnerBoardContextType | undefined>(undefined);

export function WinnerBoardProvider({ children }: { children: ReactNode }) {
  const [showWinnerBoardModal, setShowWinnerBoardModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'leader' | 'first-to-reach'>('leader');

  const openWinnerBoardModal = () => {
    setShowWinnerBoardModal(true);
  };

  const closeWinnerBoardModal = () => {
    setShowWinnerBoardModal(false);
  };

  return (
    <WinnerBoardContext.Provider
      value={{
        showWinnerBoardModal,
        openWinnerBoardModal,
        closeWinnerBoardModal,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </WinnerBoardContext.Provider>
  );
}

export function useWinnerBoard() {
  const context = useContext(WinnerBoardContext);
  if (context === undefined) {
    throw new Error('useWinnerBoard must be used within a WinnerBoardProvider');
  }
  return context;
}
