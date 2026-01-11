/**
 * User Service
 * Handle user-related API calls
 */

import apiClient from '../api-client';

export const userService = {
  // Get user profile
  getProfile: async () => {
    return await apiClient.get('/user/profile');
  },

  // Update profile
  updateProfile: async (data: any) => {
    return await apiClient.put('/user/profile', data);
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    return await apiClient.post('/user/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return await apiClient.post('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get betting history
  getBettingHistory: async (params?: any) => {
    return await apiClient.get('/user/bets', { params });
  },

  // Get transaction history
  getTransactionHistory: async (params?: any) => {
    return await apiClient.get('/user/transactions', { params });
  },
};
