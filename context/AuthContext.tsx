'use client';

/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/services/auth.service';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  wallet: {
    balance: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
  const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const response: any = await authService.me();
      // API returns { success: true, data: user }
      // Normalize possible shapes: { success, data }, { user }, or user object
      const userPayload = response?.data || response?.user || response;
      setUser(userPayload || null);
    } catch (error) {
      // Try to log structured error information for easier debugging
      try {
        console.error('Failed to fetch user - error object:', error);
        // Common shape from api-client rejection
        if (error && typeof error === 'object') {
          console.error('error.message:', (error as any).message);
          console.error('error.status:', (error as any).status);
          console.error('error.data:', (error as any).data);
        }
      } catch (logErr) {
        console.error('Failed to log error details', logErr);
      }
      // Clear both legacy and new token keys
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    const response: any = await authService.login({ emailOrPhone, password });
    // API returns { success: true, data: { user, token } }
    const { user, token } = response.data;
  // Persist token under both keys for backward compatibility
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
  }
    setUser(user);
  };

  const register = async (registerData: any) => {
    const response: any = await authService.register(registerData);
    // API returns { success: true, data: { user, token } }
    const { user, token } = response.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
  }
    setUser(user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
  localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
