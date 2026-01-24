/**
 * Authentication Service
 * Handle all authentication-related API calls
 */

import apiClient from '../api-client';

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
  refCode?: string; // optional referral code passed from marketing link
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export const authService = {
  // Register new user
  register: async (data: RegisterData) => {
    return await apiClient.post('/auth/register', data);
  },

  // Login user
  login: async (data: LoginData) => {
    return await apiClient.post('/auth/login', data);
  },

  // Logout
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },

  // Get current user
  me: async () => {
    return await apiClient.get('/auth/me');
  },

  // Forgot password
  forgotPassword: async (email: string) => {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, password: string) => {
    return await apiClient.post('/auth/reset-password', { token, password });
  },

  // Verify email
  verifyEmail: async (token: string) => {
    return await apiClient.post('/auth/verify-email', { token });
  },
};
