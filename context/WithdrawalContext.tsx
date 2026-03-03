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
  kycInitialView: 'kyc-check' | 'personal-info';
  kycDisableAutoComplete: boolean;
  showChangePasswordModal: boolean;
  openWithdrawalModal: () => void;
  closeWithdrawalModal: () => void;
  openKYCModal: () => void;
  closeKYCModal: () => void;
  onKYCComplete: () => void;
  openPersonalInfoModal: () => void;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
}

const WithdrawalContext = createContext<WithdrawalContextType | undefined>(undefined);

export function WithdrawalProvider({ children }: { children: ReactNode }) {
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycInitialView, setKycInitialView] = useState<'kyc-check' | 'personal-info'>('kyc-check');
  const [kycDisableAutoComplete, setKycDisableAutoComplete] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // When user clicks "Withdraw", always open KYC check first
  const openWithdrawalModal = () => {
    setKycInitialView('kyc-check');
    setKycDisableAutoComplete(false);
    setShowKYCModal(true);
  };

  const closeWithdrawalModal = () => {
    setShowWithdrawalModal(false);
  };

  const openKYCModal = () => {
    setKycInitialView('kyc-check');
    setKycDisableAutoComplete(false);
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

  // Open KYC modal at Personal Info view (no auto-redirect to withdrawal)
  const openPersonalInfoModal = () => {
    setKycInitialView('personal-info');
    setKycDisableAutoComplete(true);
    setShowKYCModal(true);
  };

  const openChangePasswordModal = () => setShowChangePasswordModal(true);
  const closeChangePasswordModal = () => setShowChangePasswordModal(false);

  return (
    <WithdrawalContext.Provider
      value={{
        showWithdrawalModal,
        showKYCModal,
        kycInitialView,
        kycDisableAutoComplete,
        showChangePasswordModal,
        openWithdrawalModal,
        closeWithdrawalModal,
        openKYCModal,
        closeKYCModal,
        onKYCComplete,
        openPersonalInfoModal,
        openChangePasswordModal,
        closeChangePasswordModal,
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
