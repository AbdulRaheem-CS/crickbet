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
    const token = localStorage.getItem('authToken');
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
      setUser(response.data || response.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    const response: any = await authService.login({ emailOrPhone, password });
    // API returns { success: true, data: { user, token } }
    const { user, token } = response.data;
    localStorage.setItem('authToken', token);
    setUser(user);
  };

  const register = async (registerData: any) => {
    const response: any = await authService.register(registerData);
    // API returns { success: true, data: { user, token } }
    const { user, token } = response.data;
    localStorage.setItem('authToken', token);
    setUser(user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
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
