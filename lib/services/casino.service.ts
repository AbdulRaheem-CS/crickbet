/**
 * Casino Service
 * Handle casino-related API calls - connected to GSC+ backend
 */

import apiClient from '../api-client';

export interface CasinoGame {
  _id: string;
  gameCode: string;
  gameName: string;
  productCode: number;
  productName: string;
  gameType: string;
  category: string;
  imageUrl?: string;
  langName?: Record<string, string>;
  langIcon?: Record<string, string>;
  supportCurrency: string;
  status: string;
  isPopular: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isHot: boolean;
  allowFreeRound: boolean;
  stats: {
    totalPlays: number;
    totalWagered: number;
    totalWon: number;
    uniquePlayers: number;
  };
}

export interface GameListResponse {
  success: boolean;
  data: CasinoGame[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface GameLaunchResponse {
  success: boolean;
  message?: string;
  data: {
    gameUrl: string;
    content?: string;
    sessionId?: string;
  };
}

export interface ProviderInfo {
  _id: number;
  productName: string;
  productCode: number;
  gameCount: number;
  gameTypes: string[];
  categories: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

export const casinoService = {
  // Get casino games with filtering & pagination
  getGames: async (params?: {
    category?: string;
    gameType?: string;
    productCode?: number;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<GameListResponse> => {
    return await apiClient.get('/casino/games', { params }) as any;
  },

  // Get games by category
  getGamesByCategory: async (category: string, params?: { page?: number; limit?: number }): Promise<GameListResponse> => {
    return await apiClient.get(`/casino/games/category/${category}`, { params }) as any;
  },

  // Get games by provider
  getGamesByProvider: async (provider: string, params?: { page?: number; limit?: number }): Promise<GameListResponse> => {
    return await apiClient.get(`/casino/games/provider/${provider}`, { params }) as any;
  },

  // Get game by ID
  getGameById: async (gameId: string) => {
    return await apiClient.get(`/casino/games/${gameId}`);
  },

  // Launch real game (requires auth)
  launchGame: async (gameId: string): Promise<GameLaunchResponse> => {
    return await apiClient.post(`/casino/games/${gameId}/launch`) as any;
  },

  // Launch demo game
  launchDemo: async (gameId: string): Promise<GameLaunchResponse> => {
    return await apiClient.post(`/casino/games/${gameId}/demo`) as any;
  },

  // Launch Super Lobby
  launchSuperLobby: async (type: number = 0) => {
    return await apiClient.post('/casino/super-lobby', { type });
  },

  // Get popular games
  getPopularGames: async (): Promise<{ success: boolean; data: CasinoGame[] }> => {
    return await apiClient.get('/casino/popular') as any;
  },

  // Get featured games
  getFeaturedGames: async (): Promise<{ success: boolean; data: CasinoGame[] }> => {
    return await apiClient.get('/casino/featured') as any;
  },

  // Get new games
  getNewGames: async (): Promise<{ success: boolean; data: CasinoGame[] }> => {
    return await apiClient.get('/casino/new') as any;
  },

  // Get all providers
  getProviders: async (): Promise<{ success: boolean; data: ProviderInfo[] }> => {
    return await apiClient.get('/casino/providers') as any;
  },

  // Get all categories
  getCategories: async (): Promise<{ success: boolean; data: CategoryInfo[] }> => {
    return await apiClient.get('/casino/categories') as any;
  },

  // Get user's game sessions
  getSessions: async (params?: { page?: number; limit?: number; status?: string }) => {
    return await apiClient.get('/casino/sessions', { params });
  },

  // End a game session
  endSession: async (sessionId: string) => {
    return await apiClient.post(`/casino/sessions/${sessionId}/end`);
  },

  // Search games
  searchGames: async (query: string, limit: number = 20): Promise<GameListResponse> => {
    return await apiClient.get('/casino/games', { params: { search: query, limit } }) as any;
  },
};
