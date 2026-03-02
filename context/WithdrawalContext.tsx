'use client';

/**
 * Withdrawal Context
 * Manages withdrawal modal state globally.
 * Now includes KYC check flow: KYC Modal → Withdrawal Modal
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface WithdrawalContextType {
  showWithdrawalModal: boolean;
  showKYCModal: boolean;
  openWithdrawalModal: () => void;
  closeWithdrawalModal: () => void;
  openKYCModal: () => void;
  closeKYCModal: () => void;
  onKYCComplete: () => void;
}

const WithdrawalContext = createContext<WithdrawalContextType | undefined>(undefined);

export function WithdrawalProvider({ children }: { children: ReactNode }) {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // When user clicks "Withdraw", always open KYC check first
  const openWithdrawalModal = () => {
    setShowKYCModal(true);
  };

  const closeWithdrawalModal = () => {
    setShowWithdrawalModal(false);
  };

  const openKYCModal = () => {
    setShowKYCModal(true);
  };

  const closeKYCModal = () => {
    setShowKYCModal(false);
  };

  // Called when KYC is verified → close KYC modal, open withdrawal modal
  const onKYCComplete = () => {
    setShowKYCModal(false);
    setShowWithdrawalModal(true);
  };

  return (
    <WithdrawalContext.Provider
      value={{
        showWithdrawalModal,
        showKYCModal,
        openWithdrawalModal,
        closeWithdrawalModal,
        openKYCModal,
        closeKYCModal,
        onKYCComplete,
      }}
    >
      {children}
    </WithdrawalContext.Provider>
  );
}

export function useWithdrawal() {
  const context = useContext(WithdrawalContext);
  if (!context) {
    throw new Error('useWithdrawal must be used within WithdrawalProvider');
  }
  return context;
}
