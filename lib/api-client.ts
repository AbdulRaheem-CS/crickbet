/**
 * API Client
 * Centralized API client with authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      // Support both new ('authToken') and legacy ('token') keys
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message = error.response?.data?.message || error.response?.data?.error || 'An error occurred';
    
    // Handle 401 - Unauthorized
    // Don't redirect if it's a login or register attempt (failed credentials)
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    
    if (error.response?.status === 401 && typeof window !== 'undefined' && !isAuthEndpoint) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// ============================================
// AUTHENTICATION API
// ============================================
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    return apiClient.post('/auth/register', data);
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data?.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.data.token);
    }
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  },

  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  updateProfile: async (data: any) => {
    return apiClient.put('/auth/profile', data);
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return apiClient.post('/auth/change-password', data);
  },
};

// ============================================
// BETTING API
// ============================================
export const bettingAPI = {
  placeBet: async (data: {
    marketId: string;
    selectionId: string;
    betType: 'back' | 'lay';
    odds: number;
    stake: number;
  }) => {
    return apiClient.post('/bets/place', data);
  },

  getMyBets: async (params?: {
    page?: number;
    limit?: number;
    status?: string | string[];
    marketId?: string;
  }) => {
    return apiClient.get('/bets', { params });
  },

  getBetById: async (betId: string) => {
    return apiClient.get(`/bets/${betId}`);
  },

  getOpenBets: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/bets/status/open', { params });
  },

  getMatchedBets: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/bets/status/matched', { params });
  },

  getSettledBets: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/bets/status/settled', { params });
  },

  cancelBet: async (betId: string) => {
    return apiClient.post(`/bets/${betId}/cancel`);
  },

  cashOut: async (betId: string) => {
    return apiClient.post(`/bets/${betId}/cashout`);
  },

  calculateCashOut: async (betId: string, currentOdds: number) => {
    return apiClient.get(`/bets/${betId}/cashout-value`, {
      params: { currentOdds },
    });
  },

  getBetsByMarket: async (marketId: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get(`/bets/market/${marketId}`, { params });
  },

  getStats: async () => {
    return apiClient.get('/bets/stats/summary');
  },
};

// ============================================
// WALLET API
// ============================================
export const walletAPI = {
  getBalance: async () => {
    return apiClient.get('/wallet/balance');
  },

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }) => {
    return apiClient.get('/wallet/transactions', { params });
  },

  getTransactionById: async (transactionId: string) => {
    return apiClient.get(`/wallet/transactions/${transactionId}`);
  },

  deposit: async (data: { amount: number; paymentMethod: string }) => {
    return apiClient.post('/wallet/deposit', data);
  },

  verifyDeposit: async (data: { transactionId: string; paymentId: string }) => {
    return apiClient.post('/wallet/deposit/verify', data);
  },

  withdraw: async (data: {
    amount: number;
    bankDetails: {
      accountNumber: string;
      ifsc: string;
      accountName: string;
    };
  }) => {
    return apiClient.post('/wallet/withdrawal', data);
  },

  getWithdrawalStatus: async (withdrawalId: string) => {
    return apiClient.get(`/wallet/withdrawal/${withdrawalId}`);
  },

  cancelWithdrawal: async (withdrawalId: string) => {
    return apiClient.post(`/wallet/withdrawal/${withdrawalId}/cancel`);
  },

  getExposure: async () => {
    return apiClient.get('/wallet/exposure');
  },

  getStats: async () => {
    return apiClient.get('/wallet/stats');
  },

  getPaymentMethods: async () => {
    return apiClient.get('/wallet/payment-methods');
  },
};

// ============================================
// SPORTS/MARKET API
// ============================================
export const sportsAPI = {
  getSports: async () => {
    return apiClient.get('/sports');
  },

  getSportById: async (sportId: string) => {
    return apiClient.get(`/sports/${sportId}`);
  },

  getMarkets: async (params?: {
    sportId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return apiClient.get('/markets', { params });
  },

  getMarketById: async (marketId: string, includeStats = false) => {
    return apiClient.get(`/markets/${marketId}`, {
      params: { includeStats },
    });
  },

  getMarketOdds: async (marketId: string) => {
    return apiClient.get(`/markets/${marketId}/odds`);
  },

  getMarketStats: async (marketId: string) => {
    return apiClient.get(`/markets/${marketId}/stats`);
  },

  getMarketsByEvent: async (eventId: string) => {
    return apiClient.get(`/markets/event/${eventId}`);
  },

  getMarketsBySport: async (sportId: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get(`/markets/sport/${sportId}`, { params });
  },

  getLiveMarkets: async (sportId?: string) => {
    return apiClient.get('/markets/live', { params: sportId ? { sportId } : {} });
  },

  getUpcomingMarkets: async (sportId?: string, hours = 24) => {
    return apiClient.get('/markets/upcoming', { 
      params: { sportId, hours },
    });
  },

  getFeaturedMarkets: async (limit = 10) => {
    return apiClient.get('/markets/featured', { params: { limit } });
  },

  getHotMarkets: async (limit = 10) => {
    return apiClient.get('/markets/hot', { params: { limit } });
  },
};

// ============================================
// ADMIN MARKET API
// ============================================
export const adminMarketAPI = {
  createMarket: async (data: any) => {
    return apiClient.post('/markets', data);
  },

  updateMarket: async (marketId: string, data: any) => {
    return apiClient.put(`/markets/${marketId}`, data);
  },

  addRunner: async (marketId: string, runnerData: any) => {
    return apiClient.post(`/markets/${marketId}/runners`, runnerData);
  },

  removeRunner: async (marketId: string, runnerId: string, permanent = false) => {
    return apiClient.delete(`/markets/${marketId}/runners/${runnerId}`, {
      params: { permanent },
    });
  },

  updateOdds: async (marketId: string, runners: any[]) => {
    return apiClient.put(`/markets/${marketId}/odds`, { runners });
  },

  bulkUpdateOdds: async (markets: any[]) => {
    return apiClient.post('/markets/odds/bulk', { markets });
  },

  updateMarketStatus: async (marketId: string, status: string) => {
    return apiClient.patch(`/markets/${marketId}/status`, { status });
  },

  settleMarket: async (marketId: string, winningRunnerId: string) => {
    return apiClient.post(`/markets/${marketId}/settle`, { winningRunnerId });
  },

  voidMarket: async (marketId: string, reason: string) => {
    return apiClient.post(`/markets/${marketId}/void`, { reason });
  },

  deleteMarket: async (marketId: string) => {
    return apiClient.delete(`/markets/${marketId}`);
  },
};

// ============================================
// ODDS FEED API (Admin)
// ============================================
export const oddsFeedAPI = {
  manualUpdate: async (marketId: string, runners: any[]) => {
    return apiClient.post('/odds-feed/manual', { marketId, runners });
  },

  simulatedUpdate: async (marketId: string) => {
    return apiClient.post(`/odds-feed/simulated/${marketId}`);
  },

  startFeed: async (marketId: string, source = 'simulated', interval = 5000) => {
    return apiClient.post(`/odds-feed/start/${marketId}`, { source, interval });
  },

  stopFeed: async (marketId: string) => {
    return apiClient.post(`/odds-feed/stop/${marketId}`);
  },

  startAllFeeds: async (source = 'simulated', interval = 5000) => {
    return apiClient.post('/odds-feed/start-all', { source, interval });
  },

  stopAllFeeds: async () => {
    return apiClient.post('/odds-feed/stop-all');
  },

  getFeedStatus: async () => {
    return apiClient.get('/odds-feed/status');
  },

  testBetfair: async (marketId: string) => {
    return apiClient.get('/odds-feed/test/betfair', { params: { marketId } });
  },

  testOddsAPI: async (sport: string, eventId: string) => {
    return apiClient.get('/odds-feed/test/oddsapi', { params: { sport, eventId } });
  },
};

// ============================================
// CASINO API
// ============================================
export const casinoAPI = {
  getGames: async (params?: {
    category?: string;
    gameType?: string;
    productCode?: number;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    return apiClient.get('/casino/games', { params });
  },

  getGamesByCategory: async (category: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get(`/casino/games/category/${category}`, { params });
  },

  getGamesByProvider: async (provider: string, params?: { page?: number; limit?: number }) => {
    return apiClient.get(`/casino/games/provider/${provider}`, { params });
  },

  getGameById: async (gameId: string) => {
    return apiClient.get(`/casino/games/${gameId}`);
  },

  launchGame: async (gameId: string) => {
    return apiClient.post(`/casino/games/${gameId}/launch`);
  },

  launchDemo: async (gameId: string) => {
    return apiClient.post(`/casino/games/${gameId}/demo`);
  },

  getPopularGames: async () => {
    return apiClient.get('/casino/popular');
  },

  getFeaturedGames: async () => {
    return apiClient.get('/casino/featured');
  },

  getNewGames: async () => {
    return apiClient.get('/casino/new');
  },

  getProviders: async () => {
    return apiClient.get('/casino/providers');
  },

  getCategories: async () => {
    return apiClient.get('/casino/categories');
  },

  searchGames: async (query: string, limit: number = 20) => {
    return apiClient.get('/casino/games', { params: { search: query, limit } });
  },
};

// ============================================
// PROMOTION API
// ============================================
export const promotionAPI = {
  getPromotions: async () => {
    return apiClient.get('/promotions');
  },

  getPromotionById: async (promoId: string) => {
    return apiClient.get(`/promotions/${promoId}`);
  },

  claimPromotion: async (promoId: string) => {
    return apiClient.post(`/promotions/${promoId}/claim`);
  },
};

// ============================================
// REFERRAL API
// ============================================
export const referralAPI = {
  getReferralCode: async () => {
    return apiClient.get('/referrals/my-code');
  },

  getStats: async () => {
    return apiClient.get('/referrals/stats');
  },

  getReferrals: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/referrals', { params });
  },
};

// ============================================
// PAYMENT API
// ============================================
export const paymentAPI = {
  getPaymentMethods: async (country = 'IN') => {
    return apiClient.get('/payment/methods', { params: { country } });
  },

  initiateDeposit: async (data: {
    amount: number;
    gateway: string;
    metadata?: any;
  }) => {
    return apiClient.post('/payment/deposit', data);
  },

  verifyRazorpay: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return apiClient.post('/payment/verify/razorpay', data);
  },

  requestWithdrawal: async (data: {
    amount: number;
    bankDetails: {
      accountNumber: string;
      ifsc: string;
      accountName: string;
      bankName?: string;
    };
  }) => {
    return apiClient.post('/payment/withdrawal', data);
  },

  getPaymentStatus: async (transactionId: string) => {
    return apiClient.get(`/payment/status/${transactionId}`);
  },

  // Admin methods
  verifyManualDeposit: async (data: {
    transactionId: string;
    paymentReference: string;
    verified: boolean;
  }) => {
    return apiClient.post('/payment/verify/manual', data);
  },

  testGateway: async (gateway: string) => {
    return apiClient.get(`/payment/test/${gateway}`);
  },
};

// ============================================
// ADMIN API
// ============================================
export const adminAPI = {
  // User Management
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) => {
    return apiClient.get('/admin/users', { params });
  },

  getUserById: async (userId: string) => {
    return apiClient.get(`/admin/users/${userId}`);
  },

  updateUser: async (userId: string, data: {
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
    kycVerified?: boolean;
  }) => {
    return apiClient.put(`/admin/users/${userId}`, data);
  },

  changeUserStatus: async (userId: string, data: {
    status: 'active' | 'suspended' | 'banned';
    reason?: string;
  }) => {
    // Backend route expects PUT for status changes
    return apiClient.put(`/admin/users/${userId}/status`, data);
  },

  deleteUser: async (userId: string) => {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  // KYC Management
  getPendingKYC: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/admin/kyc/pending', { params });
  },

  getKYCById: async (kycId: string) => {
    return apiClient.get(`/admin/kyc/${kycId}`);
  },

  approveKYC: async (kycId: string, data?: { verificationLevel?: number }) => {
    return apiClient.post(`/admin/kyc/${kycId}/approve`, data);
  },

  rejectKYC: async (kycId: string, data: { reason: string }) => {
    return apiClient.post(`/admin/kyc/${kycId}/reject`, data);
  },

  // Bet Management
  getAllBets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    marketId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiClient.get('/admin/bets', { params });
  },

  getBetById: async (betId: string) => {
    return apiClient.get(`/admin/bets/${betId}`);
  },

  voidBet: async (betId: string, data: { reason: string }) => {
    return apiClient.post(`/admin/bets/${betId}/void`, data);
  },

  // Market Management
  getAllMarkets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sportId?: string;
  }) => {
    return apiClient.get('/admin/markets', { params });
  },

  createMarket: async (data: any) => {
    return apiClient.post('/admin/markets', data);
  },

  updateMarket: async (marketId: string, data: any) => {
    return apiClient.put(`/admin/markets/${marketId}`, data);
  },

  settleMarket: async (marketId: string, data: {
    winner: string;
    result?: any;
  }) => {
    return apiClient.post(`/admin/markets/${marketId}/settle`, data);
  },

  // Withdrawal Management
  getPendingWithdrawals: async (params?: { page?: number; limit?: number }) => {
    return apiClient.get('/admin/withdrawals/pending', { params });
  },

  approveWithdrawal: async (withdrawalId: string, data: {
    txnId: string;
    remarks?: string;
  }) => {
    return apiClient.post(`/admin/withdrawals/${withdrawalId}/approve`, data);
  },

  rejectWithdrawal: async (withdrawalId: string, data: { reason: string }) => {
    return apiClient.post(`/admin/withdrawals/${withdrawalId}/reject`, data);
  },

  // Transaction Management
  getAllTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiClient.get('/admin/transactions', { params });
  },

  getTransactionById: async (transactionId: string) => {
    return apiClient.get(`/admin/transactions/${transactionId}`);
  },

  // Platform Statistics
  getOverviewStats: async (params?: { period?: string }) => {
    return apiClient.get('/admin/stats/overview', { params });
  },

  getRevenueReport: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiClient.get('/admin/stats/revenue', { params });
  },

  getUsersReport: async (params?: { period?: string }) => {
    return apiClient.get('/admin/stats/users', { params });
  },

  getBetsReport: async (params?: { period?: string }) => {
    return apiClient.get('/admin/stats/bets', { params });
  },
};

// ============================================
// AFFILIATE API
// ============================================
export const affiliateAPI = {
  // Register new affiliate
  register: async (data: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    refCode?: string;  // Referral code from referring affiliate
  }) => {
    return apiClient.post('/affiliate/register', data);
  },

  // Get affiliate profile
  getProfile: async () => {
    return apiClient.get('/affiliate/profile');
  },

  // Get affiliate dashboard stats
  getDashboard: async () => {
    return apiClient.get('/affiliate/dashboard');
  },

  // Get affiliate commissions
  getCommissions: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return apiClient.get('/affiliate/commissions', { params });
  },

  // Get affiliate referrals
  getReferrals: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    return apiClient.get('/affiliate/referrals', { params });
  },
  // KYC (affiliate)
  getKYC: async () => {
    return apiClient.get('/affiliate/kyc');
  },

  submitIdentityKYC: async (data: {
    documentType: string;
    documentNumber: string;
    expiryDate: string;
    frontImage: string;
    backImage?: string | null;
    selfieImage: string;
  }) => {
    return apiClient.post('/affiliate/kyc/identity', data);
  },

  submitAddressKYC: async (data: {
    documentType: string;
    documentNumber: string;
    expiryDate: string;
    frontImage: string;
    backImage?: string | null;
  }) => {
    return apiClient.post('/affiliate/kyc/address', data);
  },
};

// Export default API client
export default apiClient;
