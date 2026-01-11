/**
 * Betting Service
 * Handle betting-related API calls
 */

import apiClient from '../api-client';

export interface PlaceBetData {
  marketId: string;
  runnerId: string;
  betType: 'back' | 'lay';
  odds: number;
  stake: number;
}

export const bettingService = {
  // Place bet
  placeBet: async (data: PlaceBetData) => {
    return await apiClient.post('/bet/place', data);
  },

  // Get my bets
  getMyBets: async (params?: any) => {
    return await apiClient.get('/bet/my-bets', { params });
  },

  // Cancel bet
  cancelBet: async (betId: string) => {
    return await apiClient.delete(`/bet/${betId}`);
  },

  // Cash out bet
  cashoutBet: async (betId: string) => {
    return await apiClient.post(`/bet/${betId}/cashout`);
  },

  // Get bet details
  getBetDetails: async (betId: string) => {
    return await apiClient.get(`/bet/${betId}`);
  },
};
