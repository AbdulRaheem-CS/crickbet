/**
 * User Service
 * Handle user-related API calls
 */

import apiClient from '../api-client';

export const userService = {
  // Get user profile
  getProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  // Update profile
  updateProfile: async (data: any) => {
    return await apiClient.put('/users/profile', data);
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get betting history
  getBettingHistory: async (params?: any) => {
    return await apiClient.get('/users/bets', { params });
  },

  // Get transaction history
  getTransactionHistory: async (params?: any) => {
    return await apiClient.get('/users/transactions', { params });
  },

  // ==============================
  // Player KYC Methods
  // ==============================

  // Get player KYC status
  getKYCStatus: async () => {
    return await apiClient.get('/users/kyc-status');
  },

  // Update full name
  updateFullName: async (firstName: string, lastName: string) => {
    return await apiClient.post('/users/update-fullname', { firstName, lastName });
  },

  // Send phone OTP
  sendPhoneOTP: async () => {
    return await apiClient.post('/users/send-phone-otp');
  },

  // Verify phone OTP
  verifyPhoneOTP: async (otp: string) => {
    return await apiClient.post('/users/verify-phone-otp', { otp });
  },
};
