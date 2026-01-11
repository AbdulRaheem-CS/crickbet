/**
 * Market Service
 * Handle market-related API calls
 */

import apiClient from '../api-client';

export const marketService = {
  // Get all sports
  getSports: async () => {
    return await apiClient.get('/market/sports');
  },

  // Get markets for a sport
  getMarkets: async (sportId: string, params?: any) => {
    return await apiClient.get(`/market/${sportId}`, { params });
  },

  // Get market details
  getMarketDetails: async (marketId: string) => {
    return await apiClient.get(`/market/details/${marketId}`);
  },

  // Get live markets
  getLiveMarkets: async () => {
    return await apiClient.get('/market/live');
  },

  // Get upcoming markets
  getUpcomingMarkets: async () => {
    return await apiClient.get('/market/upcoming');
  },
};
