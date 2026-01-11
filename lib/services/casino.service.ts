/**
 * Casino Service
 * Handle casino-related API calls
 */

import apiClient from '../api-client';

export const casinoService = {
  // Get casino games
  getGames: async (params?: any) => {
    return await apiClient.get('/casino/games', { params });
  },

  // Get game details
  getGameDetails: async (gameId: string) => {
    return await apiClient.get(`/casino/games/${gameId}`);
  },

  // Launch game
  launchGame: async (gameId: string) => {
    return await apiClient.post('/casino/launch', { gameId });
  },

  // Get game history
  getGameHistory: async (params?: any) => {
    return await apiClient.get('/casino/history', { params });
  },
};
