/**
 * Wallet Service
 * Handle wallet-related API calls
 */

import apiClient from '../api-client';

export const walletService = {
  // Get wallet balance
  getBalance: async () => {
    return await apiClient.get('/wallet/balance');
  },

  // Initiate deposit
  deposit: async (amount: number, method: string) => {
    return await apiClient.post('/wallet/deposit', { amount, method });
  },

  // Request withdrawal
  withdraw: async (amount: number, method: string, bankDetails?: any) => {
    return await apiClient.post('/wallet/withdraw', { amount, method, bankDetails });
  },

  // Get transactions
  getTransactions: async (params?: any) => {
    return await apiClient.get('/wallet/transactions', { params });
  },

  // Verify deposit
  verifyDeposit: async (transactionId: string, paymentId: string) => {
    return await apiClient.post('/wallet/verify-deposit', { transactionId, paymentId });
  },

  // Get payment methods
  getPaymentMethods: async () => {
    return await apiClient.get('/wallet/payment-methods');
  },
};
